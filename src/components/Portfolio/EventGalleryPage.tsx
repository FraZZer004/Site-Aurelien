import React from 'react';
import { useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';

const EventGalleryPage: React.FC = () => {
  const navigate = useNavigate();

  // Get preview photos for events
  const eventPreviews = photos.filter(p => p.categoryId === 'events' && p.isPreview);

  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Événements</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
          Sélectionnez un événement pour découvrir les photos associées.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {eventPreviews.map(photo => (
            <div
              key={photo.eventId}
              onClick={() => navigate(`/portfolio/events/${photo.eventId}`)}
              className="cursor-pointer group overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-light text-black dark:text-white mb-2">
                  {photo.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>{photo.date}</span>
                  <span className="truncate ml-4">{photo.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventGalleryPage;