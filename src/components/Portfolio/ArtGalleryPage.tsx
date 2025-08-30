import React from 'react';
import { photos } from '../../data/photos';
import PhotoCard from './PhotoCard';

const ArtGalleryPage: React.FC = () => {
  // Get preview photos for art projects
  const artPreviews = photos.filter(p => p.categoryId === 'art' && p.isPreview);

  // Group photos by artId
  const artGroups = artPreviews.map(preview => {
    const artPhotos = photos.filter(
      p => p.categoryId === 'art' && 
      p.artId === preview.artId && 
      !p.isPreview
    );
    
    return {
      preview,
      photos: artPhotos
    };
  });

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Projets Personnels</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
          Découvrez mes projets artistiques personnels.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {artGroups.map(({ preview, photos: artPhotos }) => (
            <PhotoCard
              key={preview.artId}
              photos={artPhotos}
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

export default ArtGalleryPage;