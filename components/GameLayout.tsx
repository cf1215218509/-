import React, { useState, useEffect } from 'react';
import { GameType, GameStatus } from '../types';
import { generateTaunt } from '../services/geminiService';

interface GameLayoutProps {
  gameType: GameType;
  children: React.ReactNode;
  onBack: () => void;
  status: GameStatus;
  setStatus: (s: GameStatus) => void;
  lastScore: number;
}

const GAME_TITLES: Record<GameType, string> = {
  [GameType.REVERSE_TETRIS]: "反向俄罗斯方块",
  [GameType.ROTATED_SNAKE]: "旋转贪吃蛇",
  [GameType.COWARDLY_BUTTON]: "胆小鬼按钮",
  [GameType.INVERSE_MAZE]: "反向迷宫",
  [GameType.COLOR_LIAR]: "色彩骗局",
  [GameType.TROLL_MATH]: "智障算术",
  [GameType.NONE]: ""
};

const GameLayout: React.FC<GameLayoutProps> = ({ 
  gameType, 
  children, 
  onBack, 
  status, 
  setStatus,
  lastScore
}) => {
  const [taunt, setTaunt] = useState<string>('');
  const [loadingTaunt, setLoadingTaunt] = useState(false);

  useEffect(() => {
    if (status === GameStatus.GAME_OVER) {
      setLoadingTaunt(true);
      generateTaunt(gameType, lastScore).then(msg => {
        setTaunt(msg);
        setLoadingTaunt(false);
      });
    } else {
      setTaunt('');
    }
  }, [status, lastScore, gameType]);

  const handleStart = () => setStatus(GameStatus.PLAYING);

  return (
    <div className="flex flex-col items-center justify-start h-full w-full max-w-4xl mx-auto pt-2">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-2 shrink-0">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 px-2 py-1"
        >
          <i className="fas fa-arrow-left"></i> <span className="hidden sm:inline">放弃治疗</span>
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green truncate px-2">
          {GAME_TITLES[gameType]}
        </h2>
        <div className="w-10 md:w-20"></div> {/* Spacer */}
      </div>

      {/* Game Area Wrapper - ensures content fits */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center min-h-0">
        {children}

        {/* Overlay for Start/Game Over */}
        {(status === GameStatus.IDLE || status === GameStatus.GAME_OVER) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm rounded-xl">
            <div className="text-center p-6 max-w-sm w-full mx-4 border border-gray-800 bg-gray-900 rounded-xl shadow-2xl">
              {status === GameStatus.IDLE ? (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">准备好受苦了吗？</h3>
                  <button 
                    onClick={handleStart}
                    className="w-full py-4 bg-neon-green text-black font-bold text-lg rounded hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,65,0.4)]"
                  >
                    开始实验
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-neon-red mb-2 glitch-text">实验失败</h3>
                  <p className="text-xl text-gray-300 mb-6">最终得分: {lastScore}</p>
                  
                  {/* Da Vinci Taunt Box */}
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 mb-6 relative min-h-[5rem] flex items-center justify-center">
                    <div className="absolute -top-3 -left-3 bg-neon-purple text-xs font-bold px-2 py-1 rounded text-white shadow-md">
                      达文西锐评
                    </div>
                    {loadingTaunt ? (
                      <div className="flex justify-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    ) : (
                      <p className="text-gray-200 italic font-mono text-sm md:text-base leading-relaxed">"{taunt}"</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleStart}
                      className="py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                    >
                      重试
                    </button>
                    <button 
                      onClick={onBack}
                      className="py-3 border border-gray-600 text-gray-400 rounded hover:border-gray-400 hover:text-white transition-colors"
                    >
                      退出
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLayout;