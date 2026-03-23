/**
 * AdminPhotoList
 * Shows all photos for a given section with delete capability.
 */
import React, { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import type { Photo } from '../../types';

interface Props {
  photos: Photo[];
  onDeleted: () => void;
}

const AdminPhotoList: React.FC<Props> = ({ photos, onDeleted }) => {
  const { token } = useAdminAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur suppression');
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (photos.length === 0) {
    return (
      <p className="text-gray-600 text-sm italic py-4">
        Aucune photo dans cette section.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10"
        >
          <div className="aspect-square">
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex flex-col justify-between p-2">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.isPreview && (
                <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                  APERÇU
                </span>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs line-clamp-1 mb-1">
                {photo.title || photo.alt}
              </p>
              {confirmId === photo.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={!!deletingId}
                    className="flex-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg py-1 flex items-center justify-center gap-1"
                  >
                    {deletingId === photo.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    Confirmer
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(photo.id)}
                  className="w-full bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-lg py-1 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPhotoList;
