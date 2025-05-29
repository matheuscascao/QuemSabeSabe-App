import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { Lightbulb } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register(
        formData.email,
        formData.username,
        formData.password
      );
      login(response.token, response.user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao registrar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center -mt-28 mb-8">
          <Lightbulb size={48} className="text-purple-600 mb-3" />
          <h1 className="text-4xl font-bold text-purple-700 tracking-tight">
            Quem Sabe, Sabe
          </h1>
        </div>

        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Criar uma nova conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              entrar na sua conta
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Endereço de Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="sr-only">
                Nome de usuário
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Nome de usuário"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirmar Senha"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 focus-visible:ring-purple-500" 
            isLoading={isLoading}
          >
            Criar conta
          </Button>
        </form>
      </div>
    </div>
  );
}
