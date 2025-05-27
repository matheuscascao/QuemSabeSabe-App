import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../stores/quiz";
import { useAuthStore } from "../../stores/auth";

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
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "EASY"
  );
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
      <div className="text-center p-4">
        <p className="text-lg text-gray-600">Please log in to create a quiz.</p>
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
      navigate("/categories"); // Redirect to categories page after successful creation
    } catch (error) {
      // Error is handled by the store
      console.error("Failed to create quiz:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Quiz Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-gray-700"
          >
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
            }
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 20}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Add Question
          </button>
        </div>

        {questions.map((question, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-medium text-gray-900">
                Question {index + 1}
              </h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question Text
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(index, "text", e.target.value)}
                required
                minLength={3}
                maxLength={500}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correct === optionIndex}
                    onChange={() =>
                      updateQuestion(index, "correct", optionIndex)
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
                    placeholder={`Option ${optionIndex + 1}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                value={question.timeLimit}
                onChange={(e) =>
                  updateQuestion(index, "timeLimit", parseInt(e.target.value))
                }
                required
                min={5}
                max={120}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate("/categories")}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Quiz"}
        </button>
      </div>
    </form>
  );
}
