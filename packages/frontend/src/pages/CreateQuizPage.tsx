import { useEffect, useState } from "react";
import { CreateQuizForm } from "../components/quiz/CreateQuizForm";
import { useAuthStore } from "../stores/auth";

interface Category {
  id: string;
  name: string;
  description?: string;
}

export function CreateQuizPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";
        const response = await fetch(`${API_URL}/api/v1/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCategories();
    } else {
      setError("You must be logged in to create a quiz");
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create a New Quiz
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create your quiz. You can add up to 20
            questions.
          </p>
        </div>
        <CreateQuizForm categories={categories} />
      </div>
    </div>
  );
}
