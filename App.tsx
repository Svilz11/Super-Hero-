
import React, { useState, useCallback } from 'react';
import { generateHero } from './services/geminiService';
import { HeroProfile, GameState } from './types';
import GameEngine from './components/GameEngine';
import HeroCreator from './components/HeroCreator';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [hero, setHero] = useState<HeroProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    isPlaying: false,
    distanceInLevel: 0,
    levelLength: 2500, // Reduced from 4000 for faster Level 1
    gameOver: false,
  });

  const handleGenerateHero = async (theme?: string) => {
    setLoading(true);
    try {
      const newHero = await generateHero(theme);
      setHero(newHero);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      isPlaying: true,
      distanceInLevel: 0,
      levelLength: 2500,
      gameOver: false,
    });
  };

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      distanceInLevel: 0,
      levelLength: 2500 + (prev.level * 600),
      isPlaying: true
    }));
  }, []);

  const stopGame = useCallback((finalScore: number) => {
    setGameState(prev => ({
      ...prev,
      score: finalScore,
      isPlaying: false,
      gameOver: true
    }));
  }, []);

  const updateDistance = useCallback((dist: number) => {
    setGameState(prev => {
        if (Math.abs(prev.distanceInLevel - dist) < 50) return prev;
        return { ...prev, distanceInLevel: dist };
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white overflow-hidden select-none">
      {!gameState.isPlaying && !gameState.gameOver && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-7xl font-hero text-yellow-400 mb-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transform -rotate-2">
            SUPERHERO PRIME
          </h1>
          <div className="max-w-4xl w-full">
            <HeroCreator 
              hero={hero} 
              onGenerate={handleGenerateHero} 
              loading={loading} 
              onStart={startGame}
            />
          </div>
        </div>
      )}

      {gameState.isPlaying && hero && (
        <GameEngine 
          hero={hero} 
          level={gameState.level}
          levelLength={gameState.levelLength}
          onGameOver={stopGame}
          onLevelComplete={nextLevel}
          updateProgress={updateDistance}
        />
      )}

      {gameState.gameOver && (
        <div className="relative z-50 flex flex-col items-center justify-center min-h-screen bg-black/95">
          <div className="text-center p-12 border-4 border-red-600 rounded-[40px] bg-slate-900 shadow-[0_0_100px_rgba(220,38,38,0.3)]">
            <h2 className="text-9xl font-hero text-red-600 mb-6 tracking-tighter italic">MISSION FAILED</h2>
            <div className="flex justify-center gap-12 mb-12">
                <div className="text-center">
                    <p className="text-slate-500 uppercase font-black text-sm tracking-widest">Sector reached</p>
                    <p className="text-6xl font-hero text-white">{gameState.level}</p>
                </div>
                <div className="text-center">
                    <p className="text-slate-500 uppercase font-black text-sm tracking-widest">Final score</p>
                    <p className="text-6xl font-hero text-yellow-500">{gameState.score}</p>
                </div>
            </div>
            <div className="flex gap-6 justify-center">
                <button 
                onClick={startGame}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-12 py-6 rounded-2xl font-black text-3xl transition-all hover:scale-110 shadow-[0_12px_0_rgb(161,98,7)] active:translate-y-2 active:shadow-none"
                >
                TRY AGAIN
                </button>
                <button 
                onClick={() => setGameState(p => ({ ...p, gameOver: false, isPlaying: false }))}
                className="bg-slate-700 hover:bg-slate-600 text-white px-10 py-6 rounded-2xl font-bold text-xl transition-all"
                >
                RETIRE HERO
                </button>
            </div>
          </div>
        </div>
      )}

      {gameState.isPlaying && <UIOverlay gameState={gameState} hero={hero!} />}
    </div>
  );
};

export default App;
