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
      setError("Você precisa estar logado para criar um quiz");
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-lg font-medium hover:shadow-md transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Título centralizado */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-700 flex items-center justify-center gap-2">Criar Novo Quiz</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Preencha os detalhes abaixo para criar seu quiz. Você pode adicionar até 20 questões.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="pb-8 px-4">
        <CreateQuizForm categories={categories} />
      </div>
    </div>
  );
}