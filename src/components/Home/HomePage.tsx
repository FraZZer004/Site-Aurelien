import React from 'react';
import HeroSection from './HeroSection';
import FadeInSection from '../UI/FadeInSection';
import AboutFeatureCards from '../Home/AboutFeatureCards';

const HomePage: React.FC = () => {
    return (
        <div>
            <HeroSection />

            <section className="py-24 px-6 bg-white dark:bg-black">
                <div className="max-w-4xl mx-auto">

                    <FadeInSection>
                        <div className="text-center">
                            <h2 className="text-3xl font-light text-black dark:text-white">
                                À propos
                            </h2>

                            {/* petite barre gradient sous le titre */}
                            <div className="mt-3 h-[3px] w-20 mx-auto rounded-full bg-gradient-to-r #4A4A4A from-transparent via-white to-transparent" />
                        </div>
                    </FadeInSection>

                    {/* 🔥 insertion des 3 cartes ici */}
                    <FadeInSection delay={200}>
                        <AboutFeatureCards />
                    </FadeInSection>

                    {/* Texte 1 */}
                    <FadeInSection delay={400}>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-12 mb-8">
                            Passionné par le dessin, j’ai découvert il y a quelques années un véritable attrait pour la photographie.
                            Mon objectif, dans la photo automobile, est de capturer les instants uniques des voitures d’exception.
                            Lorsque je travaille avec un client, je cherche avant tout à mettre en valeur son véhicule et à lui offrir
                            un souvenir mémorable à travers mes clichés. La photographie me permet aussi de provoquer des rencontres
                            et de partager cette passion autour de l’automobile.
                        </p>
                    </FadeInSection>

                    {/* Texte 2 */}
                    <FadeInSection delay={600}>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            Je participe également à différents événements automobiles, comme le Prestige Auto de Beaune, des
                            rassemblements ou encore des journées sur circuit, afin d’enrichir mon portfolio et partager cette passion.
                            En parallèle, je développe aussi d’autres thématiques photographiques : la street photography, les paysages
                            et la photographie animalière, qui nourrissent mon regard et apportent une diversité à mon travail.
                        </p>
                    </FadeInSection>
                </div>
            </section>
        </div>
    );
};

export default HomePage;