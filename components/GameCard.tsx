import React from 'react';
import { GameConfig } from '../types';

interface GameCardProps {
  config: GameConfig;
  onSelect: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ config, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-left transition-all hover:-translate-y-1 hover:border-${config.color}-500 hover:shadow-lg hover:shadow-${config.color}-500/20`}
    >
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${config.color}-500/10 blur-2xl transition-all group-hover:bg-${config.color}-500/20`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-2xl text-${config.color}-400 group-hover:bg-${config.color}-500/20 group-hover:text-${config.color}-300`}>
          <i className={config.icon}></i>
        </div>
        <h3 className="mb-2 text-xl font-bold text-white group-hover:text-neon-green/90">{config.title}</h3>
        <p className="text-sm text-gray-400 group-hover:text-gray-300">{config.description}</p>
      </div>
    </button>
  );
};

export default GameCard;