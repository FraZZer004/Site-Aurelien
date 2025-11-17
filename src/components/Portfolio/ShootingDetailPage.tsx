import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { photos } from '../../data/photos';
import { Photo } from '../../types';
import PhotoCard from './PhotoCard';

type BrandFilter = 'all' | string;
type ColorFilter = 'all' | string;

interface ShootingGroup {
    key: string;          // clé de regroupement (ici : title)
    preview: Photo;       // photo utilisée pour l’aperçu de la carte
    photos: Photo[];      // toutes les photos de cette voiture
    brand?: string;
    color?: string;
}

const ShootingDetailPage: React.FC = () => {
    const { shootingId } = useParams<{ shootingId: string }>();
    const navigate = useNavigate();

    // Preview du shooting pour le header (affiche de la section auto/moto/divers)
    const shootingPreview = photos.find(
        (p: any) =>
            p.categoryId === 'shootings' &&
            p.shootingId === shootingId &&
            p.isPreview
    ) as Photo | undefined;

    // Toutes les photos de ce shooting (sans la preview de section)
    const shootingPhotos: Photo[] = photos.filter(
        (p: any) =>
            p.categoryId === 'shootings' &&
            p.shootingId === shootingId &&
            !p.isPreview
    );

    const [brandFilter, setBrandFilter] = React.useState<BrandFilter>('all');
    const [colorFilter, setColorFilter] = React.useState<ColorFilter>('all');

    // 🔹 Regrouper les photos par "voiture" (on se base sur le title)
    const groups: ShootingGroup[] = React.useMemo(() => {
        const map = new Map<string, ShootingGroup>();

        shootingPhotos.forEach((p: any) => {
            const key =
                (p.modelId as string | undefined) || // si jamais tu ajoutes un id de modèle un jour
                (p.title as string | undefined) ||
                (p.alt as string | undefined) ||
                p.src; // fallback

            const existing = map.get(key);
            if (!existing) {
                map.set(key, {
                    key,
                    preview: p,
                    photos: [p],
                    brand: p.brand,
                    color: p.color,
                });
            } else {
                existing.photos.push(p);
                // si on trouve une vraie preview pour cette voiture, on la prend
                if (!(existing.preview as any).isPreview && (p as any).isPreview) {
                    existing.preview = p;
                }
            }
        });

        return Array.from(map.values());
    }, [shootingPhotos]);

    // Marques dispo, à partir de toutes les photos du shooting
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

    // 🔹 Application des filtres au NIVEAU DES GROUPES (voitures)
    const filteredGroups = React.useMemo(() => {
        return groups.filter((g) => {
            const matchBrand =
                brandFilter === 'all' || (g.brand && g.brand === brandFilter);
            const matchColor =
                colorFilter === 'all' || (g.color && g.color === colorFilter);
            return matchBrand && matchColor;
        });
    }, [groups, brandFilter, colorFilter]);

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

                {/* HEADER type "Prestige Auto 2025" */}
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
                            {filteredGroups.length} voiture
                            {filteredGroups.length > 1 ? 's' : ''} affichée
                            {filteredGroups.length > 1 ? 's' : ''} sur {groups.length}.
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

                {/* 🎛️ Filtres Marque / Couleur — mobile-friendly */}
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

                {/* 🧱 ICI on remplace la mosaïque de photos par des BOX type dessins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <PhotoCard
                            key={group.key}
                            photos={group.photos}
                            title={group.preview.title || group.preview.alt}
                            date={group.preview.date}
                            description={group.preview.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShootingDetailPage;