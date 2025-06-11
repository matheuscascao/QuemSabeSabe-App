import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../stores/quiz";
import { useAuthStore } from "../../stores/auth";
import { Plus, X, Clock } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CreateQuizFormProps {
  categories: Category[];
}

export function CreateQuizForm({ categories }: CreateQuizFormProps) {
  const navigate = useNavigate();
  const { createQuiz, isLoading, error } = useQuizStore();
  const { isAuthenticated } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", "", "", ""],
      correct: 0,
      timeLimit: 30,
      order: 1,
    },
  ]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-gray-50 rounded-2xl p-8 text-center max-w-md">
          <p className="text-xl text-gray-700 mb-4">Você precisa estar logado para criar um quiz</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correct: 0,
        timeLimit: 30,
        order: questions.length + 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(
      questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 }))
    );
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    if (field === "options") {
      newQuestions[index].options = value;
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createQuiz({
        title,
        description,
        categoryId,
        difficulty,
        questions,
      });
      navigate("/quizzes");
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  };

  const difficultyOptions = {
    EASY: { label: "Fácil", color: "bg-green-100 text-green-700 border-green-300" },
    MEDIUM: { label: "Médio", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    HARD: { label: "Difícil", color: "bg-red-100 text-red-700 border-red-300" }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Informações Básicas */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título do Quiz
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            placeholder="Digite o título do seu quiz"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Descreva seu quiz..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificuldade
            </label>
            <div className="flex gap-2">
              {Object.entries(difficultyOptions).map(([value, { label, color }]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value as "EASY" | "MEDIUM" | "HARD")}
                  className={`px-4 py-2 rounded-lg font-medium border transition-all ${
                    difficulty === value
                      ? color
                      : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questões */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Questões ({questions.length}/20)
          </h3>
          <button
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 20}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Adicionar Questão
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  Questão {index + 1}
                </h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pergunta
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, "text", e.target.value)}
                  required
                  minLength={3}
                  maxLength={500}
                  placeholder="Digite sua pergunta..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Opções de Resposta
                </label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={question.correct === optionIndex}
                      onChange={() => updateQuestion(index, "correct", optionIndex)}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[optionIndex] = e.target.value;
                        updateQuestion(index, "options", newOptions);
                      }}
                      required
                      minLength={1}
                      maxLength={200}
                      placeholder={`Opção ${optionIndex + 1}`}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        question.correct === optionIndex
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo Limite (segundos)
                </label>
                <input
                  type="number"
                  value={question.timeLimit}
                  onChange={(e) => updateQuestion(index, "timeLimit", parseInt(e.target.value))}
                  required
                  min={5}
                  max={120}
                  className="w-24 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => navigate("/quizzes")}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Criando..." : "Criar Quiz"}
        </button>
      </div>
    </form>
  );
}