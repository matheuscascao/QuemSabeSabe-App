import { create } from "zustand";
import { useAuthStore } from "./auth";

interface Question {
  text: string;
  options: string[];
  correct: number;
  timeLimit: number;
  order: number;
}

interface CreateQuizData {
  title: string;
  description?: string;
  categoryId: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: Question[];
}

interface QuizState {
  isLoading: boolean;
  error: string | null;
  createQuiz: (data: CreateQuizData) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const useQuizStore = create<QuizState>((set) => ({
  isLoading: false,
  error: null,
  createQuiz: async (data: CreateQuizData) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      throw new Error("Not authenticated");
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/v1/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create quiz");
      }

      await response.json();
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to create quiz",
      });
      throw error;
    }
  },
}));
