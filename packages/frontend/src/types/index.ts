export type Difficulty = 'easy' | 'medium' | 'hard';

export type CategoryId = 
  | 'science' 
  | 'mathematics' 
  | 'history' 
  | 'sports' 
  | 'arts' 
  | 'geography' 
  | 'cinema' 
  | 'technology';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  color: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  timePerQuestion: number;
  creator: string;
  popularity: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    timeTaken: number;
  }[];
  completed: boolean;
  date: number;
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  results: QuizResult[];
  achievements: string[];
  createdQuizzes: string[];
}