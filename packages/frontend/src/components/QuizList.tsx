import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Trophy, Award, BookOpen, ChevronRight, Zap, Brain, Palette, Globe, Dumbbell, Film, Code, Music } from "lucide-react";

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

// Mapa de ícones mais completo
const iconMap: { [key: string]: React.ReactNode } = {
  science: <Zap className="w-8 h-8" />,
  calculate: <Brain className="w-8 h-8" />,
  history_edu: <BookOpen className="w-8 h-8" />,
  palette: <Palette className="w-8 h-8" />,
  sports_soccer: <Dumbbell className="w-8 h-8" />,
  movie: <Film className="w-8 h-8" />,
  computer: <Code className="w-8 h-8" />,
  language: <Globe className="w-8 h-8" />,
  music_note: <Music className="w-8 h-8" />,
};

// Cores padrão caso não venham do backend
const defaultColors = [
  "#10B981", // Verde (Ciências)
  "#3B82F6", // Azul (Matemática)
  "#F59E0B", // Amarelo (História)
  "#EC4899", // Rosa (Artes)
  "#F97316", // Laranja (Esportes)
  "#8B5CF6", // Roxo (Cinema)
  "#06B6D4", // Ciano (Tecnologia)
  "#6366F1", // Índigo (Geografia)
];

export function QuizList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        console.log("Buscando categorias...");
        const response = await api.get<Category[]>("/api/v1/categories");
        console.log("Categorias recebidas:", response);
        
        // Adiciona cor padrão se não vier do backend
        const categoriesWithColors = response.map((cat, index) => ({
          ...cat,
          color: cat.color || defaultColors[index % defaultColors.length]
        }));
        
        setCategories(categoriesWithColors);
        // Não expande nenhuma categoria por padrão
      } catch (err) {
        setError("Falha ao carregar os quizzes. Por favor, tente novamente mais tarde.");
        console.error("Erro ao buscar quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return { label: "Fácil", className: "bg-green-500 text-white" };
      case "MEDIUM":
        return { label: "Médio", className: "bg-yellow-500 text-white" };
      case "HARD":
        return { label: "Difícil", className: "bg-red-500 text-white" };
      default:
        return { label: difficulty, className: "bg-gray-500 text-white" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-purple-700 mb-3">
            Escolha seu Desafio 
          </h1>
          <p className="text-lg text-gray-600">Escolha uma categoria para começar a jogar!</p>
        </div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const isExpanded = expandedCategories.has(category.id);
            const hasQuizzes = category.quizzes && category.quizzes.length > 0;
            
            return (
              <div
                key={category.id}
                className="relative animate-fadeIn"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Card da Categoria */}
                <div
                  className={`rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${hasQuizzes ? 'cursor-pointer' : 'cursor-default'} relative overflow-hidden`}
                  style={{
                    backgroundColor: category.color || defaultColors[index % defaultColors.length],
                    boxShadow: `0 8px 32px ${category.color || defaultColors[index % defaultColors.length]}40`
                  }}
                  onClick={() => hasQuizzes && toggleCategory(category.id)}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full"></div>
                    <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl text-white">
                          {iconMap[category.icon] || <BookOpen className="w-8 h-8" />}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">
                            {category.name}
                          </h2>
                          <p className="text-white/80 text-sm">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      {hasQuizzes && (
                        <ChevronRight 
                          className={`text-white/80 transition-transform duration-300 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          size={24}
                        />
                      )}
                    </div>

                    {/* Info e Botões */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {hasQuizzes ? (
                          <span className="text-white/90 font-medium">
                            {category.quizzes.length} {category.quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                          </span>
                        ) : (
                          <span className="text-white/70 text-sm italic">
                            Em breve
                          </span>
                        )}
                        
                        <Link
                          to={`/categories/${category.id}/ranking`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                        >
                          <Award size={14} />
                          Ranking
                        </Link>
                      </div>
                      
                      {hasQuizzes && (
                        <span className="text-white/70 text-xs">
                          {isExpanded ? 'Clique para fechar' : 'Clique para explorar'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de Quizzes (Expandível com animação) */}
                {hasQuizzes && isExpanded && (
                  <div className="mt-4 space-y-3 px-2 animate-slideDown">
                    {category.quizzes.map((quiz, quizIndex) => {
                      const difficultyConfig = getDifficultyConfig(quiz.difficulty);
                      
                      return (
                        <div
                          key={quiz.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] animate-fadeInUp"
                          style={{
                            animationDelay: `${quizIndex * 75}ms`
                          }}
                        >
                              <Link
                                to={`/quizzes/${quiz.id}`}
                                className="block p-5"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h3 className="font-bold text-gray-800 text-lg">
                                    {quiz.title}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyConfig.className}`}>
                                    {difficultyConfig.label}
                                  </span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {quiz.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2" style={{ color: category.color }}>
                                    <BookOpen size={16} />
                                    <span className="text-sm font-semibold">
                                      {quiz._count.questions} Questões
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <span className="text-xs">Jogar</span>
                                    <ChevronRight size={16} />
                                  </div>
                                </div>
                              </Link>
                              
                              {/* Botão de Ranking do Quiz */}
                              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                                <Link
                                  to={`/quizzes/${quiz.id}/ranking`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center justify-center gap-2 w-full text-purple-600 hover:text-purple-700 transition-colors text-sm font-semibold"
                                >
                                  <Trophy size={16} />
                                  Ver Ranking
                                </Link>
                              </div>
                            </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Adicione estas classes ao seu CSS global ou tailwind.config.js */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out both;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}