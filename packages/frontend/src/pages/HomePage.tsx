import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Trophy, Lightbulb } from "lucide-react";
import { Button } from "../components/ui/button";

interface RankingUser {
  id: string;
  username: string;
  level: number;
  xp: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getRanking()
      .then((data) => setRanking(data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topo roxo com logo, nome e botão */}
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 pt-12 pb-16 flex flex-col items-center justify-center text-white">
        <Lightbulb size={48} className="mb-4" />
        <h1 className="text-4xl font-bold mb-2">Quem Sabe, Sabe</h1>
        <p className="text-lg mb-6">Teste seus conhecimentos!</p>
        <Button
          size="lg"
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold text-lg px-10 py-4 mb-4"
          onClick={() => navigate("/quizzes")}
        >
          <span className="flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
            Jogar Agora
          </span>
        </Button>
      </div>

      {/* Conteúdo sobre fundo cinza, bem afastado da parte roxa */}
      <div className="max-w-2xl mx-auto w-full px-4 -mt-10 md:-mt-14">
        {/* Mensagem de boas-vindas */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-bold text-indigo-700 mb-2">Olá, Explorador! 👋</h3>
          <p className="text-gray-600">
            Pronto para mais aventuras de conhecimento? Explore categorias diversas e desafie seus amigos!
          </p>
        </div>

        {/* Top Jogadores */}
        <div className="font-semibold text-gray-700 mb-2 text-base">Top Jogadores</div>

        {/* Ranking Global */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium text-gray-700">Ranking Global</div>
            <button
              onClick={() => navigate("/ranking")}
              className="text-sm text-indigo-600 font-medium"
            >
              Ver todos
            </button>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando ranking...</div>
          ) : (
            <div>
              {ranking.slice(0, 3).map((player, index) => (
                <div key={player.id} className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-3
                    ${index === 0 ? "bg-yellow-100 text-yellow-600" : index === 1 ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}>
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{player.username}</div>
                  </div>
                  <div className="font-bold text-indigo-600">{player.xp.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          className="w-full bg-indigo-100 text-indigo-600 rounded-lg py-3 font-medium hover:bg-indigo-200 transition"
          onClick={() => navigate("/ranking")}
        >
          Ver Ranking Completo
        </Button>
      </div>
    </div>
  );
}