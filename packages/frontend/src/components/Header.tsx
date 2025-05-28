import { Settings, Star, Lightbulb } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 flex justify-between items-center">
      <div className="w-1/5">
        {/* Possible back button or menu icon can go here */}
      </div>
      
      <div className="w-3/5 flex items-center justify-center">
        <Lightbulb size={32} className="mr-3" />
        <h1 className="text-2xl font-bold">Quem Sabe, Sabe</h1>
      </div>
      
      <div className="w-1/5 flex justify-end items-center">
        <Star size={20} className="mr-1 text-yellow-400" />
        <span className="mr-4 text-lg">8.620</span>
        <Settings size={24} className="cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;
