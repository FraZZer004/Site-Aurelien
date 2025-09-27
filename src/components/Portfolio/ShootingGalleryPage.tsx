import React from 'react';
import { useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';

const ShootingGalleryPage: React.FC = () => {
  const navigate = useNavigate();

  // Get preview photos for shootings
  const shootingPreviews = photos.filter(p => p.categoryId === 'shootings' && p.isPreview);

  return (
      <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Shootings</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
            Sélectionnez un shooting pour découvrir les photos associées.
          </p>

          {/* GRID */}
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
                    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                >
                  {/* Image avec overlay + gradient (style CarouselBlock) */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                        src={photo.src}
                        alt={photo.alt || photo.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-opacity duration-500 pointer-events-none" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>

                  {/* Titre + date/description superposés sur l'image (comme le carrousel) */}
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

                  {/* Halo subtil au hover */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />
                </article>
            ))}
          </div>
        </div>
      </div>
  );
};

export default ShootingGalleryPage;