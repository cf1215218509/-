export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED'
}

export enum GameType {
  REVERSE_TETRIS = 'REVERSE_TETRIS',
  ROTATED_SNAKE = 'ROTATED_SNAKE',
  COWARDLY_BUTTON = 'COWARDLY_BUTTON',
  INVERSE_MAZE = 'INVERSE_MAZE',
  COLOR_LIAR = 'COLOR_LIAR',
  TROLL_MATH = 'TROLL_MATH',
  NONE = 'NONE'
}

export interface GameConfig {
  id: GameType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface TauntResponse {
  message: string;
}