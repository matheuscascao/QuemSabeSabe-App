import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { HomePage } from "./pages/HomePage";
import { ProtectedRoute } from "./components/auth/protected-route";
import { QuizList } from "./components/QuizList";
import { Quiz } from "./components/Quiz";
import { CreateQuizPage } from "./pages/CreateQuizPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Create a wrapper component to use useLocation
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showHeaderFooter = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {showHeaderFooter && <Header />}
      <main className={`flex-grow ${showHeaderFooter ? 'pt-16 pb-16' : ''}`}>
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/create"
            element={
              <ProtectedRoute>
                <CreateQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:quizId"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
