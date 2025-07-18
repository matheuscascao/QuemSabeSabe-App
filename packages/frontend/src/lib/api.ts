import { LoginResponse } from "../../src/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get the token directly from localStorage to avoid Zustand store issues outside of components
function getAuthToken(): string | null {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      return state.token;
    } catch (err) {
      console.error("Error parsing auth storage:", err);
      return null;
    }
  }
  return null;
}

async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}

export const api = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  register: async (
    email: string,
    username: string,
    password: string
  ): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  get: async <T>(url: string): Promise<T> => {
    return fetchWithAuth<T>(url);
  },

  post: async <T>(url: string, data: unknown): Promise<T> => {
    return fetchWithAuth<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  fetchWithAuth,

  getRanking: async () => {
    return fetchWithAuth<
      { id: string; username: string; level: number; xp: number }[]
    >("/api/v1/auth/ranking");
  },

  getQuizRanking: async (quizId: string) => {
    return fetchWithAuth<{
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
        completedAt: string;
      }>;
      totalParticipants: number;
    }>(`/api/v1/quizzes/${quizId}/ranking`);
  },

  getCategoryRanking: async (categoryId: string) => {
    return fetchWithAuth<{
      category: {
        id: string;
        name: string;
        description: string;
        color: string;
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
          completedAt: string;
        }>;
      }>;
      totalParticipants: number;
    }>(`/api/v1/categories/${categoryId}/ranking`);
  },

  updateUserProfile: async (data: { username: string; email: string }) => {
    return fetchWithAuth<{ user: { id: string; email: string; username: string; level: number; xp: number } }>(
      '/api/v1/users/me',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  getUserAttemptsCount: async () => {
    return fetchWithAuth<{ count: number }>('/api/v1/users/me/attempts/count');
  },

  getUserMainCategory: async () => {
    return fetchWithAuth<{
      mainCategory: {
        id: string;
        name: string;
        icon: string;
        color: string;
        averagePercentage: number;
        quizCount: number;
      } | null;
    }>('/api/v1/users/me/main-category');
  },
};
