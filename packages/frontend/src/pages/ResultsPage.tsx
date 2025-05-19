import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '../store/quiz-store';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getQuizById } from '../data/quizzes';
import { getCategoryById } from '../data/categories';
import { Progress } from '../components/ui/progress';
import { Award, Clock, Home, RotateCcw, Share2 } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const getQuizResult = useQuizStore(state => state.getQuizResult);
  const getCorrectAnswersCount = useQuizStore(state => state.getCorrectAnswersCount);
  const selectedAnswers = useQuizStore(state => state.selectedAnswers);
  const activeQuiz = useQuizStore(state => state.activeQuiz);
  const startQuiz = useQuizStore(state => state.startQuiz);
  
  // Redirect if no active quiz or results
  useEffect(() => {
    if (!activeQuiz || !quizId) {
      navigate('/');
    }
  }, [activeQuiz, quizId, navigate]);
  
  if (!activeQuiz || !quizId) {
    return null;
  }
  
  const quiz = getQuizById(quizId);
  if (!quiz) return null;
  
  const category = getCategoryById(quiz.categoryId);
  if (!category) return null;
  
  const result = getQuizResult();
  if (!result) return null;
  
  const correctCount = getCorrectAnswersCount();
  const scorePercentage = Math.round((result.score / result.maxScore) * 100);
  const questionsCount = quiz.questions.length;
  
  const handleRetakeQuiz = () => {
    startQuiz(quiz);
    navigate(`/quiz/${quiz.id}`);
  };
  
  // Determine performance level based on score
  const getPerformanceLevel = () => {
    if (scorePercentage >= 90) return { text: 'Excellent!', color: 'text-success-700' };
    if (scorePercentage >= 70) return { text: 'Great job!', color: 'text-primary-700' };
    if (scorePercentage >= 50) return { text: 'Good effort!', color: 'text-warning-700' };
    return { text: 'Keep practicing!', color: 'text-error-700' };
  };
  
  const performance = getPerformanceLevel();
  
  // Format time in minutes and seconds
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <div className={`${category.color.background} text-center p-8 rounded-xl mb-8 animate-fade-in`}>
        <div className="mb-3">
          <span className={`inline-block ${category.color.primary} text-white text-sm font-medium px-3 py-1 rounded-full`}>
            {category.name}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quiz Completed!
        </h1>
        <p className={`text-xl font-semibold ${performance.color} mb-4`}>
          {performance.text}
        </p>
        
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {result.score}/{result.maxScore}
            </div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {correctCount}/{questionsCount}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatTime(result.timeSpent)}
            </div>
            <div className="text-sm text-gray-600">Time Taken</div>
          </div>
        </div>
      </div>
      
      <Card variant="elevated" className="mb-8 animate-slide-up">
        <CardHeader>
          <CardTitle>Question Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className={`mb-4 p-4 border rounded-lg ${
                isCorrect ? 'border-success-200 bg-success-50' : 'border-error-200 bg-error-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white ${
                    isCorrect ? 'bg-success-500' : 'bg-error-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{question.text}</p>
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">
                        Your answer: <span className={isCorrect ? 'text-success-700 font-medium' : 'text-error-700 font-medium'}>
                          {userAnswer !== null ? question.options[userAnswer] : 'Not answered'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-success-700 font-medium">
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex gap-3">
          <Button
            onClick={handleRetakeQuiz}
            variant="primary"
            icon={<RotateCcw size={16} />}
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            icon={<Home size={16} />}
          >
            Home
          </Button>
        </div>
        
        <Button
          variant="ghost"
          icon={<Share2 size={16} />}
        >
          Share Results
        </Button>
      </div>
      
      <section className="mb-8 animate-fade-in animation-delay-300">
        <Card variant="elevated" className="bg-primary-50 border border-primary-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-100 text-primary-700 p-2 rounded-full">
                <Award size={20} />
              </div>
              <h3 className="font-semibold text-lg text-primary-900">Quiz Achievements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-primary-200">
                <h4 className="font-medium text-sm text-gray-600 mb-1.5">Experience Gained</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary-700">+{result.score}</span>
                  <span className="text-sm text-gray-500">XP</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-primary-200">
                <h4 className="font-medium text-sm text-gray-600 mb-1.5">Time Efficiency</h4>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary-500" />
                  <span className="text-sm text-gray-700">
                    {Math.round(result.timeSpent / 1000 / questionsCount)}s per question
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="text-center animate-fade-in animation-delay-500">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Ready for another challenge?
        </h3>
        <p className="text-gray-600 mb-4">
          Continue your learning journey with more quizzes
        </p>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigate('/categories')}
        >
          Explore Categories
        </Button>
      </section>
    </div>
  );
};