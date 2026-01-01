
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { StarSystem, Sector, StarType, MapConfig } from '../types';
import { MAP_SIZE_LY, STAR_COLORS, PLAYER_COLORS } from '../constants';
import { Noise2D } from '../services/noise';

interface StarMapProps {
  stars: StarSystem[];
  sectors: Sector[];
  mapConfig: MapConfig;
  onStarSelect: (star: StarSystem | null, screenX: number, screenY: number) => void;
}

const StarMap: React.FC<StarMapProps> = ({ stars, sectors, mapConfig, onStarSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 3 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [transformAtStart, setTransformAtStart] = useState({ x: 0, y: 0 });
  
  const noiseRef = useMemo(() => {
    let numericSeed = 0;
    if (mapConfig.seed) {
      for (let i = 0; i < mapConfig.seed.length; i++) {
        numericSeed = (numericSeed << 5) - numericSeed + mapConfig.seed.charCodeAt(i);
        numericSeed |= 0;
      }
    } else {
      numericSeed = Math.random();
    }
    return new Noise2D(numericSeed);
  }, [mapConfig.seed]);

  const isPointInDust = useCallback((x: number, y: number): boolean => {
    let currentThreshold = 1 - mapConfig.dustDensity;
    let tooCloseToStar = false;
    
    for (const star of stars) {
      const dx = star.x - x;
      const dy = star.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 4) { tooCloseToStar = true; break; }
      
      if (distSq <= mapConfig.dustRangeMax * mapConfig.dustRangeMax && distSq >= mapConfig.dustRangeMin * mapConfig.dustRangeMin) {
        if (star.type !== StarType.COMMON) {
          const dist = Math.sqrt(distSq);
          const range = mapConfig.dustRangeMax - mapConfig.dustRangeMin;
          const factor = (dist - mapConfig.dustRangeMin) / range;
          currentThreshold = (1 - mapConfig.dustDensity) / (1 + mapConfig.dustProbFactor * (1 - factor));
        }
      }
    }
    
    if (tooCloseToStar) return false;
    const val = noiseRef.fbm(x * 0.04, y * 0.04, 3, 0.5);
    return val > currentThreshold;
  }, [stars, mapConfig, noiseRef]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // --- PROCEDURAL DUST ---
    const dustRes = 1.0; 
    for (let x = 0; x < MAP_SIZE_LY; x += dustRes) {
      for (let y = 0; y < MAP_SIZE_LY; y += dustRes) {
        let currentThreshold = 1 - mapConfig.dustDensity;
        let tooCloseToStar = false;
        
        for (const star of stars) {
          const dx = star.x - x;
          const dy = star.y - y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 4) { tooCloseToStar = true; break; }
          
          if (distSq <= mapConfig.dustRangeMax * mapConfig.dustRangeMax && distSq >= mapConfig.dustRangeMin * mapConfig.dustRangeMin) {
             if (star.type !== StarType.COMMON) {
               const dist = Math.sqrt(distSq);
               const range = mapConfig.dustRangeMax - mapConfig.dustRangeMin;
               const factor = (dist - mapConfig.dustRangeMin) / range;
               currentThreshold = (1 - mapConfig.dustDensity) / (1 + mapConfig.dustProbFactor * (1 - factor));
             }
          }
        }
        
        if (tooCloseToStar) continue;
        const val = noiseRef.fbm(x * 0.04, y * 0.04, 3, 0.5);
        if (val > currentThreshold) {
          const opacity = Math.min(0.35, (val - currentThreshold) * 2);
          ctx.fillStyle = `rgba(100, 116, 139, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dustRes * 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // --- SECTOR DASHED BORDERS ---
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
    ctx.lineWidth = 1.5 / transform.scale;
    ctx.setLineDash([8 / transform.scale, 8 / transform.scale]);
    sectors.forEach(s => {
      ctx.strokeRect(s.bounds.x, s.bounds.y, s.bounds.width, s.bounds.height);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
      ctx.font = `bold ${14 / transform.scale}px sans-serif`;
      ctx.fillText(s.id, s.bounds.x + 4 / transform.scale, s.bounds.y + 16 / transform.scale);
    });
    ctx.setLineDash([]);

    // --- TERRITORIES ---
    const terrRes = 1.5;
    stars.forEach(star => {
      if (star.owner === 'None') return;
      const color = PLAYER_COLORS[star.owner];
      const radius = 10;
      
      for (let tx = star.x - radius; tx <= star.x + radius; tx += terrRes) {
        for (let ty = star.y - radius; ty <= star.y + radius; ty += terrRes) {
          const dx = tx - star.x;
          const dy = ty - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius || dist < 0.1) continue;

          let effectiveDist = dist;
          const midX = star.x + dx * 0.5;
          const midY = star.y + dy * 0.5;
          if (isPointInDust(midX, midY)) effectiveDist += dist * 0.5;
          if (isPointInDust(tx, ty)) effectiveDist += dist * 0.5;

          const strength = Math.max(0, 1 - (effectiveDist / 10));
          if (strength > 0) {
            ctx.fillStyle = color.replace('0.4', (strength * 0.4).toString());
            ctx.beginPath();
            ctx.arc(tx, ty, terrRes * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });

    // --- STARS ---
    stars.forEach(star => {
      ctx.fillStyle = STAR_COLORS[star.type];
      const starSize = star.type === StarType.SUPERMASSIVE_BLACK_HOLE ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.arc(star.x, star.y, starSize / transform.scale + 0.5, 0, Math.PI * 2);
      ctx.fill();

      if (star.owner !== 'None') {
        ctx.strokeStyle = PLAYER_COLORS[star.owner].replace('0.4', '1');
        ctx.lineWidth = 2 / transform.scale;
        ctx.beginPath();
        ctx.arc(star.x, star.y, (starSize + 1.5) / transform.scale + 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (star.type !== StarType.COMMON) {
          const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 5 / transform.scale);
          grad.addColorStop(0, STAR_COLORS[star.type]);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 5 / transform.scale, 0, Math.PI * 2);
          ctx.fill();
      }

      ctx.fillStyle = star.owner !== 'None' ? PLAYER_COLORS[star.owner].replace('0.4', '1') : '#94a3b8';
      ctx.font = `bold ${10 / transform.scale}px monospace`;
      ctx.fillText(star.label, star.x + 4 / transform.scale, star.y - 4 / transform.scale);
    });

    ctx.restore();

    // --- SCALE BAR ---
    const scaleBarX = 30;
    const scaleBarY = canvas.height - 40;
    const scaleBarLen = 1 * transform.scale;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY - 5);
    ctx.lineTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarLen, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarLen, scaleBarY - 5);
    ctx.stroke();
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1 LY', scaleBarX + scaleBarLen / 2, scaleBarY - 10);
    ctx.textAlign = 'left';

  }, [stars, sectors, transform, mapConfig, isPointInDust, noiseRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      draw();
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { 
      setIsDragging(true);
      setDragOrigin({ x: e.clientX, y: e.clientY });
      setTransformAtStart({ x: transform.x, y: transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragOrigin.x;
      const dy = e.clientY - dragOrigin.y;
      setTransform({
        ...transform,
        x: transformAtStart.x + dx,
        y: transformAtStart.y + dy
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragOrigin.x;
      const dy = e.clientY - dragOrigin.y;
      const moveDist = Math.sqrt(dx * dx + dy * dy);
      if (moveDist < 5) handleSelection(e);
      setIsDragging(false);
    }
  };

  const handleSelection = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - transform.x) / transform.scale;
    const worldY = (mouseY - transform.y) / transform.scale;
    
    let closest: StarSystem | null = null;
    let minDist = 20 / transform.scale;
    stars.forEach(star => {
      const d = Math.sqrt((star.x - worldX)**2 + (star.y - worldY)**2);
      if (d < minDist) {
        minDist = d;
        closest = star;
      }
    });
    onStarSelect(closest, e.clientX, e.clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.002;
    const delta = -e.deltaY;
    const newScale = Math.max(0.5, Math.min(60, transform.scale + delta * zoomSpeed * transform.scale));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - transform.x) / transform.scale;
    const worldY = (mouseY - transform.y) / transform.scale;
    setTransform({
      scale: newScale,
      x: mouseX - worldX * newScale,
      y: mouseY - worldY * newScale
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="cursor-crosshair w-full h-full touch-none"
    />
  );
};

export default StarMap;
