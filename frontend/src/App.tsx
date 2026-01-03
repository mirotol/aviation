import React, { useState } from 'react';
import Cockpit from './components/cockpit/Cockpit';
import InfoPanel from './components/infopanel/InfoPanel';
import { PlaybackControls } from './components/playback/PlaybackControls';

import './App.css';

function App() {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#000',
        alignItems: 'stretch', // Ensures children fill the height
      }}
    >
      {/* The main flight deck area */}
      <div style={{ flexGrow: 1, display: 'flex', position: 'relative' }}>
        <Cockpit />

        {/* Floating Toggle Button */}
        <button
          onClick={() => setShowInfo((prev) => !prev)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            background: '#2e2e2e',
            border: '1px solid #444',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 100,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {showInfo ? 'Hide Telemetry' : 'Show Telemetry'}
        </button>
        <PlaybackControls />
      </div>

      {/* Side Data Panel */}
      {showInfo && (
        <aside
          style={{
            width: '350px',
            backgroundColor: '#1a1a1a',
            borderLeft: '2px solid #333',
            padding: '80px 24px 24px',
            overflowY: 'auto',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          }}
        >
          <InfoPanel />
        </aside>
      )}
    </div>
  );
}

export default App;
