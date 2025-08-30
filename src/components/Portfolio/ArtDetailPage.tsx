import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import { ArrowLeft } from 'lucide-react';
import CarouselBlock from './CarouselBlock';

const ArtDetailPage: React.FC = () => {
  const { artId } = useParams<{ artId: string }>();
  const navigate = useNavigate();
  
  // Get art preview for title and description
  const artPreview = photos.find(
    p => p.categoryId === 'art' && 
    p.artId === artId && 
    p.isPreview
  );

  // Get all photos for this art project (excluding preview)
  const artPhotos = photos.filter(
    p => p.categoryId === 'art' && 
    p.artId === artId && 
    !p.isPreview
  );

  // Group photos by subEventId (we'll use this for different series/themes)
  const subArtGroups = artPhotos.reduce((groups, photo) => {
    const subEventId = photo.subEventId || photo.id; // Use photo id if no subEventId
    if (!groups[subEventId]) {
      groups[subEventId] = [];
    }
    groups[subEventId].push(photo);
    return groups;
  }, {} as Record<string, typeof artPhotos>);

  const goBack = () => navigate('/portfolio/art');

  if (!artPreview) {
    return <div>Projet artistique non trouvé</div>;
  }

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux projets personnels
        </button>

        <h1 className="text-3xl md:text-4xl font-light mb-4 text-black dark:text-white">
          {artPreview.title || artId?.replace(/-/g, ' ')}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          {artPreview.date} — {artPreview.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(subArtGroups).map(([subArtId, subArtPhotos]) => {
            // Get the first photo to use as preview and for title/description
            const previewPhoto = subArtPhotos[0];
            
            return (
              <CarouselBlock
                key={subArtId}
                photos={subArtPhotos}
                title={previewPhoto.title || previewPhoto.alt}
                date={previewPhoto.date}
                description={previewPhoto.description}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArtDetailPage;