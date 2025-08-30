import React from 'react';
import { photos } from '../../data/photos';
import PhotoCard from './PhotoCard';

const ShootingGalleryPage: React.FC = () => {
  // Get preview photos for shootings
  const shootingPreviews = photos.filter(p => p.categoryId === 'shootings' && p.isPreview);

  // Group photos by shootingId
  const shootingGroups = shootingPreviews.map(preview => {
    const shootingPhotos = photos.filter(
      p => p.categoryId === 'shootings' &&
      p.shootingId === preview.shootingId &&
      !p.isPreview
    );

    return {
      preview,
      photos: shootingPhotos
    };
  });

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Shootings</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
          Découvrez mes séances photo professionnelles de véhicules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {shootingGroups.map(({ preview, photos: shootingPhotos }) => (
            <PhotoCard
              key={preview.shootingId}
              photos={shootingPhotos}
              title={preview.title || preview.alt}
              date={preview.date}
              description={preview.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShootingGalleryPage;