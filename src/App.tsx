import React, { Suspense, lazy } from 'react';
import GameUI from './components/GameUI';
import GameRenderer from './components/GameRenderer';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }>
        <GameUI />
        <GameRenderer />
      </Suspense>
    </div>
  );
}

export default App;
