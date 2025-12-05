import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus } from '../../types';
import TouchControls from '../TouchControls';

// Utils
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

// Tetromino definitions
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
];

const COLORS = [
  'bg-cyan-500', 'bg-yellow-400', 'bg-purple-500', 
  'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500'
];

interface ReverseTetrisProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const ReverseTetris: React.FC<ReverseTetrisProps> = ({ onGameOver, status, setStatus }) => {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][], color: number, x: number, y: number } | null>(null);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number | null>(null);

  const createPiece = () => {
    const typeIdx = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[typeIdx];
    return {
      shape,
      color: typeIdx,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
  };

  const resetGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setCurrentPiece(createPiece());
  };

  // Reset when playing starts
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      resetGame();
    }
  }, [status]);

  const checkCollision = (piece: typeof currentPiece, moveX = 0, moveY = 0, newShape?: number[][]) => {
    if (!piece) return false;
    const shape = newShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = piece.x + c + moveX;
          const newY = piece.y + r + moveY;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && grid[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    if (!currentPiece) return;
    const newGrid = grid.map(row => [...row]);
    let gameOver = false;

    currentPiece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const newY = currentPiece.y + r;
          const newX = currentPiece.x + c;
          if (newY >= 0 && newY < ROWS) {
            newGrid[newY][newX] = currentPiece.color + 1; // +1 to distinguish from empty
          } else {
            gameOver = true;
          }
        }
      });
    });

    if (gameOver) {
      setStatus(GameStatus.GAME_OVER);
      onGameOver(score);
      return;
    }

    // Clear lines
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newGrid[r].every(cell => cell !== 0)) {
        newGrid.splice(r, 1);
        newGrid.unshift(Array(COLS).fill(0));
        linesCleared++;
        r++; // Check same row index again
      }
    }

    setScore(s => s + linesCleared * 100);
    setGrid(newGrid);
    setCurrentPiece(createPiece());
  };

  const rotatePiece = useCallback(() => {
    if (!currentPiece || status !== GameStatus.PLAYING) return;
    const shape = currentPiece.shape;
    const newShape = shape[0].map((_, index) => shape.map(row => row[index]).reverse());
    if (!checkCollision(currentPiece, 0, 0, newShape)) {
      setCurrentPiece({ ...currentPiece, shape: newShape });
    }
  }, [currentPiece, status]);

  const move = useCallback((dirX: number, dirY: number) => {
    if (!currentPiece || status !== GameStatus.PLAYING) return;
    if (!checkCollision(currentPiece, dirX, dirY)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dirX, y: currentPiece.y + dirY });
    } else if (dirY > 0) {
      mergePiece();
    }
  }, [currentPiece, grid, status]);

  // Game Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      // Note: We don't create piece here because resetGame does it
      const interval = setInterval(() => {
        move(0, 1);
      }, 500); // Speed
      gameLoopRef.current = interval as unknown as number;

      return () => clearInterval(interval);
    }
  }, [status, currentPiece, move]);

  // Controls - THE REVERSE PART
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          // Reverses to Right
          move(1, 0); 
          break;
        case 'ArrowRight':
          // Reverses to Left
          move(-1, 0);
          break;
        case 'ArrowDown':
           // Down rotates instead of soft drop
           rotatePiece();
           break;
        case 'ArrowUp':
          // Up acts as Soft Drop
          move(0, 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, move, rotatePiece]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-full pb-4">
      <div className="text-center shrink-0">
         <p className="text-neon-red font-bold animate-pulse">按键诅咒已生效</p>
         <div className="text-xs text-gray-400 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-right">← 向右移</span>
            <span className="text-left">→ 向左移</span>
            <span className="text-right">↓ 旋转</span>
            <span className="text-left">↑ 下落</span>
         </div>
      </div>
      
      {/* Game Grid Container - Scaled for Mobile */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        <div className="relative border-4 border-gray-700 bg-gray-900 rounded-lg overflow-hidden shadow-2xl transform scale-[0.8] sm:scale-90 md:scale-100 origin-center" 
             style={{ width: COLS * BLOCK_SIZE, height: ROWS * BLOCK_SIZE }}>
          
          {/* Render Grid */}
          {grid.map((row, r) => (
            row.map((cell, c) => (
              cell ? (
                <div 
                  key={`${r}-${c}`}
                  className={`absolute w-full h-full border border-black/20 ${COLORS[cell - 1]}`}
                  style={{ 
                    width: BLOCK_SIZE, 
                    height: BLOCK_SIZE, 
                    left: c * BLOCK_SIZE, 
                    top: r * BLOCK_SIZE 
                  }}
                />
              ) : null
            ))
          ))}

          {/* Render Current Piece */}
          {currentPiece && currentPiece.shape.map((row, r) => (
            row.map((val, c) => (
              val ? (
                <div
                  key={`curr-${r}-${c}`}
                  className={`absolute border border-black/20 ${COLORS[currentPiece.color]}`}
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    left: (currentPiece.x + c) * BLOCK_SIZE,
                    top: (currentPiece.y + r) * BLOCK_SIZE
                  }}
                />
              ) : null
            ))
          ))}
        </div>
        <div className="mt-2 text-xl font-mono text-neon-green">分数: {score}</div>
      </div>

      {/* Mobile Controls */}
      <TouchControls 
        color="cyan"
        onLeft={() => move(1, 0)} // Left Button -> Moves Right
        onRight={() => move(-1, 0)} // Right Button -> Moves Left
        onUp={() => move(0, 1)} // Up Button -> Soft Drop
        onDown={() => rotatePiece()} // Down Button -> Rotate
      />
    </div>
  );
};

export default ReverseTetris;