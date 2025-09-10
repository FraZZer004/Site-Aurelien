import React from 'react';
import { photos } from '../../data/photos';
import MasonryGrid from './MasonryGrid';

const AffichesGalleryPage: React.FC = () => {
    // Récupérer toutes les affiches (pas besoin de preview ici)
    const affichesPhotos = photos.filter(p => p.categoryId === 'affiches');

    return (
        <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Affiches</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
                    Explorez ma collection d'affiches issues de mes shootings.
                </p>

                {/* Utilisation directe du MasonryGrid pour afficher toutes les affiches */}
                <MasonryGrid photos={affichesPhotos} />
            </div>
        </div>
    );
};

export default AffichesGalleryPage;
