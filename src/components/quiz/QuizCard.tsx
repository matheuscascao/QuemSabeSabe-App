import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Quiz } from '../../types';
import { Play, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategoryById } from '../../data/categories';

interface QuizCardProps {
  quiz: Quiz;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate();
  const category = getCategoryById(quiz.categoryId);
  
  if (!category) return null;
  
  const difficultyColors = {
    easy: 'bg-success-50 text-success-700',
    medium: 'bg-warning-50 text-warning-700',
    hard: 'bg-error-50 text-error-700'
  };
  
  const difficultyColor = difficultyColors[quiz.difficulty];
  const difficultyText = quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1);
  
  const totalTime = quiz.timePerQuestion * quiz.questions.length;
  const formattedTime = totalTime >= 60 
    ? `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`
    : `${totalTime}s`;
  
  const handleStartQuiz = () => {
    navigate(`/quiz/${quiz.id}`);
  };
  
  return (
    <Card variant="bordered" className="animate-fade-in">
      <CardHeader className={`${category.color.background} rounded-t-lg pb-3`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`${category.color.text} font-bold`}>
              {quiz.title}
            </CardTitle>
            <CardDescription className="text-gray-700 mt-1">
              {quiz.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
            {difficultyText}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium flex items-center">
            <Award size={12} className="mr-1" />
            {quiz.popularity}% popularity
          </span>
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium flex items-center">
            <Clock size={12} className="mr-1" />
            {formattedTime}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-1">
          {quiz.questions.length} questions
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-end">
        <Button 
          onClick={handleStartQuiz}
          variant="primary"
          size="sm"
          icon={<Play size={16} />}
          iconPosition="right"
        >
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};