import React from 'react';
import { photos } from '../../data/photos';
import PhotoCard from './PhotoCard';

const DrawingGalleryPage: React.FC = () => {
  // Get preview photos for drawings
  const drawingPreviews = photos.filter(p => p.categoryId === 'drawings' && p.isPreview);

  // Group photos by drawingId
  const drawingGroups = drawingPreviews.map(preview => {
    const drawingPhotos = photos.filter(
      p => p.categoryId === 'drawings' && 
      p.drawingId === preview.drawingId && 
      !p.isPreview
    );
    
    return {
      preview,
      photos: drawingPhotos
    };
  });

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Dessins</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
          Découvrez mes illustrations et dessins de véhicules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {drawingGroups.map(({ preview, photos: drawingPhotos }) => (
            <PhotoCard
              key={preview.drawingId}
              photos={drawingPhotos}
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

export default DrawingGalleryPage;