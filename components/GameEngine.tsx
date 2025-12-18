
import React, { useEffect, useRef, useState } from 'react';
import { HeroProfile, Platform, Particle, Projectile, GameState } from '../types';

interface GameEngineProps {
  hero: HeroProfile;
  level: number;
  levelLength: number;
  onGameOver: (score: number) => void;
  onLevelComplete: () => void;
  updateProgress: (dist: number) => void;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const GRAVITY = 0.6; 
const JUMP_FORCE = -15; 
const DASH_SPEED = 10; 
const BASE_SCROLL_SPEED = 3; 

const GameEngine: React.FC<GameEngineProps> = ({ hero, level, levelLength, onGameOver, onLevelComplete, updateProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [showHint, setShowHint] = useState(true);
  
  const stateRef = useRef({
    scrollSpeed: BASE_SCROLL_SPEED + (level * 0.25),
    distanceTravelled: 0,
    frameCount: 0,
    isLevelComplete: false,
    levelLength: levelLength,
    isInitialized: false,
  });

  const playerRef = useRef({
    x: 250,
    y: 300,
    width: 44,
    height: 64,
    vx: 0,
    vy: 0,
    jumpCount: 0, // Track jumps for double jump
    jumpReleased: true, // Force discrete presses
    dead: false,
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const platforms = useRef<Platform[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const particles = useRef<Particle[]>([]);

  const createExplosion = (x: number, y: number, color: string, count: number, velocityMult = 1) => {
    for(let i=0; i<count; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 15 * velocityMult,
        vy: (Math.random() - 0.5) * 15 * velocityMult,
        life: 1.0,
        color,
        size: Math.random() * 8 + 2
      });
    }
  };

  const spawnPlatform = (lastX: number): Platform => {
    const diff = Math.min((level - 1) / 50, 2); 
    const spacingMult = level < 5 ? 0.8 : 1 + (diff * 0.2);
    const spacing = (120 + Math.random() * 200) * spacingMult;
    const width = (250 + Math.random() * 400) / (1 + (diff * 0.1));
    const y = 250 + Math.random() * 300;
    
    const types: ('static' | 'moving' | 'vanishing')[] = ['static', 'static', 'moving', 'vanishing'];
    const type = level < 4 ? 'static' : types[Math.floor(Math.random() * types.length)];

    return { 
      x: lastX + spacing, 
      y, 
      width, 
      height: 40, 
      type, 
      originY: y,
      phase: Math.random() * Math.PI * 2
    };
  };

  const spawnProjectile = () => {
    const speed = 5 + (level * 0.4);
    projectiles.current.push({
      x: CANVAS_WIDTH + 100,
      y: 100 + Math.random() * 500,
      vx: -speed,
      vy: (Math.random() - 0.5) * 3,
      size: 8 + Math.random() * 12,
      color: '#ef4444'
    });
  };

  const initLevel = () => {
    stateRef.current.distanceTravelled = 0;
    stateRef.current.scrollSpeed = BASE_SCROLL_SPEED + (level * 0.25);
    stateRef.current.isLevelComplete = false;
    stateRef.current.isInitialized = true;
    
    playerRef.current.dead = false;
    playerRef.current.x = 250;
    playerRef.current.y = 300;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.jumpCount = 0;

    platforms.current = [{ x: 0, y: 550, width: 1200, height: 150, type: 'static' }];
    projectiles.current = [];
    particles.current = [];
    
    let currentX = 1200;
    while(currentX < 2600) {
      const p = spawnPlatform(currentX);
      platforms.current.push(p);
      currentX = p.x + p.width;
    }
  };

  const update = () => {
    const p = playerRef.current;
    const s = stateRef.current;
    if (p.dead || s.isLevelComplete) {
      draw();
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    s.frameCount++;

    // 1. Spawning Mechanics
    const spawnRate = Math.max(15, 150 - (level * 5));
    if (s.frameCount % spawnRate === 0 && s.distanceTravelled < s.levelLength - 800) {
      spawnProjectile();
    }

    // 2. World Movement
    const moveAmount = s.scrollSpeed;
    s.distanceTravelled += moveAmount;
    
    if (s.frameCount % 10 === 0) updateProgress(s.distanceTravelled);

    // 3. Movement Input
    if (keys.current['ArrowRight'] || keys.current['d']) {
      p.vx = DASH_SPEED;
      if (showHint) setShowHint(false);
    } else if (keys.current['ArrowLeft'] || keys.current['a']) {
      p.vx = -DASH_SPEED / 1.5;
    } else {
      p.vx *= 0.85;
    }

    // Jump Logic (Double Jump)
    const jumpPressed = keys.current['ArrowUp'] || keys.current['w'] || keys.current[' '];
    
    if (jumpPressed) {
      if (p.jumpReleased && p.jumpCount < 2) {
        p.vy = JUMP_FORCE;
        p.jumpCount++;
        p.jumpReleased = false; // Must release key to jump again
        
        // Visual feedback for jumps
        if (p.jumpCount === 1) {
          createExplosion(p.x + p.width / 2, p.y + p.height, hero.color, 10);
        } else if (p.jumpCount === 2) {
          // Bigger effect for double jump
          createExplosion(p.x + p.width / 2, p.y + p.height, '#ffffff', 15, 1.5);
          createExplosion(p.x + p.width / 2, p.y + p.height, hero.color, 10, 0.8);
        }
      }
    } else {
      p.jumpReleased = true;
    }

    p.vy += GRAVITY;
    p.x += (p.vx - moveAmount);
    p.y += p.vy;

    // 4. Object Logic
    platforms.current.forEach(plat => {
      plat.x -= moveAmount;
      if (plat.type === 'moving') {
        plat.y = plat.originY! + Math.sin(s.frameCount * 0.04 + plat.phase!) * 80;
      }
    });

    projectiles.current.forEach(proj => {
      proj.x += proj.vx - moveAmount;
      proj.y += proj.vy;
      
      const dx = (p.x + p.width/2) - proj.x;
      const dy = (p.y + p.height/2) - proj.y;
      if (Math.sqrt(dx*dx + dy*dy) < proj.size + 15) {
        handleDeath();
      }
    });

    // 5. Collisions
    let isGrounded = false;
    platforms.current.forEach(plat => {
      const isVanishingVisible = plat.type !== 'vanishing' || Math.sin(s.frameCount * 0.1 + plat.phase!) > -0.2;
      
      if (isVanishingVisible &&
          p.x + p.width > plat.x && p.x < plat.x + plat.width &&
          p.y + p.height > plat.y && p.y + p.height < plat.y + plat.height + 25 &&
          p.vy >= 0) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.jumpCount = 0; // Reset jump count on landing
        isGrounded = true;
      }
    });

    // 6. Death & Win Conditions
    if (p.x < -10 || p.x > CANVAS_WIDTH + 10 || p.y > CANVAS_HEIGHT + 50) {
      handleDeath();
    }

    if (s.distanceTravelled >= s.levelLength && !s.isLevelComplete) {
      s.isLevelComplete = true;
      setTimeout(onLevelComplete, 1800);
    }

    // 7. Housekeeping
    platforms.current = platforms.current.filter(plat => plat.x + plat.width > -200);
    if (platforms.current.length < 8 && s.distanceTravelled < s.levelLength - 1000) {
      const last = platforms.current[platforms.current.length - 1];
      platforms.current.push(spawnPlatform(last.x + last.width));
    }
    projectiles.current = projectiles.current.filter(proj => proj.x + proj.size > -100);

    particles.current.forEach(part => {
      part.x += part.vx - moveAmount;
      part.y += part.vy;
      part.life -= 0.025;
    });
    particles.current = particles.current.filter(part => part.life > 0);

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const handleDeath = () => {
    if (playerRef.current.dead) return;
    playerRef.current.dead = true;
    createExplosion(playerRef.current.x, playerRef.current.y, '#ff0000', 25);
    createExplosion(playerRef.current.x, playerRef.current.y, hero.color, 15);
    setTimeout(() => onGameOver(Math.floor(stateRef.current.distanceTravelled / 10)), 1200);
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const p = playerRef.current;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    const hue = (level * 25) % 360;
    ctx.fillStyle = `hsl(${hue}, 40%, 6%)`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Star Field
    ctx.fillStyle = 'white';
    for(let i=0; i<40; i++) {
        const x = (i * 187 - (s.distanceTravelled * 0.2) % 2400);
        const y = (i * 321) % CANVAS_HEIGHT;
        ctx.globalAlpha = 0.1 + (Math.sin(s.frameCount * 0.01 + i) * 0.1);
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Platforms
    platforms.current.forEach(plat => {
      const isVanishingVisible = plat.type !== 'vanishing' || Math.sin(s.frameCount * 0.1 + plat.phase!) > -0.2;
      ctx.globalAlpha = isVanishingVisible ? 1.0 : 0.15;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(plat.x + 6, plat.y + 6, plat.width, plat.height);

      let color = '#334155';
      if (plat.type === 'moving') color = '#2563eb';
      if (plat.type === 'vanishing') color = '#b91c1c';
      
      const pGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
      pGrad.addColorStop(0, color);
      pGrad.addColorStop(1, '#020617');
      ctx.fillStyle = pGrad;
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      ctx.globalAlpha = 1.0;
    });

    // Extraction Point
    if (s.distanceTravelled >= s.levelLength - 1800) {
      const goalX = (s.levelLength - s.distanceTravelled) + 1000;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(goalX, 0, 500, CANVAS_HEIGHT);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 15;
      ctx.setLineDash([20, 10]);
      ctx.strokeRect(goalX, 0, 500, CANVAS_HEIGHT);
      ctx.setLineDash([]);
      
      ctx.font = 'bold 100px Bangers';
      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'center';
      ctx.fillText('EXTRACT', goalX + 250, CANVAS_HEIGHT / 2);
    }

    // Projectiles
    projectiles.current.forEach(proj => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Particles
    particles.current.forEach(part => {
      ctx.globalAlpha = part.life;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Player
    if (!p.dead) {
      ctx.shadowBlur = 25;
      ctx.shadowColor = hero.color;
      ctx.fillStyle = hero.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
      
      // Mask/Eyes
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(p.x, p.y + 12, p.width, 14);
      ctx.fillStyle = 'white';
      ctx.fillRect(p.x + 12, p.y + 16, 6, 6);
      ctx.fillRect(p.x + 26, p.y + 16, 6, 6);

      // Cape
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      const capeX = p.x - 12 - (p.vx * 0.5);
      ctx.moveTo(p.x + p.width/2, p.y + 8);
      ctx.lineTo(capeX, p.y + p.height - 4);
      ctx.lineTo(p.x + p.width/2, p.y + p.height - 4);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Double Jump Indicator (small particles trail if airborn)
      if (p.jumpCount > 0 && !p.dead) {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p.x + p.width/2, p.y + p.height + 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    // Win Overlay
    if (s.isLevelComplete) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.font = 'bold 140px Bangers';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('CLEARED', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    }

    // Chase Wall Warning
    if (p.x < 150) {
      const warningAlpha = (150 - p.x) / 150;
      ctx.fillStyle = `rgba(220, 38, 38, ${warningAlpha * 0.4})`;
      ctx.fillRect(0, 0, 100, CANVAS_HEIGHT);
      if (s.frameCount % 30 < 15) {
        ctx.font = 'bold 30px Oswald';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText('! DANGER !', 20, CANVAS_HEIGHT/2);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    initLevel();
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-black relative">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        className="max-w-full max-h-full border-b-8 border-slate-900 shadow-2xl"
      />
      {showHint && !playerRef.current.dead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="text-center animate-in fade-in zoom-in duration-500">
             <h3 className="text-8xl font-hero text-yellow-400 drop-shadow-lg mb-4">MISSION START</h3>
             <div className="flex gap-12 justify-center items-center">
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl mb-2">D</div>
                   <p className="font-bold uppercase tracking-widest text-white">Hold to Run</p>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-24 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl mb-2">SPACE</div>
                   <p className="font-bold uppercase tracking-widest text-white">Double Jump!</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
