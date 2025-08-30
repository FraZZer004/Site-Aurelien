import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../../types';

interface LightboxProps {
  photo: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, photos, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, onNavigate]);

  if (!photo) return null;

  const currentIndex = photos.findIndex(p => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white p-2 hover:text-gray-300 transition-colors"
        aria-label="Fermer"
      >
        <X size={28} />
      </button>

      {hasPrev && (
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-gray-300 transition-colors"
          aria-label="Photo précédente"
        >
          <ChevronLeft size={40} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onNavigate('next')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-gray-300 transition-colors"
          aria-label="Photo suivante"
        >
          <ChevronRight size={40} />
        </button>
      )}
      
      <div className="max-w-5xl max-h-[80vh] relative">
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[70vh] max-w-full object-contain"
        />
        
        <div className="mt-4 text-white">
          <p className="text-lg">{photo.alt}</p>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-300">
            <span>{photo.date}</span>
            <span>{photo.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;