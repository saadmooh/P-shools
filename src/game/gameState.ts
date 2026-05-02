import { generateId } from '../utils/helpers';
import {
  UNIT_TYPES,
  BUILDING_TYPES,
  RESOURCE_TYPES,
  TERRAIN_TYPES,
  UNIT_STATS,
  BUILDING_STATS,
  MAP_WIDTH,
  MAP_HEIGHT
} from './constants';
import type { GameState, Player, Unit, Building, ResourceNode, Terrain } from './types';

export function createInitialGameState(playerCount: number = 2): GameState {
  const terrain = generateTerrain();
  const resources = generateResources(terrain);
  
  const players: Map<number, Player> = new Map();
  const buildings: Map<string, Building> = new Map();
  const units: Map<string, Unit> = new Map();
  
  const playerColors = ['#4CAF50', '#2196F3', '#FF5722', '#9C27B0'];
  
  // Create players
  for (let i = 0; i < playerCount; i++) {
    const startX = Math.floor(MAP_WIDTH / 4) * (i % 2 + 1);
    const startY = Math.floor(MAP_HEIGHT / 2);
    
    players.set(i, {
      id: i,
      name: `Player ${i + 1}`,
      resources: {
        [RESOURCE_TYPES.FOOD]: 200,
        [RESOURCE_TYPES.WOOD]: 200,
        [RESOURCE_TYPES.GOLD]: 100,
        [RESOURCE_TYPES.STONE]: 100
      },
      population: 3,
      maxPopulation: 5,
      color: playerColors[i] || '#FFFFFF'
    });
    
    // Create Town Center for each player
    const townCenter: Building = {
      id: generateId(),
      type: BUILDING_TYPES.TOWN_CENTER,
      position: { x: startX, y: startY },
      width: 3,
      height: 3,
      health: BUILDING_STATS[BUILDING_TYPES.TOWN_CENTER].health,
      maxHealth: BUILDING_STATS[BUILDING_TYPES.TOWN_CENTER].health,
      owner: i,
      productionQueue: [],
      progress: 100
    };
    buildings.set(townCenter.id, townCenter);
    
    // Create initial villagers for each player
    for (let j = 0; j < 3; j++) {
      const villager: Unit = {
        id: generateId(),
        type: UNIT_TYPES.VILLAGER,
        position: { x: startX + 2 + j, y: startY + 2 },
        health: UNIT_STATS[UNIT_TYPES.VILLAGER].health,
        maxHealth: UNIT_STATS[UNIT_TYPES.VILLAGER].health,
        attack: UNIT_STATS[UNIT_TYPES.VILLAGER].attack,
        range: UNIT_STATS[UNIT_TYPES.VILLAGER].range,
        speed: UNIT_STATS[UNIT_TYPES.VILLAGER].speed,
        owner: i,
        state: 'idle'
      };
      units.set(villager.id, villager);
    }
  }
  
  return {
    players,
    units,
    buildings,
    resources,
    terrain,
    currentPlayer: 0,
    gameTick: 0,
    isPaused: false
  };
}

function generateTerrain(): Terrain[][] {
  const terrain: Terrain[][] = [];
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: Terrain[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Simple terrain generation with noise-like patterns
      const rand = Math.random();
      let type = TERRAIN_TYPES.GRASS;
      let walkable = true;
      
      if (rand > 0.85) {
        type = TERRAIN_TYPES.FOREST;
      } else if (rand > 0.95) {
        type = TERRAIN_TYPES.MOUNTAIN;
        walkable = false;
      } else if (rand > 0.98) {
        type = TERRAIN_TYPES.WATER;
        walkable = false;
      }
      
      row.push({ type, walkable });
    }
    terrain.push(row);
  }
  
  return terrain;
}

function generateResources(terrain: Terrain[][]): Map<string, ResourceNode> {
  const resources = new Map<string, ResourceNode>();
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = terrain[y][x];
      
      if (tile.type === TERRAIN_TYPES.FOREST) {
        resources.set(generateId(), {
          id: generateId(),
          type: RESOURCE_TYPES.WOOD,
          position: { x, y },
          amount: 100,
          maxAmount: 100
        });
      } else if (Math.random() > 0.98) {
        // Random gold deposits
        resources.set(generateId(), {
          id: generateId(),
          type: RESOURCE_TYPES.GOLD,
          position: { x, y },
          amount: 500,
          maxAmount: 500
        });
      } else if (Math.random() > 0.99) {
        // Random stone deposits
        resources.set(generateId(), {
          id: generateId(),
          type: RESOURCE_TYPES.STONE,
          position: { x, y },
          amount: 400,
          maxAmount: 400
        });
      } else if (Math.random() > 0.97) {
        // Berry bushes for food
        resources.set(generateId(), {
          id: generateId(),
          type: RESOURCE_TYPES.FOOD,
          position: { x, y },
          amount: 150,
          maxAmount: 150
        });
      }
    }
  }
  
  return resources;
}

export function canAfford(
  player: Player,
  cost: Record<string, number>
): boolean {
  for (const [resource, amount] of Object.entries(cost)) {
    if ((player.resources[resource] || 0) < amount) {
      return false;
    }
  }
  return true;
}

export function payCost(
  player: Player,
  cost: Record<string, number>
): void {
  for (const [resource, amount] of Object.entries(cost)) {
    player.resources[resource] = (player.resources[resource] || 0) - amount;
  }
}
