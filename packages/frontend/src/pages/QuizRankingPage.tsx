import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { Trophy, Star, User, Clock, ArrowLeft, Target } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface QuizRankingUser {
  userId: string;
  username: string;
  level: number;
  xp: number;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
}

interface QuizRankingData {
  quiz: {
    id: string;
    title: string;
    difficulty: string;
    totalQuestions: number;
  };
  ranking: QuizRankingUser[];
  totalParticipants: number;
}

export function QuizRankingPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState<QuizRankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!quizId) {
      navigate("/");
      return;
    }

    setIsLoading(true);
    api
      .getQuizRanking(quizId)
      .then((data) => {
        setRankingData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz ranking:", error);
        setHasError(true);
        setIsLoading(false);
      });
  }, [quizId, navigate]);

  if (!quizId) return null;

  const userRanking = rankingData?.ranking.find((u) => u.userId === user?.id);
  const userPosition = userRanking
    ? rankingData.ranking.indexOf(userRanking) + 1
    : null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HARD":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPositionColor = (index: number) => {
    if (index === 0) return "border-yellow-400 bg-yellow-50";
    if (index === 1) return "border-gray-300 bg-gray-50";
    if (index === 2) return "border-amber-700 bg-amber-50";
    return "border-purple-700 bg-purple-50";
  };

  const getPositionIcon = (index: number) => {
    if (index < 3) {
      const colors = ["text-yellow-400", "text-gray-400", "text-amber-700"];
      return <Trophy size={22} className={colors[index]} />;
    }
    return (
      <span className="font-bold text-lg text-purple-700">{index + 1}</span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={28} />
            Ranking do Quiz
          </h1>
        </div>
        <Link to={`/quizzes/${quizId}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Target size={16} />
            Tentar Quiz
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          Carregando ranking do quiz...
        </div>
      )}

      {hasError && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            Erro ao carregar ranking do quiz.
          </div>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {!isLoading && !hasError && rankingData && (
        <>
          {/* Quiz Info */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {rankingData.quiz.title}
                </h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span
                    className={`px-3 py-1 rounded-full ${getDifficultyColor(
                      rankingData.quiz.difficulty
                    )} text-gray-700`}
                  >
                    {rankingData.quiz.difficulty}
                  </span>
                  <span>{rankingData.quiz.totalQuestions} questões</span>
                  <span>{rankingData.totalParticipants} participantes</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {rankingData.totalParticipants}
                </div>
                <div className="text-sm opacity-90">Participantes</div>
              </div>
            </div>
          </Card>

          {/* User Position Card */}
          {userRanking && (
            <Card className="bg-gradient-to-r from-yellow-300 to-amber-400 mb-8 p-5 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold text-xl border-2 border-yellow-300">
                  {userPosition}
                </div>
                <div className="flex-1">
                  <div className="font-bold">Sua Posição</div>
                  <div className="flex items-center text-sm gap-2">
                    <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
                      {userRanking.score}/{userRanking.maxScore} (
                      {userRanking.percentage}%)
                    </span>
                    <span>•</span>
                    <span>Nível {userRanking.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{userRanking.percentage}%</div>
                  <div className="text-xs">Acerto</div>
                </div>
              </div>
            </Card>
          )}

          {/* Ranking List */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Ranking do Quiz
            </h2>

            {rankingData.ranking.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum participante ainda. Seja o primeiro!
              </div>
            ) : (
              <ol className="space-y-3">
                {rankingData.ranking.map((participant, idx) => (
                  <li
                    key={participant.userId}
                    className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${getPositionColor(
                      idx
                    )} ${
                      participant.userId === user?.id && idx > 2
                        ? "font-bold text-purple-700"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border mr-2 ${
                        idx === 0
                          ? "border-yellow-400"
                          : idx === 1
                          ? "border-gray-300"
                          : idx === 2
                          ? "border-amber-700"
                          : "border-purple-700"
                      }`}
                    >
                      {getPositionIcon(idx)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User
                          size={18}
                          className={
                            idx === 0
                              ? "text-yellow-400"
                              : idx === 1
                              ? "text-gray-400"
                              : idx === 2
                              ? "text-amber-700"
                              : "text-purple-700"
                          }
                        />
                        <span
                          className={
                            participant.userId === user?.id
                              ? `font-bold ${
                                  idx === 0
                                    ? "text-yellow-500"
                                    : idx === 1
                                    ? "text-gray-400"
                                    : idx === 2
                                    ? "text-amber-700"
                                    : "text-purple-700"
                                }`
                              : ""
                          }
                        >
                          {participant.username}
                          {participant.userId === user?.id && (
                            <span className="text-xs ml-1 opacity-70">
                              (Você)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Nível {participant.level}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span>
                          {new Date(
                            participant.completedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`font-bold text-lg ${
                          idx < 3
                            ? idx === 0
                              ? "text-yellow-500"
                              : idx === 1
                              ? "text-gray-500"
                              : "text-amber-700"
                            : "text-purple-700"
                        }`}
                      >
                        {participant.percentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {participant.score}/{participant.maxScore}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </div>
  );
}
