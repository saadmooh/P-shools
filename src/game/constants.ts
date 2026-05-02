// Game Constants
export const TILE_SIZE = 32;
export const MAP_WIDTH = 50;
export const MAP_HEIGHT = 50;

// Resource types
export const RESOURCE_TYPES = {
  FOOD: 'food',
  WOOD: 'wood',
  GOLD: 'gold',
  STONE: 'stone'
} as const;

// Unit types
export const UNIT_TYPES = {
  VILLAGER: 'villager',
  SCOUT: 'scout',
  MILITIA: 'militia'
} as const;

// Building types
export const BUILDING_TYPES = {
  TOWN_CENTER: 'townCenter',
  HOUSE: 'house',
  BARRACKS: 'barracks',
  FARM: 'farm',
  MINE: 'mine',
  LUMBER_CAMP: 'lumberCamp'
} as const;

// Game speeds (ms per tick)
export const GAME_SPEED = {
  NORMAL: 1000,
  FAST: 500,
  SLOW: 2000
};

// Unit stats
export const UNIT_STATS = {
  [UNIT_TYPES.VILLAGER]: {
    health: 25,
    attack: 3,
    range: 1,
    speed: 4,
    cost: { [RESOURCE_TYPES.FOOD]: 50 }
  },
  [UNIT_TYPES.SCOUT]: {
    health: 45,
    attack: 4,
    range: 1,
    speed: 8,
    cost: { [RESOURCE_TYPES.FOOD]: 60, [RESOURCE_TYPES.WOOD]: 30 }
  },
  [UNIT_TYPES.MILITIA]: {
    health: 60,
    attack: 8,
    range: 1,
    speed: 3,
    cost: { [RESOURCE_TYPES.FOOD]: 60, [RESOURCE_TYPES.GOLD]: 20 }
  }
};

// Building stats
export const BUILDING_STATS = {
  [BUILDING_TYPES.TOWN_CENTER]: {
    health: 1000,
    cost: { [RESOURCE_TYPES.WOOD]: 275, [RESOURCE_TYPES.STONE]: 100 },
    buildTime: 60,
    population: 5
  },
  [BUILDING_TYPES.HOUSE]: {
    health: 400,
    cost: { [RESOURCE_TYPES.WOOD]: 25 },
    buildTime: 20,
    population: 5
  },
  [BUILDING_TYPES.BARRACKS]: {
    health: 600,
    cost: { [RESOURCE_TYPES.WOOD]: 175, [RESOURCE_TYPES.STONE]: 50 },
    buildTime: 40,
    population: 0
  },
  [BUILDING_TYPES.FARM]: {
    health: 200,
    cost: { [RESOURCE_TYPES.WOOD]: 60 },
    buildTime: 15,
    foodCapacity: 500
  },
  [BUILDING_TYPES.MINE]: {
    health: 300,
    cost: { [RESOURCE_TYPES.WOOD]: 100 },
    buildTime: 20,
    resourceType: RESOURCE_TYPES.GOLD
  },
  [BUILDING_TYPES.LUMBER_CAMP]: {
    health: 300,
    cost: { [RESOURCE_TYPES.WOOD]: 75 },
    buildTime: 20,
    resourceType: RESOURCE_TYPES.WOOD
  }
};

// Terrain types
export const TERRAIN_TYPES = {
  GRASS: 'grass',
  FOREST: 'forest',
  WATER: 'water',
  MOUNTAIN: 'mountain',
  GOLD_MINE: 'goldMine',
  STONE_MINE: 'stoneMine',
  BERRY_BUSH: 'berryBush'
} as const;
