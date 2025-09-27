import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import { ArrowLeft } from 'lucide-react';
import MasonryGrid from './MasonryGrid';

const ShootingDetailPage: React.FC = () => {
    const { shootingId } = useParams<{ shootingId: string }>();
    const navigate = useNavigate();

    // Preview du shooting (titre / description)
    const shootingPreview = photos.find(
        p =>
            p.categoryId === 'shootings' &&
            p.shootingId === shootingId &&
            p.isPreview
    );

    // Toutes les photos du shooting (hors preview)
    const shootingPhotos = photos.filter(
        p =>
            p.categoryId === 'shootings' &&
            p.shootingId === shootingId &&
            !p.isPreview
    );

    const goBack = () => navigate('/portfolio/shootings');

    if (!shootingPreview) {
        return (
            <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        Shooting non trouvé
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={goBack}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Retour aux shootings
                </button>

                <h1 className="text-3xl md:text-4xl font-light mb-4 text-black dark:text-white">
                    {shootingPreview.title || shootingId?.replace(/-/g, ' ')}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-12">
                    {shootingPreview.date} — {shootingPreview.description}
                </p>

                {/* Mosaïque de photos — identique à la page Évènements */}
                <MasonryGrid photos={shootingPhotos} />
            </div>
        </div>
    );
};

export default ShootingDetailPage;