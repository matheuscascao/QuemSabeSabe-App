import React from 'react';
import { categories } from '../data/categories';
import { CategoryCard } from '../components/quiz/CategoryCard';

export const CategoriesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Categories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our diverse range of quiz categories and challenge yourself in your favorite subjects.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};