export interface Position {
  x: number;
  y: number;
}

export interface Resource {
  type: string;
  amount: number;
}

export interface Unit {
  id: string;
  type: string;
  position: Position;
  health: number;
  maxHealth: number;
  attack: number;
  range: number;
  speed: number;
  owner: number; // player ID
  state: 'idle' | 'moving' | 'gathering' | 'attacking' | 'building';
  targetPosition?: Position;
  targetEntityId?: string;
  gatherTarget?: string; // resource ID to gather from
}

export interface Building {
  id: string;
  type: string;
  position: Position;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  owner: number;
  productionQueue: string[];
  progress: number; // construction progress 0-100
}

export interface ResourceNode {
  id: string;
  type: string;
  position: Position;
  amount: number;
  maxAmount: number;
}

export interface Terrain {
  type: string;
  walkable: boolean;
}

export interface Player {
  id: number;
  name: string;
  resources: Record<string, number>;
  population: number;
  maxPopulation: number;
  color: string;
}

export interface GameState {
  players: Map<number, Player>;
  units: Map<string, Unit>;
  buildings: Map<string, Building>;
  resources: Map<string, ResourceNode>;
  terrain: Terrain[][];
  currentPlayer: number;
  gameTick: number;
  isPaused: boolean;
}
