import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { photos } from '../../data/photos';
import MasonryGrid from './MasonryGrid';
import { Photo } from '../../types';

type BrandFilter = 'all' | string;
type ColorFilter = 'all' | string;

const ShootingDetailPage: React.FC = () => {
    const { shootingId } = useParams<{ shootingId: string }>();
    const navigate = useNavigate();

    // Preview du shooting pour le header
    const shootingPreview = photos.find(
        (p) =>
            p.categoryId === 'shootings' &&
            (p as any).shootingId === shootingId &&
            p.isPreview
    );

    // Toutes les photos du shooting (sans la preview)
    const shootingPhotos: Photo[] = photos.filter(
        (p) =>
            p.categoryId === 'shootings' &&
            (p as any).shootingId === shootingId &&
            !p.isPreview
    );

    const [brandFilter, setBrandFilter] = React.useState<BrandFilter>('all');
    const [colorFilter, setColorFilter] = React.useState<ColorFilter>('all');

    // Marques dispo
    const brands = React.useMemo(
        () =>
            Array.from(
                new Set(
                    shootingPhotos
                        .map((p: any) => p.brand as string | undefined)
                        .filter(Boolean)
                )
            ),
        [shootingPhotos]
    );

    // Couleurs dispo
    const colors = React.useMemo(
        () =>
            Array.from(
                new Set(
                    shootingPhotos
                        .map((p: any) => p.color as string | undefined)
                        .filter(Boolean)
                )
            ),
        [shootingPhotos]
    );

    // Application des filtres
    const filteredPhotos = React.useMemo(() => {
        return shootingPhotos.filter((p: any) => {
            const matchBrand =
                brandFilter === 'all' || (p.brand && p.brand === brandFilter);
            const matchColor =
                colorFilter === 'all' || (p.color && p.color === colorFilter);
            return matchBrand && matchColor;
        });
    }, [shootingPhotos, brandFilter, colorFilter]);

    const goBack = () => navigate('/portfolio/shootings');

    if (!shootingPreview) {
        return (
            <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={goBack}
                        className="mb-8 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Retour aux shootings</span>
                    </button>
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        Shooting introuvable.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 px-6 bg-white dark:bg-black min-h-screen text-black dark:text-white">
            <div className="max-w-6xl mx-auto">
                {/* Bouton retour */}
                <button
                    onClick={goBack}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Retour aux shootings
                </button>

                {/* HEADER */}
                <header className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center mb-10 md:mb-14">
                    {/* Texte */}
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            {shootingPreview.title ||
                                shootingId?.replace(/-/g, ' ') ||
                                'Shooting'}
                        </h1>

                        <div className="h-[3px] w-28 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-6" />

                        {shootingPreview.date && (
                            <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 mb-4">
                                {shootingPreview.date}
                            </p>
                        )}

                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
                            {shootingPreview.description ||
                                'Sélection de clichés réalisés lors de ce shooting.'}
                        </p>

                        <p className="mt-10 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                            {filteredPhotos.length} photo
                            {filteredPhotos.length > 1 ? 's' : ''} affichée
                            {filteredPhotos.length > 1 ? 's' : ''} sur{' '}
                            {shootingPhotos.length}.
                        </p>
                    </div>

                    {/* Image / affiche */}
                    <div className="relative rounded-3xl overflow-hidden bg-black/10 dark:bg-white/5 shadow-[0_22px_60px_rgba(0,0,0,0.6)]">
                        <div className="aspect-[4/3]">
                            <img
                                src={shootingPreview.src}
                                alt={shootingPreview.alt}
                                className="w-full h-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                        </div>
                    </div>
                </header>

                {/* 🎛️ Filtres Marque / Couleur — version mobile-friendly */}
                {(brands.length > 0 || colors.length > 0) && (
                    <div className="mb-10 space-y-4">
                        {/* Marque */}
                        {brands.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 mr-1">
                  Marque
                </span>
                                <div className="flex flex-nowrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setBrandFilter('all')}
                                        className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs md:text-sm border ${
                                            brandFilter === 'all'
                                                ? 'bg-yellow-400 text-black border-yellow-400'
                                                : 'border-gray-500/60 text-gray-200 hover:bg-black/10'
                                        }`}
                                    >
                                        Toutes
                                    </button>
                                    {brands.map((brand) => (
                                        <button
                                            key={brand}
                                            type="button"
                                            onClick={() => setBrandFilter(brand)}
                                            className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs md:text-sm border ${
                                                brandFilter === brand
                                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                                    : 'border-gray-500/60 text-gray-200 hover:bg-black/10'
                                            }`}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Couleur */}
                        {colors.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 mr-1">
                  Couleur
                </span>
                                <div className="flex flex-nowrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setColorFilter('all')}
                                        className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs md:text-sm border ${
                                            colorFilter === 'all'
                                                ? 'bg-yellow-400 text-black border-yellow-400'
                                                : 'border-gray-500/60 text-gray-200 hover:bg-black/10'
                                        }`}
                                    >
                                        Toutes
                                    </button>
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setColorFilter(color)}
                                            className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs md:text-sm border ${
                                                colorFilter === color
                                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                                    : 'border-gray-500/60 text-gray-200 hover:bg-black/10'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Mosaïque */}
                <MasonryGrid photos={filteredPhotos} />
            </div>
        </div>
    );
};

export default ShootingDetailPage;