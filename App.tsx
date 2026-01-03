
import React, { useState, useEffect, useMemo, useRef } from 'react';
import StarMap from './components/StarMap';
import TechTree from './components/TechTree';
import { Resources, MapConfig, StarSystem, Sector, PlayerID, BuildingType } from './types';
import { INITIAL_RESOURCES, PLAYER_COLORS, BUILDING_STATS, MAX_RESOURCE_CAP, EMPTY_RESOURCES } from './constants';
import { generateSectors, generateStars } from './services/mapGenerator';
import { techData } from './techTree';

type GameState = 'setup' | 'playing' | 'techtree';

interface SaveSlot {
  name: string;
  date: string;
  data: any;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerID>('Player 1');
  const [saveName, setSaveName] = useState<string>('Operation Nebula');
  const [localSaves, setLocalSaves] = useState<SaveSlot[]>([]);
  const [day, setDay] = useState(1);
  const [playerResources, setPlayerResources] = useState<Record<PlayerID, Resources>>({
    'Player 1': { ...INITIAL_RESOURCES },
    'Player 2': { ...INITIAL_RESOURCES },
    'Player 3': { ...INITIAL_RESOURCES },
    'Player 4': { ...INITIAL_RESOURCES },
    'None': { ...EMPTY_RESOURCES }
  });

  // Track owned technologies for each player
  const [playerTechs, setPlayerTechs] = useState<Record<PlayerID, string[]>>(() => {
    const initialTechIds = techData.technologies
      .filter(t => t.time === 'Initial')
      .map(t => t.id);
    return {
      'Player 1': [...initialTechIds],
      'Player 2': [...initialTechIds],
      'Player 3': [...initialTechIds],
      'Player 4': [...initialTechIds],
      'None': []
    };
  });
  
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    commonCount: 8, neutronCount: 2, blackHoleCount: 1,
    dustDensity: 0.35, minStarDistance: 12,
    dustRangeMin: 2, dustRangeMax: 6, dustProbFactor: 3.0,
    seed: Math.random().toString(36).substring(2, 10),
  });

  const [stars, setStars] = useState<StarSystem[]>([]);
  const sectors = useMemo(() => generateSectors(), []);
  const [selectedStarData, setSelectedStarData] = useState<{ starId: string; x: number; y: number } | null>(null);
  
  const selectedStar = stars.find(s => s.id === selectedStarData?.starId);
  const currentRes = playerResources[currentPlayer];

  // Modified displayedRes to return null if no star is selected, signaling HUD to show '-'
  const displayedRes = useMemo(() => {
    if (!selectedStar) return null;
    return playerResources[selectedStar.owner];
  }, [selectedStar, playerResources]);

  const handleSetOwner = (owner: PlayerID) => {
    if (!selectedStar) return;
    setStars(prev => prev.map(s => s.id === selectedStar.id ? { ...s, owner } : s));
  };

  const handleConstruct = (type: BuildingType, count: number) => {
    if (!selectedStar) return;
    const stat = BUILDING_STATS[type];
    const multiplier = (selectedStar.type === 'psr' || selectedStar.type === 'str' || selectedStar.type === 'STR') ? 2 : 1;
    if (stat.reqEarth && selectedStar.earthLikeCount < stat.reqEarth) {
      alert(`Insufficient Conditions: At least ${stat.reqEarth} Earth-like planets (E≥1) required.`);
      return;
    }
    const currentCount = selectedStar.buildings[type];
    const limit = 100000000;
    if (currentCount + count > limit) {
      alert(`Limit Reached: Max 100M units per building type.`);
      return;
    }
    const totalCosts: Partial<Record<keyof Resources, number>> = {};
    let canAfford = true;
    for (const [res, amt] of Object.entries(stat.cost)) {
      const required = (amt as number) * count * multiplier;
      totalCosts[res as keyof Resources] = required;
      if (currentRes[res as keyof Resources] < required) canAfford = false;
    }
    if (!canAfford) { alert("Insufficient Resources"); return; }
    setPlayerResources(prev => {
      const next = { ...prev };
      const pr = { ...next[currentPlayer] };
      for (const [res, amt] of Object.entries(totalCosts)) { (pr as any)[res] -= amt; }
      next[currentPlayer] = pr;
      return next;
    });
    setStars(prev => prev.map(s => s.id === selectedStar.id ? { ...s, buildings: { ...s.buildings, [type]: s.buildings[type] + count } } : s));
  };

  const handleDemolish = (type: BuildingType, count: number) => {
    if (!selectedStar || selectedStar.buildings[type] < count) return;
    const stat = BUILDING_STATS[type];
    const multiplier = (selectedStar.type === 'psr' || selectedStar.type === 'str' || selectedStar.type === 'STR') ? 2 : 1;
    setPlayerResources(prev => {
      const next = { ...prev };
      const pr = { ...next[currentPlayer] };
      for (const [res, amt] of Object.entries(stat.cost)) { (pr as any)[res] += Math.floor((amt as number) * count * multiplier * 0.5); }
      next[currentPlayer] = pr;
      return next;
    });
    setStars(prev => prev.map(s => s.id === selectedStar.id ? { ...s, buildings: { ...s.buildings, [type]: s.buildings[type] - count } } : s));
  };

  const handleSynthesize = (target: keyof Resources, costAmt: number, yieldAmt: number) => {
    if (currentRes.iron < costAmt) { alert("Insufficient Iron"); return; }
    setPlayerResources(prev => {
      const next = { ...prev };
      const pr = { ...next[currentPlayer] };
      pr.iron -= costAmt;
      (pr as any)[target] += yieldAmt;
      return { ...next, [currentPlayer]: pr };
    });
  };

  const nextCycle = () => {
    setDay(d => d + 1);
    setStars(prevStars => {
      const nextStars = prevStars.map(s => ({ ...s }));
      const nextResources = { ...playerResources };
      
      nextStars.forEach(star => {
        if (star.owner === 'None') return;
        const res = nextResources[star.owner];
        
        (Object.keys(star.buildings) as BuildingType[]).forEach(bType => {
          const count = Number(star.buildings[bType]);
          if (count <= 0) return;
          
          const stat = BUILDING_STATS[bType];
          let canProduce = true;
          
          const consumption = stat.consumption as Record<string, number>;
          for (const [cRes, cAmt] of Object.entries(consumption)) {
            const current = Number((res as any)[cRes]);
            if (current < cAmt * count) {
              canProduce = false;
              break;
            }
          }
          
          if (canProduce) {
            for (const [cRes, cAmt] of Object.entries(consumption)) {
              (res as any)[cRes] -= Number(cAmt) * count;
            }
            
            const production = stat.production as Record<string, number>;
            for (const [pRes, pAmt] of Object.entries(production)) {
              const producedAmount = Number(pAmt) * count;
              if (pRes === 'iron') {
                const harvest = Math.min(Number(star.ironReserve), producedAmount);
                res.iron += harvest;
                star.ironReserve -= harvest;
              } else if (pRes === 'hydrogen') {
                const harvest = Math.min(Number(star.hydrogenReserve), producedAmount);
                res.hydrogen += harvest;
                star.hydrogenReserve -= harvest;
              } else if (pRes === 'starGold') {
                const harvest = Math.min(Number(star.starGoldReserve), producedAmount);
                res.starGold += harvest;
                star.starGoldReserve -= harvest;
              } else {
                (res as any)[pRes] += producedAmount;
              }
            }
          }
        });
      });
      setPlayerResources(nextResources);
      return nextStars;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('nebula_local_saves_v2');
    if (saved) setLocalSaves(JSON.parse(saved));
  }, []);

  const persist = (s: SaveSlot[]) => {
    setLocalSaves(s);
    localStorage.setItem('nebula_local_saves_v2', JSON.stringify(s));
  };

  const startGame = () => {
    const newStars = generateStars(mapConfig, sectors);
    setStars(newStars);
    setSelectedStarData(null);
    setGameState('playing');
  };

  const saveToLocal = () => {
    const slot: SaveSlot = {
      name: saveName || `Expedition_${Date.now()}`,
      date: new Date().toISOString(),
      data: { stars, playerResources, playerTechs, mapConfig, day, currentPlayer }
    };
    persist([slot, ...localSaves.filter(s => s.name !== slot.name)].slice(0, 10));
    alert("Archives Updated");
  };

  const loadSlot = (slot: SaveSlot) => {
    setStars(slot.data.stars);
    setPlayerResources(slot.data.playerResources);
    if (slot.data.playerTechs) setPlayerTechs(slot.data.playerTechs);
    setMapConfig(slot.data.mapConfig);
    setDay(slot.data.day);
    setCurrentPlayer(slot.data.currentPlayer);
    setSaveName(slot.name);
    setGameState('playing');
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col font-sans select-none overflow-hidden text-slate-200">
      {gameState === 'setup' ? (
        <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-8 select-none relative overflow-hidden text-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent"></div>
          <div className="z-10 text-center animate-in fade-in duration-1000">
            <h1 className="text-7xl font-black tracking-[0.2em] text-indigo-400 drop-shadow-2xl">NEBULA</h1>
            <p className="text-slate-500 font-mono tracking-widest text-sm mt-3 uppercase italic">Protocol Version 2.0_Construct</p>
          </div>

          <div className="z-10 w-full max-w-6xl bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-8 ring-1 ring-slate-700/30">
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-3">Stellar Density</h2>
              {['commonCount', 'neutronCount', 'blackHoleCount'].map(k => (
                <div key={k} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-mono">{k.replace('Count', '')}</span>
                  <input type="number" value={(mapConfig as any)[k]} onChange={e => setMapConfig({...mapConfig, [k]: parseInt(e.target.value) || 0})} className="w-14 bg-transparent text-indigo-400 font-mono text-center text-sm outline-none" />
                </div>
              ))}
              <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-mono">Min Distance</span>
                <input type="number" value={mapConfig.minStarDistance} onChange={e => setMapConfig({...mapConfig, minStarDistance: parseInt(e.target.value) || 0})} className="w-14 bg-transparent text-indigo-400 font-mono text-center text-sm outline-none" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-3">Field Config</h2>
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-500 block uppercase font-mono">Map Seed</span>
                <div className="flex space-x-2">
                  <input value={mapConfig.seed} onChange={e => setMapConfig({...mapConfig, seed: e.target.value})} className="flex-1 bg-slate-900 px-3 py-1.5 rounded text-sm font-mono outline-none border border-slate-800" />
                  <button onClick={() => setMapConfig({...mapConfig, seed: Math.random().toString(36).substring(7)})} className="text-sm">🎲</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Dust Density</span>
                  <input type="number" step="0.01" value={mapConfig.dustDensity} onChange={e => setMapConfig({...mapConfig, dustDensity: parseFloat(e.target.value) || 0})} className="w-full bg-transparent text-indigo-400 font-mono text-sm outline-none" />
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Prob Factor</span>
                  <input type="number" step="0.1" value={mapConfig.dustProbFactor} onChange={e => setMapConfig({...mapConfig, dustProbFactor: parseFloat(e.target.value) || 0})} className="w-full bg-transparent text-indigo-400 font-mono text-sm outline-none" />
                </div>
              </div>
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Dust Ring Range</span>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-[10px] text-slate-600">MIN</span>
                    <input type="number" value={mapConfig.dustRangeMin} onChange={e => setMapConfig({...mapConfig, dustRangeMin: parseInt(e.target.value) || 0})} className="flex-1 bg-slate-900 px-2 py-1 rounded text-xs font-mono border border-slate-800 text-indigo-400" />
                  </div>
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-[10px] text-slate-600">MAX</span>
                    <input type="number" value={mapConfig.dustRangeMax} onChange={e => setMapConfig({...mapConfig, dustRangeMax: parseInt(e.target.value) || 0})} className="flex-1 bg-slate-900 px-2 py-1 rounded text-xs font-mono border border-slate-800 text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-3">Expedition Archive</h2>
              <input value={saveName} onChange={e => setSaveName(e.target.value)} className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-white placeholder-slate-700 outline-none" placeholder="Expedition Title..." />
              <button onClick={startGame} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95 uppercase tracking-widest">Deploy Command</button>
            </div>
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-3">Local Memory</h2>
              <div className="h-[220px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {localSaves.map((s, i) => (
                  <div key={i} onClick={() => loadSlot(s)} className="bg-slate-950/40 hover:bg-slate-800/60 p-3 rounded-xl border border-slate-800 cursor-pointer transition-all flex justify-between items-center group">
                    <div className="flex flex-col"><span className="text-xs font-bold truncate max-w-[120px]">{s.name}</span><span className="text-[10px] text-slate-500 font-mono">{new Date(s.date).toLocaleDateString()}</span></div>
                    <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 uppercase font-black">Link</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {gameState === 'techtree' && <TechTree onClose={() => setGameState('playing')} currentPlayer={currentPlayer} onPlayerChange={setCurrentPlayer} playerTechs={playerTechs} />}

          {/* HUD Header */}
          <div className="z-20 h-24 bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800 flex items-center justify-between px-10 shadow-2xl shrink-0">
            <div className="flex items-center space-x-12">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-indigo-400 leading-none">NEBULA</h1>
                <p className="text-xs text-slate-500 font-mono tracking-widest mt-1.5 uppercase">Day {day.toString().padStart(4, '0')}</p>
              </div>
              
              <div className="flex space-x-6 items-center bg-slate-950/60 px-5 py-3.5 rounded-2xl border border-slate-800/50">
                {/* Displayed Star Name Section */}
                <div className="flex flex-col items-start pr-4 border-r border-slate-800/50">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Target</span>
                  <span className="text-xs font-black text-indigo-400 font-mono uppercase truncate max-w-[120px]">
                    {selectedStar ? selectedStar.label : 'None'}
                  </span>
                </div>

                {/* Resource HUD with '-' functionality when no target is selected */}
                {[
                  { label: 'Fe', key: 'iron', color: 'text-amber-500' },
                  { label: 'Na', key: 'nano', color: 'text-emerald-500' },
                  { label: '⚡', key: 'energy', color: 'text-cyan-400' },
                  { label: 'H2', key: 'hydrogen', color: 'text-blue-400' },
                  { label: 'SG', key: 'starGold', color: 'text-yellow-400' },
                  { label: 'C', key: 'carbyne', color: 'text-indigo-400' },
                  { label: 'Nu', key: 'denseNeutron', color: 'text-purple-400' },
                  { label: 'Si', key: 'strongInteraction', color: 'text-red-400' },
                ].map(r => {
                  const val = displayedRes ? (displayedRes as any)[r.key] : null;
                  const displayVal = val === null ? '-' : (val >= 1e9 ? `${(val/1e9).toFixed(1)}B` : val >= 1e6 ? `${(val/1e6).toFixed(1)}M` : Math.floor(val));
                  
                  return (
                    <div key={r.label} className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{r.label}</span>
                      <span className={`text-sm font-mono font-black ${r.color} ${val !== null && val > MAX_RESOURCE_CAP ? 'animate-pulse text-red-600' : ''}`}>
                        {displayVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <button onClick={() => setGameState('techtree')} className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Technology</button>
              <button onClick={nextCycle} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Next Cycle</button>
              <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-slate-800">
                {(['Player 1', 'Player 2', 'Player 3', 'Player 4'] as PlayerID[]).map(p => (
                  <button key={p} onClick={() => setCurrentPlayer(p)} className={`px-5 py-2 rounded-full text-[10px] font-black transition-all ${currentPlayer === p ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>P{p.slice(-1)}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex">
            <div className="absolute top-8 left-8 z-10 space-y-4">
              <button onClick={() => setGameState('setup')} className="bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-400 border border-slate-700 px-5 py-3 rounded-xl font-bold uppercase transition-all block w-36">Deployment</button>
              <button onClick={saveToLocal} className="bg-emerald-950/40 hover:bg-emerald-900/40 text-xs text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl font-bold uppercase block w-36">Sync State</button>
            </div>

            <div className="flex-1 relative">
              <StarMap stars={stars} sectors={sectors} mapConfig={mapConfig} onStarSelect={(s, x, y) => setSelectedStarData(s ? {starId: s.id, x, y} : null)} />
              
              {selectedStar && (
                <div className="absolute z-50 w-[420px] bg-slate-900/95 backdrop-blur-3xl border border-slate-700 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-[2.5rem] p-8 overflow-y-auto max-h-[85%] ring-1 ring-indigo-500/20"
                     style={{ left: Math.min(window.innerWidth - 450, selectedStarData!.x + 25), top: Math.min(window.innerHeight - 650, selectedStarData!.y + 25) }}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-500 uppercase tracking-widest font-black">Analysis Core</span>
                      <h3 className="text-3xl font-black text-indigo-400 font-mono tracking-tighter leading-none">{selectedStar.label}</h3>
                    </div>
                    <button onClick={() => setSelectedStarData(null)} className="text-slate-600 hover:text-white transition-colors text-3xl leading-none">&times;</button>
                  </div>
                  <div className="space-y-8">
                    {/* OWNER SELECTION */}
                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800">
                      <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">System Control</h4>
                      <div className="flex flex-wrap gap-2">
                        {(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'None'] as PlayerID[]).map(p => {
                          const isActive = selectedStar.owner === p;
                          const colorClass = p === 'None' 
                            ? (isActive ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-500') 
                            : (isActive ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800');
                          
                          return (
                            <button 
                              key={p} 
                              onClick={() => handleSetOwner(p)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border border-slate-700/50 ${colorClass}`}
                            >
                              {p === 'None' ? 'Neutral' : p.replace('Player ', 'P')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800 space-y-3">
                       <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 uppercase font-bold tracking-widest">Iron Reserves</span>
                        <span className="text-amber-500 font-mono font-bold text-sm">{selectedStar.ironReserve.toExponential(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 uppercase font-bold tracking-widest">Hydrogen Reserves</span>
                        <span className="text-blue-400 font-mono font-bold text-sm">{selectedStar.hydrogenReserve.toExponential(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 uppercase font-bold tracking-widest">Star Gold Reserves</span>
                        <span className="text-yellow-400 font-mono font-bold text-sm">{selectedStar.starGoldReserve.toExponential(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                        <div className="flex justify-between bg-slate-900/50 p-2.5 rounded-xl px-3"><span className="text-slate-500">Planets (E)</span><span className="text-emerald-400 font-bold">{selectedStar.earthLikeCount}</span></div>
                        <div className="flex justify-between bg-slate-900/50 p-2.5 rounded-xl px-3"><span className="text-slate-500">Gas (J)</span><span className="text-blue-400 font-bold">{selectedStar.gasGiantCount}</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1 border-b border-slate-800 pb-1.5">Infrastructure</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {(Object.keys(BUILDING_STATS) as BuildingType[]).map(type => {
                          const stat = BUILDING_STATS[type];
                          const costMult = (selectedStar.type !== 's' ? 2 : 1);
                          const current = selectedStar.buildings[type];
                          return (
                            <div key={type} className="bg-slate-950/40 border border-slate-800 p-4 rounded-3xl hover:bg-slate-800/30 transition-all">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-bold text-slate-200">{stat.name}</span>
                                <span className="text-xs font-mono text-slate-500">Active: {current >= 1e6 ? `${(current/1e6).toFixed(1)}M` : current}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono space-y-1">
                                 <div className="flex flex-wrap gap-x-3">{Object.entries(stat.cost).map(([r, a]) => (<span key={r} className="uppercase">{r}: <span className="text-slate-300">{(a as number) * costMult}</span></span>))}</div>
                                 <div className="flex flex-wrap gap-x-3 text-indigo-400/80">{Object.entries(stat.production).map(([r, a]) => (<span key={r} className="uppercase">Prod: +{a as number} {r}</span>))}</div>
                              </div>
                              <div className="mt-4 flex space-x-3">
                                <button onClick={() => handleConstruct(type, 1)} className="flex-1 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-500/20 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-indigo-400 transition-colors">+ Build</button>
                                <button onClick={() => handleDemolish(type, 1)} className="flex-1 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400 transition-colors">- Scrap</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1 border-b border-slate-800 pb-1.5">Synthesis Lab</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { target: 'nano', cost: 2, label: 'Nano Materials' }, 
                          { target: 'carbyne', cost: 5, label: 'Carbyne' }, 
                          { target: 'denseNeutron', cost: 10, label: 'Dense Neutron' }, 
                          { target: 'strongInteraction', cost: 20, label: 'Strong Interaction' }
                        ].map(syn => (
                          <button key={syn.target} onClick={() => handleSynthesize(syn.target as any, syn.cost, 1)} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl hover:bg-indigo-950/30 hover:border-indigo-800/40 transition-all text-left">
                            <div className="text-xs font-bold text-indigo-300">{syn.label}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">{syn.cost} Fe → 1 Unit</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
