import React from 'react';
import FadeInSection from '../UI/FadeInSection';

const HeroSection: React.FC = () => {
    return (
        <div className="relative w-full h-screen">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{
                    backgroundImage: "url('/assets/images/Shooting_perso/RS3/IMG_3841_home.jpg')",
                    // backgroundImage: "url('/assets/images/PAB2025/ShootingsFefe/gmk-7.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
                {/* Wrapper pour pouvoir placer le halo ovale derrière tout le bloc */}
                <div className="relative max-w-xl w-full flex justify-center">
                    {/* 🔥 Halo ovale flou derrière titre + texte + bouton */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            -inset-x-10
                            -inset-y-4
                            rounded-[999px]
                            backdrop-blur-[1.5px]
                            bg-[radial-gradient(
                              ellipse_at_center,
                              rgba(0,0,0,0.65)_0%,
                              rgba(0,0,0,0.50)_25%,
                              rgba(0,0,0,0.30)_55%,
                              rgba(0,0,0,0.12)_75%,
                              rgba(0,0,0,0)_100%
                            )]
                          "
                    />

                    {/* Contenu réel, par-dessus le halo */}
                    <div className="relative text-center">
                        <FadeInSection delay={300}>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
                                Aurélien
                                <br />
                                Communeau
                            </h1>
                        </FadeInSection>

                        <FadeInSection delay={600}>
                            <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-12">
                                Photographe Spécialisé dans le domaine Automobile
                            </p>
                        </FadeInSection>

                        <FadeInSection delay={900}>
                            <button
                                onClick={() =>
                                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                                }
                                className="
                  py-3 px-10
                  text-sm uppercase tracking-wider font-medium
                  text-white
                  bg-[rgb(29,29,29)]/80
                  border border-white/60
                  rounded-full
                  shadow-[0_6px_0_rgba(0,0,0,0.8)]
                  hover:translate-y-[4px]
                  hover:shadow-[0_2px_0_rgba(0,0,0,0.6)]
                  hover:bg-white hover:text-black
                  transition-all duration-200 ease-out
                "
                            >
                                Découvrir
                            </button>
                        </FadeInSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;