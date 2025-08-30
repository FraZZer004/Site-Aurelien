import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../../types';
import Lightbox from './Lightbox';

interface PhotoCardProps {
  photos: Photo[];
  title: string;
  date: string;
  description: string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photos, title, date, description }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? photos.length - 1 : prevIndex - 1
      );
    } else {
      setCurrentIndex((prevIndex) => 
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <>
      <div 
        className="group overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={openLightbox}
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
          
          {/* Navigation arrows - only show if more than 1 photo */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70 z-10"
                aria-label="Photo précédente"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70 z-10"
                aria-label="Photo suivante"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Photo counter */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {currentIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-light text-black dark:text-white mb-2">
            {title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>{date}</span>
            <span className="truncate ml-4">{description}</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <Lightbox
          photo={currentPhoto}
          photos={photos}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
};

export default PhotoCard;