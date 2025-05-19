import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Category } from '../../types';
import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../../data/categories';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const Icon = getCategoryIcon(category.icon);
  
  return (
    <Link 
      to={`/categories/${category.id}`}
      className="block transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded-lg"
    >
      <Card 
        className={`h-full border border-${category.color.text}/10 animate-scale-in`}
        variant="elevated"
      >
        <div className={`${category.color.background} rounded-t-lg p-4 flex justify-between items-center`}>
          <div className={`${category.color.primary} text-white p-3 rounded-full`}>
            <Icon size={24} />
          </div>
          <ArrowRight className={`${category.color.text} opacity-60`} size={20} />
        </div>
        
        <CardHeader className="pb-0">
          <CardTitle className={`${category.color.text} font-semibold`}>
            {category.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 h-10">
            {category.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">3 quizzes</span>
            <div className="flex space-x-1">
              <span className={`px-2 py-0.5 rounded-full ${category.color.background} ${category.color.text} text-xs font-medium`}>
                Easy
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};