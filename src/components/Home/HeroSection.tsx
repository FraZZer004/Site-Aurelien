import React from 'react';
import FadeInSection from '../UI/FadeInSection';

const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('https://i.postimg.cc/13F88hGh/IMG-8199.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
        <div className="max-w-xl text-center">
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
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="py-3 px-8 border border-white text-white hover:bg-white hover:text-black transition-colors duration-300 text-sm uppercase tracking-wider"
            >
              Découvrir
            </button>
          </FadeInSection>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;