import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

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
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [xpGained, setXpGained] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setError("Quiz ID is missing");
        setLoading(false);
        return;
      }

      console.log("Fetching quiz with ID:", quizId);
      try {
        const response = await api.get<Quiz>(`/api/v1/quizzes/${quizId}`);
        console.log("Quiz response:", response);
        setQuiz(response);
      } catch (err) {
        console.error("Error details:", err);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    console.log("Selecting answer:", { questionId, optionIndex });
    setSelectedAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: optionIndex,
      };
      console.log("New answers state:", newAnswers);
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const allQuestionsAnswered = quiz.questions.every(
      (q) => selectedAnswers[q.id] !== undefined
    );

    if (!allQuestionsAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);

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
      setError("Failed to submit quiz. Please try again.");
      console.error("Error submitting quiz:", err);
    } finally {
      setSubmitting(false);
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
          Try Again
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>Quiz not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (showResults && score !== null) {
    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Quiz Results</h2>
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">
            {percentage.toFixed(1)}%
          </div>
          <div
            className={`text-lg font-medium ${
              passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {passed ? "Congratulations! You passed!" : "Try again!"}
          </div>
          <div className="text-gray-600 mt-2">
            You got {score} out of {quiz.questions.length} questions correct.
          </div>
          {passed && xpGained !== null && (
            <div className="text-primary font-medium mt-2">
              You earned {xpGained} XP!
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/quizzes")}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back to Quizzes
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
              Try Again
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.description}</p>
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
            {quiz.difficulty}
          </span>
          <span className="text-gray-600 text-sm">
            {currentQuestionIndex + 1} of {quiz.questions.length} questions
          </span>
          <span className="text-gray-600 text-sm">
            Time limit: {currentQuestion.timeLimit} seconds
          </span>
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
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  style={{
                    backgroundColor: isSelected
                      ? "rgb(59 130 246 / 0.1)"
                      : "white",
                    borderColor: isSelected
                      ? "rgb(59 130 246)"
                      : "rgb(229 231 235)",
                    color: isSelected ? "rgb(59 130 246)" : "inherit",
                    fontWeight: isSelected ? "500" : "normal",
                  }}
                  className="w-full p-4 text-left rounded-lg border transition-colors hover:border-blue-500/50 hover:bg-gray-50"
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="px-6 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
