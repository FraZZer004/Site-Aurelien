import React from 'react';
import { useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import FadeInSection from '../UI/FadeInSection';

const ShootingGalleryPage: React.FC = () => {
    const navigate = useNavigate();

    // Get preview photos for shootings
    const shootingPreviews = photos.filter(
        (p) => p.categoryId === 'shootings' && p.isPreview
    );

    const totalShootings = shootingPreviews.length;

    return (
        <section className="min-h-screen py-20 px-6 bg-white dark:bg-black text-black dark:text-white">
            <div className="max-w-6xl mx-auto">

                {/* 🔥 Header premium (aligné avec les Événements) */}
                <FadeInSection>
                    <header className="mb-10 md:mb-14">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            Shootings
                        </h1>

                        {/* Soulignement dégradé or */}
                        <div className="h-[3px] w-28 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-6" />

                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
                            Découvre les différents shootings réalisés : automobiles, motos et
                            catégories diverses. Sélectionne une catégorie pour visualiser les
                            photos associées.
                        </p>

                        <p className="mt-8 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                            {totalShootings} shooting
                            {totalShootings > 1 ? 's' : ''} disponible
                            {totalShootings > 1 ? 's' : ''}.
                        </p>
                    </header>
                </FadeInSection>

                {/* 🔳 GRID – tes cartes 100% intactes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {shootingPreviews.map((photo) => (
                        <article
                            key={photo.shootingId}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/portfolio/shootings/${photo.shootingId}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/portfolio/shootings/${photo.shootingId}`);
                                }
                            }}
                            className="
                group relative overflow-hidden rounded-2xl
                bg-white dark:bg-neutral-900
                border border-neutral-200/60 dark:border-neutral-800
                shadow-xl transition-all duration-500 cursor-pointer
                transform hover:-translate-y-2 hover:shadow-2xl
                focus:outline-none focus:ring-2 focus:ring-indigo-500/60
              "
                        >
                            {/* Image avec overlay + gradient */}
                            <div className="relative overflow-hidden aspect-[4/3]">
                                <img
                                    src={photo.src}
                                    alt={photo.alt || photo.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-opacity duration-500 pointer-events-none" />

                                {/* Gradient bottom */}
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            </div>

                            {/* Texte superposé */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                                <h3 className="text-white text-lg md:text-xl font-medium tracking-wide drop-shadow-md line-clamp-2">
                                    {photo.title}
                                </h3>

                                <div className="mt-2 flex items-center justify-between text-[13px] text-white/85">
                                    <span className="truncate">{photo.date}</span>
                                    <span className="truncate max-w-[62%] text-right">
                    {photo.description}
                  </span>
                                </div>
                            </div>

                            {/* Halo hover */}
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShootingGalleryPage;