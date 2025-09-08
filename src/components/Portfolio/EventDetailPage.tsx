import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import { ArrowLeft } from 'lucide-react';
import MasonryGrid from './MasonryGrid';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Get event preview for title and description
  const eventPreview = photos.find(
      p => p.categoryId === 'events' &&
          p.eventId === eventId &&
          p.isPreview
  );

  // Get all photos for this event (excluding preview)
  const eventPhotos = photos.filter(
      p => p.categoryId === 'events' &&
          p.eventId === eventId &&
          !p.isPreview
  );

  const goBack = () => navigate('/portfolio/events');

  if (!eventPreview) {
    return (
        <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-gray-600 dark:text-gray-400">
              Événement non trouvé
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
        <div className="max-w-6xl mx-auto">
          <button
              onClick={goBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux événements
          </button>

          <h1 className="text-3xl md:text-4xl font-light mb-4 text-black dark:text-white">
            {eventPreview.title || eventId?.replace(/-/g, ' ')}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-12">
            {eventPreview.date} — {eventPreview.description}
          </p>

          {/* Mosaïque de photos pour les événements */}
          <MasonryGrid photos={eventPhotos} />
        </div>
      </div>
  );
};

export default EventDetailPage;