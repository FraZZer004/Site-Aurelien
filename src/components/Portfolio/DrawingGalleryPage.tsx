import React from 'react';
import { photos } from '../../data/photos';
import PhotoCard from './PhotoCard';

const DrawingGalleryPage: React.FC = () => {
    // Get preview photos for drawings
    const drawingPreviews = photos.filter(
        (p) => p.categoryId === 'drawings' && p.isPreview
    );

    // Group photos by drawingId
    const drawingGroups = drawingPreviews.map((preview) => {
        const drawingPhotos = photos.filter(
            (p) =>
                p.categoryId === 'drawings' &&
                p.drawingId === preview.drawingId &&
                !p.isPreview
        );

        return {
            preview,
            photos: drawingPhotos
        };
    });

    return (
        <div className="py-20 px-6 bg-white dark:bg-black min-h-screen text-black dark:text-white">
            <div className="max-w-6xl mx-auto">

                {/* ===== ENTÊTE MODERNISÉE (style Events) ===== */}
                <header className="mb-14">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light">
                        Dessins
                    </h1>

                    {/* Soulignement dégradé */}
                    <div className="h-[3px] w-28 mt-4 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

                    <p className="mt-6 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Découvrez mes illustrations et dessins de véhicules.
                    </p>

                    <p className="mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                        {drawingGroups.length} dessin
                        {drawingGroups.length > 1 ? 's' : ''} disponible
                        {drawingGroups.length > 1 ? 's' : ''}.
                    </p>
                </header>

                {/* ===== GRILLE DES CARTES ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {drawingGroups.map(({ preview, photos: drawingPhotos }) => (
                        <PhotoCard
                            key={preview.drawingId}
                            photos={drawingPhotos}
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

export default DrawingGalleryPage;