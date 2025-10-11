import React, { useRef } from 'react';
import { Plus } from 'lucide-react';

const Header = ({ onAddTask }) => {
  return (
    <div className="text-center mb-2">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Eisenhower Matrix</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6">Organize tasks by importance and urgency</p>
      
      <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
        <button onClick={onAddTask} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md">
          <Plus size={20} />Add Task
        </button>
      </div>
    </div>
  );
};

export default Header;