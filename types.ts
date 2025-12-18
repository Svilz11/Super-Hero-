
export interface HeroStats {
  strength: number;
  agility: number;
  intelligence: number;
  power: number;
}

export interface HeroProfile {
  name: string;
  alias: string;
  backstory: string;
  powerName: string;
  powerDescription: string;
  color: string;
  stats: HeroStats;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'static' | 'moving' | 'vanishing';
  hasHazard?: boolean;
  hazardX?: number;
  originY?: number;
  phase?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  distanceInLevel: number;
  levelLength: number;
  gameOver: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
