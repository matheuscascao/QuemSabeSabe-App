import React from 'react';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';
import { useQuizStore } from '../../store/quiz-store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const activeQuiz = useQuizStore(state => state.activeQuiz);
  
  // Use a simpler layout for active quiz to minimize distractions
  const isQuizActive = activeQuiz && location.pathname.includes('/quiz/');
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className={clsx(
        "flex-grow",
        isQuizActive ? "pt-0" : "pt-6 pb-12"
      )}>
        {children}
      </main>
      {!isQuizActive && (
        <footer className="bg-white py-4 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-500 text-sm">
              Quiz Master © {new Date().getFullYear()} — Expand Your Knowledge
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

// Helper function to conditionally join class names
function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}