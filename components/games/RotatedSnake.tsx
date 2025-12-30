
import React, { useState, useEffect, useRef } from 'react';
import { GameStatus } from '../../types';
import TouchControls from '../TouchControls';

const GRID_SIZE = 20;
const TICK_RATE = 120; // Slightly slower for better control
const CELL_SIZE = 16; 

interface Point {
  x: number;
  y: number;
}

interface RotatedSnakeProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const RotatedSnake: React.FC<RotatedSnakeProps> = ({ onGameOver, status, setStatus }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = (): Point => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setFood(generateFood());
  };

  // CRITICAL: Reset when entering PLAYING status (Retry clicked)
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      resetGame();
    }
  }, [status]);

  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const moveSnake = () => {
      setSnake(currentSnake => {
        const newHead = {
          x: currentSnake[0].x + directionRef.current.x,
          y: currentSnake[0].y + directionRef.current.y
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setStatus(GameStatus.GAME_OVER);
          onGameOver(score);
          return currentSnake;
        }

        // Self collision
        if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setStatus(GameStatus.GAME_OVER);
          onGameOver(score);
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];
        
        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, TICK_RATE);
    return () => clearInterval(interval);
  }, [status, food, score, onGameOver, setStatus]);

  const handleDirectionInput = (key: string) => {
    const current = directionRef.current;
    switch (key) {
      case 'ArrowUp':
        if (current.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
         if (current.y !== 1) setDirection({ x: 0, y: -1 });
         break;
      case 'ArrowDown':
         if (current.x !== -1) setDirection({ x: 1, y: 0 });
         break;
      case 'ArrowLeft':
         if (current.y !== -1) setDirection({ x: 0, y: 1 });
         break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      handleDirectionInput(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  return (
    <div className="flex flex-col items-center w-full h-full justify-between pb-2 overflow-hidden">
      <div className="text-center shrink-0 py-2">
         <p className="text-neon-purple font-bold text-sm sm:text-base">按键错乱：逆向旋转</p>
         <div className="text-[10px] sm:text-xs text-gray-400 mt-1">
            <p>↑=左 | →=上 | ↓=右 | ←=下</p>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 relative">
        <div 
          className="relative bg-gray-900 border-2 border-neon-green/30 rounded shadow-[0_0_20px_rgba(0,255,65,0.2)] transform scale-[0.75] sm:scale-100 origin-center"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
        >
          <div 
            className="absolute bg-neon-red rounded-full shadow-[0_0_10px_#ff3131]"
            style={{
              width: CELL_SIZE - 4, height: CELL_SIZE - 4,
              left: food.x * CELL_SIZE + 2, top: food.y * CELL_SIZE + 2
            }}
          />
          {snake.map((segment, i) => (
            <div 
              key={i}
              className={`absolute ${i === 0 ? 'bg-neon-green' : 'bg-green-700'} rounded-sm`}
              style={{
                width: CELL_SIZE - 2, height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE + 1, top: segment.y * CELL_SIZE + 1
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-xl font-mono text-neon-green">分数: {score}</div>
      </div>

      <TouchControls 
         color="green"
         onUp={() => handleDirectionInput('ArrowUp')}
         onDown={() => handleDirectionInput('ArrowDown')}
         onLeft={() => handleDirectionInput('ArrowLeft')}
         onRight={() => handleDirectionInput('ArrowRight')}
      />
    </div>
  );
};

export default RotatedSnake;
