/**
 * AdminPhotoForm
 * Allows uploading multiple photos at once to a section.
 *
 * - Shared fields: category, section, date, description, brand, color, keywords
 * - Per-photo: title (editable inline below each thumbnail)
 * - All photos are uploaded and saved in a single batch
 */
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { usePhotos } from '../../context/PhotosContext';
import type { Photo } from '../../types';

const CATEGORIES = [
  { id: 'events',    label: 'Événements',    sectionKey: 'eventId',    sectionLabel: 'Événement' },
  { id: 'shootings', label: 'Shootings',     sectionKey: 'shootingId', sectionLabel: 'Shooting' },
  { id: 'art',       label: "Projets d'art", sectionKey: 'artId',      sectionLabel: 'Projet' },
  { id: 'drawings',  label: 'Dessins',       sectionKey: 'drawingId',  sectionLabel: 'Série' },
  { id: 'affiches',  label: 'Affiches',      sectionKey: 'afficheId',  sectionLabel: 'Collection' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface FileEntry {
  id: string;       // local key
  file: File;
  preview: string;  // object URL
  title: string;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function nameWithoutExt(file: File) {
  return file.name.replace(/\.[^.]+$/, '');
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
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
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

  /* ── Category & section ── */
  const [categoryId, setCategoryId] = useState<CategoryId>('events');
  const [isNewSection, setIsNewSection] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [subEventId, setSubEventId] = useState('');

  /* ── Shared metadata ── */
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [keywords, setKeywords] = useState('');

  /* ── Files ── */
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Status ── */
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cat = CATEGORIES.find((c) => c.id === categoryId)!;

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

  /* ── File handling ── */
  const addFiles = useCallback((files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newEntries: FileEntry[] = images.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      title: nameWithoutExt(file),
    }));
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.id !== id);
    });
  };

  const updateTitle = (id: string, title: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, title } : e)));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  /* ── Upload one file ── */
  const uploadOne = async (entry: FileEntry): Promise<string> => {
    const base64 = await resizeImage(entry.file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: entry.file.name, contentType: 'image/jpeg', data: base64 }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upload échoué (${res.status}): ${body}`);
    }
    const { url } = await res.json() as { url: string };
    return url;
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalSectionId = isNewSection ? slugify(newSectionName) : sectionId;
    if (!finalSectionId) { setError('Sélectionne ou crée une section.'); return; }
    if (entries.length === 0) { setError('Ajoute au moins une image.'); return; }

    setLoading(true);
    try {
      const photos: Array<Partial<Photo> & Record<string, unknown>> = [];

      // If new section, build the preview photo from the first image
      let firstSrc: string | null = null;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        setProgress(`Upload ${i + 1} / ${entries.length} — ${entry.file.name}`);
        const src = await uploadOne(entry);
        if (i === 0) firstSrc = src;

        const photo: Partial<Photo> & Record<string, unknown> = {
          id: `${categoryId}-${finalSectionId}-${Date.now()}-${i}`,
          categoryId,
          src,
          alt: entry.title || nameWithoutExt(entry.file),
          title: entry.title || undefined,
          date: date || new Date().toLocaleDateString('fr-FR'),
          description: description || '',
          brand: brand || undefined,
          color: color || undefined,
          keywords: keywords
            ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
            : undefined,
        };
        photo[cat.sectionKey] = finalSectionId;
        if (categoryId === 'events' && subEventId) {
          photo.subEventId = slugify(subEventId);
        }
        photos.push(photo);
      }

      // Prepend preview photo if creating a new section
      const payload: Array<Partial<Photo> & Record<string, unknown>> = [];
      if (isNewSection && firstSrc) {
        const preview: Partial<Photo> & Record<string, unknown> = {
          id: `${categoryId}-preview-${finalSectionId}-${Date.now()}`,
          categoryId,
          src: firstSrc,
          alt: newSectionName,
          title: newSectionName,
          date: date || new Date().toLocaleDateString('fr-FR'),
          description: description || '',
          isPreview: true,
        };
        preview[cat.sectionKey] = finalSectionId;
        payload.push(preview);
      }
      payload.push(...photos);

      setProgress('Sauvegarde…');
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Sauvegarde échouée (${res.status}): ${body}`);
      }

      setSuccess(`${entries.length} photo${entries.length > 1 ? 's' : ''} ajoutée${entries.length > 1 ? 's' : ''} !`);
      // Reset
      entries.forEach((e) => URL.revokeObjectURL(e.preview));
      setEntries([]);
      setDate('');
      setDescription('');
      setBrand('');
      setColor('');
      setKeywords('');
      setSubEventId('');
      if (!isNewSection) setSectionId('');
      setIsNewSection(false);
      setNewSectionName('');
      setProgress('');
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Catégorie ── */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button"
              onClick={() => { setCategoryId(c.id); setSectionId(''); setIsNewSection(false); setNewSectionName(''); }}
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

      {/* ── Section ── */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">{cat.sectionLabel}</label>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setIsNewSection(false)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              !isNewSection ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >Existant</button>
          <button type="button" onClick={() => setIsNewSection(true)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1 ${
              isNewSection ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400' : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <Plus className="w-3 h-3" /> Nouvelle section
          </button>
        </div>

        {isNewSection ? (
          <input type="text" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Nom de la nouvelle section (ex: Prestige Auto 2026)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
          />
        ) : (
          <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="">— Sélectionner —</option>
            {existingSections.map((s) => (
              <option key={s.id} value={s.id}>{s.label} ({s.id})</option>
            ))}
          </select>
        )}

        {categoryId === 'events' && (
          <input type="text" value={subEventId} onChange={(e) => setSubEventId(e.target.value)}
            placeholder="Sous-catégorie (optionnel, ex: stand-bugatti)"
            className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        )}
      </div>

      {/* ── Drop zone ── */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Photos <span className="text-gray-600 text-xs">(sélection multiple possible)</span>
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-yellow-400/50 rounded-xl p-8 cursor-pointer transition-colors text-center"
        >
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          <p className="text-sm text-gray-500">Glisse tes photos ici ou clique pour en choisir</p>
          <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP — plusieurs fichiers acceptés</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        {/* Preview grid */}
        {entries.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {entries.map((entry) => (
              <div key={entry.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                  <img src={entry.preview} alt={entry.title} className="w-full h-full object-cover" />
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                {/* Per-photo title */}
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => updateTitle(entry.id, e.target.value)}
                  placeholder="Titre"
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {entries.length} photo{entries.length > 1 ? 's' : ''} sélectionnée{entries.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Métadonnées communes ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input type="text" value={date} onChange={(e) => setDate(e.target.value)}
            placeholder="16/05/2025"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Courte description…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>

        {(categoryId === 'events' || categoryId === 'shootings') && (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Marque</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="Ferrari, Porsche…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Couleur</label>
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                placeholder="Rouge, Noir…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Mots-clés (séparés par des virgules)</label>
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
            placeholder="GT3RS, Cabriolet, Circuit…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
      </div>

      {/* ── Feedback ── */}
      {progress && (
        <p className="text-yellow-400 text-sm flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> {progress}
        </p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        type="submit"
        disabled={loading || entries.length === 0}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-medium rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> En cours…</>
          : <><Upload className="w-4 h-4" /> Publier {entries.length > 0 ? `${entries.length} photo${entries.length > 1 ? 's' : ''}` : 'les photos'}</>
        }
      </button>
    </form>
  );
};

export default AdminPhotoForm;
