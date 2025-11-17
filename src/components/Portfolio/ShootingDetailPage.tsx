// src/components/Portfolio/ShootingDetailPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { photos } from '../../data/photos';
import CarouselBlock from './CarouselBlock';
import { Photo } from '../../types';

type BrandFilter = 'all' | string;
type ColorFilter = 'all' | string;

interface SubShootingGroup {
    id: string;
    photos: Photo[];
    brand?: string;
    color?: string;
    title: string;
    date: string;
    description: string;
}

const ShootingDetailPage: React.FC = () => {
    const { shootingId } = useParams<{ shootingId: string }>();
    const navigate = useNavigate();

    // Photo "preview" pour le header de la section (Shootings Auto / Moto / Divers)
    const shootingPreview = photos.find(
        (p) =>
            p.categoryId === 'shootings' &&
            (p as any).shootingId === shootingId &&
            p.isPreview
    );

    // Toutes les photos de cette section (sans la preview)
    const shootingPhotos: Photo[] = photos.filter(
        (p) =>
            p.categoryId === 'shootings' &&
            (p as any).shootingId === shootingId &&
            !p.isPreview
    );

    const [brandFilter, setBrandFilter] = React.useState<BrandFilter>('all');
    const [colorFilter, setColorFilter] = React.useState<ColorFilter>('all');

    // Regroupement par "subShooting" (BMW M4 Competition, etc.)
    const subShootingGroups: SubShootingGroup[] = React.useMemo(() => {
        const groupsMap: Record<string, Photo[]> = {};

        shootingPhotos.forEach((photo: any) => {
            const key = photo.subEventId || photo.id; // identifiant du shooting
            if (!groupsMap[key]) {
                groupsMap[key] = [];
            }
            groupsMap[key].push(photo);
        });

        return Object.entries(groupsMap).map(([id, groupPhotos]) => {
            const first = groupPhotos[0] as any;

            return {
                id,
                photos: groupPhotos,
                brand: first.brand as string | undefined,
                color: first.color as string | undefined,
                title: first.title || first.alt,
                date: first.date || '',
                description: first.description || '',
            };
        });
    }, [shootingPhotos]);

    // Marques disponibles (à partir des shootings, pas des photos individuelles)
    const brands = React.useMemo(
        () =>
            Array.from(
                new Set(
                    subShootingGroups
                        .map((g) => g.brand)
                        .filter((b): b is string => Boolean(b))
                )
            ),
        [subShootingGroups]
    );

    // Couleurs disponibles
    const colors = React.useMemo(
        () =>
            Array.from(
                new Set(
                    subShootingGroups
                        .map((g) => g.color)
                        .filter((c): c is string => Boolean(c))
                )
            ),
        [subShootingGroups]
    );

    // Application des filtres sur les shootings (cards)
    const filteredGroups = React.useMemo(
        () =>
            subShootingGroups.filter((g) => {
                const matchBrand =
                    brandFilter === 'all' || (g.brand && g.brand === brandFilter);
                const matchColor =
                    colorFilter === 'all' || (g.color && g.color === colorFilter);
                return matchBrand && matchColor;
            }),
        [subShootingGroups, brandFilter, colorFilter]
    );

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
                        Shooting non trouvé.
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

                {/* 🔥 HEADER aligné sur la page Évènements */}
                <header className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center mb-10 md:mb-14">
                    {/* Texte à gauche */}
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            {shootingPreview.title ||
                                shootingId?.replace(/-/g, ' ') ||
                                'Shootings'}
                        </h1>

                        {/* Soulignement dégradé or */}
                        <div className="h-[3px] w-28 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-6" />

                        {shootingPreview.date && (
                            <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 mb-4">
                                {shootingPreview.date}
                            </p>
                        )}

                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
                            {shootingPreview.description ||
                                'Sélection de shootings réalisés autour de cette thématique.'}
                        </p>

                        {/* Compteur de shootings */}
                        <p className="mt-10 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                            {filteredGroups.length} shooting
                            {filteredGroups.length > 1 ? 's' : ''} affiché
                            {filteredGroups.length > 1 ? 's' : ''} sur{' '}
                            {subShootingGroups.length}.
                        </p>
                    </div>

                    {/* Image de la section à droite */}
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

                {/* 🎛️ Filtres Marque / Couleur (même style que événements) */}
                {(brands.length > 0 || colors.length > 0) && (
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="hidden md:block" />

                        <div className="flex flex-wrap gap-3 md:justify-end">
                            {/* Filtre marque */}
                            {brands.length > 0 && (
                                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Marque
                  </span>
                                    <div className="inline-flex rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 overflow-hidden text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setBrandFilter('all')}
                                            className={`px-3 py-1.5 ${
                                                brandFilter === 'all'
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            Toutes
                                        </button>
                                        {brands.map((brand) => (
                                            <button
                                                key={brand}
                                                type="button"
                                                onClick={() => setBrandFilter(brand)}
                                                className={`px-3 py-1.5 ${
                                                    brandFilter === brand
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
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
                                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Couleur
                  </span>
                                    <div className="inline-flex rounded-full bg-black/5 dark:bg:white/5 border border-black/10 dark:border-white/15 overflow-hidden text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setColorFilter('all')}
                                            className={`px-3 py-1.5 ${
                                                colorFilter === 'all'
                                                    ? 'bg-yellow-400 text-black'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            Toutes
                                        </button>
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setColorFilter(color)}
                                                className={`px-3 py-1.5 ${
                                                    colorFilter === color
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
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

                {/* 🧱 Grille existante : on ne change rien au style des cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGroups.map((group) => (
                        <CarouselBlock
                            key={group.id}
                            photos={group.photos}
                            title={group.title}
                            date={group.date}
                            description={group.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShootingDetailPage;