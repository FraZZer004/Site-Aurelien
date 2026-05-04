/**
 * AdminPhotoForm
 * Allows uploading multiple photos at once to a section.
 *
 * - Shared fields: category, section, date, description, brand, color, keywords
 * - Per-photo: title (editable inline below each thumbnail)
 * - All photos are uploaded and saved in a single batch
 * - Cover photo can be chosen by clicking any thumbnail before submit
 */
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Plus, Image as ImageIcon, Star } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { usePhotos, useAdditions } from '../../context/PhotosContext';
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
    .replace(/[̀-ͯ]/g, '')
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
  const additions = useAdditions();

  /* ── Category & section ── */
  const [categoryId, setCategoryId] = useState<CategoryId>('events');
  const [isNewSection, setIsNewSection] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [subEventId, setSubEventId] = useState('');

  /* ── Shared metadata ── */
  const [sharedTitle, setSharedTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [keywords, setKeywords] = useState('');

  /* ── Files ── */
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Cover selection ── */
  const [coverIndex, setCoverIndex] = useState(0);
  const [replaceExistingCover, setReplaceExistingCover] = useState(false);

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

  const selectedSectionHasPreview = React.useMemo(() => {
    if (isNewSection || !sectionId) return true;
    return allPhotos.some(
      (p) => p.categoryId === categoryId && (p as any)[cat.sectionKey] === sectionId && p.isPreview
    );
  }, [allPhotos, categoryId, cat.sectionKey, isNewSection, sectionId]);

  // Cover picker is active when: new section, existing section without cover, or user toggled replace
  const coverPickerActive = isNewSection || !selectedSectionHasPreview || replaceExistingCover;

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
      const idx = prev.findIndex((e) => e.id === id);
      const next = prev.filter((e) => e.id !== id);
      // Keep coverIndex in bounds; if cover was removed reset to 0
      setCoverIndex((ci) => (idx === ci ? 0 : Math.min(ci, Math.max(0, next.length - 1))));
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return next;
    });
  };

  const updateTitle = (id: string, title: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, title } : e)));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const resetCoverPicker = () => {
    setCoverIndex(0);
    setReplaceExistingCover(false);
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

  /* ── Demote old cover (PATCH if dynamic, soft-delete if static) ── */
  const demoteOldCover = async (oldCoverId: string) => {
    const isDynamic = additions.some((a) => a.id === oldCoverId);
    if (isDynamic) {
      await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [oldCoverId], patch: { isPreview: false } }),
      });
    } else {
      const raw = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [oldCoverId] }),
      });
      if (!raw.ok) throw new Error('Impossible de remplacer l\'ancienne couverture');
    }
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

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        setProgress(`Upload ${i + 1} / ${entries.length} — ${entry.file.name}`);
        const src = await uploadOne(entry);

        const isPreviewPhoto = coverPickerActive && i === coverIndex;
        const resolvedTitle = isPreviewPhoto && isNewSection
          ? newSectionName
          : (sharedTitle || (isNewSection ? newSectionName : (entry.title || nameWithoutExt(entry.file))));

        const photo: Partial<Photo> & Record<string, unknown> = {
          id: `${categoryId}-${finalSectionId}-${Date.now()}-${i}`,
          categoryId,
          src,
          alt: resolvedTitle,
          title: resolvedTitle,
          ...(isPreviewPhoto ? { isPreview: true } : {}),
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
          const sluggedSub = slugify(subEventId);
          if (sluggedSub) photo.subEventId = sluggedSub;
        }
        photos.push(photo);
      }

      setProgress('Sauvegarde…');
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(photos),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Sauvegarde échouée (${res.status}): ${body}`);
      }

      // Demote the old cover if the user explicitly chose to replace it
      if (replaceExistingCover && selectedSectionHasPreview) {
        const oldCover = allPhotos.find(
          (p) => p.categoryId === categoryId &&
            (p as any)[cat.sectionKey] === finalSectionId &&
            p.isPreview
        );
        if (oldCover) {
          setProgress('Remplacement de la couverture…');
          await demoteOldCover(oldCover.id);
        }
      }

      setSuccess(`${entries.length} photo${entries.length > 1 ? 's' : ''} ajoutée${entries.length > 1 ? 's' : ''} !`);
      entries.forEach((e) => URL.revokeObjectURL(e.preview));
      setEntries([]);
      setSharedTitle('');
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
      resetCoverPicker();
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
              onClick={() => {
                setCategoryId(c.id);
                setSectionId('');
                setIsNewSection(false);
                setNewSectionName('');
                resetCoverPicker();
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

      {/* ── Section ── */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">{cat.sectionLabel}</label>
        <div className="flex gap-2 mb-2">
          <button type="button"
            onClick={() => { setIsNewSection(false); resetCoverPicker(); }}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              !isNewSection ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >Existant</button>
          <button type="button"
            onClick={() => { setIsNewSection(true); resetCoverPicker(); }}
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
          <select value={sectionId}
            onChange={(e) => { setSectionId(e.target.value); resetCoverPicker(); }}
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

        {/* Feedback cover — new section */}
        {isNewSection && newSectionName && (
          <p className="mt-2 text-xs text-yellow-400/70">
            Clique sur une photo pour choisir la couverture de cette section.
          </p>
        )}

        {/* Feedback cover — missing preview */}
        {!selectedSectionHasPreview && !isNewSection && sectionId && (
          <p className="mt-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
            Cette section n'a pas de photo de couverture — la 1ère photo uploadée deviendra la cover. Clique sur une photo pour en choisir une autre.
          </p>
        )}

        {/* Toggle — replace existing cover */}
        {selectedSectionHasPreview && !isNewSection && sectionId && (
          <label className="mt-2 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceExistingCover}
              onChange={(e) => { setReplaceExistingCover(e.target.checked); setCoverIndex(0); }}
              className="accent-yellow-400"
            />
            <span className="text-xs text-gray-400">Remplacer la photo de couverture actuelle</span>
          </label>
        )}
      </div>

      {/* ── Titre du sujet ── */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Titre du sujet
          <span className="text-gray-600 text-xs ml-2">— regroupe toutes les photos sous le même bloc</span>
        </label>
        <input
          type="text"
          value={sharedTitle}
          onChange={(e) => setSharedTitle(e.target.value)}
          placeholder={categoryId === 'shootings' ? 'ex: Ferrari 488 GTB' : categoryId === 'events' ? 'ex: Bugatti Veyron' : 'ex: Titre commun'}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
        />
        {sharedTitle && (
          <p className="text-xs text-yellow-400/70 mt-1">
            Toutes les photos auront le titre "{sharedTitle}" → elles seront dans le même bloc.
          </p>
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

        {/* Cover picker hint */}
        {entries.length > 0 && coverPickerActive && (
          <p className="mt-2 text-xs text-yellow-400/60 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Clique sur une photo pour la définir comme couverture
          </p>
        )}

        {/* Preview grid */}
        {entries.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {entries.map((entry, idx) => {
              const isCover = coverPickerActive && idx === coverIndex;
              return (
                <div key={entry.id} className="relative">
                  <div
                    onClick={() => coverPickerActive && setCoverIndex(idx)}
                    className={`aspect-square rounded-xl overflow-hidden bg-white/5 relative ${
                      coverPickerActive ? 'cursor-pointer' : ''
                    } ${isCover ? 'ring-2 ring-yellow-400' : 'ring-1 ring-white/10'}`}
                  >
                    <img src={entry.preview} alt={entry.title} className="w-full h-full object-cover" />
                    {isCover && (
                      <div className="absolute inset-0 bg-yellow-400/10 flex items-start justify-start p-1.5">
                        <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-0.5">
                          <Star className="w-2 h-2" /> Cover
                        </span>
                      </div>
                    )}
                    {coverPickerActive && !isCover && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded">
                          Définir cover
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 rounded-full p-1 transition-colors z-10"
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
              );
            })}
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
