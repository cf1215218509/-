
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus } from '../../types';

interface TrollPachinkoProps {
  onGameOver: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const WIDTH = 320;
const HEIGHT = 480;
const BALL_RADIUS = 8;
const PIN_RADIUS = 5;
const GRAVITY = 0.28;
const FRICTION = 0.992;
const BOUNCE = 0.65;

interface Entity {
  x: number;
  y: number;
}

interface Ball extends Entity {
  vx: number;
  vy: number;
  active: boolean;
}

interface Pin extends Entity {}

interface Bucket extends Entity {
  w: number;
  h: number;
  score: number;
  color: string;
}

const TrollPachinko: React.FC<TrollPachinkoProps> = ({ onGameOver, status, setStatus }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ballsLeft, setBallsLeft] = useState(0);
  const [totalBalls, setTotalBalls] = useState(5);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  // Game state refs for the loop to avoid closure staleness
  const ballRef = useRef<Ball | null>(null);
  const pinsRef = useRef<Pin[]>([]);
  const bucketsRef = useRef<Bucket[]>([]);
  const frameRef = useRef<number>(0);
  const multiplierRef = useRef(1); // Use ref for logic in frame loop

  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  const initGame = useCallback(() => {
    const pins: Pin[] = [];
    const rows = 9;
    const startY = 120;
    const spacingX = 34;
    const spacingY = 38;

    for (let r = 0; r < rows; r++) {
      const pinsInRow = r % 2 === 0 ? 8 : 7;
      const rowWidth = (pinsInRow - 1) * spacingX;
      const offsetX = (WIDTH - 40 - rowWidth) / 2;
      for (let i = 0; i < pinsInRow; i++) {
        pins.push({ x: offsetX + i * spacingX, y: startY + r * spacingY });
      }
    }
    pinsRef.current = pins;

    const bucketW = (WIDTH - 40) / 5;
    bucketsRef.current = [
      { x: 0, y: HEIGHT - 40, w: bucketW, h: 40, score: 10, color: '#3b82f6' },
      { x: bucketW, y: HEIGHT - 40, w: bucketW, h: 40, score: 50, color: '#22c55e' },
      { x: bucketW * 2, y: HEIGHT - 40, w: bucketW, h: 40, score: 100, color: '#eab308' },
      { x: bucketW * 3, y: HEIGHT - 40, w: bucketW, h: 40, score: 20, color: '#a855f7' },
      { x: bucketW * 4, y: HEIGHT - 40, w: bucketW, h: 40, score: 10, color: '#3b82f6' },
    ];
  }, []);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setScore(0);
      setMultiplier(1);
      setIsConfiguring(true);
      ballRef.current = null;
      initGame();
    }
  }, [status, initGame]);

  const startGameWithBalls = (count: number) => {
    setTotalBalls(count);
    setBallsLeft(count);
    setIsConfiguring(false);
  };

  const launchBall = () => {
    if (ballsLeft <= 0 || ballRef.current?.active) return;
    
    const launchPower = (power / 100) * 14 + 6;
    ballRef.current = {
      x: WIDTH - 20,
      y: HEIGHT - 20,
      vx: -1.2, 
      vy: -launchPower,
      active: true
    };
    setBallsLeft(prev => prev - 1);
    setPower(0);
    setIsCharging(false);
  };

  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING || isConfiguring) return;

    const ball = ballRef.current;
    if (ball && ball.active) {
      ball.vy += GRAVITY;
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x < BALL_RADIUS) { ball.x = BALL_RADIUS; ball.vx *= -BOUNCE; }
      if (ball.x > WIDTH - BALL_RADIUS) { ball.x = WIDTH - BALL_RADIUS; ball.vx *= -BOUNCE; }
      if (ball.y < BALL_RADIUS) { ball.y = BALL_RADIUS; ball.vy *= -BOUNCE; }

      pinsRef.current.forEach(pin => {
        const dx = ball.x - pin.x;
        const dy = ball.y - pin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BALL_RADIUS + PIN_RADIUS) {
          const angle = Math.atan2(dy, dx);
          ball.x = pin.x + Math.cos(angle) * (BALL_RADIUS + PIN_RADIUS + 0.1);
          ball.y = pin.y + Math.sin(angle) * (BALL_RADIUS + PIN_RADIUS + 0.1);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          ball.vx = Math.cos(angle) * speed * BOUNCE;
          ball.vy = Math.sin(angle) * speed * BOUNCE;
        }
      });

      if (ball.y > HEIGHT - 35) {
        const bucket = bucketsRef.current.find(b => ball.x >= b.x && ball.x <= b.x + b.w);
        if (bucket) {
          const earned = bucket.score * multiplierRef.current;
          setScore(s => s + earned);
          
          // Multiplier Logic: Increase on high score, reset on low score
          if (bucket.score >= 50) {
            setMultiplier(m => m + 1);
          } else {
            setMultiplier(1);
          }

          ball.active = false;
          if (ballsLeft === 0) {
            setTimeout(() => {
              setStatus(GameStatus.GAME_OVER);
              onGameOver(score + earned);
            }, 600);
          }
        } else if (ball.y > HEIGHT + 30) {
          ball.active = false;
          setMultiplier(1); // Miss resets multiplier
          if (ballsLeft === 0) {
            setStatus(GameStatus.GAME_OVER);
            onGameOver(score);
          }
        }
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, WIDTH - 4, HEIGHT - 4);

    ctx.beginPath();
    ctx.moveTo(WIDTH - 40, HEIGHT);
    ctx.lineTo(WIDTH - 40, 100);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    pinsRef.current.forEach(pin => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, PIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    bucketsRef.current.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.score.toString(), b.x + b.w / 2, b.y + 25);
    });

    if (ball && ball.active) {
      ctx.fillStyle = '#00ff41';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff41';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    frameRef.current = requestAnimationFrame(update);
  }, [status, ballsLeft, score, isConfiguring, onGameOver, setStatus]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameRef.current);
  }, [update]);

  const handleStartCharge = () => {
    if (!isConfiguring && !ballRef.current?.active && ballsLeft > 0) setIsCharging(true);
  };

  useEffect(() => {
    let interval: number;
    if (isCharging) {
      interval = window.setInterval(() => {
        setPower(p => {
          if (p >= 100) return 100;
          return p + 3;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isCharging]);

  if (isConfiguring) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-orange-500 mb-2">选择实验规模</h3>
        <p className="text-sm text-gray-400 mb-4 text-center italic">达文西说：珠子越多，你丢人的机会就越多。</p>
        <div className="mb-6 p-3 bg-gray-800 rounded border border-gray-700 text-[10px] text-gray-300">
           <p className="font-bold text-neon-green mb-1">连击规则说明：</p>
           <p>• 连续落入 <span className="text-white">50/100分</span> 桶：倍率 +1</p>
           <p>• 落入 <span className="text-white">10/20分</span> 桶或未进桶：倍率重置</p>
        </div>
        <div className="grid grid-cols-1 gap-4 w-full max-w-[200px]">
          {[3, 5, 10, 20].map(count => (
            <button
              key={count}
              onClick={() => startGameWithBalls(count)}
              className="py-4 bg-gray-800 border border-gray-600 rounded-xl text-white font-bold hover:bg-orange-600 hover:border-orange-400 transition-all flex justify-between px-6 items-center group"
            >
              <span>{count} 颗弹珠</span>
              <i className="fas fa-chevron-right opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-full h-full pb-4">
      <div className="text-center py-2 shrink-0">
         <p className="text-orange-500 font-bold text-sm">反人类设定：逆向力学加载</p>
         <p className="text-[10px] text-gray-500 mt-1">达成连击（入高分桶）可获得更高分数倍率！</p>
      </div>

      <div className="flex-1 flex gap-4 items-center justify-center w-full min-h-0 relative">
        <div className="relative border-4 border-gray-700 bg-gray-900 rounded-lg overflow-hidden shadow-2xl transform scale-[0.85] origin-center">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="bg-transparent" />
          
          {/* Dashboard overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
             <div className="bg-black/70 px-3 py-1.5 rounded border border-gray-700 backdrop-blur-sm">
                <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Remaining</p>
                <p className="text-orange-500 font-black text-lg leading-tight">{ballsLeft}</p>
             </div>
             <div className="bg-black/70 px-3 py-1.5 rounded border border-gray-700 backdrop-blur-sm">
                <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Score</p>
                <p className="text-neon-green font-black text-lg leading-tight">{score}</p>
             </div>
             {/* Multiplier Display */}
             {multiplier > 1 && (
               <div className="bg-neon-purple/80 px-3 py-1.5 rounded border border-white/20 backdrop-blur-sm animate-bounce shadow-[0_0_10px_rgba(176,38,255,0.5)]">
                  <p className="text-[9px] text-white uppercase tracking-tighter font-bold">Combo</p>
                  <p className="text-white font-black text-lg leading-tight">{multiplier}x</p>
               </div>
             )}
          </div>
        </div>

        {/* Power Bar */}
        <div className="flex flex-col items-center h-64 w-10">
           <div className="flex-1 w-full bg-gray-800 rounded-full overflow-hidden flex flex-col-reverse p-1.5 border border-gray-700 shadow-inner">
              <div 
                className="w-full bg-gradient-to-t from-orange-600 via-yellow-400 to-white rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                style={{ height: `${power}%` }}
              />
           </div>
           <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase rotate-90 origin-center w-12">POWER</p>
        </div>
      </div>

      <div className="mt-4 shrink-0 px-4 w-full max-w-[240px]">
        <button
          onPointerDown={handleStartCharge}
          onPointerUp={launchBall}
          disabled={!!ballRef.current?.active || ballsLeft === 0}
          className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
            ${(ballRef.current?.active || ballsLeft === 0) 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed grayscale' 
              : 'bg-gradient-to-br from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 shadow-orange-900/40'}`}
        >
          <i className={`fas ${isCharging ? 'fa-spinner fa-spin' : 'fa-meteor'}`}></i>
          {isCharging ? '发射中...' : '投珠'}
        </button>
      </div>
    </div>
  );
};

export default TrollPachinko;
