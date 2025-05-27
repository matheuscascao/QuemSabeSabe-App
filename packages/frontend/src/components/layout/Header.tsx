import React from "react";
import { Brain, User, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuizStore } from "../../store/quiz-store";
import { Button } from "../ui/button";

export const Header: React.FC = () => {
  const location = useLocation();
  const userProfile = useQuizStore((state) => state.userProfile);
  const activeQuiz = useQuizStore((state) => state.activeQuiz);

  // Do not show the header in active quiz mode
  if (activeQuiz && location.pathname.includes("/quiz/")) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center space-x-2 text-primary-700 hover:text-primary-900 transition-colors"
        >
          <Brain size={32} strokeWidth={2} />
          <span className="font-bold text-xl">Quiz Master</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center gap-5 text-gray-600">
            <Link
              to="/"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname === "/"
                  ? "font-semibold text-primary-700"
                  : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/categories"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname.includes("/categories")
                  ? "font-semibold text-primary-700"
                  : ""
              }`}
            >
              Categories
            </Link>
            <Link to="/quizzes/create">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create Quiz
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <User size={18} className="text-primary-600" />
            <span className="font-medium text-sm">{userProfile.username}</span>
            <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-full">
              Lvl {userProfile.level}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
