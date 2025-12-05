import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus } from '../../types';

interface ColorLiarProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

type ColorType = 'red' | 'green' | 'blue' | 'yellow';

const COLORS: Record<ColorType, { label: string, hex: string, bg: string }> = {
  red: { label: '红色', hex: '#ff3131', bg: 'bg-red-500' },
  green: { label: '绿色', hex: '#00ff41', bg: 'bg-green-500' },
  blue: { label: '蓝色', hex: '#26c6da', bg: 'bg-cyan-500' }, // using cyan for better visibility
  yellow: { label: '黄色', hex: '#ffff00', bg: 'bg-yellow-400' },
};

const ColorLiar: React.FC<ColorLiarProps> = ({ onGameOver, status, setStatus }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Game State
  const [currentText, setCurrentText] = useState<ColorType>('red');
  const [currentColor, setCurrentColor] = useState<ColorType>('green');
  const [rule, setRule] = useState<'MATCH_TEXT' | 'MATCH_COLOR'>('MATCH_COLOR');

  // Shuffle colors/rules
  const nextRound = useCallback(() => {
    const keys = Object.keys(COLORS) as ColorType[];
    
    // Pick random text and color (ensure they are different sometimes, same sometimes)
    const text = keys[Math.floor(Math.random() * keys.length)];
    const color = keys[Math.floor(Math.random() * keys.length)];
    
    // Random rule
    const newRule = Math.random() > 0.5 ? 'MATCH_TEXT' : 'MATCH_COLOR';

    setCurrentText(text);
    setCurrentColor(color);
    setRule(newRule);
  }, []);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setScore(0);
      setTimeLeft(30);
      nextRound();
    }
  }, [status, nextRound]);

  // Timer
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setStatus(GameStatus.GAME_OVER);
          onGameOver(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, score, onGameOver, setStatus]);

  const handleAnswer = (color: ColorType) => {
    if (status !== GameStatus.PLAYING) return;

    const correctAnswer = rule === 'MATCH_TEXT' ? currentText : currentColor;

    if (color === correctAnswer) {
      setScore(s => s + 1);
      // Small time bonus
      setTimeLeft(t => Math.min(t + 1, 30));
      nextRound();
    } else {
      // Wrong answer penalty
      setTimeLeft(t => Math.max(0, t - 5));
      // Visual feedback could go here
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg pt-4">
      <div className="flex justify-between w-full mb-6 px-4">
         <div className="text-xl text-neon-green font-mono">得分: {score}</div>
         <div className="text-xl text-neon-red font-mono">时间: {timeLeft}s</div>
      </div>

      <div className="relative w-full aspect-video bg-gray-900 border border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 mb-8">
        
        {/* Rule Display */}
        <div className="absolute top-4 text-gray-400 text-sm uppercase tracking-widest">当前规则</div>
        <div className={`text-2xl font-bold mb-8 transition-colors duration-200 ${rule === 'MATCH_TEXT' ? 'text-white' : 'text-neon-purple'}`}>
           {rule === 'MATCH_TEXT' ? '选字的 意思' : '选字的 颜色'}
        </div>

        {/* The Trick Word */}
        <div 
           className="text-6xl font-black transition-all duration-100 transform hover:scale-105"
           style={{ color: COLORS[currentColor].hex }}
        >
           {COLORS[currentText].label}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 w-full px-4">
        {(Object.keys(COLORS) as ColorType[]).map((c) => (
           <button
             key={c}
             onClick={() => handleAnswer(c)}
             className={`${COLORS[c].bg} h-20 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all text-black font-bold text-xl`}
           >
             {COLORS[c].label}
           </button>
        ))}
      </div>
    </div>
  );
};

export default ColorLiar;