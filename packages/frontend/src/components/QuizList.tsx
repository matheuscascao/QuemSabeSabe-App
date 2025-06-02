import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Trophy, Award } from "lucide-react";
import { Button } from "./ui/button";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  _count: {
    questions: number;
  };
}

export function QuizList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get<Category[]>("/api/v1/categories");
        setCategories(response);
      } catch (err) {
        setError("Failed to load quizzes. Please try again later.");
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: category.color }}
              >
                <span className="material-icons">{category.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h2>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </div>

            {/* Category Ranking Button */}
            <Link to={`/categories/${category.id}/ranking`}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Award size={16} />
                Ranking da Categoria
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Link to={`/quizzes/${quiz.id}`} className="block p-4 pb-2">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {quiz.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        quiz.difficulty === "EASY"
                          ? "bg-green-100 text-green-800"
                          : quiz.difficulty === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                    <span className="text-primary font-medium">
                      {quiz._count.questions} Questions
                    </span>
                  </div>
                </Link>

                {/* Quiz Ranking Button */}
                <div className="px-4 pb-4">
                  <Link to={`/quizzes/${quiz.id}/ranking`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trophy size={14} />
                      Ver Ranking
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
