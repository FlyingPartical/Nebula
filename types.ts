
export enum StarType {
  COMMON = 's',
  NEUTRON = 'psr',
  BLACK_HOLE = 'str',
  SUPERMASSIVE_BLACK_HOLE = 'STR'
}

export type PlayerID = 'Player 1' | 'Player 2' | 'Player 3' | 'Player 4' | 'None';

export interface Resources {
  iron: number;
  nano: number;
  energy: number;
  hydrogen: number;
  carbyne: number;
  denseNeutron: number;
  strongInteraction: number;
  starGold: number;
}

export type BuildingType = 'Mine' | 'NanoMine' | 'FusionReactor' | 'ZeroPointMine';

export interface Technology {
  id: string;
  name: string;
  time: string;
  prereqs: string[];
  effect: string;
  location: string;
  branch: string;
}

export interface StarSystem {
  id: string;
  type: StarType;
  x: number;
  y: number;
  earthLikeCount: number;
  gasGiantCount: number;
  label: string;
  noiseSeed: number;
  owner: PlayerID;
  ironReserve: number;
  hydrogenReserve: number;
  starGoldReserve: number;
  buildings: Record<BuildingType, number>;
}

export interface Sector {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  bounds: { x: number; y: number; width: number; height: number };
}

export interface MapConfig {
  commonCount: number;
  neutronCount: number;
  blackHoleCount: number;
  dustDensity: number;
  minStarDistance: number;
  dustRangeMin: number;
  dustRangeMax: number;
  dustProbFactor: number;
  seed: string;
}
