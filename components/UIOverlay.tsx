
import React from 'react';
import { GameState, HeroProfile } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  hero: HeroProfile;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, hero }) => {
  const progress = (gameState.distanceInLevel / gameState.levelLength) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none p-10 z-30">
      <div className="flex justify-between items-start">
        {/* Hero Banner */}
        <div className="flex gap-4 items-center bg-black/80 backdrop-blur-xl p-5 rounded-3xl border-2 border-white/20 shadow-2xl">
          <div 
            className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg"
            style={{ backgroundColor: hero.color }}
          >
            <span className="text-4xl">🦸</span>
          </div>
          <div>
            <h3 className="text-3xl font-hero text-white tracking-tight">{hero.alias}</h3>
            <p className="text-xs uppercase text-yellow-500 font-bold tracking-[0.2em]">POWER: {hero.powerName}</p>
          </div>
        </div>

        {/* Level Stats */}
        <div className="flex flex-col items-center">
           <div className="bg-slate-900 border-4 border-yellow-500 px-10 py-4 rounded-3xl shadow-2xl transform -skew-x-12">
              <p className="text-[10px] uppercase font-black tracking-widest text-center mb-1 text-white/50">SECTOR MISSION</p>
              <p className="text-6xl font-hero text-white text-center">LEVEL {gameState.level}</p>
           </div>
           
           {/* Level Progress Bar */}
           <div className="w-96 bg-slate-800/80 h-4 mt-6 rounded-full border-2 border-white/10 overflow-hidden backdrop-blur-md">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 relative"
                style={{ width: `${Math.min(100, progress)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
           </div>
           <p className="text-[10px] text-white/60 mt-2 font-bold tracking-[0.3em] uppercase">Target Distance: {Math.floor(gameState.levelLength)}m</p>
        </div>

        {/* Tactical Info */}
        <div className="text-right flex flex-col items-end gap-3">
          <div className="bg-red-600 px-6 py-3 rounded-2xl text-white font-black shadow-xl animate-pulse">
            INTERCEPTORS DETECTED
          </div>
          <div className="bg-slate-900/90 border-2 border-slate-700 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-500 font-bold mb-1">SCORE MULTIPLIER</p>
            <p className="text-2xl font-mono text-yellow-400">x{gameState.level}.0</p>
          </div>
        </div>
      </div>
      
      {/* Dynamic Damage Flash Overlay logic could go here if needed */}
    </div>
  );
};

export default UIOverlay;
