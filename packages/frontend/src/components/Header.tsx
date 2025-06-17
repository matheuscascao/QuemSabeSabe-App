import { Settings, Star, Lightbulb, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/modal';
import { Carousel } from './ui/carousel';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const tutorialSlides = [
    {
      title: "Escolha um Quiz",
      description: "Selecione uma categoria e escolha um quiz que mais te interessa. Temos diversos temas para você explorar!",
      image: "/images/tutorial/choose-quiz.png"
    },
    {
      title: "Responda as Perguntas",
      description: "Cada quiz tem várias perguntas. Leia com atenção e escolha a resposta correta. Você tem um tempo limitado para responder!",
      image: "/images/tutorial/answer-questions.png"
    },
    {
      title: "Ganhe Pontos",
      description: "Acertando as respostas, você ganha pontos e sobe no ranking! Quanto mais rápido responder, mais pontos você ganha.",
      image: "/images/tutorial/earn-points.png"
    },
    {
      title: "Desafie seus Amigos",
      description: "Compare seus resultados e veja quem sabe mais! Compartilhe seus resultados e incentive seus amigos a jogarem também.",
      image: "/images/tutorial/challenge-friends.png"
    }
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 flex justify-between items-center">
        <div className="w-1/5">
          {/* Possible back button or menu icon can go here */}
        </div>
        
        <div className="w-3/5 flex items-center justify-center">
          <Lightbulb size={32} className="mr-3" />
          <h1 className="text-2xl font-bold">Quem Sabe, Sabe</h1>
        </div>
        
        <div className="w-1/5 flex justify-end items-center gap-4 relative">
          <span className="mr-2 text-lg">{user?.xp ?? 0} XP</span>
          <span className="mr-4 text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded-full">Nível {user?.level ?? '-'}</span>
          <button
            onClick={() => setShowTutorial(true)}
            className="text-white hover:text-yellow-200 transition-colors"
          >
            <HelpCircle size={24} />
          </button>
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

      {/* Tutorial Modal */}
      <Modal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        title="Como Jogar"
      >
        <Carousel
          slides={tutorialSlides}
          onComplete={() => setShowTutorial(false)}
        />
      </Modal>
    </>
  );
};

export default Header;
