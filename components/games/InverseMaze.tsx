import React, { useState, useEffect, useRef } from 'react';
import { GameStatus } from '../../types';

interface InverseMazeProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const InverseMaze: React.FC<InverseMazeProps> = ({ onGameOver, status, setStatus }) => {
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 350 }); // Start position (bottom left-ish)
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{x: number, y: number} | null>(null);

  // Maze Walls (simple rects: x, y, w, h in %)
  // 350x350 playing area for mobile compatibility (slightly smaller)
  const SIZE = 350;
  
  // Scaled coordinates mostly same proportional logic
  const WALLS = [
    // Outer border
    { x: 0, y: 0, w: SIZE, h: 10 }, { x: 0, y: SIZE - 10, w: SIZE, h: 10 },
    { x: 0, y: 0, w: 10, h: SIZE }, { x: SIZE - 10, y: 0, w: 10, h: SIZE },
    // Inner walls
    { x: 10, y: 260, w: 200, h: 20 },
    { x: 260, y: 80, w: 20, h: 270 },
    { x: 80, y: 80, w: 200, h: 20 },
    { x: 80, y: 100, w: 20, h: 120 },
    { x: 150, y: 180, w: 80, h: 20 },
  ];

  const START_ZONE = { x: 30, y: 290, w: 60, h: 50 };
  const END_ZONE = { x: 280, y: 30, w: 50, h: 50 };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setCursorPos({ x: 50, y: 300 }); // Adjusted start
      setScore(0);
      lastTouchRef.current = null;
    }
  }, [status]);

  const updatePosition = (dx: number, dy: number) => {
    setCursorPos(prev => {
        const nextX = Math.max(0, Math.min(SIZE, prev.x + dx));
        const nextY = Math.max(0, Math.min(SIZE, prev.y + dy));

        // Collision Check
        const cursorSize = 10;
        const hitWall = WALLS.some(w => 
          nextX < w.x + w.w &&
          nextX + cursorSize > w.x &&
          nextY < w.y + w.h &&
          nextY + cursorSize > w.y
        );

        if (hitWall) {
          setStatus(GameStatus.GAME_OVER);
          onGameOver(0); // You failed
          return prev;
        }

        // Win Check
        if (
          nextX < END_ZONE.x + END_ZONE.w &&
          nextX + cursorSize > END_ZONE.x &&
          nextY < END_ZONE.y + END_ZONE.h &&
          nextY + cursorSize > END_ZONE.y
        ) {
           setStatus(GameStatus.GAME_OVER);
           onGameOver(100); // Success score
           return prev;
        }

        return { x: nextX, y: nextY };
      });
  }

  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Logic for inverse movement
      const sensitivity = 1.5;
      const dx = -e.movementX * sensitivity;
      const dy = -e.movementY * sensitivity;
      updatePosition(dx, dy);
    };

    // Lock pointer
    const lockPointer = async () => {
      try {
        await containerRef.current?.requestPointerLock();
      } catch (e) {
        // console.error("Pointer lock failed", e);
      }
    };
    
    // Only lock on desktop click
    const handleContainerClick = () => {
        if (!('ontouchstart' in window)) lockPointer();
    }
    
    const el = containerRef.current;
    if(el) el.addEventListener('click', handleContainerClick);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      if(el) el.removeEventListener('click', handleContainerClick);
      document.removeEventListener('mousemove', handleMouseMove);
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, [status, onGameOver, setStatus]);

  // Touch Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (status !== GameStatus.PLAYING) return;
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  }

  const handleTouchMove = (e: React.TouchEvent) => {
      if (status !== GameStatus.PLAYING || !lastTouchRef.current) return;
      // Prevent scrolling
      e.preventDefault(); 
      const touch = e.touches[0];
      
      const dxRaw = touch.clientX - lastTouchRef.current.x;
      const dyRaw = touch.clientY - lastTouchRef.current.y;
      
      // Inverse logic
      const sensitivity = 1.2;
      const dx = -dxRaw * sensitivity;
      const dy = -dyRaw * sensitivity;

      updatePosition(dx, dy);

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  }

  return (
    <div className="flex flex-col items-center pt-4">
      <div className="mb-4 text-center">
         <p className="text-neon-purple font-bold">反向迷宫</p>
         <p className="text-xs text-gray-400">电脑：鼠标 | 手机：触摸滑动 (反向)</p>
      </div>

      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="relative bg-gray-900 border-2 border-gray-700 overflow-hidden touch-none transform scale-90 md:scale-100 origin-top"
        style={{ width: SIZE, height: SIZE, cursor: 'none' }}
      >
        {/* Start Zone */}
        <div 
          className="absolute bg-green-900/50 border border-green-500/50 flex items-center justify-center text-xs text-green-500"
          style={{ left: START_ZONE.x, top: START_ZONE.y, width: START_ZONE.w, height: START_ZONE.h }}
        >
          Start
        </div>

        {/* End Zone */}
        <div 
          className="absolute bg-red-900/50 border border-red-500/50 flex items-center justify-center text-xs text-red-500 animate-pulse"
          style={{ left: END_ZONE.x, top: END_ZONE.y, width: END_ZONE.w, height: END_ZONE.h }}
        >
          End
        </div>

        {/* Walls */}
        {WALLS.map((w, i) => (
          <div 
            key={i}
            className="absolute bg-gray-600 border border-gray-500 shadow-sm"
            style={{ left: w.x, top: w.y, width: w.w, height: w.h }}
          />
        ))}

        {/* Player Cursor */}
        {status === GameStatus.PLAYING && (
          <div 
            className="absolute bg-neon-green rounded-full shadow-[0_0_10px_#00ff41] z-10 pointer-events-none"
            style={{ 
              left: cursorPos.x, 
              top: cursorPos.y, 
              width: 10, 
              height: 10,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {status === GameStatus.IDLE && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm pointer-events-none">
                点击或触摸开始
            </div>
        )}
      </div>
    </div>
  );
};

export default InverseMaze;