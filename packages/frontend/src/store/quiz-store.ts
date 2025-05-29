import { create } from 'zustand';
import { Question, Quiz, QuizResult, UserProfile } from '../types/index';

interface QuizState {
  // Current quiz taking state
  activeQuiz: Quiz | null;
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  startTime: number | null;
  endTime: number | null;
  
  // User profile
  userProfile: UserProfile;
  
  // Actions
  startQuiz: (quiz: Quiz) => void;
  answerQuestion: (questionIndex: number, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuiz: () => void;
  cancelQuiz: () => void;
  
  // Computed values
  getCurrentQuestion: () => Question | null;
  getQuizProgress: () => { current: number; total: number };
  getCurrentScore: () => number;
  getQuizResult: () => QuizResult | null;
  getCorrectAnswersCount: () => number;
}

const initialProfile: UserProfile = {
  id: 'user1',
  username: 'Learner',
  level: 1,
  xp: 0,
  results: [],
  achievements: [],
  createdQuizzes: []
};

export const useQuizStore = create<QuizState>((set, get) => ({
  // State
  activeQuiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: [],
  startTime: null,
  endTime: null,
  userProfile: initialProfile,
  
  // Actions
  startQuiz: (quiz: Quiz) => {
    console.log('Starting quiz:', quiz);
    const initialAnswers = Array(quiz.questions.length).fill(null);
    console.log('Initial answers:', initialAnswers);
    
    set({
      activeQuiz: quiz,
      currentQuestionIndex: 0,
      selectedAnswers: initialAnswers,
      startTime: Date.now(),
      endTime: null
    });
    
    console.log('Quiz state after start:', get());
  },
  
  answerQuestion: (questionIndex: number, answerIndex: number) => {
    console.log('Store - Answering question:', { questionIndex, answerIndex });
    const { selectedAnswers } = get();
    console.log('Store - Current answers:', selectedAnswers);
    
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    
    console.log('Store - New answers:', newAnswers);
    set({ selectedAnswers: newAnswers });
    
    // Log state after update
    console.log('Store - State after answer:', get());
  },
  
  nextQuestion: () => {
    const { currentQuestionIndex, activeQuiz } = get();
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },
  
  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },
  
  finishQuiz: () => {
    const result = get().getQuizResult();
    if (result) {
      set(state => ({
        endTime: Date.now(),
        userProfile: {
          ...state.userProfile,
          results: [...state.userProfile.results, result]
        }
      }));
    }
  },
  
  cancelQuiz: () => {
    set({
      activeQuiz: null,
      currentQuestionIndex: 0,
      selectedAnswers: [],
      startTime: null,
      endTime: null
    });
  },
  
  // Computed values
  getCurrentQuestion: () => {
    const { activeQuiz, currentQuestionIndex } = get();
    if (!activeQuiz) return null;
    return activeQuiz.questions[currentQuestionIndex];
  },
  
  getQuizProgress: () => {
    const { activeQuiz, currentQuestionIndex } = get();
    if (!activeQuiz) return { current: 0, total: 0 };
    return {
      current: currentQuestionIndex + 1,
      total: activeQuiz.questions.length
    };
  },
  
  getCurrentScore: () => {
    const { activeQuiz, selectedAnswers } = get();
    if (!activeQuiz) return 0;
    
    return selectedAnswers.reduce<number>((score, answer, index) => {
      if (answer === null) return score;
      
      const question = activeQuiz.questions[index];
      if (answer === question.correctAnswer) {
        return score + 10; // Base points for correct answer
      }
      return score;
    }, 0);
  },
  
  getCorrectAnswersCount: () => {
    const { activeQuiz, selectedAnswers } = get();
    if (!activeQuiz) return 0;
    
    return selectedAnswers.reduce<number>((count, answer, index) => {
      if (answer === null) return count;
      
      const question = activeQuiz.questions[index];
      if (answer === question.correctAnswer) {
        return count + 1;
      }
      return count;
    }, 0);
  },
  
  getQuizResult: () => {
    const { activeQuiz, selectedAnswers, startTime } = get();
    if (!activeQuiz || !startTime) return null;
    
    const endTime = Date.now();
    const timeSpent = endTime - startTime;
    
    const answers = selectedAnswers.map((answer, index) => {
      const question = activeQuiz.questions[index];
      return {
        questionId: question.id,
        selectedOption: answer !== null ? answer : -1,
        isCorrect: answer === question.correctAnswer,
        timeTaken: timeSpent / selectedAnswers.length // Approximate time per question
      };
    });
    
    const score = get().getCurrentScore();
    const maxScore = activeQuiz.questions.length * 10;
    
    return {
      quizId: activeQuiz.id,
      score,
      maxScore,
      timeSpent,
      answers,
      completed: !selectedAnswers.includes(null),
      date: endTime
    };
  }
}));