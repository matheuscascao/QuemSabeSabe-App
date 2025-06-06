import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import { Trophy, Star, User } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface RankingUser {
  id: string;
  username: string;
  level: number;
  xp: number;
}

export function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsLoading(true);
    api.getRanking()
      .then((data) => {
        setRanking(data);
        setIsLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  }, []);

  const userIndex = ranking.findIndex((u) => u.id === user?.id);
  const userPosition = userIndex >= 0 ? userIndex + 1 : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-purple-700 flex items-center justify-center gap-2">
       🏆 Ranking dos Campeões
      </h1>

      <Card className="bg-gradient-to-r from-yellow-300 to-amber-400 mb-8 p-5 rounded-xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold text-xl border-2 border-yellow-300">
            {userPosition ?? '-'}
          </div>
          <div className="flex-1">
            <div className="font-bold">Sua Posição</div>
            <div className="flex items-center text-sm">
              <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full mr-2">{user?.xp ?? 0} pontos</span>
              <span className="mr-2">•</span>
              <span>Nível {user?.level ?? '-'}</span>
            </div>
          </div>
          <div className="bg-white bg-opacity-30 p-2 rounded-full">
            <Star className="text-yellow-500" size={20} />
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Ranking Global</h2>
        {isLoading && <div className="text-center py-8 text-gray-500">Carregando ranking...</div>}
        {hasError && <div className="text-center py-8 text-red-500">Erro ao carregar ranking.</div>}
        {!isLoading && !hasError && (
          <ol className="space-y-3">
            {ranking.map((u, idx) => (
              <li
                key={u.id}
                className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${
                  idx === 0
                    ? 'border-yellow-400 bg-yellow-50'
                    : idx === 1
                    ? 'border-gray-300 bg-gray-50'
                    : idx === 2
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-purple-700 bg-purple-50'
                } ${u.id === user?.id && idx > 2 ? 'font-bold text-purple-700' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border mr-2 ${
                  idx === 0
                    ? 'border-yellow-400'
                    : idx === 1
                    ? 'border-gray-300'
                    : idx === 2
                    ? 'border-amber-700'
                    : 'border-purple-700'
                }`}>
                  {idx < 3 ? (
                    <Trophy size={22} className={
                      idx === 0
                        ? 'text-yellow-400'
                        : idx === 1
                        ? 'text-gray-400'
                        : 'text-amber-700'
                    } />
                  ) : (
                    <span className="font-bold text-lg text-purple-700">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User size={18} className={
                      idx === 0
                        ? 'text-yellow-400'
                        : idx === 1
                        ? 'text-gray-400'
                        : idx === 2
                        ? 'text-amber-700'
                        : 'text-purple-700'
                    } />
                    <span className={
                      u.id === user?.id
                        ? `font-bold ${
                            idx === 0
                              ? 'text-yellow-500'
                              : idx === 1
                              ? 'text-gray-400'
                              : idx === 2
                              ? 'text-amber-700'
                              : 'text-purple-700'
                          }`
                        : ''
                    }>{u.username}</span>
                  </div>
                  <div className="text-xs text-gray-500">Nível {u.level}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${
                    idx < 3
                      ? idx === 0
                        ? 'text-yellow-500'
                        : idx === 1
                        ? 'text-gray-500'
                        : 'text-amber-700'
                      : 'text-purple-700'
                  }`}>{u.xp.toLocaleString()} XP</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
} 