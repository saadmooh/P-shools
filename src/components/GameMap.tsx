import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { TILE_SIZE } from '../../game/constants';

const GameMap: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const cameraPosition = useGameStore((state) => state.cameraPosition);
  const zoom = useGameStore((state) => state.zoom);
  const selectedUnitIds = useGameStore((state) => state.selectedUnitIds);
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  
  const selectUnits = useGameStore((state) => state.selectUnits);
  const selectBuilding = useGameStore((state) => state.selectBuilding);
  const commandMove = useGameStore((state) => state.commandMove);
  const commandGather = useGameStore((state) => state.commandGather);
  const commandAttack = useGameStore((state) => state.commandAttack);
  
  // Auto-tick the game
  useEffect(() => {
    const tick = useGameStore.getState().tick;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Age of Empires Clone</h2>
          <p className="mb-4">Click "New Game" to start playing</p>
        </div>
      </div>
    );
  }
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - cameraPosition.x) / zoom;
    const clickY = (e.clientY - rect.top - cameraPosition.y) / zoom;
    
    const tileX = Math.floor(clickX / TILE_SIZE);
    const tileY = Math.floor(clickY / TILE_SIZE);
    
    // Check if clicking on a unit
    let clickedUnit: string | null = null;
    for (const [id, unit] of gameState.units) {
      const unitX = Math.floor(unit.position.x);
      const unitY = Math.floor(unit.position.y);
      if (unitX === tileX && unitY === tileY) {
        clickedUnit = id;
        break;
      }
    }
    
    // Check if clicking on a building
    let clickedBuilding: string | null = null;
    for (const [id, building] of gameState.buildings) {
      if (
        tileX >= building.position.x &&
        tileX < building.position.x + building.width &&
        tileY >= building.position.y &&
        tileY < building.position.y + building.height
      ) {
        clickedBuilding = id;
        break;
      }
    }
    
    // Check if clicking on a resource
    let clickedResource: string | null = null;
    for (const [id, resource] of gameState.resources) {
      const resX = Math.floor(resource.position.x);
      const resY = Math.floor(resource.position.y);
      if (resX === tileX && resY === tileY) {
        clickedResource = id;
        break;
      }
    }
    
    if (selectedUnitIds.length > 0 && !clickedUnit && !clickedBuilding) {
      // Command selected units to move
      commandMove(tileX, tileY);
    } else if (clickedUnit) {
      // Select unit
      selectUnits([clickedUnit]);
    } else if (clickedBuilding) {
      // Select building
      selectBuilding(clickedBuilding);
    } else if (clickedResource && selectedUnitIds.length > 0) {
      // Command villagers to gather
      commandGather(clickedResource);
    } else {
      // Deselect
      selectUnits([]);
      selectBuilding(null);
    }
  };
  
  // Render the game map
  const renderMap = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - 200; // Leave room for UI
    
    return (
      <canvas
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        className="bg-green-800 cursor-crosshair"
        style={{
          transform: `translate(${cameraPosition.x}px, ${cameraPosition.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      />
    );
  };
  
  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
      {renderMap()}
      
      {/* Mini-map overlay */}
      <div className="absolute bottom-4 right-4 w-32 h-32 bg-black border-2 border-gray-600 opacity-75">
        {/* Mini-map content would go here */}
      </div>
    </div>
  );
};

export default GameMap;
