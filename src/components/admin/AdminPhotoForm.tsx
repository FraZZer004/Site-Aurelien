/**
 * AdminPhotoForm
 * Form to add a new photo (or create a new section via isPreview: true).
 *
 * Handles:
 * - Category selection
 * - Section selection (existing) or creation (new, isPreview: true)
 * - File upload with client-side resize/compression (max 1920px, ~2MB)
 * - All Photo fields
 */
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { usePhotos } from '../../context/PhotosContext';
import type { Photo } from '../../types';

const CATEGORIES = [
  { id: 'events', label: 'Événements', sectionKey: 'eventId', sectionLabel: 'Événement' },
  { id: 'shootings', label: 'Shootings', sectionKey: 'shootingId', sectionLabel: 'Shooting' },
  { id: 'art', label: 'Projets d\'art', sectionKey: 'artId', sectionLabel: 'Projet' },
  { id: 'drawings', label: 'Dessins', sectionKey: 'drawingId', sectionLabel: 'Série' },
  { id: 'affiches', label: 'Affiches', sectionKey: 'afficheId', sectionLabel: 'Collection' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function resizeImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            // Strip data URL prefix → pure base64
            resolve(dataUrl.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface Props {
  onSuccess: () => void;
}

const AdminPhotoForm: React.FC<Props> = ({ onSuccess }) => {
  const { token } = useAdminAuth();
  const allPhotos = usePhotos();

  const [categoryId, setCategoryId] = useState<CategoryId>('events');
  const [isNewSection, setIsNewSection] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [subEventId, setSubEventId] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageSrc, setImageSrc] = useState(''); // URL manuelle

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [keywords, setKeywords] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const cat = CATEGORIES.find((c) => c.id === categoryId)!;

  // Derive existing sections from photos
  const existingSections = React.useMemo(() => {
    const map = new Map<string, string>();
    allPhotos.forEach((p) => {
      if (p.categoryId !== categoryId) return;
      const id = (p as any)[cat.sectionKey] as string | undefined;
      const label = p.title || p.alt || id || '—';
      if (id && !map.has(id)) map.set(id, label);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [allPhotos, categoryId, cat.sectionKey]);

  const handleFileChange = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageSrc('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFileChange(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return imageSrc;

    const base64 = await resizeImage(imageFile);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: imageFile.name,
        contentType: 'image/jpeg',
        data: base64,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upload échoué (${res.status}): ${body || 'pas de détail'}`);
    }
    const { url } = await res.json() as { url: string };
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalSectionId = isNewSection ? slugify(newSectionName) : sectionId;

    if (!finalSectionId) {
      setError('Sélectionne ou crée une section.');
      return;
    }
    if (!imageFile && !imageSrc) {
      setError('Ajoute une image ou une URL.');
      return;
    }

    setLoading(true);
    try {
      const src = await uploadImage();

      // Derive alt from title, or filename, or section name
      const derivedAlt = title || imageFile?.name.replace(/\.[^.]+$/, '') || finalSectionId;

      const photo: Partial<Photo> & Record<string, unknown> = {
        id: `${categoryId}-${finalSectionId}-${Date.now()}`,
        categoryId,
        src,
        alt: derivedAlt,
        title: title || undefined,
        date: date || new Date().toLocaleDateString('fr-FR'),
        description: description || '',
        brand: brand || undefined,
        color: color || undefined,
        keywords: keywords ? keywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
      };

      // Assign section ID
      photo[cat.sectionKey] = finalSectionId;

      // Sub-event for events
      if (categoryId === 'events' && subEventId) {
        photo.subEventId = slugify(subEventId);
      }

      // If new section → create a preview photo first
      if (isNewSection) {
        const previewPhoto: Partial<Photo> & Record<string, unknown> = {
          id: `${categoryId}-preview-${finalSectionId}-${Date.now()}`,
          categoryId,
          src,
          alt: newSectionName,
          title: newSectionName,
          date: date || new Date().toLocaleDateString('fr-FR'),
          description: description || '',
          isPreview: true,
        };
        previewPhoto[cat.sectionKey] = finalSectionId;

        // POST preview first, then the actual photo
        const res = await fetch('/api/admin/content', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([previewPhoto, photo]),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`Sauvegarde échouée (${res.status}): ${body || 'pas de détail'}`);
        }
      } else {
        const res = await fetch('/api/admin/content', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(photo),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`Sauvegarde échouée (${res.status}): ${body || 'pas de détail'}`);
        }
      }

      setSuccess('Photo ajoutée avec succès !');
      // Reset form
      setImageFile(null);
      setImagePreview('');
      setImageSrc('');
      setTitle('');
      setDate('');
      setDescription('');
      setBrand('');
      setColor('');
      setKeywords('');
      setSubEventId('');
      if (!isNewSection) setSectionId('');
      setIsNewSection(false);
      setNewSectionName('');

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Catégorie */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoryId(c.id);
                setSectionId('');
                setIsNewSection(false);
                setNewSectionName('');
              }}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                categoryId === c.id
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">{cat.sectionLabel}</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setIsNewSection(false)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              !isNewSection
                ? 'bg-white/10 border-white/20 text-white'
                : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            Existant
          </button>
          <button
            type="button"
            onClick={() => setIsNewSection(true)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1 ${
              isNewSection
                ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400'
                : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <Plus className="w-3 h-3" /> Nouvelle section
          </button>
        </div>

        {isNewSection ? (
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder={`Nom de la nouvelle section (ex: Prestige Auto 2026)`}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
          />
        ) : (
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="">— Sélectionner —</option>
            {existingSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.id})
              </option>
            ))}
          </select>
        )}

        {/* Sub-event for events */}
        {categoryId === 'events' && (
          <input
            type="text"
            value={subEventId}
            onChange={(e) => setSubEventId(e.target.value)}
            placeholder="Sous-catégorie (optionnel, ex: stand-bugatti)"
            className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        )}
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Image</label>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="relative border-2 border-dashed border-white/10 hover:border-yellow-400/50 rounded-xl p-6 cursor-pointer transition-colors text-center"
        >
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="aperçu"
                className="max-h-40 rounded-lg mx-auto object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="absolute -top-2 -right-2 bg-black rounded-full p-1 border border-white/20"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-gray-500">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Glisse une image ici ou clique pour choisir</p>
              <p className="text-xs mt-1 opacity-60">JPG, PNG, WebP — max ~4 Mo</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-600">ou URL</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <input
          type="text"
          value={imageSrc}
          onChange={(e) => {
            setImageSrc(e.target.value);
            setImageFile(null);
            setImagePreview('');
          }}
          placeholder="/assets/images/MonEvent/photo.jpg"
          className="mt-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm font-mono"
        />
      </div>

      {/* Champs texte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ferrari 458 Italia"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="16/05/2025"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Courte description…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm resize-none"
          />
        </div>

        {(categoryId === 'events' || categoryId === 'shootings') && (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Marque</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ferrari, Porsche…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Couleur</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Rouge, Noir…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">
            Mots-clés (séparés par des virgules)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="GT3RS, Cabriolet, Circuit…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
      </div>

      {/* Feedback */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-medium rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {loading ? 'Enregistrement…' : 'Ajouter la photo'}
      </button>
    </form>
  );
};

export default AdminPhotoForm;
