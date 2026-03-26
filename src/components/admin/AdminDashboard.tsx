/**
 * AdminDashboard
 * Main admin interface: category tabs, section list, photo management, add form.
 */
import React, { useState, useCallback } from 'react';
import { LogOut, Plus, ChevronDown, ChevronRight, RefreshCw, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { usePhotos, useRefreshPhotos } from '../../context/PhotosContext';
import AdminPhotoList from './AdminPhotoList';
import AdminPhotoForm from './AdminPhotoForm';
import type { Photo } from '../../types';

const CATEGORIES = [
  { id: 'events', label: 'Événements', sectionKey: 'eventId' },
  { id: 'shootings', label: 'Shootings', sectionKey: 'shootingId' },
  { id: 'art', label: 'Projets d\'art', sectionKey: 'artId' },
  { id: 'drawings', label: 'Dessins', sectionKey: 'drawingId' },
  { id: 'affiches', label: 'Affiches', sectionKey: 'afficheId' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface Section {
  id: string;
  label: string;
  photos: Photo[];
  preview?: Photo;
}

function groupByTitle(photos: Photo[]): Array<{ key: string; photos: Photo[] }> {
  const map = new Map<string, Photo[]>();
  for (const p of photos) {
    const key = p.title?.trim() || p.alt?.trim() || 'Sans titre';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  // Merge all 1-photo groups (unique filenames) into a single "Autres" bucket
  const entries = Array.from(map.entries());
  const multi = entries.filter(([, ps]) => ps.length > 1).map(([key, ps]) => ({ key, photos: ps }));
  const solos = entries.filter(([, ps]) => ps.length === 1).flatMap(([, ps]) => ps);
  if (solos.length > 0) multi.push({ key: 'Autres', photos: solos });
  return multi;
}

interface GroupRef { key: string; photos: Photo[] }

interface EditForm {
  title: string; date: string; description: string;
  brand: string; color: string; keywords: string;
}

const AdminDashboard: React.FC = () => {
  const { logout, token } = useAdminAuth();
  const photos = usePhotos();
  const refresh = useRefreshPhotos();

  const [activeCat, setActiveCat] = useState<CategoryId>('events');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  // Group edit modal
  const [editingGroup, setEditingGroup] = useState<GroupRef | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', date: '', description: '', brand: '', color: '', keywords: '' });
  // Group delete confirmation
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<GroupRef | null>(null);
  const [groupActionLoading, setGroupActionLoading] = useState(false);

  const openEdit = (group: GroupRef) => {
    const first = group.photos[0];
    setEditForm({
      title: first?.title || group.key,
      date: first?.date || '',
      description: first?.description || '',
      brand: first?.brand || '',
      color: first?.color || '',
      keywords: first?.keywords?.join(', ') || '',
    });
    setEditingGroup(group);
  };

  const handleSaveGroupEdit = async () => {
    if (!editingGroup) return;
    setGroupActionLoading(true);
    try {
      const ids = editingGroup.photos.map((p) => p.id);
      const patch: Record<string, unknown> = {
        title: editForm.title,
        alt: editForm.title,
        date: editForm.date,
        description: editForm.description,
        brand: editForm.brand || undefined,
        color: editForm.color || undefined,
        keywords: editForm.keywords
          ? editForm.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : undefined,
      };
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, patch }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      refresh();
      setEditingGroup(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirmDeleteGroup) return;
    setGroupActionLoading(true);
    try {
      const ids = confirmDeleteGroup.photos.map((p) => p.id);
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      refresh();
      setConfirmDeleteGroup(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const cat = CATEGORIES.find((c) => c.id === activeCat)!;

  // Build sections from photos
  const sections: Section[] = React.useMemo(() => {
    const map = new Map<string, Section>();

    photos
      .filter((p) => p.categoryId === activeCat)
      .forEach((p) => {
        const sectionId = (p as any)[cat.sectionKey] as string | undefined;
        if (!sectionId) return;

        if (!map.has(sectionId)) {
          map.set(sectionId, {
            id: sectionId,
            label: sectionId,
            photos: [],
          });
        }

        const section = map.get(sectionId)!;

        if (p.isPreview) {
          section.preview = p;
          section.label = p.title || p.alt || sectionId;
        } else {
          section.photos.push(p);
        }
      });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'fr')
    );
  }, [photos, activeCat, cat.sectionKey]);

  const totalPhotos = photos.filter((p) => p.categoryId === activeCat && !p.isPreview).length;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleted = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleSuccess = useCallback(() => {
    refresh();
    setShowAddForm(false);
  }, [refresh]);

  return (
    <>
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-light">Administration</h1>
          <p className="text-xs text-gray-500">Site d'Aurélien Communeau</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-3xl font-light text-yellow-400">{photos.length}</p>
            <p className="text-xs text-gray-500 mt-1">Photos totales</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-3xl font-light text-yellow-400">{sections.length}</p>
            <p className="text-xs text-gray-500 mt-1">Sections — {cat.label}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-3xl font-light text-yellow-400">{totalPhotos}</p>
            <p className="text-xs text-gray-500 mt-1">Photos — {cat.label}</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCat(c.id);
                setExpandedSections(new Set());
                setShowAddForm(false);
              }}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                activeCat === c.id
                  ? 'bg-yellow-400 text-black border-yellow-400 font-medium'
                  : 'border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Add photo button / form */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-colors border ${
              showAddForm
                ? 'bg-white/5 border-white/20 text-white'
                : 'bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Masquer le formulaire' : 'Ajouter une photo / section'}
          </button>

          {showAddForm && (
            <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-base font-light mb-6 text-gray-300">
                Nouvelle photo — {cat.label}
              </h2>
              <AdminPhotoForm onSuccess={handleSuccess} />
            </div>
          )}
        </div>

        {/* Sections list */}
        <div className="space-y-3">
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
            Sections ({sections.length})
          </h2>

          {sections.length === 0 && (
            <p className="text-gray-600 text-sm italic">
              Aucune section dans cette catégorie.
            </p>
          )}

          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div
                key={section.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Section header */}
                <div className="flex items-center">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex-1 flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left min-w-0"
                  >
                    {/* Preview thumbnail */}
                    {section.preview && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={section.preview.src}
                          alt={section.preview.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-light truncate">{section.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ID: <span className="font-mono text-gray-400">{section.id}</span>
                        {' · '}
                        {section.photos.length} photo{section.photos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {/* Section-level actions */}
                  <div className="flex items-center gap-1 pr-3 flex-shrink-0">
                    <button
                      onClick={() => openEdit({ key: section.label, photos: section.photos })}
                      className="p-2 rounded-lg text-gray-600 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                      title="Modifier toutes les photos de cette section"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteGroup({
                        key: section.label,
                        photos: [
                          ...section.photos,
                          ...(section.preview ? [section.preview] : []),
                        ],
                      })}
                      className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Supprimer toute la section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Section photos */}
                {isExpanded && (() => {
                  const groups = groupByTitle(section.photos);
                  const hasMultipleGroups = groups.length > 1;
                  return (
                    <div className="border-t border-white/10 p-4 space-y-8">
                      {hasMultipleGroups ? (
                        groups.map((group) => (
                          <div key={group.key}>
                            {/* Shooting group header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-px flex-1 bg-white/10" />
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                                <span className="text-sm font-medium text-yellow-300">{group.key}</span>
                                <span className="text-xs text-yellow-400/60">
                                  {group.photos.length} photo{group.photos.length > 1 ? 's' : ''}
                                </span>
                                <button
                                  onClick={() => openEdit(group)}
                                  className="ml-1 p-1 rounded-full hover:bg-white/10 text-yellow-400/50 hover:text-yellow-300 transition-colors"
                                  title="Modifier le bloc"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteGroup(group)}
                                  className="p-1 rounded-full hover:bg-red-500/20 text-yellow-400/50 hover:text-red-400 transition-colors"
                                  title="Supprimer le bloc"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <AdminPhotoList photos={group.photos} onDeleted={handleDeleted} />
                          </div>
                        ))
                      ) : (
                        <AdminPhotoList photos={section.photos} onDeleted={handleDeleted} />
                      )}
                      {section.preview && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-600 mb-2">Photo d'aperçu (preview)</p>
                          <AdminPhotoList photos={[section.preview]} onDeleted={handleDeleted} />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </div>{/* end min-h-screen */}

    {/* ── Edit Group Modal ── */}
    {editingGroup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-light text-white">Modifier le bloc</h3>
              <p className="text-xs text-yellow-400/70 mt-0.5">
                {editingGroup.key} · {editingGroup.photos.length} photo{editingGroup.photos.length > 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={() => setEditingGroup(null)} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Titre du bloc</label>
              <input type="text" value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input type="text" value={editForm.date} placeholder="16/05/2025"
                  onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Marque</label>
                <input type="text" value={editForm.brand} placeholder="Ferrari…"
                  onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Couleur</label>
                <input type="text" value={editForm.color} placeholder="Rouge…"
                  onChange={(e) => setEditForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mots-clés</label>
                <input type="text" value={editForm.keywords} placeholder="GT3RS, Circuit…"
                  onChange={(e) => setEditForm((f) => ({ ...f, keywords: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input type="text" value={editForm.description} placeholder="Courte description…"
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-white/10">
            <button onClick={() => setEditingGroup(null)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button onClick={handleSaveGroupEdit} disabled={groupActionLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-yellow-400 text-black font-medium hover:bg-yellow-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {groupActionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Delete Group Confirmation Modal ── */}
    {confirmDeleteGroup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-light text-white mb-1">Supprimer le bloc</h3>
            <p className="text-sm text-white font-medium mb-1">"{confirmDeleteGroup.key}"</p>
            <p className="text-xs text-gray-500">
              {confirmDeleteGroup.photos.length} photo{confirmDeleteGroup.photos.length > 1 ? 's' : ''} seront supprimées définitivement. Cette action est irréversible.
            </p>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-white/10">
            <button onClick={() => setConfirmDeleteGroup(null)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button onClick={handleDeleteGroup} disabled={groupActionLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-red-500 text-white font-medium hover:bg-red-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {groupActionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Supprimer
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminDashboard;
