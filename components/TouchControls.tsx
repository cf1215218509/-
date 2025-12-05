import React from 'react';

interface TouchControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  color?: string;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onUp, onDown, onLeft, onRight, color = 'gray' }) => {
  // Increased size from w-16 to w-20/w-24, added transparency to background
  const btnClass = `w-20 h-20 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600/50 shadow-lg active:scale-95 active:border-${color}-400 active:text-${color}-400 active:bg-gray-700 transition-all select-none touch-none text-2xl`;

  return (
    <div className="grid grid-cols-3 gap-3 mt-auto mb-2 md:hidden select-none touch-none shrink-0 z-40 pb-safe">
       {/* Top Row */}
       <div></div>
       <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onUp(); }}>
         <i className="fas fa-arrow-up"></i>
       </button>
       <div></div>

       {/* Middle Row */}
       <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onLeft(); }}>
         <i className="fas fa-arrow-left"></i>
       </button>
       <div className="flex items-center justify-center pointer-events-none">
         <div className={`w-3 h-3 rounded-full bg-${color}-500/30 animate-pulse`}></div>
       </div>
       <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onRight(); }}>
         <i className="fas fa-arrow-right"></i>
       </button>

       {/* Bottom Row */}
       <div></div>
       <button className={btnClass} onPointerDown={(e) => { e.preventDefault(); onDown(); }}>
         <i className="fas fa-arrow-down"></i>
       </button>
       <div></div>
    </div>
  );
};

export default TouchControls;