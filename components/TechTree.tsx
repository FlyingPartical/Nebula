import React, { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from 'react';
import { Technology, PlayerID } from '../types';
import { PLAYER_COLORS } from '../constants';
import { techData } from '../techTree';

interface TechTreeProps {
  onClose: () => void;
  currentPlayer: PlayerID;
  onPlayerChange: (player: PlayerID) => void;
  playerTechs: Record<PlayerID, string[]>;
}

const TechTree: React.FC<TechTreeProps> = ({ onClose, currentPlayer, onPlayerChange, playerTechs }) => {
  const [transform, setTransform] = useState({ x: 300, y: 100, scale: 0.6 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Record<string, HTMLDivElement | null>>({});
  const rootNodeRef = useRef<HTMLDivElement>(null);

  const techList = techData.technologies;

  // Branch grouping logic for root to branch lines
  const mainBranches = useMemo(() => {
    // These keys must match the "branch" strings in techTree.ts
    const categories: Record<string, string[]> = {
      "Theory": ["Theory"],
      "Energy": ["Energy"],
      "Materials": ["Materials"],
      "Comms": ["Comms"],
      "Sensing": ["Sensing"],
      "Engines": ["Engines"],
      "Protection": ["Protection"],
      "Weapons": ["Kinetic", "Energy Weapons"],
      "Mining": ["Mining"]
    };

    const grouped: Record<string, Record<string, Technology[]>> = {};
    Object.entries(categories).forEach(([main, subBranches]) => {
      grouped[main] = {};
      subBranches.forEach(sub => {
        grouped[main][sub] = techList.filter(t => t.branch === sub);
      });
    });
    return grouped;
  }, [techList]);

  // Recalculate positions after render to ensure SVG lines are correct
  // Fixed error by properly casting NodeList elements to HTMLElement
  const updatePositions = useCallback(() => {
    const positions: Record<string, { x: number; y: number; w: number; h: number }> = {};
    // Fix: Explicitly cast Object.entries to [string, HTMLDivElement | null][] to avoid 'unknown' type errors on 'el'
    (Object.entries(nodesRef.current) as [string, HTMLDivElement | null][]).forEach(([id, el]) => {
      if (el) {
        positions[id] = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      }
    });
    
    if (rootNodeRef.current) {
        positions['ROOT'] = {
            x: rootNodeRef.current.offsetLeft,
            y: rootNodeRef.current.offsetTop,
            w: rootNodeRef.current.offsetWidth,
            h: rootNodeRef.current.offsetHeight
        };
    }
    
    document.querySelectorAll('.branch-header').forEach((node) => {
        const el = node as HTMLElement;
        const branchName = el.dataset.branch;
        if (branchName) {
            positions[branchName] = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
        }
    });

    setNodePositions(positions);
  }, []);

  useLayoutEffect(() => {
    updatePositions();
    // Re-check after a short delay for any layout shifts
    const timer = setTimeout(updatePositions, 100);
    return () => clearTimeout(timer);
  }, [mainBranches, updatePositions]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragOrigin({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragOrigin.x,
        y: e.clientY - dragOrigin.y
      }));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY;
    const zoomSpeed = 0.001;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(2, prev.scale + delta * zoomSpeed * prev.scale))
    }));
  };

  const isTechOwned = (techId: string) => playerTechs[currentPlayer]?.includes(techId);

  const currentPrereqs = useMemo(() => {
    if (!hoveredTechId) return [];
    return techList.find(t => t.id === hoveredTechId)?.prereqs || [];
  }, [hoveredTechId, techList]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="absolute top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-b border-blue-900/30 flex items-center justify-between px-10 z-[110]">
        <div className="flex items-center space-x-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Technology Tree</h2>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Research & Development Repository</p>
          </div>
          <div className="flex bg-blue-950/20 p-1 rounded-full border border-blue-900/20">
            {(['Player 1', 'Player 2', 'Player 3', 'Player 4'] as PlayerID[]).map(p => (
              <button key={p} onClick={() => onPlayerChange(p)} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${currentPlayer === p ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-700 hover:text-blue-500'}`}>P{p.slice(-1)}</button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95">CLOSE</button>
      </div>

      <div 
        className="absolute transition-transform duration-75"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
      >
        <svg className="absolute top-0 left-0 w-[40000px] h-[20000px] pointer-events-none overflow-visible">
          {nodePositions['ROOT'] && Object.keys(mainBranches).map(branch => {
              const rootPos = nodePositions['ROOT'];
              const branchPos = nodePositions[branch];
              if (!branchPos || branchPos.x === 0) return null; // Avoid drawing before layout is stable

              const x1 = rootPos.x + rootPos.w / 2;
              const y1 = rootPos.y + rootPos.h;
              const x2 = branchPos.x + branchPos.w / 2;
              const y2 = branchPos.y;

              const midY = (y1 + y2) / 2;
              return <path key={`root-${branch}`} d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`} stroke="#3b82f6" strokeWidth="3" fill="none" opacity="0.6" />;
          })}

          {Object.entries(mainBranches).map(([main, subGroup]) => {
              return Object.entries(subGroup).map(([sub, techs]) => {
                  return techs.map((tech, idx) => {
                      if (idx === techs.length - 1) return null;
                      const nextTech = techs[idx + 1];
                      const startNode = nodePositions[tech.id];
                      const endNode = nodePositions[nextTech.id];
                      if (!startNode || !endNode) return null;

                      const x1 = startNode.x + startNode.w / 2;
                      const y1 = startNode.y + startNode.h;
                      const x2 = endNode.x + endNode.w / 2;
                      const y2 = endNode.y;

                      const midY = (y1 + y2) / 2;
                      return <path key={`line-${tech.id}-${nextTech.id}`} d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`} stroke="#3b82f6" strokeWidth="2.5" fill="none" opacity="0.4" />;
                  });
              });
          })}
        </svg>

        <div className="flex flex-col items-center">
          <div ref={rootNodeRef} className="w-80 bg-blue-600/20 border-2 border-blue-500 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-40">
            <h1 className="text-3xl font-black text-blue-400 italic tracking-widest uppercase">TECH TREE</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-widest">CENTRAL REPOSITORY</p>
          </div>

          <div className="flex space-x-16 items-start">
            {Object.entries(mainBranches).map(([mainName, subGroups]) => (
              <div key={mainName} className="flex flex-col items-center">
                <div 
                  data-branch={mainName}
                  className="branch-header w-64 bg-slate-900/80 border border-blue-900/30 rounded-xl py-3 px-4 text-center mb-12 shadow-lg backdrop-blur-sm"
                >
                   <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">{mainName}</h3>
                </div>

                <div className="flex space-x-12">
                   {Object.entries(subGroups).map(([subName, techs]) => (
                     <div key={subName} className="flex flex-col items-center">
                        {(mainName === "Weapons") && (
                             <div className="w-full h-8 flex items-center justify-center mb-4 relative">
                                <div className="absolute bottom-0 w-full border-t border-blue-900/50"></div>
                                <span className="bg-black px-4 text-[10px] font-black text-blue-700 uppercase tracking-[0.3em] z-10">{subName.toUpperCase()}</span>
                             </div>
                        )}
                        <div className="space-y-12">
                          {techs.map(tech => {
                            const owned = isTechOwned(tech.id);
                            const isPrereqHighlight = currentPrereqs.includes(tech.id);
                            const playerColor = PLAYER_COLORS[currentPlayer].replace('0.4', '1');

                            return (
                              <div 
                                key={tech.id} 
                                ref={el => { nodesRef.current[tech.id] = el; }}
                                onMouseEnter={() => setHoveredTechId(tech.id)}
                                onMouseLeave={() => setHoveredTechId(null)}
                                className={`w-64 bg-slate-900/40 backdrop-blur-md border rounded-xl p-4 transition-all duration-300 relative group cursor-pointer
                                  ${isPrereqHighlight ? 'ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] scale-110 z-20 border-blue-400' : 'z-10'}
                                `}
                                style={{ borderColor: isPrereqHighlight ? '#3b82f6' : (owned ? playerColor : 'rgba(30, 58, 138, 0.2)') }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                   <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${owned ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-slate-950/80 text-slate-600 border border-slate-800'}`}>
                                     {tech.time}
                                   </span>
                                   <span className="text-[8px] text-blue-900/50 font-mono">#{tech.id}</span>
                                </div>
                                <h4 className={`text-sm font-black leading-tight mb-1.5 transition-colors ${isPrereqHighlight ? 'text-blue-100' : 'text-slate-200'}`}>{tech.name}</h4>
                                <p className="text-[9px] text-slate-500 leading-tight mb-3 line-clamp-2 italic">{tech.effect}</p>
                                <div className="flex items-center space-x-2 text-[7px] text-blue-900 font-black uppercase tracking-tighter">
                                  <span className="shrink-0 text-blue-950">LAB:</span>
                                  <span className="truncate opacity-60">{tech.location}</span>
                                </div>
                                {owned && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: playerColor }}></div>}
                              </div>
                            );
                          })}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechTree;