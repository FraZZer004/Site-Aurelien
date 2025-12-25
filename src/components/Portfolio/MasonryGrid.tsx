import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Photo } from '../../types';
import FadeInSection from '../UI/FadeInSection';
import Lightbox from './Lightbox';

interface MasonryGridProps {
    photos: Photo[];
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ photos }) => {
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [columns, setColumns] = useState(3);

    // Photo dérivée (source de vérité = index)
    const selectedPhoto = useMemo(
        () => (currentIndex === null ? null : photos[currentIndex] ?? null),
        [currentIndex, photos]
    );

    // Ajuster le nombre de colonnes selon la taille d'écran
    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 640) setColumns(1);
            else if (window.innerWidth < 1024) setColumns(2);
            else setColumns(3);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Distribuer les photos dans les colonnes
    const photoColumns = useMemo(() => {
        const cols: Photo[][] = Array.from({ length: columns }, () => []);
        photos.forEach((photo, index) => {
            cols[index % columns].push(photo);
        });
        return cols;
    }, [photos, columns]);

    const openLightbox = useCallback((photo: Photo) => {
        // index fiable (id puis src en fallback)
        const idx =
            photos.findIndex((p) => p.id === photo.id) ??
            photos.findIndex((p) => p.src === photo.src);

        setCurrentIndex(idx >= 0 ? idx : 0);
    }, [photos]);

    const closeLightbox = useCallback(() => {
        setCurrentIndex(null);
    }, []);

    const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
        setCurrentIndex((i) => {
            if (i === null) return i;
            const next =
                direction === 'prev'
                    ? Math.max(i - 1, 0)
                    : Math.min(i + 1, photos.length - 1);

            return next;
        });
    }, [photos.length]);

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

            <Lightbox
                photo={selectedPhoto}
                photos={photos}
                onClose={closeLightbox}
                onNavigate={navigatePhoto}
                currentIndex={currentIndex ?? undefined}   // ✅ on l’utilise maintenant
            />
        </>
    );
};

export default MasonryGrid;