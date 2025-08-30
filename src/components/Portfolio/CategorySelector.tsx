import React from 'react';
import { PhotographyCategory } from '../../types';
import FadeInSection from '../UI/FadeInSection';

interface CategorySelectorProps {
  categories: PhotographyCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <FadeInSection>
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-6 py-2 text-sm transition-all duration-300 ${
              selectedCategoryId === category.id
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </FadeInSection>
  );
};

export default CategorySelector;