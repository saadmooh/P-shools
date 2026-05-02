import { UNIT_STATS, BUILDING_STATS, RESOURCE_TYPES } from './constants';
import type { GameState, Unit, Building, Player } from './types';
import { distance } from '../utils/helpers';

export function gameTick(state: GameState): GameState {
  if (state.isPaused) return state;
  
  const newState = {
    ...state,
    players: new Map(state.players),
    units: new Map(state.units),
    buildings: new Map(state.buildings),
    resources: new Map(state.resources),
    gameTick: state.gameTick + 1
  };
  
  // Process all units
  for (const [id, unit] of newState.units) {
    const updatedUnit = processUnit(unit, newState);
    if (updatedUnit) {
      newState.units.set(id, updatedUnit);
    }
  }
  
  // Process all buildings
  for (const [id, building] of newState.buildings) {
    const updatedBuilding = processBuilding(building, newState);
    if (updatedBuilding) {
      newState.buildings.set(id, updatedBuilding);
    }
  }
  
  return newState;
}

function processUnit(unit: Unit, state: GameState): Unit | null {
  if (unit.health <= 0) {
    // Unit died, remove from game
    const player = state.players.get(unit.owner);
    if (player) {
      player.population--;
    }
    return null;
  }
  
  switch (unit.state) {
    case 'moving':
      return moveUnit(unit, state);
    case 'gathering':
      return gatherResources(unit, state);
    case 'attacking':
      return attackTarget(unit, state);
    case 'building':
      return constructBuilding(unit, state);
    default:
      return unit;
  }
}

function moveUnit(unit: Unit, state: GameState): Unit {
  if (!unit.targetPosition) {
    unit.state = 'idle';
    return unit;
  }
  
  const dx = unit.targetPosition.x - unit.position.x;
  const dy = unit.targetPosition.y - unit.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 0.5) {
    // Reached destination
    unit.position = { ...unit.targetPosition };
    unit.state = 'idle';
    unit.targetPosition = undefined;
  } else {
    // Move towards target
    const speed = unit.speed / 10; // Normalize speed
    unit.position = {
      x: unit.position.x + (dx / dist) * speed,
      y: unit.position.y + (dy / dist) * speed
    };
  }
  
  return unit;
}

function gatherResources(unit: Unit, state: GameState): Unit {
  if (!unit.gatherTarget) {
    unit.state = 'idle';
    return unit;
  }
  
  const resource = state.resources.get(unit.gatherTarget);
  if (!resource || resource.amount <= 0) {
    unit.state = 'idle';
    unit.gatherTarget = undefined;
    return unit;
  }
  
  // Check if close enough to gather
  const dist = distance(unit.position, resource.position);
  if (dist > 2) {
    unit.targetPosition = resource.position;
    unit.state = 'moving';
    return unit;
  }
  
  // Gather resources (every 10 ticks)
  if (state.gameTick % 10 === 0) {
    const gatherAmount = 10;
    resource.amount -= gatherAmount;
    
    const player = state.players.get(unit.owner);
    if (player) {
      player.resources[resource.type] = (player.resources[resource.type] || 0) + gatherAmount;
    }
    
    if (resource.amount <= 0) {
      state.resources.delete(resource.id);
      unit.gatherTarget = undefined;
      unit.state = 'idle';
    }
  }
  
  return unit;
}

function attackTarget(unit: Unit, state: GameState): Unit {
  if (!unit.targetEntityId) {
    unit.state = 'idle';
    return unit;
  }
  
  // Find target (could be unit or building)
  let target: Unit | Building | undefined;
  target = state.units.get(unit.targetEntityId);
  if (!target) {
    target = state.buildings.get(unit.targetEntityId);
  }
  
  if (!target || target.health <= 0) {
    unit.state = 'idle';
    unit.targetEntityId = undefined;
    return unit;
  }
  
  // Check range
  const dist = distance(unit.position, target.position);
  if (dist > unit.range + 1) {
    unit.targetPosition = target.position;
    unit.state = 'moving';
    return unit;
  }
  
  // Attack every 20 ticks
  if (state.gameTick % 20 === 0) {
    target.health -= unit.attack;
    
    if (target.health <= 0) {
      if ('owner' in target) {
        const targetOwner = state.players.get((target as any).owner);
        if (targetOwner) {
          targetOwner.population--;
        }
      }
      unit.state = 'idle';
      unit.targetEntityId = undefined;
    }
  }
  
  return unit;
}

function constructBuilding(unit: Unit, state: GameState): Unit {
  // Villagers can help construct buildings
  // Simplified: just check if building is being constructed nearby
  return unit;
}

function processBuilding(building: Building, state: GameState): Building | null {
  if (building.health <= 0) {
    // Building destroyed
    return null;
  }
  
  // Handle production queue
  if (building.productionQueue.length > 0 && building.progress >= 100) {
    const unitType = building.productionQueue[0];
    const stats = UNIT_STATS[unitType as keyof typeof UNIT_STATS];
    
    if (stats) {
      const player = state.players.get(building.owner);
      if (player && player.population < player.maxPopulation) {
        // Spawn unit near building
        const newUnit: Unit = {
          id: Math.random().toString(36).substr(2, 9),
          type: unitType,
          position: {
            x: building.position.x + building.width + 1,
            y: building.position.y + building.height / 2
          },
          health: stats.health,
          maxHealth: stats.health,
          attack: stats.attack,
          range: stats.range,
          speed: stats.speed,
          owner: building.owner,
          state: 'idle'
        };
        
        state.units.set(newUnit.id, newUnit);
        player.population++;
        building.productionQueue.shift();
        building.progress = 0;
      }
    }
  }
  
  // Increment progress if producing
  if (building.productionQueue.length > 0 && building.progress < 100) {
    building.progress += 2; // Production speed
    if (building.progress > 100) {
      building.progress = 100;
    }
  }
  
  return building;
}

export function findPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  terrain: any[][],
  obstacles: Set<string>
): Array<{ x: number; y: number }> {
  // Simple A* pathfinding (simplified version)
  // In a full implementation, this would be more sophisticated
  
  const path: Array<{ x: number; y: number }> = [];
  let current = { ...start };
  
  while (distance(current, end) > 1) {
    const dx = end.x - current.x;
    const dy = end.y - current.y;
    
    current = {
      x: current.x + Math.sign(dx),
      y: current.y + Math.sign(dy)
    };
    
    // Check for obstacles
    const key = `${Math.round(current.x)},${Math.round(current.y)}`;
    if (obstacles.has(key)) {
      // Simple avoidance: try perpendicular movement
      current = {
        x: current.x - Math.sign(dx),
        y: current.y
      };
    }
    
    path.push({ ...current });
    
    if (path.length > 100) break; // Prevent infinite loops
  }
  
  return path;
}
