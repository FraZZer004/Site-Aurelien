import React from 'react';
import HeroSection from './HeroSection';
import FadeInSection from '../UI/FadeInSection';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      
      <section className="py-24 px-6 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <h2 className="text-3xl font-light mb-12 text-center text-black dark:text-white">À propos</h2>
          </FadeInSection>
          
          <FadeInSection delay={300}>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Passionné par l'automobile et la photographie depuis plus petit, je me spécialise dans la capture de l'essence et de la beauté des véhicules d'exception. Mon approche combine technique, précision et vision artistique pour créer des images qui racontent une histoire.
            </p>
          </FadeInSection>
          
          <FadeInSection delay={600}>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Des événements prestigieux aux séances sur mesure, chaque projet est une occasion de sublimer ces œuvres d'art automobiles. Mon portfolio reflète ma quête constante de l'image parfaite, où lumière, composition et émotion se rencontrent.
            </p>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;