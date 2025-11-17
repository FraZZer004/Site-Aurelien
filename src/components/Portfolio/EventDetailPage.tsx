import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { photos } from '../../data/photos';
import MasonryGrid from './MasonryGrid';
import { Photo } from '../../types';

type BrandFilter = 'all' | string;
type ColorFilter = 'all' | string;

const EventDetailPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // Photo "preview" de l'évènement pour le header
    const eventPreview = photos.find(
        (p) =>
            p.categoryId === 'events' &&
            (p as any).eventId === eventId &&
            p.isPreview
    );

    // Toutes les photos de l'évènement (sans la preview)
    const eventPhotos: Photo[] = photos.filter(
        (p) =>
            p.categoryId === 'events' &&
            (p as any).eventId === eventId &&
            !p.isPreview
    );

    const [brandFilter, setBrandFilter] = React.useState<BrandFilter>('all');
    const [colorFilter, setColorFilter] = React.useState<ColorFilter>('all');

    // Marques disponibles
    const brands = React.useMemo(
        () =>
            Array.from(
                new Set(
                    eventPhotos
                        .map((p: any) => p.brand as string | undefined)
                        .filter(Boolean)
                )
            ),
        [eventPhotos]
    );

    // Couleurs disponibles
    const colors = React.useMemo(
        () =>
            Array.from(
                new Set(
                    eventPhotos
                        .map((p: any) => p.color as string | undefined)
                        .filter(Boolean)
                )
            ),
        [eventPhotos]
    );

    // Application des filtres
    const filteredPhotos = React.useMemo(() => {
        return eventPhotos.filter((p: any) => {
            const matchBrand =
                brandFilter === 'all' || (p.brand && p.brand === brandFilter);
            const matchColor =
                colorFilter === 'all' || (p.color && p.color === colorFilter);
            return matchBrand && matchColor;
        });
    }, [eventPhotos, brandFilter, colorFilter]);

    const goBack = () => navigate('/portfolio/events');

    if (!eventPreview) {
        return (
            <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={goBack}
                        className="mb-8 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Retour aux événements</span>
                    </button>
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        Évènement introuvable.
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
                    Retour aux événements
                </button>

                {/* 🔥 HEADER type "Prestige Auto 2025" */}
                <header className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center mb-10 md:mb-14">
                    {/* Texte à gauche */}
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            {eventPreview.title || eventId?.replace(/-/g, ' ')}
                        </h1>

                        {/* Soulignement dégradé or */}
                        <div className="h-[3px] w-28 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-6" />

                        {eventPreview.date && (
                            <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 mb-4">
                                {eventPreview.date}
                            </p>
                        )}

                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
                            {eventPreview.description ||
                                'Sélection de clichés réalisés lors de cet évènement automobile.'}
                        </p>

                        {/* Compteur de photos sous le texte, comme sur ton screen */}
                        <p className="mt-10 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                            {filteredPhotos.length} photo
                            {filteredPhotos.length > 1 ? 's' : ''} affichée
                            {filteredPhotos.length > 1 ? 's' : ''} sur {eventPhotos.length}.
                        </p>
                    </div>

                    {/* Affiche / image à droite */}
                    <div className="relative rounded-3xl overflow-hidden bg-black/10 dark:bg-white/5 shadow-[0_22px_60px_rgba(0,0,0,0.6)]">
                        <div className="aspect-[4/3]">
                            <img
                                src={eventPreview.src}
                                alt={eventPreview.alt}
                                className="w-full h-full object-cover"
                            />
                            {/* léger fondu sur les bords */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                        </div>
                    </div>
                </header>

                {/* 🎛️ Filtres Marque / Couleur */}
                {(brands.length > 0 || colors.length > 0) && (
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* pour alignement desktop avec le header */}
                        <div className="hidden md:block" />

                        <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:justify-end">
                            {/* Filtre marque */}
                            {brands.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Marque
                  </span>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setBrandFilter('all')}
                                            className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                                                brandFilter === 'all'
                                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                                    : 'bg-transparent text-gray-600 dark:text-gray-300 border-black/10 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            Toutes
                                        </button>

                                        {brands.map((brand) => (
                                            <button
                                                key={brand}
                                                type="button"
                                                onClick={() => setBrandFilter(brand)}
                                                className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                                                    brandFilter === brand
                                                        ? 'bg-yellow-400 text-black border-yellow-400'
                                                        : 'bg-transparent text-gray-600 dark:text-gray-300 border-black/10 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filtre couleur */}
                            {colors.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Couleur
                  </span>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setColorFilter('all')}
                                            className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                                                colorFilter === 'all'
                                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                                    : 'bg-transparent text-gray-600 dark:text-gray-300 border-black/10 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            Toutes
                                        </button>

                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setColorFilter(color)}
                                                className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                                                    colorFilter === color
                                                        ? 'bg-yellow-400 text-black border-yellow-400'
                                                        : 'bg-transparent text-gray-600 dark:text-gray-300 border-black/10 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 🧱 Mosaïque existante */}
                <MasonryGrid photos={filteredPhotos} />
            </div>
        </div>
    );
};

export default EventDetailPage;