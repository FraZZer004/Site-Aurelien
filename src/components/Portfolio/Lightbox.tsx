import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../../types';

interface LightboxProps {
    photo: Photo | null;
    photos: Photo[];
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
    // On le laisse pour compatibilité, mais on ne s'y fie plus
    currentIndex?: number;
}

const Lightbox: React.FC<LightboxProps> = ({
                                               photo,
                                               photos,
                                               onClose,
                                               onNavigate,
                                           }) => {
    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

    const minSwipeDistance = 50;

    // Gestion clavier : ESC ferme, flèches naviguent
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'ArrowLeft') {
                onNavigate('prev');
            }
            if (e.key === 'ArrowRight') {
                onNavigate('next');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose, onNavigate]);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (touchStart === null || touchEnd === null) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && hasNext) {
            onNavigate('next');
        }
        if (isRightSwipe && hasPrev) {
            onNavigate('prev');
        }
    };

    if (!photo) return null;

    // 🔥 Index calculé directement à partir de `photo` et `photos`
    let activeIndex = photos.indexOf(photo);

    // Si pour une raison quelconque la référence n’est pas la même, fallback par src
    if (activeIndex === -1) {
        const idxBySrc = photos.findIndex((p) => p.src === photo.src);
        activeIndex = idxBySrc >= 0 ? idxBySrc : 0;
    }

    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < photos.length - 1;
    const isVideo = photo.src.match(/\.(mp4|mov|webm)$/i);

    return (
        // Fond noir cliquable → ferme la lightbox
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Contenu : on bloque la propagation du clic pour ne pas fermer */}
            <div
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-white p-3 md:p-2 hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full"
                    aria-label="Fermer"
                >
                    <X size={24} className="md:w-7 md:h-7" />
                </button>

                {hasPrev && (
                    <button
                        onClick={() => onNavigate('prev')}
                        className="
                            absolute left-2 md:left-4 top-1/2 -translate-y-1/2
                            p-3 md:p-2
                            text-yellow-300
                            rounded-full
                            bg-white/5
                            backdrop-blur-sm
                            border border-yellow-400/30
                            hover:bg-yellow-300/20
                            hover:text-yellow-200
                            transition-all duration-200
                            z-10
                        "
                        aria-label="Photo précédente"
                    >
                        <ChevronLeft size={28} className="md:w-8 md:h-8" />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={() => onNavigate('next')}
                        className="
                            absolute right-2 md:right-4 top-1/2 -translate-y-1/2
                            p-3 md:p-2
                            text-yellow-300
                            rounded-full
                            bg-white/5
                            backdrop-blur-sm
                            border border-yellow-400/30
                            hover:bg-yellow-300/20
                            hover:text-yellow-200
                            transition-all duration-200
                            z-10
                        "
                        aria-label="Photo suivante"
                    >
                        <ChevronRight size={28} className="md:w-8 md:h-8" />
                    </button>
                )}

                {/* Zones de toucher invisibles pour mobile */}
                {hasPrev && (
                    <div
                        className="absolute left-0 top-0 w-1/3 h-full md:hidden z-5"
                        onClick={() => onNavigate('prev')}
                        aria-label="Zone tactile - Photo précédente"
                    />
                )}

                {hasNext && (
                    <div
                        className="absolute right-0 top-0 w-1/3 h-full md:hidden z-5"
                        onClick={() => onNavigate('next')}
                        aria-label="Zone tactile - Photo suivante"
                    />
                )}

                <div className="w-full h-full flex items-center justify-center relative">
                    {isVideo ? (
                        <video
                            src={photo.src}
                            controls
                            autoPlay={false}
                            loop={photo.loop}
                            muted={photo.muted}
                            poster={photo.poster}
                            playsInline
                            className="max-h-[80vh] max-w-full object-contain mx-auto"
                        >
                            Votre navigateur ne supporte pas la vidéo.
                        </video>
                    ) : (
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            className="max-h-[80vh] max-w-full object-contain mx-auto block"
                        />
                    )}
                </div>

                {/* Infos photo/vidéo */}
                <div className="absolute bottom-20 md:bottom-16 left-4 right-4 text-white text-center">
                    <div className="mt-4 text-white px-2">
                        <div className="flex justify-between items-center text-sm text-gray-300">
                            <span>{photo.date}</span>
                            <span>{photo.description}</span>
                        </div>
                    </div>
                </div>

                {/* Indicateur desktop (numérique) */}
                <div
                    className="
                        hidden md:flex
                        absolute bottom-8 left-1/2 -translate-x-1/2
                        px-4 py-1.5
                        rounded-full
                        bg-black/40
                        backdrop-blur-sm
                        border border-yellow-400/30
                        text-yellow-300
                        text-sm font-light tracking-wide
                    "
                >
                    {activeIndex + 1} / {photos.length}
                </div>

                {/* Indicateur mobile (numérique) */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex justify-center md:hidden">
                    <div className="px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium tracking-wide">
                        {activeIndex + 1} / {photos.length}
                    </div>
                </div>

                {/* Instructions mobile */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs opacity-70 md:hidden text-center">
                    Glissez ou touchez les côtés pour naviguer
                </div>
            </div>
        </div>
    );
};

export default Lightbox;