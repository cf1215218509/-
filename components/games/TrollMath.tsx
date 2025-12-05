import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus } from '../../types';

interface TrollMathProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

type Operator = '+' | '-' | '×';

const TrollMath: React.FC<TrollMathProps> = ({ onGameOver, status, setStatus }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  
  // Logic State
  const [opMap, setOpMap] = useState<Record<Operator, Operator>>({ '+': '+', '-': '-', '×': '×' });
  const [problem, setProblem] = useState({ a: 0, b: 0, symbol: '+' as Operator, answer: 0 });
  const [options, setOptions] = useState<number[]>([]);

  // Shuffle the meaning of operators
  const randomizeRules = useCallback(() => {
    const symbols: Operator[] = ['+', '-', '×'];
    const meanings: Operator[] = ['+', '-', '×'];
    
    // Fisher-Yates shuffle meanings
    for (let i = meanings.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [meanings[i], meanings[j]] = [meanings[j], meanings[i]];
    }

    const newMap: any = {};
    symbols.forEach((sym, idx) => {
      newMap[sym] = meanings[idx];
    });
    setOpMap(newMap);
  }, []);

  const generateProblem = useCallback(() => {
    // Pick random symbol
    const symbols: Operator[] = ['+', '-', '×'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const realOp = opMap[symbol];

    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    let result = 0;

    // Adjust numbers for clean results
    if (realOp === '+') {
      result = a + b;
    } else if (realOp === '-') {
      if (a < b) [a, b] = [b, a]; // Ensure positive
      result = a - b;
    } else if (realOp === '×') {
      a = Math.floor(Math.random() * 6) + 1; // Keep mult smaller
      b = Math.floor(Math.random() * 6) + 1;
      result = a * b;
    }

    // Generate fake answers
    const fake1 = result + Math.floor(Math.random() * 5) + 1;
    const fake2 = result - Math.floor(Math.random() * 5) - 1;
    const opts = [result, fake1, fake2].sort(() => Math.random() - 0.5);

    setProblem({ a, b, symbol, answer: result });
    setOptions(opts);
  }, [opMap]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setScore(0);
      setTimeLeft(45);
      randomizeRules();
    }
  }, [status, randomizeRules]);

  // If rules change, generate new problem immediately
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      generateProblem();
    }
  }, [opMap, status, generateProblem]);

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
        // Every 10 seconds, randomize rules again to confuse user
        if (prev % 15 === 0 && prev !== 45) {
          randomizeRules();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, score, onGameOver, setStatus, randomizeRules]);

  const handleSelect = (val: number) => {
    if (status !== GameStatus.PLAYING) return;
    if (val === problem.answer) {
      setScore(s => s + 1);
      generateProblem();
    } else {
      setStatus(GameStatus.GAME_OVER);
      onGameOver(score);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg pt-4">
      <div className="flex justify-between w-full mb-6 px-4">
         <div className="text-xl text-neon-green font-mono">得分: {score}</div>
         <div className="text-xl text-neon-red font-mono">时间: {timeLeft}s</div>
      </div>

      {/* Rules Legend */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-8 flex gap-8 border border-gray-700">
         {Object.entries(opMap).map(([sym, meaning]) => (
            <div key={sym} className="flex flex-col items-center">
               <span className="text-gray-400 text-xs mb-1">实际上是</span>
               <div className="font-mono text-lg">
                  <span className="text-neon-purple font-bold">{sym}</span> = <span className="text-white font-bold">{meaning}</span>
               </div>
            </div>
         ))}
      </div>

      {/* Problem */}
      <div className="mb-12">
        <span className="text-6xl font-bold font-mono tracking-wider">
           {problem.a} <span className="text-neon-green">{problem.symbol}</span> {problem.b} = ?
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-6 w-full px-4">
        {options.map((opt, i) => (
           <button
             key={i}
             onClick={() => handleSelect(opt)}
             className="h-20 bg-gray-800 border-2 border-gray-600 rounded-xl text-3xl font-bold hover:bg-gray-700 hover:border-neon-green transition-all"
           >
             {opt}
           </button>
        ))}
      </div>
      
      <p className="mt-8 text-gray-500 text-sm animate-pulse">规则每15秒打乱一次...</p>
    </div>
  );
};

export default TrollMath;