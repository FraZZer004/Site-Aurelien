import React from 'react';
import { useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

interface EventPreview {
    eventId: string;
    title: string;
    date?: string;
    description?: string;
    src: string;
    alt: string;
}

/**
 * On construit la liste des évènements à partir des photos
 * de catégorie "events" qui ont isPreview = true.
 */
const buildEventPreviews = (): EventPreview[] => {
    const eventPreviews = photos.filter(
        (p) => p.categoryId === 'events' && p.isPreview
    ) as any[];

    return eventPreviews.map((p) => ({
        eventId: p.eventId as string,
        title: p.title || p.alt || 'Évènement',
        date: p.date,
        description: p.description,
        src: p.src,
        alt: p.alt,
    }));
};

/**
 * Essaie de convertir la date string en Date pour trier.
 * Si la conversion échoue, on renvoie 0 (équivalent).
 */
const getDateValue = (dateStr?: string): number => {
    if (!dateStr) return 0;
    // On tente un parse robuste : si c'est déjà “YYYY-MM-DD” ou autre.
    const parsed = Date.parse(dateStr);
    if (!Number.isNaN(parsed)) return parsed;

    // Si c'est un format genre "16/05 - 18/05/2025", on prend la dernière date.
    const match = dateStr.match(/(\d{2}\/\d{2}\/\d{4})/g);
    if (match && match.length > 0) {
        const last = match[match.length - 1];
        const [d, m, y] = last.split('/');
        const iso = `${y}-${m}-${d}`;
        const parsed2 = Date.parse(iso);
        return Number.isNaN(parsed2) ? 0 : parsed2;
    }

    return 0;
};

const EventGalleryPage: React.FC = () => {
    const navigate = useNavigate();
    const [sortOption, setSortOption] = React.useState<SortOption>('date-desc');

    const events = React.useMemo(() => buildEventPreviews(), []);
    const eventsCount = events.length;

    const sortedEvents = React.useMemo(() => {
        const cloned = [...events];

        cloned.sort((a, b) => {
            const dateA = getDateValue(a.date);
            const dateB = getDateValue(b.date);
            const nameA = a.title.toLowerCase();
            const nameB = b.title.toLowerCase();

            switch (sortOption) {
                case 'date-asc':
                    return dateA - dateB;
                case 'date-desc':
                    return dateB - dateA;
                case 'name-asc':
                    return nameA.localeCompare(nameB, 'fr');
                case 'name-desc':
                    return nameB.localeCompare(nameA, 'fr');
                default:
                    return 0;
            }
        });

        return cloned;
    }, [events, sortOption]);

    const handleOpenEvent = (eventId: string) => {
        navigate(`/portfolio/events/${eventId}`);
    };

    return (
        <section className="min-h-screen py-20 px-6 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* HEADER (style 2ᵉ capture) */}
                <header className="mb-10 md:mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                        Événements
                    </h1>

                    {/* Soulignement dégradé */}
                    <div className="h-[3px] w-24 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-6" />

                    <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
                        Découvre les différents événements couverts&nbsp;: salons,
                        rassemblements, circuits et rencontres autour de l&apos;automobile.
                        Utilise les filtres pour organiser les évènements par date ou par nom.
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {eventsCount} évènement{eventsCount > 1 ? 's' : ''} disponible
                        {eventsCount > 1 ? 's' : ''}.
                    </p>

                    {/* Barre de tri alignée à droite sur desktop */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {/* espace à gauche, on peut laisser vide ou mettre quelque chose plus tard */}
            </span>

                        <div className="flex items-center gap-3 md:justify-end">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Trier par
              </span>
                            <div className="inline-flex rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/20 overflow-hidden text-sm">
                                <button
                                    type="button"
                                    onClick={() => setSortOption('date-desc')}
                                    className={`px-4 py-2 whitespace-nowrap ${
                                        sortOption === 'date-desc'
                                            ? 'bg-yellow-400 text-black'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                                    }`}
                                >
                                    Date (récent)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSortOption('date-asc')}
                                    className={`px-4 py-2 whitespace-nowrap ${
                                        sortOption === 'date-asc'
                                            ? 'bg-yellow-400 text-black'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                                    }`}
                                >
                                    Date (ancien)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSortOption('name-asc')}
                                    className={`px-4 py-2 whitespace-nowrap ${
                                        sortOption === 'name-asc'
                                            ? 'bg-yellow-400 text-black'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                                    }`}
                                >
                                    Nom A–Z
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSortOption('name-desc')}
                                    className={`px-4 py-2 whitespace-nowrap ${
                                        sortOption === 'name-desc'
                                            ? 'bg-yellow-400 text-black'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                                    }`}
                                >
                                    Nom Z–A
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CARTES ÉVÈNEMENTS (style 1ʳᵉ capture) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedEvents.map((event) => (
                        <button
                            key={event.eventId}
                            onClick={() => handleOpenEvent(event.eventId)}
                            className="
                group relative w-full text-left
                overflow-hidden rounded-3xl
                bg-black/80 dark:bg-black
                shadow-[0_20px_45px_rgba(0,0,0,0.6)]
                transition-transform duration-300 hover:-translate-y-2
              "
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                                <img
                                    src={event.src}
                                    alt={event.alt}
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Gradient en bas */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

                                {/* Texte en bas */}
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <h2 className="text-lg md:text-xl font-light text-white mb-1">
                                        {event.title}
                                    </h2>
                                    {event.date && (
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-300 mb-1">
                                            {event.date}
                                        </p>
                                    )}
                                    {event.description && (
                                        <p className="text-xs text-gray-200 line-clamp-1">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventGalleryPage;