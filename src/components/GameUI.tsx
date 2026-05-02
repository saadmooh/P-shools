import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { UNIT_TYPES, BUILDING_TYPES, UNIT_STATS, BUILDING_STATS } from '../game/constants';

const GameUI: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const selectedUnitIds = useGameStore((state) => state.selectedUnitIds);
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  const isPlaying = useGameStore((state) => state.isPlaying);
  const isPaused = useGameStore((state) => state.gameState?.isPaused || false);
  
  const initializeGame = useGameStore((state) => state.initializeGame);
  const togglePause = useGameStore((state) => state.togglePause);
  const trainUnit = useGameStore((state) => state.trainUnit);
  const selectUnits = useGameStore((state) => state.selectUnits);
  
  // Get current player resources
  const currentPlayer = gameState?.players.get(gameState.currentPlayer);
  
  // Get selected units
  const selectedUnits = selectedUnitIds
    .map(id => gameState?.units.get(id))
    .filter(Boolean);
  
  // Get selected building
  const selectedBuilding = selectedBuildingId 
    ? gameState?.buildings.get(selectedBuildingId) 
    : null;
  
  if (!isPlaying) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Age of Empires Clone</h1>
          <button
            onClick={() => initializeGame(2)}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold"
          >
            New Game
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-50">
      {/* Top bar with resources */}
      <div className="bg-gray-900 px-4 py-2 flex justify-between items-center">
        <div className="flex space-x-6">
          {currentPlayer && (
            <>
              <span className="text-yellow-400">
                🍖 Food: {currentPlayer.resources.food || 0}
              </span>
              <span className="text-green-400">
                🌲 Wood: {currentPlayer.resources.wood || 0}
              </span>
              <span className="text-yellow-500">
                💰 Gold: {currentPlayer.resources.gold || 0}
              </span>
              <span className="text-gray-400">
                🪨 Stone: {currentPlayer.resources.stone || 0}
              </span>
              <span className="text-blue-400">
                👥 Population: {currentPlayer.population}/{currentPlayer.maxPopulation}
              </span>
            </>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={togglePause}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <span className="px-4 py-1">
            Tick: {gameState?.gameTick || 0}
          </span>
        </div>
      </div>
      
      {/* Action panel */}
      <div className="p-4 flex space-x-4">
        {/* Unit actions */}
        {selectedUnits.length > 0 && (
          <div className="bg-gray-700 p-3 rounded">
            <h3 className="font-bold mb-2">Selected Units ({selectedUnits.length})</h3>
            <div className="flex space-x-2">
              {selectedUnits[0]?.type === UNIT_TYPES.VILLAGER && (
                <>
                  <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                    Build House
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                    Build Farm
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                    Build Mine
                  </button>
                </>
              )}
              <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                Attack (A)
              </button>
              <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                    Stop (S)
              </button>
            </div>
          </div>
        )}
        
        {/* Building actions */}
        {selectedBuilding && (
          <div className="bg-gray-700 p-3 rounded">
            <h3 className="font-bold mb-2">
              {selectedBuilding.type.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <div className="mb-2">
              <div className="w-48 bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${selectedBuilding.progress}%` }}
                />
              </div>
              <span className="text-xs">
                HP: {selectedBuilding.health}/{selectedBuilding.maxHealth}
              </span>
            </div>
            
            {/* Production queue */}
            {selectedBuilding.type === BUILDING_TYPES.TOWN_CENTER && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">Train Units:</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => trainUnit(selectedBuilding.id, UNIT_TYPES.VILLAGER)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                    disabled={!canAffordUnit(UNIT_TYPES.VILLAGER, currentPlayer)}
                  >
                    Villager (50🍖)
                  </button>
                </div>
              </div>
            )}
            
            {selectedBuilding.type === BUILDING_TYPES.BARRACKS && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">Train Units:</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => trainUnit(selectedBuilding.id, UNIT_TYPES.MILITIA)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                    disabled={!canAffordUnit(UNIT_TYPES.MILITIA, currentPlayer)}
                  >
                    Militia (60🍖, 20💰)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Build menu */}
        {!selectedBuilding && selectedUnits.some(u => u?.type === UNIT_TYPES.VILLAGER) && (
          <div className="bg-gray-700 p-3 rounded">
            <h3 className="font-bold mb-2">Build</h3>
            <div className="flex space-x-2">
              <button className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded text-sm">
                House (25🌲)
              </button>
              <button className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded text-sm">
                Farm (60🌲)
              </button>
              <button className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded text-sm">
                Lumber Camp (75🌲)
              </button>
              <button className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded text-sm">
                Mine (100🌲)
              </button>
              <button className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded text-sm">
                Barracks (175🌲, 50🪨)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function canAffordUnit(unitType: string, player: any): boolean {
  if (!player) return false;
  const stats = UNIT_STATS[unitType as keyof typeof UNIT_STATS];
  if (!stats || !stats.cost) return false;
  
  for (const [resource, amount] of Object.entries(stats.cost)) {
    if ((player.resources[resource] || 0) < amount) {
      return false;
    }
  }
  return true;
}

export default GameUI;
