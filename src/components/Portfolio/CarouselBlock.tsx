import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../../types';
import Lightbox from './Lightbox';

interface CarouselBlockProps {
  photos: Photo[];
  title: string;
  date: string;
  description: string;
}

const CarouselBlock: React.FC<CarouselBlockProps> = ({ photos, title, date, description }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  if (!photos.length) return null;

  return (
      <>
        <div
            className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
            onClick={openLightbox}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image container with gradient overlay */}
          <div className="relative overflow-hidden aspect-[4/3] rounded-t-2xl">
            <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Floating title */}
            <div className="absolute top-6 left-6 right-6">
              <h3 className="text-2xl font-light text-white drop-shadow-lg leading-tight">
                {title}
              </h3>
            </div>

            {/* Navigation arrows - only show if more than 1 photo */}
            {photos.length > 1 && (
                <>
                  <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 z-10"
                      aria-label="Photo précédente"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 z-10"
                      aria-label="Photo suivante"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Photo counter */}
                  <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {currentIndex + 1} / {photos.length}
                  </div>
                </>
            )}
          </div>

          {/* Content section with glass morphism effect */}
          <div className="relative p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            {/* Decorative line */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

            {/* Date and description with improved typography */}
            <div className="flex justify-between items-end mt-4">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">Date</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{date}</span>
              </div>

              <div className="flex flex-col text-right max-w-[60%]">
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">Description</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{description}</span>
              </div>
            </div>

            {/* Hover indicator */}
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-700 orange-500 to-yellow-400 transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`}></div>
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

export default CarouselBlock;