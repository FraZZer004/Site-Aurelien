import React, { useState, useEffect } from 'react';
import { Photo } from '../../types';
import FadeInSection from '../UI/FadeInSection';
import Lightbox from './Lightbox';

interface MasonryGridProps {
    photos: Photo[];
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ photos }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [columns, setColumns] = useState(3);

    // Ajuster le nombre de colonnes selon la taille d'écran
    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 640) {
                setColumns(1);
            } else if (window.innerWidth < 1024) {
                setColumns(2);
            } else {
                setColumns(3);
            }
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Distribuer les photos dans les colonnes
    const distributePhotos = () => {
        const photoColumns: Photo[][] = Array.from({ length: columns }, () => []);

        photos.forEach((photo, index) => {
            const columnIndex = index % columns;
            photoColumns[columnIndex].push(photo);
        });

        return photoColumns;
    };

    const openLightbox = (photo: Photo) => {
        setSelectedPhoto(photo);
    };

    const closeLightbox = () => {
        setSelectedPhoto(null);
    };

    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (!selectedPhoto) return;

        const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
        const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex >= 0 && newIndex < photos.length) {
            setSelectedPhoto(photos[newIndex]);
        }
    };

    const photoColumns = distributePhotos();

    return (
        <>
            <div className="flex gap-4">
                {photoColumns.map((columnPhotos, columnIndex) => (
                    <div key={columnIndex} className="flex-1 flex flex-col gap-4">
                        {columnPhotos.map((photo, photoIndex) => (
                            <FadeInSection
                                key={photo.id}
                                delay={photoIndex * 100 + columnIndex * 50}
                            >
                                <div
                                    className="group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800"
                                    onClick={() => openLightbox(photo)}
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={photo.src}
                                            alt={photo.alt}
                                            className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />

                                        {/* Overlay avec informations au hover */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                                            <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-lg font-light mb-1">{photo.alt}</h3>
                                                <div className="flex justify-between items-center text-sm opacity-90">
                                                    <span>{photo.date}</span>
                                                    <span className="truncate ml-2">{photo.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            <Lightbox
                photo={selectedPhoto}
                photos={photos}
                onClose={closeLightbox}
                onNavigate={navigatePhoto}
            />
        </>
    );
};

export default MasonryGrid;