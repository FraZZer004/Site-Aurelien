import React from 'react';
import { photos } from '../../data/photos';
import MasonryGrid from './MasonryGrid';

const AffichesGalleryPage: React.FC = () => {
    // Récupérer toutes les affiches
    const affichesPhotos = photos.filter((p) => p.categoryId === 'affiches');

    return (
        <div className="py-20 px-6 bg-white dark:bg-black min-h-screen text-black dark:text-white">
            <div className="max-w-6xl mx-auto">

                {/* ===== ENTÊTE MODERNISÉE (style Events / Drawings / Art) ===== */}
                <header className="mb-14">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light">
                        Affiches
                    </h1>

                    {/* Soulignement dégradé */}
                    <div className="h-[3px] w-28 mt-4 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

                    <p className="mt-6 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Explorez ma collection d'affiches issues de mes shootings.
                    </p>

                    {/* Compteur */}
                    <p className="mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                        {affichesPhotos.length} affiche
                        {affichesPhotos.length > 1 ? 's' : ''} disponible
                        {affichesPhotos.length > 1 ? 's' : ''}.
                    </p>
                </header>

                {/* ===== MOSAÏQUE ===== */}
                <MasonryGrid photos={affichesPhotos} />

            </div>
        </div>
    );
};

export default AffichesGalleryPage;