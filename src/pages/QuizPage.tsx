import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quiz-store';
import { getQuizById } from '../data/quizzes';
import { Button } from '../components/ui/button';
import { QuizOption } from '../components/quiz/QuizOption';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { getCategoryById } from '../data/categories';
import { ArrowLeft, ArrowRight, Flag, Timer } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  // Quiz state
  const activeQuiz = useQuizStore(state => state.activeQuiz);
  const currentQuestionIndex = useQuizStore(state => state.currentQuestionIndex);
  const selectedAnswers = useQuizStore(state => state.selectedAnswers);
  const getCurrentQuestion = useQuizStore(state => state.getCurrentQuestion);
  const getQuizProgress = useQuizStore(state => state.getQuizProgress);
  
  // Quiz actions
  const startQuiz = useQuizStore(state => state.startQuiz);
  const answerQuestion = useQuizStore(state => state.answerQuestion);
  const nextQuestion = useQuizStore(state => state.nextQuestion);
  const previousQuestion = useQuizStore(state => state.previousQuestion);
  const finishQuiz = useQuizStore(state => state.finishQuiz);
  
  // Time tracking
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // UI states
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  
  // Initialize quiz if not already active
  useEffect(() => {
    if (!activeQuiz && quizId) {
      const quiz = getQuizById(quizId);
      if (quiz) {
        startQuiz(quiz);
      } else {
        navigate('/');
      }
    }
  }, [activeQuiz, quizId, startQuiz, navigate]);
  
  // Timer effect
  useEffect(() => {
    if (!activeQuiz) return;
    
    const question = getCurrentQuestion();
    if (!question) return;
    
    const timePerQuestion = activeQuiz.timePerQuestion;
    setTimeLeft(timePerQuestion);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [activeQuiz, currentQuestionIndex, getCurrentQuestion]);
  
  // Auto-advance when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      // If no answer selected, select one randomly or leave unanswered
      if (selectedAnswers[currentQuestionIndex] === null) {
        // For demo - leave unanswered
      }
      
      // Delay to show which was correct
      setHasRevealed(true);
      setTimeout(() => {
        if (currentQuestionIndex < (activeQuiz?.questions.length || 0) - 1) {
          handleNextQuestion();
        } else {
          handleFinishQuiz();
        }
      }, 2000);
    }
  }, [timeLeft, currentQuestionIndex, selectedAnswers, activeQuiz]);
  
  if (!activeQuiz) {
    return null;
  }
  
  const currentQuestion = getCurrentQuestion();
  const progress = getQuizProgress();
  const category = getCategoryById(activeQuiz.categoryId);
  const currentAnswer = selectedAnswers[currentQuestionIndex];
  
  const handleSelectOption = (index: number) => {
    // Don't allow changing answer if time's up or answer revealed
    if (timeLeft === 0 || hasRevealed) return;
    
    answerQuestion(currentQuestionIndex, index);
  };
  
  const handleNextQuestion = () => {
    setIsAnimating(true);
    setHasRevealed(false);
    
    setTimeout(() => {
      nextQuestion();
      setIsAnimating(false);
    }, 300);
  };
  
  const handlePreviousQuestion = () => {
    setIsAnimating(true);
    setHasRevealed(false);
    
    setTimeout(() => {
      previousQuestion();
      setIsAnimating(false);
    }, 300);
  };
  
  const handleFinishQuiz = () => {
    finishQuiz();
    navigate(`/results/${activeQuiz.id}`);
  };
  
  // Handle reveal answer to show correct answer
  const handleRevealAnswer = () => {
    setHasRevealed(true);
  };
  
  if (!currentQuestion || !category) {
    return null;
  }
  
  const isLastQuestion = currentQuestionIndex === activeQuiz.questions.length - 1;
  const isAnswered = currentAnswer !== null;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Quiz header with category and progress */}
      <div className={`${category.color.background} rounded-xl p-5 mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-xl font-bold ${category.color.text}`}>
            {activeQuiz.title}
          </h1>
          <div className="flex items-center">
            <Timer size={18} className="mr-1 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {Math.ceil(timeLeft || 0)}s
            </span>
          </div>
        </div>
        
        <ProgressBar 
          current={progress.current} 
          total={progress.total} 
          timeLeft={timeLeft || 0}
          totalTime={activeQuiz.timePerQuestion}
        />
      </div>
      
      {/* Question */}
      <div className={`bg-white rounded-xl shadow-sm p-6 mb-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {currentQuestion.text}
        </h2>
        
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <QuizOption
              key={index}
              text={option}
              index={index}
              isSelected={currentAnswer === index}
              isCorrect={index === currentQuestion.correctAnswer}
              isRevealed={hasRevealed}
              disabled={hasRevealed || timeLeft === 0}
              onSelect={handleSelectOption}
            />
          ))}
        </div>
        
        {/* Explanation if answer revealed */}
        {hasRevealed && currentQuestion.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm animate-slide-up">
            <strong className="font-medium">Explanation:</strong> {currentQuestion.explanation}
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePreviousQuestion}
          variant="outline"
          disabled={currentQuestionIndex === 0 || isAnimating}
          icon={<ArrowLeft size={16} />}
          iconPosition="left"
        >
          Previous
        </Button>
        
        <div className="flex gap-3">
          {!hasRevealed && isAnswered && (
            <Button
              onClick={handleRevealAnswer}
              variant="secondary"
            >
              Check Answer
            </Button>
          )}
          
          {isLastQuestion ? (
            <Button
              onClick={handleFinishQuiz}
              variant="primary"
              icon={<Flag size={16} />}
              iconPosition="right"
              disabled={isAnimating}
            >
              Finish Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              disabled={isAnimating}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};