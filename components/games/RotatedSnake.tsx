import React, { useState, useEffect, useRef } from 'react';
import { GameStatus } from '../../types';
import TouchControls from '../TouchControls';

const GRID_SIZE = 20;
const TICK_RATE = 100;
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
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 }); // Moving Right initially
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

  // Reset when game starts
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      resetGame();
    }
  }, [status]);

  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const moveSnake = () => {
      const newHead = {
        x: snake[0].x + directionRef.current.x,
        y: snake[0].y + directionRef.current.y
      };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setStatus(GameStatus.GAME_OVER);
        onGameOver(score);
        return;
      }

      // Self collision
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setStatus(GameStatus.GAME_OVER);
        onGameOver(score);
        return;
      }

      const newSnake = [newHead, ...snake];
      
      // Eat food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const interval = setInterval(moveSnake, TICK_RATE);
    return () => clearInterval(interval);
  }, [status, snake, food, score, onGameOver, setStatus]);

  // THE GLITCH: Controls are rotated.
  const handleDirectionInput = (key: string) => {
    const current = directionRef.current;

    switch (key) {
      case 'ArrowUp':
        // "Up" key maps to Left (-1, 0)
        if (current.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
         // "Right" key maps to Up (0, -1)
         if (current.y !== 1) setDirection({ x: 0, y: -1 });
         break;
      case 'ArrowDown':
         // "Down" key maps to Right (1, 0)
         if (current.x !== -1) setDirection({ x: 1, y: 0 });
         break;
      case 'ArrowLeft':
         // "Left" key maps to Down (0, 1)
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
    <div className="flex flex-col items-center w-full h-full justify-between pb-4">
      <div className="text-center shrink-0">
         <p className="text-neon-purple font-bold">按键错乱：逆向旋转</p>
         <div className="text-xs text-gray-400 mt-1 space-y-1">
            <p>↑ = 左 | → = 上 | ↓ = 右 | ← = 下</p>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        <div 
          className="relative bg-gray-900 border-2 border-neon-green/30 rounded shadow-[0_0_15px_rgba(0,255,65,0.1)] transform scale-[0.85] md:scale-100 origin-center"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
        >
          {/* Food */}
          <div 
            className="absolute bg-neon-red rounded-full shadow-[0_0_10px_#ff3131]"
            style={{
              width: CELL_SIZE - 4, height: CELL_SIZE - 4,
              left: food.x * CELL_SIZE + 2, top: food.y * CELL_SIZE + 2
            }}
          />
          
          {/* Snake */}
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