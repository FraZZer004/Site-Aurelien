import React from 'react';
import { Camera, Heart, Users } from 'lucide-react';

const baseCard =
    'relative overflow-hidden rounded-3xl bg-[rgb(29,29,29)] border border-white/5 px-8 py-8 flex flex-col gap-4 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)]';

const iconWrapper =
    'h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400';

const titleClass = 'text-lg font-semibold text-white';
const textClass = 'text-sm text-gray-400 leading-relaxed';

const AboutFeatureCards: React.FC = () => {
    return (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

            <div className={baseCard}>
                <div className={iconWrapper}>
                    <Camera size={22} />
                </div>
                <div>
                    <h3 className={titleClass}>Photographie Automobile</h3>
                    <p className={textClass}>
                        Spécialisé dans la capture de véhicules d’exception avec un œil artistique unique.
                    </p>
                </div>
            </div>

            <div className={baseCard}>
                <div className={iconWrapper}>
                    <Heart size={22} />
                </div>
                <div>
                    <h3 className={titleClass}>Passion & Créativité</h3>
                    <p className={textClass}>
                        Chaque cliché raconte une histoire, chaque voiture devient une œuvre d’art.
                    </p>
                </div>
            </div>

            <div className={baseCard}>
                <div className={iconWrapper}>
                    <Users size={22} />
                </div>
                <div>
                    <h3 className={titleClass}>Événements</h3>
                    <p className={textClass}>
                        Présent sur les circuits et rassemblements automobiles prestigieux.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default AboutFeatureCards;