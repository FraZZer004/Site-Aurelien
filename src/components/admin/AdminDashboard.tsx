/**
 * AdminDashboard
 * Main admin interface: category tabs, section list, photo management, add form.
 */
import React, { useState, useCallback } from 'react';
import { LogOut, Plus, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
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

const AdminDashboard: React.FC = () => {
  const { logout } = useAdminAuth();
  const photos = usePhotos();
  const refresh = useRefreshPhotos();

  const [activeCat, setActiveCat] = useState<CategoryId>('events');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

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
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
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

                {/* Section photos */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4">
                    <AdminPhotoList
                      photos={section.photos}
                      onDeleted={handleDeleted}
                    />
                    {section.preview && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-600 mb-2">Photo d'aperçu (preview)</p>
                        <AdminPhotoList
                          photos={[section.preview]}
                          onDeleted={handleDeleted}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
