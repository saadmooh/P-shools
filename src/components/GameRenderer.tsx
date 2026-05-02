import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { TILE_SIZE, TERRAIN_TYPES, UNIT_TYPES, BUILDING_TYPES } from '../game/constants';

const GameRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameStore((state) => state.gameState);
  const cameraPosition = useGameStore((state) => state.cameraPosition);
  const zoom = useGameStore((state) => state.zoom);
  const selectedUnitIds = useGameStore((state) => state.selectedUnitIds);
  const selectedBuildingId = useGameStore((state) => state.selectedBuildingId);
  
  const selectUnits = useGameStore((state) => state.selectUnits);
  const selectBuilding = useGameStore((state) => state.selectBuilding);
  const commandMove = useGameStore((state) => state.commandMove);
  const commandGather = useGameStore((state) => state.commandGather);
  
  // Handle keyboard input for camera movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 20 / zoom;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          useGameStore.getState().moveCamera(0, speed);
          break;
        case 'ArrowDown':
        case 's':
          useGameStore.getState().moveCamera(0, -speed);
          break;
        case 'ArrowLeft':
        case 'a':
          useGameStore.getState().moveCamera(speed, 0);
          break;
        case 'ArrowRight':
        case 'd':
          useGameStore.getState().moveCamera(-speed, 0);
          break;
        case '+':
        case '=':
          useGameStore.getState().setZoom(zoom + 0.1);
          break;
        case '-':
          useGameStore.getState().setZoom(zoom - 0.1);
          break;
        case ' ':
          useGameStore.getState().togglePause();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom]);
  
  // Render game state to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#1a472a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(cameraPosition.x, cameraPosition.y);
    ctx.scale(zoom, zoom);
    
    // Calculate visible area
    const visibleStartX = Math.max(0, -cameraPosition.x / zoom);
    const visibleStartY = Math.max(0, -cameraPosition.y / zoom);
    const visibleEndX = Math.min(
      gameState.terrain[0].length,
      (canvas.width - cameraPosition.x) / zoom
    );
    const visibleEndY = Math.min(
      gameState.terrain.length,
      (canvas.height - cameraPosition.y) / zoom
    );
    
    // Draw terrain
    for (let y = Math.floor(visibleStartY); y < visibleEndY; y++) {
      for (let x = Math.floor(visibleStartX); x < visibleEndX; x++) {
        const tile = gameState.terrain[y][x];
        const screenX = x * TILE_SIZE;
        const screenY = y * TILE_SIZE;
        
        switch (tile.type) {
          case TERRAIN_TYPES.GRASS:
            ctx.fillStyle = '#4a8c3a';
            break;
          case TERRAIN_TYPES.FOREST:
            ctx.fillStyle = '#2d5a1d';
            break;
          case TERRAIN_TYPES.MOUNTAIN:
            ctx.fillStyle = '#6b6b6b';
            break;
          case TERRAIN_TYPES.WATER:
            ctx.fillStyle = '#3b7ea8';
            break;
          default:
            ctx.fillStyle = '#4a8c3a';
        }
        
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        
        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }
    
    // Draw resources
    for (const [id, resource] of gameState.resources) {
      const screenX = resource.position.x * TILE_SIZE;
      const screenY = resource.position.y * TILE_SIZE;
      
      switch (resource.type) {
        case 'wood':
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.arc(screenX + TILE_SIZE/2, screenY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'gold':
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(screenX + 8, screenY + 8, TILE_SIZE - 16, TILE_SIZE - 16);
          break;
        case 'stone':
          ctx.fillStyle = '#808080';
          ctx.beginPath();
          ctx.arc(screenX + TILE_SIZE/2, screenY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'food':
          ctx.fillStyle = '#FF69B4';
          ctx.beginPath();
          ctx.arc(screenX + TILE_SIZE/2, screenY + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    }
    
    // Draw buildings
    for (const [id, building] of gameState.buildings) {
      const screenX = building.position.x * TILE_SIZE;
      const screenY = building.position.y * TILE_SIZE;
      const width = building.width * TILE_SIZE;
      const height = building.height * TILE_SIZE;
      
      const player = gameState.players.get(building.owner);
      ctx.fillStyle = player?.color || '#888';
      ctx.fillRect(screenX, screenY, width, height);
      
      // Building border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, width, height);
      
      // Health bar
      const healthPercent = building.health / building.maxHealth;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(screenX, screenY - 8, width, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(screenX, screenY - 8, width * healthPercent, 4);
      
      // Production progress
      if (building.productionQueue.length > 0) {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(screenX, screenY + height + 4, width * (building.progress / 100), 2);
      }
    }
    
    // Draw units
    for (const [id, unit] of gameState.units) {
      const screenX = unit.position.x * TILE_SIZE;
      const screenY = unit.position.y * TILE_SIZE;
      const isSelected = selectedUnitIds.includes(id);
      
      const player = gameState.players.get(unit.owner);
      
      // Unit circle
      ctx.fillStyle = player?.color || '#888';
      ctx.beginPath();
      ctx.arc(screenX + TILE_SIZE/2, screenY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
      ctx.fill();
      
      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX + TILE_SIZE/2, screenY + TILE_SIZE/2, TILE_SIZE/2, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Unit type indicator
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let icon = '⚔️';
      if (unit.type === UNIT_TYPES.VILLAGER) icon = '👷';
      else if (unit.type === UNIT_TYPES.SCOUT) icon = '🐎';
      
      ctx.fillText(icon, screenX + TILE_SIZE/2, screenY + TILE_SIZE/2);
      
      // Health bar
      const healthPercent = unit.health / unit.maxHealth;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(screenX, screenY - 4, TILE_SIZE, 3);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(screenX, screenY - 4, TILE_SIZE * healthPercent, 3);
    }
    
    ctx.restore();
  }, [gameState, cameraPosition, zoom, selectedUnitIds]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
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
      commandMove(tileX, tileY);
    } else if (clickedUnit) {
      selectUnits([clickedUnit]);
    } else if (clickedBuilding) {
      selectBuilding(clickedBuilding);
    } else if (clickedResource && selectedUnitIds.length > 0) {
      commandGather(clickedResource);
    } else {
      selectUnits([]);
      selectBuilding(null);
    }
  };
  
  if (!gameState) {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight - 200}
      onClick={handleCanvasClick}
      className="cursor-crosshair"
    />
  );
};

export default GameRenderer;
