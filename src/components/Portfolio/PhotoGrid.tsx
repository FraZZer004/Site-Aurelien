import React, { useState } from 'react';
import { Photo, getMediaType } from '../../types';
import FadeInSection from '../UI/FadeInSection';
import Lightbox from './Lightbox';

interface PhotoGridProps {
  photos: Photo[];
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;

    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < photos.length) {
      setSelectedPhoto(photos[newIndex]);
    }
  };

  return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo, index) => {
            const isVideo = getMediaType(photo) === 'video';

            return (
                <FadeInSection key={photo.id} delay={index * 100}>
                  <div
                      className="cursor-pointer group overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => openLightbox(photo)}
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {isVideo ? (
                          <video
                              src={photo.src}
                              controls={photo.controls ?? true}
                              loop={photo.loop}
                              muted={photo.muted}
                              poster={photo.poster}
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                              // Évite d’ouvrir la lightbox quand on clique sur les contrôles
                              onClick={(e) => e.stopPropagation()}
                          >
                            Votre navigateur ne supporte pas la vidéo.
                          </video>
                      ) : (
                          <img
                              src={photo.src}
                              alt={photo.alt}
                              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                      )}

                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-light text-black dark:text-white mb-2">
                        {photo.alt}
                      </h3>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span>{photo.date}</span>
                        <span className="truncate ml-4">{photo.description}</span>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
            );
          })}
        </div>

        <Lightbox
            photo={selectedPhoto}
            photos={photos}
            onClose={closeLightbox}
            onNavigate={navigatePhoto}
        />
      </>
  );
};

export default PhotoGrid;