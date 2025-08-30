import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import { ArrowLeft } from 'lucide-react';
import CarouselBlock from './CarouselBlock';

const ShootingDetailPage: React.FC = () => {
  const { shootingId } = useParams<{ shootingId: string }>();
  const navigate = useNavigate();

  // Get shooting preview for title and description
  const shootingPreview = photos.find(
    p => p.categoryId === 'shootings' &&
    p.shootingId === shootingId &&
    p.isPreview
  );

  // Get all photos for this shooting (excluding preview)
  const shootingPhotos = photos.filter(
    p => p.categoryId === 'shootings' &&
    p.shootingId === shootingId &&
    !p.isPreview
  );

  // Group photos by subEventId (we'll use this for different angles/series)
  const subShootingGroups = shootingPhotos.reduce((groups, photo) => {
    const subEventId = photo.subEventId || photo.id; // Use photo id if no subEventId
    if (!groups[subEventId]) {
      groups[subEventId] = [];
    }
    groups[subEventId].push(photo);
    return groups;
  }, {} as Record<string, typeof shootingPhotos>);

  const goBack = () => navigate('/portfolio/shootings');

  if (!shootingPreview) {
    return <div>Shooting non trouvé</div>;
  }

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux shootings
        </button>

        <h1 className="text-3xl md:text-4xl font-light mb-4 text-black dark:text-white">
          {shootingPreview.title || shootingId?.replace(/-/g, ' ')}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-12">
          {shootingPreview.date} — {shootingPreview.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(subShootingGroups).map(([subShootingId, subShootingPhotos]) => {
            // Get the first photo to use as preview and for title/description
            const previewPhoto = subShootingPhotos[0];

            return (
              <CarouselBlock
                key={subShootingId}
                photos={subShootingPhotos}
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

export default ShootingDetailPage;