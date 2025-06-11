import { useAuthStore } from '../stores/auth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Star, LogOut, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

export function UserProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState<number | null>(null);
  const [mainCategory, setMainCategory] = useState<{
    id: string;
    name: string;
    icon: string;
    color: string;
    averagePercentage: number;
    quizCount: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, email: user.email });
      api.getUserAttemptsCount().then(res => setAttemptsCount(res.count)).catch(() => setAttemptsCount(null));
      api.getUserMainCategory().then(res => setMainCategory(res.mainCategory)).catch(() => setMainCategory(null));
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.updateUserProfile(form);
      updateUser(res.user);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-8">
      <Card className="w-full max-w-2xl mx-auto p-0 shadow-lg">
        <CardHeader className="flex flex-col items-center bg-gradient-to-r from-purple-600 to-indigo-700 rounded-t-lg py-8">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4">
            <User size={48} className="text-purple-600" />
          </div>
          <CardTitle className="text-white text-2xl font-bold mb-1">{user.username}</CardTitle>
          <div className="text-white text-base font-medium mb-1">{user.email}</div>
        </CardHeader>
        <CardContent className="py-6 px-8 md:px-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Nome de usuário</div>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={isLoading}
                required
                maxLength={32}
                placeholder="Nome de usuário"
              />
            </div>

            {/* Estatísticas em linha */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-center my-4">
              <div>
                <div className="text-xs text-gray-500">Nível</div>
                <div className="font-bold text-indigo-700 text-lg">{user.level}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">XP</div>
                <div className="font-bold text-indigo-700 text-lg">{user.xp}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Quizzes feitos</div>
                <div className="font-bold text-indigo-700 text-lg">{attemptsCount !== null ? attemptsCount : '...'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Cadastro</div>
                <div className="font-bold text-indigo-700 text-lg">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
              </div>
            </div>

            {/* Categoria principal e média de acertos em linha */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between my-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Principal categoria</div>
                {mainCategory ? (
                  <div className="flex items-center gap-2 font-medium text-gray-800 truncate">
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{ background: mainCategory.color, width: 28, height: 28 }}
                    >
                      <BookOpen size={18} className="text-white" />
                    </span>
                    <span className="truncate">{mainCategory.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({mainCategory.quizCount} quizzes)</span>
                  </div>
                ) : (
                  <div className="text-base text-gray-400">-</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Média de acertos</div>
                <div className="font-bold text-indigo-700 text-lg">
                  {mainCategory && mainCategory.quizCount > 0
                    ? `${mainCategory.averagePercentage.toFixed(1)}%`
                    : '-'}
                </div>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">Perfil atualizado com sucesso!</div>}
            <div className="flex gap-3 mt-6">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isLoading}
              >
                Salvar
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1 flex items-center gap-2"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={18} /> Sair
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfilePage; 