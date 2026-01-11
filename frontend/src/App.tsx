import React, { useState } from 'react';
import Cockpit from './components/cockpit/Cockpit';
import InfoPanel from './components/infopanel/InfoPanel';
import { PlaybackControls } from './components/playback/PlaybackControls';

import './App.css';

function App() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="app-container">
      <div className="main-flight-deck">
        <Cockpit />
        <button
          className={`telemetry-toggle ${showInfo ? 'active' : ''}`}
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {showInfo ? 'DATA LINK: ENGAGED' : 'DATA LINK: STANDBY'}
        </button>
        <PlaybackControls />
        <aside className={`side-data-panel ${showInfo ? 'open' : ''}`}>
          <InfoPanel />
        </aside>
      </div>
    </div>
  );
}

export default App;
