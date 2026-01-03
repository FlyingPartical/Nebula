
import { StarType, StarSystem, MapConfig, Sector, PlayerID } from '../types';
import { MAP_SIZE_LY, SECTOR_COLS, SECTOR_ROWS } from '../constants';

// Mulberry32 seeded random generator
const createSeededRandom = (seed: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  let state = h;
  return () => {
    state |= 0; state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

export const generateSectors = (): Sector[] => {
  const sectors: Sector[] = [];
  const ids: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  const width = MAP_SIZE_LY / SECTOR_COLS;
  const height = MAP_SIZE_LY / SECTOR_ROWS;

  for (let r = 0; r < SECTOR_ROWS; r++) {
    for (let c = 0; c < SECTOR_COLS; c++) {
      const idx = r * SECTOR_COLS + c;
      sectors.push({
        id: ids[idx],
        bounds: {
          x: c * width,
          y: r * height,
          width,
          height,
        },
      });
    }
  }
  return sectors;
};

const generateLabel = (type: StarType, earth: number, gas: number): string => {
  if (type === StarType.SUPERMASSIVE_BLACK_HOLE) return 'str*';
  if (type === StarType.BLACK_HOLE || type === StarType.NEUTRON) {
    return `${type}E${earth}`;
  }
  return `${type}E${earth}J${gas}`;
};

const getReserves = (type: StarType, rng: () => number) => {
  const multiplier = Math.floor(rng() * 9) + 1; // 1 to 9
  let iron = 0, hydrogen = 0, starGold = 0;

  switch (type) {
    case StarType.COMMON:
      iron = multiplier * 1e10;
      hydrogen = 1e10;
      starGold = multiplier * 1e8;
      break;
    case StarType.NEUTRON:
    case StarType.BLACK_HOLE:
      iron = multiplier * 1e8;
      hydrogen = 0;
      starGold = 0;
      break;
    case StarType.SUPERMASSIVE_BLACK_HOLE:
      iron = multiplier * 1e9;
      hydrogen = 10;
      starGold = 10;
      break;
  }
  return { iron, hydrogen, starGold };
};

export const generateStars = (config: MapConfig, sectors: Sector[]): StarSystem[] => {
  const rng = createSeededRandom(config.seed || Math.random().toString());
  const stars: StarSystem[] = [];

  const isTooClose = (x: number, y: number, currentStars: StarSystem[]) => {
    for (const s of currentStars) {
      const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2);
      if (dist < config.minStarDistance) return true;
    }
    return false;
  };

  // 1. Central SMBH
  const smbhRes = getReserves(StarType.SUPERMASSIVE_BLACK_HOLE, rng);
  stars.push({
    id: 'center-smbh',
    type: StarType.SUPERMASSIVE_BLACK_HOLE,
    x: MAP_SIZE_LY / 2,
    y: MAP_SIZE_LY / 2,
    earthLikeCount: 0,
    gasGiantCount: 0,
    label: 'str*',
    noiseSeed: rng(),
    owner: 'None',
    ironReserve: smbhRes.iron,
    hydrogenReserve: smbhRes.hydrogen,
    starGoldReserve: smbhRes.starGold,
    buildings: { Mine: 0, NanoMine: 0, FusionReactor: 0, ZeroPointMine: 0 }
  });

  // 2. Player Starting Systems
  const playerSlots: { sectorId: string; player: PlayerID }[] = [
    { sectorId: 'A', player: 'Player 1' },
    { sectorId: 'C', player: 'Player 2' },
    { sectorId: 'D', player: 'Player 3' },
    { sectorId: 'F', player: 'Player 4' }
  ];

  playerSlots.forEach(slot => {
    const sector = sectors.find(s => s.id === slot.sectorId);
    if (!sector) return;
    
    const x = sector.bounds.x + sector.bounds.width / 2;
    const y = sector.bounds.y + sector.bounds.height / 2;
    
    const homeRes = getReserves(StarType.COMMON, rng);
    stars.push({
      id: `start-${slot.player}`,
      type: StarType.COMMON,
      x,
      y,
      earthLikeCount: 2,
      gasGiantCount: 3,
      label: `HOME-${slot.player.slice(-1)}`,
      noiseSeed: rng(),
      owner: slot.player,
      ironReserve: homeRes.iron,
      hydrogenReserve: homeRes.hydrogen,
      starGoldReserve: homeRes.starGold,
      buildings: { Mine: 0, NanoMine: 0, FusionReactor: 0, ZeroPointMine: 0 }
    });
  });

  // 3. Procedural Systems
  sectors.forEach((sector) => {
    const addStars = (count: number, type: StarType) => {
      for (let i = 0; i < count; i++) {
        let x, y, attempts = 0;
        do {
          x = sector.bounds.x + rng() * sector.bounds.width;
          y = sector.bounds.y + rng() * sector.bounds.height;
          attempts++;
        } while (isTooClose(x, y, stars) && attempts < 50);

        const earth = Math.floor(rng() * 5);
        const gas = (type === StarType.COMMON) ? Math.floor(rng() * 5) : 0;
        
        const res = getReserves(type, rng);
        stars.push({
          id: `${sector.id}-${type}-${i}`,
          type,
          x,
          y,
          earthLikeCount: earth,
          gasGiantCount: gas,
          label: generateLabel(type, earth, gas),
          noiseSeed: rng(),
          owner: 'None',
          ironReserve: res.iron,
          hydrogenReserve: res.hydrogen,
          starGoldReserve: res.starGold,
          buildings: { Mine: 0, NanoMine: 0, FusionReactor: 0, ZeroPointMine: 0 }
        });
      }
    };

    addStars(config.commonCount, StarType.COMMON);
    addStars(config.neutronCount, StarType.NEUTRON);
    addStars(config.blackHoleCount, StarType.BLACK_HOLE);
  });

  return stars;
};
