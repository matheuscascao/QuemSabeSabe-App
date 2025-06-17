import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Clock } from "lucide-react";
import { soundManager } from "../utils/sound";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: {
    id: string;
    name: string;
  };
  questions: {
    id: string;
    text: string;
    options: string[];
    timeLimit: number;
    order: number;
    correct: number;
    explanation?: string;
  }[];
}

export function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setError("ID do quiz não encontrado");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<Quiz>(`/api/v1/quizzes/${quizId}`);
        setQuiz(response);
      } catch (err) {
        console.error("Error details:", err);
        setError(
          "Falha ao carregar o quiz. Por favor, tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || hasRevealed) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    setTimeLeft(currentQuestion.timeLimit);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setTimeUp(true);
          setHasRevealed(true);
          setTimeout(() => {
            setTimeUp(false);
            setHasRevealed(false);
            if (currentQuestionIndex < quiz.questions.length - 1) {
              setCurrentQuestionIndex((prev) => prev + 1);
            } else {
              handleSubmit();
            }
          }, 1000);
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quiz, hasRevealed]);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (hasRevealed) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleCheckAnswer = async () => {
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestion.id];

    setHasRevealed(true);

    const isCorrect = selectedAnswer === currentQuestion.correct;

    if (isCorrect) {
      await soundManager.playCorrect();
    } else {
      await soundManager.playIncorrect();
    }

    setTimeout(() => {
      setHasRevealed(false);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }, 2000);
  };

  const handleToggleMute = () => {
    const newMutedState = soundManager.toggleMute();
    setIsMuted(newMutedState);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      const response = await api.post<{
        score: number;
        totalQuestions: number;
        xpGained: number;
      }>(`/api/v1/quizzes/${quizId}/attempt`, {
        answers: Object.entries(selectedAnswers).map(
          ([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          })
        ),
      });

      setScore(response.score);
      setXpGained(response.xpGained);
      setShowResults(true);
    } catch (err) {
      setError("Falha ao enviar o quiz. Por favor, tente novamente.");
      console.error("Error submitting quiz:", err);
    }
  };

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
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>Quiz não encontrado</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (showResults && score !== null) {
    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Resultados do Quiz
        </h2>
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">
            {percentage.toFixed(1)}%
          </div>
          <div
            className={`text-lg font-medium ${
              passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {passed ? "Parabéns! Você passou!" : "Tente novamente!"}
          </div>
          <div className="text-gray-600 mt-2">
            Você acertou {score} de {quiz.questions.length} questões.
          </div>
          {passed && xpGained !== null && (
            <div className="text-primary font-medium mt-2">
              Você ganhou {xpGained} XP!
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/quizzes")}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Voltar para Quizzes
          </button>
          {!passed && (
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setScore(null);
                setXpGained(null);
              }}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
              <Clock size={16} />
              <span className="font-medium">{timeLeft}s</span>
            </div>
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full hover:bg-gray-100"
              title={isMuted ? "Ativar sons" : "Desativar sons"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">{quiz.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <span
            className={`px-2 py-1 rounded text-sm ${
              quiz.difficulty === "EASY"
                ? "bg-green-100 text-green-800"
                : quiz.difficulty === "MEDIUM"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {quiz.difficulty === "EASY"
              ? "FÁCIL"
              : quiz.difficulty === "MEDIUM"
              ? "MÉDIO"
              : "DIFÍCIL"}
          </span>
          <span className="text-gray-600 text-sm">
            Questão {currentQuestionIndex + 1} de {quiz.questions.length}
          </span>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${(timeLeft / currentQuestion.timeLimit) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.text}
          </h2>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === index;
              const isCorrect =
                hasRevealed && index === currentQuestion.correct;
              const isIncorrect = hasRevealed && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  disabled={hasRevealed}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    isSelected && !hasRevealed
                      ? "border-blue-500 bg-blue-50 text-blue-900 shadow-md"
                      : !hasRevealed
                      ? "border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                      : "border-transparent"
                  } ${
                    isCorrect
                      ? "bg-green-100 border-green-500 text-green-900"
                      : isIncorrect
                      ? "bg-red-100 border-red-500 text-red-900"
                      : ""
                  } ${hasRevealed ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {hasRevealed && (isCorrect || isIncorrect) && (
                      <span
                        className={`ml-2 text-sm font-medium ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect ? "✓ Correto" : "✗ Incorreto"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Feedback visual/textual após resposta */}
          {(hasRevealed || timeUp) && (
            <div
              className={`rounded-xl p-4 shadow-lg mt-6 animate-fadeIn ${
                timeUp
                  ? "bg-yellow-400 text-white"
                  : selectedAnswers[currentQuestion.id] === currentQuestion.correct
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <div className="flex items-start">
                {(!timeUp && selectedAnswers[currentQuestion.id] === currentQuestion.correct) && (
                  <div className="mt-1 mr-2">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
                <div>
                  <h4 className="font-bold mb-1">
                    {timeUp
                      ? "Tempo esgotado!"
                      : selectedAnswers[currentQuestion.id] === currentQuestion.correct
                      ? "Parabéns!"
                      : "Ops! A resposta correta era:"}
                  </h4>
                  <p>
                    {!timeUp && selectedAnswers[currentQuestion.id] !== currentQuestion.correct && (
                      <span className="font-medium">
                        {currentQuestion.options[currentQuestion.correct]}
                      </span>
                    )}
                  </p>
                  {currentQuestion.explanation && !timeUp && (
                    <p className="text-sm text-white text-opacity-90 mt-1">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-3">
            {!hasRevealed &&
              selectedAnswers[currentQuestion.id] !== undefined && (
                <Button
                  onClick={handleCheckAnswer}
                  variant="secondary"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Verificar
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </Button>
              )}

            {currentQuestionIndex < quiz.questions.length - 1 && (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                variant="primary"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
              >
                Próxima
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
