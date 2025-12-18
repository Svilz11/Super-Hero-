
import React, { useState } from 'react';
import { HeroProfile } from '../types';

interface HeroCreatorProps {
  hero: HeroProfile | null;
  onGenerate: (theme?: string) => void;
  loading: boolean;
  onStart: () => void;
}

const HeroCreator: React.FC<HeroCreatorProps> = ({ hero, onGenerate, loading, onStart }) => {
  const [theme, setTheme] = useState('');

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border-4 border-slate-700 rounded-3xl p-8 shadow-2xl transition-all">
      {!hero ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-8 text-slate-300">Summon your champion from the multi-verse...</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <input 
              type="text" 
              placeholder="Enter theme (e.g. Cyberpunk, Elemental, Gothic)..." 
              className="bg-slate-900 border-2 border-slate-600 rounded-xl px-6 py-4 text-white w-full md:w-96 focus:border-yellow-500 outline-none"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
            <button 
              onClick={() => onGenerate(theme)}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-600 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
            >
              {loading ? 'SUMMONING...' : 'GENERATE HERO'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10 animate-in fade-in zoom-in duration-500">
          <div className="relative group">
            <div 
              className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-inner border-4 border-white/10"
              style={{ backgroundColor: hero.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="z-10">
                <div className="text-8xl mb-4 drop-shadow-lg">🦸</div>
                <h3 className="text-5xl font-hero text-white mb-2 drop-shadow-md">{hero.alias}</h3>
                <p className="text-xl font-bold uppercase tracking-widest opacity-80">{hero.name}</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
               {Object.entries(hero.stats).map(([key, val]) => (
                 <div key={key} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                   <div className="flex justify-between items-center mb-1">
                     <span className="capitalize text-sm opacity-60">{key}</span>
                     <span className="font-bold text-yellow-500">{val}</span>
                   </div>
                   <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                     <div 
                       className="bg-yellow-500 h-full transition-all duration-1000" 
                       style={{ width: `${val}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold mb-4 border border-yellow-500/30">
                AI GENERATED ORIGIN
              </div>
              <h4 className="text-3xl font-bold mb-4">{hero.powerName}</h4>
              <p className="text-slate-300 leading-relaxed italic mb-6">"{hero.backstory}"</p>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                 <p className="text-sm uppercase text-slate-500 font-bold mb-2">Primary Power</p>
                 <p className="text-slate-200">{hero.powerDescription}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={onStart}
                className="flex-1 bg-green-500 hover:bg-green-400 text-slate-900 font-black px-8 py-5 rounded-2xl text-2xl transition-all hover:scale-105 shadow-[0_10px_0_rgb(22,163,74)] active:translate-y-1 active:shadow-none"
              >
                START MISSION
              </button>
              <button 
                onClick={() => onGenerate()}
                disabled={loading}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-5 rounded-2xl transition-all"
              >
                {loading ? '...' : 'RE-ROLL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCreator;
