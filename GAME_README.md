# Age of Empires Clone - Web-Based RTS Game

A web-based real-time strategy (RTS) game inspired by Age of Empires, built with React, TypeScript, and Vite.

## Features

### Core Gameplay
- **Resource Management**: Gather food, wood, gold, and stone
- **Base Building**: Construct various buildings (Town Center, Houses, Barracks, Farms, Mines, etc.)
- **Unit Production**: Train villagers, scouts, and military units
- **Combat System**: Attack enemy units and buildings
- **Terrain System**: Multiple terrain types affecting movement and resource placement

### Game Mechanics
- Population system limiting unit count
- Resource gathering by villagers
- Building construction and unit production queues
- Unit selection and group commands
- Camera controls (WASD/Arrow keys + Zoom)
- Real-time game simulation with pause functionality

### Controls
- **Left Click**: Select units/buildings or command movement
- **WASD / Arrow Keys**: Move camera
- **+/-**: Zoom in/out
- **Space**: Pause/Resume game
- **Right Click**: Context-sensitive actions (move, gather, attack)

## Project Structure

```
src/
├── game/
│   ├── constants.ts      # Game configuration and stats
│   ├── types.ts          # TypeScript interfaces
│   ├── gameState.ts      # Initial state generation
│   └── gameLogic.ts      # Core game mechanics
├── components/
│   ├── GameRenderer.tsx  # Canvas-based game rendering
│   └── GameUI.tsx        # User interface overlay
├── stores/
│   └── gameStore.ts      # Zustand state management
└── utils/
    └── helpers.ts        # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

1. Click "New Game" to start
2. Select your villagers (click on them)
3. Command villagers to gather resources:
   - Click on trees for wood
   - Click on gold/stone deposits for mining
   - Click on berry bushes for food
4. Build structures:
   - Houses increase population limit
   - Town Center produces villagers
   - Barracks trains military units
   - Farms provide passive food income
5. Train an army and defeat your opponent!

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **HTML5 Canvas** - Game rendering
- **Tailwind CSS** - Styling

## Game Units

### Villager
- Cost: 50 Food
- Role: Resource gathering and building construction
- Weak combat capabilities

### Scout
- Cost: 60 Food, 30 Wood
- Role: Fast reconnaissance
- Moderate combat strength

### Militia
- Cost: 60 Food, 20 Gold
- Role: Basic military unit
- Good combat strength

## Buildings

- **Town Center**: Produces villagers, acts as main base
- **House**: Increases population capacity (+5)
- **Barracks**: Trains military units
- **Farm**: Generates food over time
- **Lumber Camp**: Enables wood gathering
- **Mine**: Enables gold/stone mining

## Development

### Adding New Units
1. Add unit type to `UNIT_TYPES` in `constants.ts`
2. Define stats in `UNIT_STATS`
3. Add production logic in relevant buildings
4. Update UI components to show new unit

### Adding New Buildings
1. Add building type to `BUILDING_TYPES` in `constants.ts`
2. Define stats in `BUILDING_STATS`
3. Implement building-specific logic in `gameLogic.ts`
4. Add to build menu in `GameUI.tsx`

### Modifying Game Balance
Edit values in `src/game/constants.ts`:
- Unit costs and stats
- Building costs and health
- Resource gathering rates
- Game speed settings

## Future Enhancements

- [ ] Multiplayer support
- [ ] More civilizations with unique bonuses
- [ ] Advanced AI opponents
- [ ] Additional unit types and upgrades
- [ ] Sound effects and music
- [ ] Improved pathfinding algorithm
- [ ] Mini-map navigation
- [ ] Save/Load game functionality
- [ ] Scenario editor

## License

MIT License - Feel free to use this project for learning or as a base for your own games!

## Acknowledgments

Inspired by the classic Age of Empires series by Ensemble Studios.
