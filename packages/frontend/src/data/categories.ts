import { Category } from '../types';
import { FlaskRound as Flask, Calculator, BookOpen, Trophy, Palette, Globe, Film, Cpu } from 'lucide-react';

export const categories: Category[] = [
  {
    id: 'science',
    name: 'Science',
    icon: 'Flask',
    description: 'Test your knowledge of biology, chemistry, physics, and more.',
    color: {
      primary: 'bg-category-science-500',
      secondary: 'bg-category-science-700',
      background: 'bg-category-science-50',
      text: 'text-category-science-900'
    }
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'Calculator',
    description: 'Challenge yourself with arithmetic, algebra, geometry and more.',
    color: {
      primary: 'bg-category-mathematics-500',
      secondary: 'bg-category-mathematics-700',
      background: 'bg-category-mathematics-50',
      text: 'text-category-mathematics-900'
    }
  },
  {
    id: 'history',
    name: 'History',
    icon: 'BookOpen',
    description: 'Explore ancient civilizations, world wars, and significant historical events.',
    color: {
      primary: 'bg-category-history-500',
      secondary: 'bg-category-history-700',
      background: 'bg-category-history-50',
      text: 'text-category-history-900'
    }
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'Trophy',
    description: 'Test your knowledge of various sports, records, and famous athletes.',
    color: {
      primary: 'bg-category-sports-500',
      secondary: 'bg-category-sports-700',
      background: 'bg-category-sports-50',
      text: 'text-category-sports-900'
    }
  },
  {
    id: 'arts',
    name: 'Arts',
    icon: 'Palette',
    description: 'Challenge yourself with questions about paintings, music, and literature.',
    color: {
      primary: 'bg-category-arts-500',
      secondary: 'bg-category-arts-700',
      background: 'bg-category-arts-50',
      text: 'text-category-arts-900'
    }
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: 'Globe',
    description: 'Explore countries, capitals, landmarks, and natural wonders.',
    color: {
      primary: 'bg-category-geography-500',
      secondary: 'bg-category-geography-700',
      background: 'bg-category-geography-50',
      text: 'text-category-geography-900'
    }
  },
  {
    id: 'cinema',
    name: 'Cinema',
    icon: 'Film',
    description: 'Test your knowledge of movies, directors, actors, and film history.',
    color: {
      primary: 'bg-category-cinema-500',
      secondary: 'bg-category-cinema-700',
      background: 'bg-category-cinema-50',
      text: 'text-category-cinema-900'
    }
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'Cpu',
    description: 'Challenge yourself with questions about computers, gadgets, and tech history.',
    color: {
      primary: 'bg-category-technology-500',
      secondary: 'bg-category-technology-700',
      background: 'bg-category-technology-50',
      text: 'text-category-technology-900'
    }
  }
];

export const getCategoryById = (id: string) => {
  return categories.find(category => category.id === id);
};

export const getCategoryIcon = (iconName: string) => {
  const icons = {
    'Flask': Flask,
    'Calculator': Calculator,
    'BookOpen': BookOpen,
    'Trophy': Trophy,
    'Palette': Palette,
    'Globe': Globe,
    'Film': Film,
    'Cpu': Cpu,
  };
  
  return icons[iconName as keyof typeof icons] || Flask;
};