import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../data/categories';
import FadeInSection from '../UI/FadeInSection';

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/portfolio/${categoryId}`);
  };
  
  return (
    <div className="py-20 px-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Portfolio</h1>
        </FadeInSection>
        
        <FadeInSection delay={200}>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-12">
            Découvrez une sélection de mes travaux photographiques, organisés par catégorie.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <FadeInSection key={category.id} delay={300 + index * 100}>
              <button
                onClick={() => handleCategoryClick(category.id)}
                className="group w-full h-64 relative overflow-hidden rounded-lg transition-all duration-300"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transform transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    backgroundImage: `url(${category.previewImage})`,
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 text-left">
                  <h2 className="text-2xl font-light mb-2 text-white">{category.name}</h2>
                  <p className="text-sm text-gray-200">{category.description}</p>
                </div>
              </button>
            </FadeInSection>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;