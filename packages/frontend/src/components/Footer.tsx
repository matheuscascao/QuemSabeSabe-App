import { Home, Play, Trophy, User, PlusSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Início', icon: <Home size={24} />, path: '/' },
    { name: 'Criar Quiz', icon: <PlusSquare size={24} />, path: '/quizzes/create' },
    { name: 'Jogar', icon: <Play size={24} />, path: '/quizzes' },
    { name: 'Ranking', icon: <Trophy size={24} />, path: '/ranking' },
    { name: 'Perfil', icon: <User size={24} />, path: '/' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-purple-700 text-white shadow-lg z-50">
      <nav className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`p-3 flex-1 flex flex-col items-center ${ 
              location.pathname === item.path
                ? 'text-yellow-300' 
                : 'text-white opacity-70 hover:opacity-100 transition-opacity'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </nav>
    </footer>
  );
};

export default Footer; 