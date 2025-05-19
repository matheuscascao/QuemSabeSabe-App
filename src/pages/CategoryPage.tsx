import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { getCategoryById, getCategoryIcon } from '../data/categories';
import { getQuizzesByCategory } from '../data/quizzes';
import { QuizCard } from '../components/quiz/QuizCard';
import { ArrowLeft } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const category = categoryId ? getCategoryById(categoryId) : null;
  const quizzes = categoryId ? getQuizzesByCategory(categoryId) : [];
  
  // Animation sequence for quiz cards
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (!category) {
      navigate('/categories');
      return;
    }
    
    // Delay to allow animations to trigger
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [category, navigate]);
  
  if (!category) return null;
  
  const Icon = getCategoryIcon(category.icon);
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <Link to="/categories" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to categories</span>
      </Link>
      
      <header className={`rounded-xl ${category.color.background} p-6 mb-8 animate-fade-in`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className={`${category.color.primary} text-white p-3 rounded-full`}>
            <Icon size={28} />
          </div>
          
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${category.color.text} mb-1`}>
              {category.name} Quizzes
            </h1>
            <p className="text-gray-700">
              {category.description}
            </p>
          </div>
        </div>
      </header>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Available Quizzes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoaded && quizzes.map((quiz, index) => (
            <div key={quiz.id} className={`transition-all duration-500 delay-${index * 100}`}>
              <QuizCard quiz={quiz} />
            </div>
          ))}
        </div>
        
        {quizzes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No quizzes available in this category yet.</p>
            <Button variant="outline">
              Try another category
            </Button>
          </div>
        )}
      </section>
      
      <section>
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-primary-800 mb-2">
            Want to create your own {category.name.toLowerCase()} quiz?
          </h3>
          <p className="text-primary-600 mb-4">
            Share your knowledge with the community and challenge others!
          </p>
          <Button variant="primary">
            Create New Quiz
          </Button>
        </div>
      </section>
    </div>
  );
};