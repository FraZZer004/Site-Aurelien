import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import { ArrowLeft } from 'lucide-react';
import CarouselBlock from './CarouselBlock';

const DrawingDetailPage: React.FC = () => {
  const { drawingId } = useParams<{ drawingId: string }>();
  const navigate = useNavigate();
  
  // Get drawing preview for title and description
  const drawingPreview = photos.find(
    p => p.categoryId === 'drawings' && 
    p.drawingId === drawingId && 
    p.isPreview
  );

  // Get all photos for this drawing project (excluding preview)
  const drawingPhotos = photos.filter(
    p => p.categoryId === 'drawings' && 
    p.drawingId === drawingId && 
    !p.isPreview
  );

  // Group photos by subEventId (we'll use this for different series/themes)
  const subDrawingGroups = drawingPhotos.reduce((groups, photo) => {
    const subEventId = photo.subEventId || photo.id; // Use photo id if no subEventId
    if (!groups[subEventId]) {
      groups[subEventId] = [];
    }
    groups[subEventId].push(photo);
    return groups;
  }, {} as Record<string, typeof drawingPhotos>);

  const goBack = () => navigate('/portfolio/drawings');

  if (!drawingPreview) {
    return <div>Dessin non trouvé</div>;
  }

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux dessins
        </button>

        <h1 className="text-3xl md:text-4xl font-light mb-4 text-black dark:text-white">
          {drawingPreview.title || drawingId?.replace(/-/g, ' ')}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          {drawingPreview.date} — {drawingPreview.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(subDrawingGroups).map(([subDrawingId, subDrawingPhotos]) => {
            // Get the first photo to use as preview and for title/description
            const previewPhoto = subDrawingPhotos[0];
            
            return (
              <CarouselBlock
                key={subDrawingId}
                photos={subDrawingPhotos}
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

export default DrawingDetailPage;