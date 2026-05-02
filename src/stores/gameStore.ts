import { create } from 'zustand';
import type { GameState, Player, Unit, Building } from '../game/types';
import { gameTick } from '../game/gameLogic';

interface GameStore {
  gameState: GameState | null;
  selectedUnitIds: string[];
  selectedBuildingId: string | null;
  cameraPosition: { x: number; y: number };
  zoom: number;
  isPlaying: boolean;
  
  // Actions
  initializeGame: (playerCount?: number) => void;
  tick: () => void;
  selectUnits: (unitIds: string[]) => void;
  selectBuilding: (buildingId: string | null) => void;
  moveCamera: (dx: number, dy: number) => void;
  setZoom: (zoom: number) => void;
  togglePause: () => void;
  commandMove: (targetX: number, targetY: number) => void;
  commandGather: (resourceId: string) => void;
  commandAttack: (targetId: string) => void;
  trainUnit: (buildingId: string, unitType: string) => void;
  placeBuilding: (buildingType: string, x: number, y: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  selectedUnitIds: [],
  selectedBuildingId: null,
  cameraPosition: { x: 0, y: 0 },
  zoom: 1,
  isPlaying: false,
  
  initializeGame: (playerCount = 2) => {
    const { createInitialGameState } = require('../game/gameState');
    const initialState = createInitialGameState(playerCount);
    set({ 
      gameState: initialState,
      isPlaying: true,
      cameraPosition: { 
        x: 0, 
        y: 0 
      }
    });
  },
  
  tick: () => {
    const state = get().gameState;
    if (!state) return;
    
    const newState = gameTick(state);
    set({ gameState: newState });
  },
  
  selectUnits: (unitIds) => {
    set({ selectedUnitIds: unitIds, selectedBuildingId: null });
  },
  
  selectBuilding: (buildingId) => {
    set({ selectedBuildingId: buildingId, selectedUnitIds: [] });
  },
  
  moveCamera: (dx, dy) => {
    set((state) => ({
      cameraPosition: {
        x: state.cameraPosition.x + dx,
        y: state.cameraPosition.y + dy
      }
    }));
  },
  
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.5, Math.min(2, zoom)) });
  },
  
  togglePause: () => {
    const state = get().gameState;
    if (!state) return;
    
    set({
      gameState: {
        ...state,
        isPaused: !state.isPaused
      }
    });
  },
  
  commandMove: (targetX, targetY) => {
    const state = get().gameState;
    const { selectedUnitIds } = get();
    if (!state) return;
    
    const newUnits = new Map(state.units);
    
    selectedUnitIds.forEach((unitId, index) => {
      const unit = newUnits.get(unitId);
      if (unit) {
        // Spread out units when moving
        const offsetX = (index % 3) - 1;
        const offsetY = Math.floor(index / 3) - 1;
        
        unit.state = 'moving';
        unit.targetPosition = {
          x: targetX + offsetX,
          y: targetY + offsetY
        };
        unit.targetEntityId = undefined;
        unit.gatherTarget = undefined;
        
        newUnits.set(unitId, unit);
      }
    });
    
    set({
      gameState: {
        ...state,
        units: newUnits
      }
    });
  },
  
  commandGather: (resourceId) => {
    const state = get().gameState;
    const { selectedUnitIds } = get();
    if (!state) return;
    
    const newUnits = new Map(state.units);
    
    selectedUnitIds.forEach((unitId) => {
      const unit = newUnits.get(unitId);
      if (unit && unit.type === 'villager') {
        unit.state = 'gathering';
        unit.gatherTarget = resourceId;
        unit.targetEntityId = undefined;
        
        newUnits.set(unitId, unit);
      }
    });
    
    set({
      gameState: {
        ...state,
        units: newUnits
      }
    });
  },
  
  commandAttack: (targetId) => {
    const state = get().gameState;
    const { selectedUnitIds } = get();
    if (!state) return;
    
    const newUnits = new Map(state.units);
    
    selectedUnitIds.forEach((unitId) => {
      const unit = newUnits.get(unitId);
      if (unit) {
        unit.state = 'attacking';
        unit.targetEntityId = targetId;
        unit.targetPosition = undefined;
        unit.gatherTarget = undefined;
        
        newUnits.set(unitId, unit);
      }
    });
    
    set({
      gameState: {
        ...state,
        units: newUnits
      }
    });
  },
  
  trainUnit: (buildingId, unitType) => {
    const state = get().gameState;
    if (!state) return;
    
    const building = state.buildings.get(buildingId);
    if (!building) return;
    
    const player = state.players.get(building.owner);
    if (!player) return;
    
    const { UNIT_STATS, canAfford, payCost } = require('../game/constants');
    const stats = UNIT_STATS[unitType as keyof typeof UNIT_STATS];
    
    if (!stats || !canAfford(player, stats.cost)) {
      return;
    }
    
    payCost(player, stats.cost);
    building.productionQueue.push(unitType);
    
    const newBuildings = new Map(state.buildings);
    newBuildings.set(buildingId, building);
    
    set({
      gameState: {
        ...state,
        buildings: newBuildings
      }
    });
  },
  
  placeBuilding: (buildingType, x, y) => {
    const state = get().gameState;
    if (!state) return;
    
    const player = state.players.get(state.currentPlayer);
    if (!player) return;
    
    const { BUILDING_STATS, canAfford, payCost } = require('../game/constants');
    const stats = BUILDING_STATS[buildingType as keyof typeof BUILDING_STATS];
    
    if (!stats || !canAfford(player, stats.cost)) {
      return;
    }
    
    payCost(player, stats.cost);
    
    const newBuilding: Building = {
      id: Math.random().toString(36).substr(2, 9),
      type: buildingType,
      position: { x, y },
      width: 2,
      height: 2,
      health: stats.health,
      maxHealth: stats.health,
      owner: state.currentPlayer,
      productionQueue: [],
      progress: 0
    };
    
    const newBuildings = new Map(state.buildings);
    newBuildings.set(newBuilding.id, newBuilding);
    
    set({
      gameState: {
        ...state,
        buildings: newBuildings
      }
    });
  }
}));
