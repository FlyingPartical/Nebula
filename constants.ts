
import { Resources, BuildingType } from './types';

export const MAP_SIZE_LY = 200;
export const SECTOR_COLS = 3;
export const SECTOR_ROWS = 2;

export const STAR_COLORS = {
  s: '#fbbf24', 
  psr: '#f8fafc',
  str: '#0f172a',
  STR: '#000000',
};

export const PLAYER_COLORS: Record<string, string> = {
  'Player 1': 'rgba(59, 130, 246, 0.4)', 
  'Player 2': 'rgba(239, 68, 68, 0.4)',  
  'Player 3': 'rgba(234, 179, 8, 0.4)',  
  'Player 4': 'rgba(34, 197, 94, 0.4)',  
  'None': 'transparent'
};

export const INITIAL_RESOURCES: Resources = {
  iron: 100,
  nano: 10,
  energy: 500,
  hydrogen: 20,
  carbyne: 0,
  denseNeutron: 0,
  strongInteraction: 0
};

export const EMPTY_RESOURCES: Resources = {
  iron: 0,
  nano: 0,
  energy: 0,
  hydrogen: 0,
  carbyne: 0,
  denseNeutron: 0,
  strongInteraction: 0
};

export const MAX_RESOURCE_CAP = 1000000000;

export const BUILDING_STATS: Record<BuildingType, any> = {
  Mine: { name: 'Basic Mine', cost: { iron: 1, energy: 1 }, production: { iron: 1 }, consumption: {}, reqEarth: 1 },
  NanoMine: { name: 'Nano Mine', cost: { nano: 1, energy: 1 }, production: { iron: 2 }, consumption: { energy: 100 }, reqEarth: 1 },
  FusionReactor: { name: 'Fusion Reactor', cost: { iron: 20, energy: 40 }, production: { energy: 10 }, consumption: { hydrogen: 1 } },
  ZeroPointMine: { name: 'Zero-Point Extractor', cost: { iron: 20000, energy: 20000 }, production: { energy: 1000 }, consumption: {} }
};
