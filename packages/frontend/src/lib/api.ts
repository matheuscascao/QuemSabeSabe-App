import { LoginResponse } from "../../src/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

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
  console.log("Auth token:", token); // Debug log
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
    const response = await fetch(`${API_URL}/auth/login`, {
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
    const response = await fetch(`${API_URL}/auth/register`, {
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
};
