
import { Resources, BuildingType, Technology } from './types';

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

export const TECH_TREE: Technology[] = [
  // Theoretical Tech
  { id: 't1', name: 'Modern Theory', time: 'Initial', prereqs: [], effect: 'Unlock basic tech tree', location: 'Any Research Station', branch: 'Theory' },
  { id: 't2', name: '3+1D Universe', time: '2 Days', prereqs: ['Modern Theory'], effect: 'Unlock high-dimensional physical rules', location: 'Any Research Station', branch: 'Theory' },
  { id: 't3', name: 'Grand Unification', time: '5 Days', prereqs: ['3+1D Universe'], effect: 'Link gravity and quantum tech', location: 'Black Hole Station', branch: 'Theory' },
  { id: 't4', name: '4+1D Universe', time: '1 Day', prereqs: ['Grand Unification', 'Engine 4'], effect: 'Unlock Klein bottle research', location: 'Klein Event Station', branch: 'Theory' },
  { id: 't5', name: 'Micro Universe', time: '3 Days', prereqs: ['4+1D Universe'], effect: 'Unlock micro universe tractor module', location: 'Klein Station', branch: 'Theory' },
  { id: 't6', name: 'Source Theory', time: '4 Days', prereqs: ['4+1D Universe'], effect: 'Unlock ultimate mass-energy conversion', location: 'SMBH Station', branch: 'Theory' },
  
  // Energy Tech
  { id: 'e1', name: 'Solar Power', time: 'Initial', prereqs: [], effect: 'Build solar panels', location: 'None', branch: 'Energy' },
  { id: 'e2', name: 'Fusion', time: '1 Day', prereqs: ['Solar Power'], effect: 'Build fusion reactors', location: 'Any Research Station', branch: 'Energy' },
  { id: 'e3', name: 'Antimatter', time: '2 Days', prereqs: ['Fusion'], effect: 'Unlock Dyson structures', location: 'Neutron Star Station', branch: 'Energy' },
  { id: 'e4', name: 'Zero Point', time: '3 Days', prereqs: ['Antimatter', '4+1D Universe'], effect: 'Build Zero-Point mines', location: 'Black Hole Station', branch: 'Energy' },
  
  // Material Tech
  { id: 'm1', name: 'Iron', time: 'Initial', prereqs: [], effect: 'Limit 0.01c, Strength 10', location: 'None', branch: 'Materials' },
  { id: 'm2', name: 'Nano Materials', time: '2 Days', prereqs: ['Iron'], effect: 'Speed 0.1c, Strength 20', location: 'Any Research Station', branch: 'Materials' },
  { id: 'm3', name: 'Carbyne', time: '3 Days', prereqs: ['Nano Materials'], effect: 'Speed 0.2c, Strength 50', location: 'Any Research Station', branch: 'Materials' },
  { id: 'm4', name: 'Star Gold', time: '3 Days', prereqs: ['Carbyne', 'Warp 1', 'Grand Unification'], effect: 'Speed 0.6c, Strength 150', location: 'Any Research Station', branch: 'Materials' },
  { id: 'm5', name: 'Carbyne-Gold Alloy', time: '1 Day', prereqs: ['Star Gold'], effect: 'Speed 0.4c, Strength 100', location: 'Any Research Station', branch: 'Materials' },
  { id: 'm6', name: 'Dense Neutron', time: '4 Days', prereqs: ['Star Gold'], effect: 'Speed 1c, Strength 300', location: 'Neutron Star Station', branch: 'Materials' },
  { id: 'm7', name: 'Strong Interaction', time: '4 Days', prereqs: ['Dense Neutron', '4+1D Universe'], effect: 'Speed 1c, Infinite Strength', location: 'Black Hole Station', branch: 'Materials' },

  // Communication/Sensing
  { id: 'c1', name: 'EM Waves', time: 'Initial', prereqs: [], effect: 'Short range comms', location: 'None', branch: 'Comms' },
  { id: 'c2', name: 'Quantum Comms', time: '1 Day', prereqs: ['EM Waves'], effect: 'High speed comms (<10c)', location: 'Any Research Station', branch: 'Comms' },
  { id: 's1', name: 'EM Radar', time: 'Initial', prereqs: [], effect: '5 LY range', location: 'None', branch: 'Sensing' },
  
  // Engines
  { id: 'en1', name: 'Propellant Engine', time: 'Initial', prereqs: [], effect: '0.01c', location: 'None', branch: 'Engines' },
  { id: 'en2', name: 'Radiation Engine', time: '1 Day', prereqs: ['Propellant Engine'], effect: '0.15c', location: 'Any Research Station', branch: 'Engines' },
  { id: 'en3', name: 'Antimatter Engine', time: '1 Day', prereqs: ['Radiation Engine', 'Antimatter'], effect: '0.5c', location: 'Any Research Station', branch: 'Engines' },
  { id: 'en4', name: 'Warp Drive Lv.1', time: '3 Days', prereqs: ['Antimatter Engine', 'Grand Unification'], effect: '1c', location: 'Any Research Station', branch: 'Engines' }
];
