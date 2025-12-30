
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus } from '../../types';
import TouchControls from '../TouchControls';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 22; // Slightly smaller to fit better with big buttons

const SHAPES = [
  [[1, 1, 1, 1]], 
  [[1, 1], [1, 1]], 
  [[0, 1, 0], [1, 1, 1]], 
  [[1, 0, 0], [1, 1, 1]], 
  [[0, 0, 1], [1, 1, 1]], 
  [[0, 1, 1], [1, 1, 0]], 
  [[1, 1, 0], [0, 1, 1]], 
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
  const currentPieceRef = useRef(currentPiece);
  const gridRef = useRef(grid);

  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { gridRef.current = grid; }, [grid]);

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
    const firstPiece = createPiece();
    setCurrentPiece(firstPiece);
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      resetGame();
    }
  }, [status]);

  const checkCollision = (piece: any, moveX = 0, moveY = 0, newShape?: number[][]) => {
    if (!piece) return false;
    const shape = newShape || piece.shape;
    const gridVal = gridRef.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = piece.x + c + moveX;
          const newY = piece.y + r + moveY;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && gridVal[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;
    const newGrid = gridRef.current.map(row => [...row]);
    let gameOver = false;

    piece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const newY = piece.y + r;
          const newX = piece.x + c;
          if (newY >= 0 && newY < ROWS) {
            newGrid[newY][newX] = piece.color + 1;
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

    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newGrid[r].every(cell => cell !== 0)) {
        newGrid.splice(r, 1);
        newGrid.unshift(Array(COLS).fill(0));
        linesCleared++;
        r++;
      }
    }

    setScore(s => s + linesCleared * 100);
    setGrid(newGrid);
    setCurrentPiece(createPiece());
  }, [score, setStatus, onGameOver]);

  const rotatePiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || status !== GameStatus.PLAYING) return;
    const shape = piece.shape;
    const newShape = shape[0].map((_, index) => shape.map(row => row[index]).reverse());
    if (!checkCollision(piece, 0, 0, newShape)) {
      setCurrentPiece({ ...piece, shape: newShape });
    }
  }, [status]);

  const move = useCallback((dirX: number, dirY: number) => {
    const piece = currentPieceRef.current;
    if (!piece || status !== GameStatus.PLAYING) return;
    if (!checkCollision(piece, dirX, dirY)) {
      setCurrentPiece({ ...piece, x: piece.x + dirX, y: piece.y + dirY });
    } else if (dirY > 0) {
      mergePiece();
    }
  }, [status, mergePiece]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      const interval = setInterval(() => {
        move(0, 1);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [status, move]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      switch (e.key) {
        case 'ArrowLeft': move(1, 0); break;
        case 'ArrowRight': move(-1, 0); break;
        case 'ArrowDown': rotatePiece(); break;
        case 'ArrowUp': move(0, 1); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, move, rotatePiece]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-full pb-2 overflow-hidden">
      <div className="text-center shrink-0 py-1">
         <p className="text-neon-red font-bold animate-pulse text-sm">按键诅咒：左右反转 / 上是速降</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 relative">
        <div className="relative border-4 border-gray-700 bg-gray-900 rounded-lg overflow-hidden shadow-2xl transform scale-[0.7] sm:scale-85 md:scale-100 origin-center" 
             style={{ width: COLS * BLOCK_SIZE, height: ROWS * BLOCK_SIZE }}>
          {grid.map((row, r) => row.map((cell, c) => cell ? (
            <div key={`${r}-${c}`} className={`absolute border border-black/20 ${COLORS[cell - 1]}`}
              style={{ width: BLOCK_SIZE, height: BLOCK_SIZE, left: c * BLOCK_SIZE, top: r * BLOCK_SIZE }} />
          ) : null))}
          {currentPiece && currentPiece.shape.map((row, r) => row.map((val, c) => val ? (
            <div key={`curr-${r}-${c}`} className={`absolute border border-black/20 ${COLORS[currentPiece.color]}`}
              style={{ width: BLOCK_SIZE, height: BLOCK_SIZE, left: (currentPiece.x + c) * BLOCK_SIZE, top: (currentPiece.y + r) * BLOCK_SIZE }} />
          ) : null))}
        </div>
        <div className="mt-1 text-xl font-mono text-neon-green">分数: {score}</div>
      </div>

      <TouchControls 
        color="cyan"
        onLeft={() => move(1, 0)}
        onRight={() => move(-1, 0)}
        onUp={() => move(0, 1)}
        onDown={() => rotatePiece()}
      />
    </div>
  );
};

export default ReverseTetris;
