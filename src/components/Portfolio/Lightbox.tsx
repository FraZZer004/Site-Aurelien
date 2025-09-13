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
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Minimum distance pour déclencher un swipe
  const minSwipeDistance = 50;

  // Mettre à jour l'index courant quand la photo change
  React.useEffect(() => {
    if (photo) {
      const index = photos.findIndex(p => p.id === photo.id);
      setCurrentIndex(index);
    }
  }, [photo, photos]);

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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasNext) {
      onNavigate('next');
    }
    if (isRightSwipe && hasPrev) {
      onNavigate('prev');
    }
  };

  if (!photo) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;
  const isVideo = photo.src.match(/\.(mp4|mov|webm)$/i);

  return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
        <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
          <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white p-3 md:p-2 hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full"
              aria-label="Fermer"
          >
            <X size={24} className="md:w-7 md:h-7" />
          </button>

          {hasPrev && (
              <button
                  onClick={() => onNavigate('prev')}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white p-4 md:p-2 hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full"
                  aria-label="Photo précédente"
              >
                <ChevronLeft size={32} className="md:w-10 md:h-10" />
              </button>
          )}

          {hasNext && (
              <button
                  onClick={() => onNavigate('next')}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white p-4 md:p-2 hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full"
                  aria-label="Photo suivante"
              >
                <ChevronRight size={32} className="md:w-10 md:h-10" />
              </button>
          )}

          {/* Zones de toucher invisibles pour mobile */}
          {hasPrev && (
              <div
                  className="absolute left-0 top-0 w-1/3 h-full md:hidden z-5"
                  onClick={() => onNavigate('prev')}
                  aria-label="Zone tactile - Photo précédente"
              />
          )}

          {hasNext && (
              <div
                  className="absolute right-0 top-0 w-1/3 h-full md:hidden z-5"
                  onClick={() => onNavigate('next')}
                  aria-label="Zone tactile - Photo suivante"
              />
          )}

          <div className="w-full h-full flex items-center justify-center relative">
            {isVideo ? (
                <video
                    src={photo.src}
                    controls
                    autoPlay={false}
                    loop={photo.loop}
                    muted={photo.muted}
                    poster={photo.poster}
                    playsInline
                    className="max-h-[80vh] max-w-full object-contain mx-auto"
                >
                  Votre navigateur ne supporte pas la vidéo.
                </video>
            ) : (
                <img
                    src={photo.src}
                    alt={photo.alt}
                    className="max-h-[80vh] max-w-full object-contain mx-auto block"
                />
            )}
          </div>

          {/* Informations de la photo/vidéo */}
          <div className="absolute bottom-20 md:bottom-16 left-4 right-4 text-white text-center">
            <div className="mt-4 text-white px-2">
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>{photo.date}</span>
                <span>{photo.description}</span>
              </div>
            </div>
          </div>

          {/* Indicateur de navigation sur mobile */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center md:hidden">
            <div className="flex space-x-2">
              {photos.map((_, index) => (
                  <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentIndex ? 'bg-white' : 'bg-gray-500'
                      }`}
                  />
              ))}
            </div>
          </div>

          {/* Instructions de navigation sur mobile */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs opacity-70 md:hidden text-center">
            Glissez ou touchez les côtés pour naviguer
          </div>
        </div>
      </div>
  );
};

export default Lightbox;