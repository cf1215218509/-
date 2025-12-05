import React, { useState, useEffect, useRef } from 'react';
import { GameStatus } from '../../types';

interface CowardlyButtonProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const CowardlyButton: React.FC<CowardlyButtonProps> = ({ onGameOver, status, setStatus }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setClicks(0);
      setTimeLeft(15);
      setPosition({ x: 50, y: 50 });
    }
  }, [status]);

  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus(GameStatus.GAME_OVER);
          onGameOver(clicks);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, clicks, onGameOver, setStatus]);

  const moveButton = () => {
    const newX = Math.random() * 80 + 10; // Keep within 10-90%
    const newY = Math.random() * 80 + 10;
    setPosition({ x: newX, y: newY });
  };

  const checkDistanceAndFlee = (clientX: number, clientY: number) => {
     if (status !== GameStatus.PLAYING || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const btnX = (position.x / 100) * rect.width;
    const btnY = (position.y / 100) * rect.height;
    
    // Coords relative to container
    const ptrX = clientX - rect.left;
    const ptrY = clientY - rect.top;

    const dist = Math.sqrt(Math.pow(ptrX - btnX, 2) + Math.pow(ptrY - btnY, 2));

    // Teleport if too close (100px radius)
    if (dist < 100) {
      moveButton();
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    checkDistanceAndFlee(e.clientX, e.clientY);
  };

  // For mobile touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    checkDistanceAndFlee(touch.clientX, touch.clientY);
  };

  const handleClick = () => {
    if (status !== GameStatus.PLAYING) return;
    setClicks(c => c + 1);
    moveButton();
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-2xl pt-8">
      <div className="mb-4 text-center">
         <p className="text-neon-purple font-bold">抓住那个按钮！</p>
         <p className="text-xs text-gray-400">它很害羞，别把鼠标靠太近。</p>
         <div className="flex gap-8 mt-2 text-lg font-mono">
           <span className="text-neon-green">点击: {clicks}</span>
           <span className="text-neon-red">时间: {timeLeft}s</span>
         </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart} // Add touch listener to container
        className="relative w-full h-96 bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden cursor-crosshair touch-none"
      >
        <button
          onClick={handleClick}
          style={{ 
            left: `${position.x}%`, 
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.1s ease-out' 
          }}
          className="absolute px-6 py-3 bg-neon-purple text-white font-bold rounded-full shadow-[0_0_20px_rgba(176,38,255,0.5)] hover:bg-white hover:text-black whitespace-nowrap active:scale-95"
        >
          点我呀！
        </button>
      </div>
    </div>
  );
};

export default CowardlyButton;