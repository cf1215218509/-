
import React from 'react';

interface TouchControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  color?: string;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onUp, onDown, onLeft, onRight, color = 'gray' }) => {
  // Ultra-large buttons for better mobile experience
  const btnClass = `w-24 h-24 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-gray-800/60 backdrop-blur-md border-4 border-gray-600/40 shadow-2xl active:scale-90 active:border-${color}-400 active:text-${color}-400 active:bg-gray-700/90 transition-all select-none touch-none text-3xl`;

  const handlePointerDown = (e: React.PointerEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-auto mb-6 md:hidden select-none touch-none shrink-0 z-50 pb-safe px-4 max-w-[400px] w-full mx-auto">
       {/* Top Row */}
       <div></div>
       <div className="flex justify-center">
         <button className={btnClass} onPointerDown={(e) => handlePointerDown(e, onUp)}>
           <i className="fas fa-arrow-up"></i>
         </button>
       </div>
       <div></div>

       {/* Middle Row */}
       <div className="flex justify-center">
         <button className={btnClass} onPointerDown={(e) => handlePointerDown(e, onLeft)}>
           <i className="fas fa-arrow-left"></i>
         </button>
       </div>
       <div className="flex items-center justify-center pointer-events-none">
         <div className={`w-4 h-4 rounded-full bg-${color}-500/50 animate-pulse`}></div>
       </div>
       <div className="flex justify-center">
         <button className={btnClass} onPointerDown={(e) => handlePointerDown(e, onRight)}>
           <i className="fas fa-arrow-right"></i>
         </button>
       </div>

       {/* Bottom Row */}
       <div></div>
       <div className="flex justify-center">
         <button className={btnClass} onPointerDown={(e) => handlePointerDown(e, onDown)}>
           <i className="fas fa-arrow-down"></i>
         </button>
       </div>
       <div></div>
    </div>
  );
};

export default TouchControls;
