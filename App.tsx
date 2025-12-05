import React, { useState } from 'react';
import { GameType, GameConfig, GameStatus } from './types';
import GameCard from './components/GameCard';
import GameLayout from './components/GameLayout';
import ReverseTetris from './components/games/ReverseTetris';
import RotatedSnake from './components/games/RotatedSnake';
import CowardlyButton from './components/games/CowardlyButton';
import InverseMaze from './components/games/InverseMaze';
import ColorLiar from './components/games/ColorLiar';
import TrollMath from './components/games/TrollMath';

const GAMES: GameConfig[] = [
  {
    id: GameType.REVERSE_TETRIS,
    title: "反向俄罗斯方块",
    description: "左即是右，右即是左。上是下落，下是旋转。逼死强迫症。",
    icon: "fas fa-border-all",
    color: "cyan"
  },
  {
    id: GameType.ROTATED_SNAKE,
    title: "旋转贪吃蛇",
    description: "方向键被旋转了90度。想往上走？按左键试试。脑子要打结了。",
    icon: "fas fa-bug",
    color: "green"
  },
  {
    id: GameType.COWARDLY_BUTTON,
    title: "胆小鬼按钮",
    description: "它不想被点击。它真的很不想。手速与预判的终极考验。",
    icon: "fas fa-bullseye",
    color: "neon-purple"
  },
  {
    id: GameType.INVERSE_MAZE,
    title: "反向迷宫",
    description: "简单的迷宫，但你的鼠标不仅不听话，还跟你对着干。",
    icon: "fas fa-arrow-trend-down",
    color: "neon-red"
  },
  {
    id: GameType.COLOR_LIAR,
    title: "色彩骗局",
    description: "红色的字写着“绿色”，你该选什么？别犹豫，犹豫就会败北。",
    icon: "fas fa-palette",
    color: "blue"
  },
  {
    id: GameType.TROLL_MATH,
    title: "智障算术",
    description: "加号变成了减号，乘号变成了加号。小学数学从未如此艰难。",
    icon: "fas fa-calculator",
    color: "yellow"
  }
];

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [lastScore, setLastScore] = useState(0);

  const handleSelectGame = (id: GameType) => {
    setActiveGame(id);
    setGameStatus(GameStatus.IDLE);
    setLastScore(0);
  };

  const handleBack = () => {
    setActiveGame(GameType.NONE);
    setGameStatus(GameStatus.IDLE);
  };

  const handleGameOver = (score: number) => {
    setLastScore(score);
  };

  const isGameActive = activeGame !== GameType.NONE;

  return (
    // Updated container layout: h-full with overflow-y-auto fixes mobile scrolling issues when body is overflow-hidden
    <div className={`w-full bg-dark-bg text-gray-100 selection:bg-neon-purple selection:text-white font-sans ${isGameActive ? 'h-[100dvh] overflow-hidden fixed inset-0' : 'h-full overflow-y-auto'}`}>
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-dark-bg to-black"></div>

      <div className={`relative z-10 container mx-auto px-4 ${isGameActive ? 'h-full flex flex-col' : 'py-8'}`}>
        
        {/* Header - Only show when NOT playing to save space on mobile */}
        {!isGameActive && (
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-white to-neon-green animate-glitch inline-block">
                达文西的
              </span>
              <br />
              <span className="text-2xl md:text-4xl text-gray-500 font-mono">反人类实验室</span>
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              欢迎来到肌肉记忆粉碎机。这里的所有游戏设计初衷都是为了让你不爽。
            </p>
          </header>
        )}

        {/* Content */}
        <main className={isGameActive ? 'flex-1 flex flex-col overflow-hidden relative' : ''}>
          {activeGame === GameType.NONE ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pb-8">
              {GAMES.map(game => (
                <GameCard 
                  key={game.id} 
                  config={game} 
                  onSelect={() => handleSelectGame(game.id)} 
                />
              ))}
            </div>
          ) : (
            <GameLayout 
              gameType={activeGame} 
              onBack={handleBack}
              status={gameStatus}
              setStatus={setGameStatus}
              lastScore={lastScore}
            >
              {activeGame === GameType.REVERSE_TETRIS && (
                <ReverseTetris 
                  onGameOver={handleGameOver} 
                  status={gameStatus} 
                  setStatus={setGameStatus} 
                />
              )}
              {activeGame === GameType.ROTATED_SNAKE && (
                <RotatedSnake 
                  onGameOver={handleGameOver} 
                  status={gameStatus} 
                  setStatus={setGameStatus} 
                />
              )}
              {activeGame === GameType.COWARDLY_BUTTON && (
                <CowardlyButton 
                  onGameOver={handleGameOver} 
                  status={gameStatus} 
                  setStatus={setGameStatus} 
                />
              )}
               {activeGame === GameType.INVERSE_MAZE && (
                <InverseMaze 
                  onGameOver={handleGameOver} 
                  status={gameStatus} 
                  setStatus={setGameStatus} 
                />
              )}
               {activeGame === GameType.COLOR_LIAR && (
                <ColorLiar 
                  onGameOver={handleGameOver} 
                  status={gameStatus} 
                  setStatus={setGameStatus} 
                />
              )}
               {activeGame === GameType.TROLL_MATH && (
                <TrollMath 
                  onGameOver={handleGameOver} 
                  status={gameStatus} 
                  setStatus={setGameStatus} 
                />
              )}
            </GameLayout>
          )}
        </main>

        {!isGameActive && (
          <footer className="mt-20 text-center text-gray-600 text-sm pb-4">
            <p>© {new Date().getFullYear()} 达文西的反人类实验室 (Da Vinci's Glitch Lab). 请勿砸坏键盘。</p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;