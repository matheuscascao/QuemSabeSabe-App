import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { categories } from '../data/categories';
import { CategoryCard } from '../components/quiz/CategoryCard';
import { Play, Trophy, BookOpen, BarChart } from 'lucide-react';

export const HomePage: React.FC = () => {
  // Show only first 4 categories on home page
  const featuredCategories = categories.slice(0, 4);

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="mb-6 animate-slide-down">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Test Your Knowledge
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge yourself with quizzes across multiple categories and track your learning progress.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 animate-slide-up">
          <Button 
            size="lg"
            icon={<Play size={18} />}
            className="animate-bounce-in"
          >
            Quick Play
          </Button>
          <Button 
            size="lg"
            variant="outline"
            icon={<BookOpen size={18} />}
            className="animate-bounce-in"
          >
            Browse Categories
          </Button>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Categories</h2>
          <Link to="/categories" className="text-primary-600 hover:text-primary-800 font-medium text-sm">
            See All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category, index) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Quiz Master?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="animation-delay-100 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="bg-primary-100 text-primary-700 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Trophy size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Learn & Achieve</h3>
              <p className="text-gray-600">
                Track your progress, earn achievements, and level up as you expand your knowledge.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="animation-delay-200 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="bg-category-science-100 text-category-science-700 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Diverse Topics</h3>
              <p className="text-gray-600">
                Explore quizzes across science, math, history, arts, and many more categories.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="animation-delay-300 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="bg-category-cinema-100 text-category-cinema-700 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <BarChart size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed statistics and performance insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-6">
        <Card className="bg-primary-600 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Ready to test your knowledge?</h3>
                <p className="text-primary-100">
                  Start a quiz now and challenge yourself with thought-provoking questions.
                </p>
              </div>
              <Button 
                variant="success"
                size="lg" 
                className="bg-white text-primary-600 hover:bg-gray-100 min-w-[150px]"
                icon={<Play size={16} />}
              >
                Start a Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};