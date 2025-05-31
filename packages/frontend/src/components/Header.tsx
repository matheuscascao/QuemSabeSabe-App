import { Settings, Star, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 flex justify-between items-center">
      <div className="w-1/5">
        {/* Possible back button or menu icon can go here */}
      </div>
      
      <div className="w-3/5 flex items-center justify-center">
        <Lightbulb size={32} className="mr-3" />
        <h1 className="text-2xl font-bold">Quem Sabe, Sabe</h1>
      </div>
      
      <div className="w-1/5 flex justify-end items-center relative">
        <Star size={20} className="mr-1 text-yellow-400" />
        <span className="mr-4 text-lg">{user?.xp ?? 0}</span>
        <div>
          <Settings
            size={24}
            className="cursor-pointer"
            onClick={() => setShowMenu((v) => !v)}
          />
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white text-gray-800 rounded shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
