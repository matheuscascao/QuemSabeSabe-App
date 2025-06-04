import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Quem Sabe, Sabe</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bem-vindo ao Quem Sabe, Sabe!
            </h2>
            <p className="text-gray-600 mb-6">
              Teste seu conhecimento e ganhe XP completando quizzes. Escolha entre
              várias categorias e níveis de dificuldade para se desafiar.
            </p>
            <button
              onClick={() => navigate("/quizzes")}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Começar Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
