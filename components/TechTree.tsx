
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Technology } from '../types';
import { TECH_TREE } from '../constants';

interface TechTreeProps {
  onClose: () => void;
}

const TechTree: React.FC<TechTreeProps> = ({ onClose }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Group techs by branch for visual clustering
  const branches = useMemo(() => {
    const grouped: Record<string, Technology[]> = {};
    TECH_TREE.forEach(tech => {
      if (!grouped[tech.branch]) grouped[tech.branch] = [];
      grouped[tech.branch].push(tech);
    });
    return grouped;
  }, []);

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
      scale: Math.max(0.2, Math.min(2, prev.scale + delta * zoomSpeed * prev.scale))
    }));
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-blue-50 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }}></div>
      
      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-white/40 backdrop-blur-md border-b border-blue-200 flex items-center justify-between px-12 z-[110]">
        <div>
          <h2 className="text-3xl font-black text-blue-900 tracking-tighter uppercase italic">Technology Repository</h2>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Universal Knowledge Index // Protocol Alpha</p>
        </div>
        <button 
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-full font-bold text-sm shadow-xl transition-all active:scale-95"
        >
          RETURN TO STAR MAP
        </button>
      </div>

      {/* Main Content Area */}
      <div 
        className="absolute transition-transform duration-75 ease-out"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
      >
        <div className="flex space-x-24 p-48">
          {Object.entries(branches).map(([branchName, techs]) => (
            <div key={branchName} className="flex flex-col space-y-16">
              <div className="h-20 flex items-center">
                <h3 className="text-2xl font-black text-blue-400/50 uppercase tracking-[0.5em] origin-left rotate-90 translate-y-14">{branchName}</h3>
              </div>
              <div className="space-y-10 pt-24">
                {techs.map((tech) => (
                  <div 
                    key={tech.id} 
                    className="w-80 bg-white/60 backdrop-blur-xl border border-blue-200 rounded-[1.5rem] p-7 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[11px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase">{tech.time}</span>
                       <span className="text-[10px] text-blue-400 font-mono">#{tech.id}</span>
                    </div>
                    <h4 className="text-xl font-black text-blue-900 leading-tight mb-3">{tech.name}</h4>
                    <div className="space-y-3">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-blue-600 uppercase">Location:</span> {tech.location}
                      </div>
                      <div className="text-xs p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-600 leading-relaxed italic">
                        {tech.effect}
                      </div>
                      {tech.prereqs.length > 0 && (
                        <div className="pt-3 border-t border-blue-100 mt-3">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Prerequisites</span>
                          <div className="flex flex-wrap gap-2">
                            {tech.prereqs.map(p => (
                              <span key={p} className="text-[10px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-500">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechTree;
