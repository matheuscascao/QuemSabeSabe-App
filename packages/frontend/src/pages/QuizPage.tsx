import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quiz-store';
import { getQuizById } from '../data/quizzes';
import { Button } from '../components/ui/button';
import { QuizOption } from '../components/quiz/QuizOption';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { getCategoryById } from '../data/categories';
import { ArrowLeft, ArrowRight, Flag, Timer, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/sound';

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
  
  // Add mute toggle button
  const [isMuted, setIsMuted] = useState(false);
  
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
      }, 750);
    }
  }, [timeLeft, currentQuestionIndex, selectedAnswers, activeQuiz]);
  
  // Add useEffect to monitor answer changes
  useEffect(() => {
    console.log('Current answer:', selectedAnswers[currentQuestionIndex]);
    console.log('Has revealed:', hasRevealed);
  }, [selectedAnswers, currentQuestionIndex, hasRevealed]);
  
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
    
    console.log('Selected answer:', index);
    console.log('Current question index:', currentQuestionIndex);
    console.log('Selected answers before:', selectedAnswers);
    
    answerQuestion(currentQuestionIndex, index);
    
    // Log the state after a small delay to ensure it's updated
    setTimeout(() => {
      console.log('Selected answers after:', selectedAnswers);
      console.log('Current answer after:', selectedAnswers[currentQuestionIndex]);
      console.log('Has revealed:', hasRevealed);
    }, 100);
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
  const handleRevealAnswer = async () => {
    if (!currentQuestion) return;
    
    setHasRevealed(true);
    const isCorrect = currentAnswer === currentQuestion.correctAnswer;
    console.log(isCorrect);
    
    try {
      if (isCorrect) {
        await soundManager.playCorrect();
      } else {
        await soundManager.playIncorrect();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  // Add mute toggle button
  const handleToggleMute = () => {
    const newMutedState = soundManager.toggleMute();
    setIsMuted(newMutedState);
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full hover:bg-gray-200/50 transition-colors"
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="flex items-center">
              <Timer size={18} className="mr-1 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {Math.ceil(timeLeft || 0)}s
              </span>
            </div>
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
          {currentQuestion.options.map((option: string, index: number) => (
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
      <div className="flex justify-between mt-6">
        <Button
          onClick={handlePreviousQuestion}
          variant="outline"
          disabled={currentQuestionIndex === 0 || isAnimating}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Previous
        </Button>
        
        <div className="flex gap-3">
          {!hasRevealed && selectedAnswers[currentQuestionIndex] !== null && (
            <Button
              onClick={handleRevealAnswer}
              variant="secondary"
              className="min-w-[120px]"
            >
              Check Answer
            </Button>
          )}
          
          {isLastQuestion ? (
            <Button
              onClick={handleFinishQuiz}
              variant="primary"
              disabled={isAnimating}
              className="flex items-center gap-2"
            >
              Finish Quiz
              <Flag size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              disabled={isAnimating}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};