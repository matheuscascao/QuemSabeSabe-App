import { z } from "zod";
import { Prisma } from "@prisma/client";

// JWT Payload type
export interface JWTPayload {
  id: string;
  email: string;
  username: string;
}

// Request schemas
export const createQuizSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  questions: z
    .array(
      z.object({
        text: z.string().min(3).max(500),
        options: z.array(z.string().min(1).max(200)).length(4),
        correct: z.number().min(0).max(3),
        timeLimit: z.number().min(5).max(120),
        order: z.number().min(1),
      })
    )
    .min(1)
    .max(20),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number(),
    })
  ),
});

export const quizIdSchema = z.object({
  quizId: z.string(),
});

export const categoryIdSchema = z.object({
  categoryId: z.string(),
});

// Type exports
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
export type QuizIdParams = z.infer<typeof quizIdSchema>;
export type CategoryIdParams = z.infer<typeof categoryIdSchema>;

// Response types
export interface QuizAttemptResult {
  attempt: {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    answers: Array<{
      questionId: string;
      selectedOption: number;
    }>;
    endedAt: Date;
  };
  score: number;
  totalQuestions: number;
  xpGained: number;
  isFirstAttempt: boolean;
}

export interface QuizRanking {
  quiz: {
    id: string;
    title: string;
    difficulty: string;
    totalQuestions: number;
  };
  ranking: Array<{
    userId: string;
    username: string;
    level: number;
    xp: number;
    score: number;
    maxScore: number;
    percentage: number;
    completedAt: Date;
  }>;
  totalParticipants: number;
}

export interface CategoryRanking {
  category: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    totalQuizzes: number;
  };
  ranking: Array<{
    userId: string;
    username: string;
    level: number;
    xp: number;
    totalScore: number;
    totalQuestions: number;
    averagePercentage: number;
    quizCount: number;
    quizAttempts: Array<{
      quizId: string;
      score: number;
      totalQuestions: number;
      percentage: number;
      completedAt: Date;
    }>;
  }>;
  totalParticipants: number;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  quizzes: Array<{
    id: string;
    title: string;
    description: string | null;
    difficulty: string;
    _count: {
      questions: number;
    };
  }>;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  category: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  };
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    timeLimit: number;
    order: number;
    correct: number;
  }>;
}

export interface CreateQuizResult {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  creatorId: string;
  difficulty: string;
  questions: Array<{
    id: string;
    quizId: string;
    text: string;
    options: string[];
    correct: number;
    timeLimit: number;
    order: number;
  }>;
}

// Helper function to safely cast JsonValue to string array
export function jsonValueToStringArray(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value as string[];
  }
  return [];
}

// Helper function to safely cast JsonValue to answers array
export function jsonValueToAnswersArray(value: Prisma.JsonValue): Array<{
  questionId: string;
  selectedOption: number;
}> {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is { questionId: string; selectedOption: number } =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        "selectedOption" in item &&
        typeof item.questionId === "string" &&
        typeof item.selectedOption === "number"
    );
  }
  return [];
}
