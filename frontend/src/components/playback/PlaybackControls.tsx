import React from 'react';
import './PlaybackControls.css';
import { useWebSocket } from '../../contexts/WebSocketContext';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4, 8, 16];

export const PlaybackControls: React.FC = () => {
  const { isPaused, speed, setPaused, setSpeed, activeProvider } = useWebSocket();

  // Show playback controls for recorded and simulated providers
  if (activeProvider !== 'recorded' && activeProvider !== 'simulated') {
    return null;
  }

  return (
    <div className="playback-controls-container">
      <div className="playback-card">
        <button
          className={`control-btn play-pause ${isPaused ? 'is-paused' : 'is-playing'}`}
          onClick={() => setPaused(!isPaused)}
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          <span className="icon">{isPaused ? '▶' : '||'}</span>
        </button>

        <div className="divider" />

        <div className="speed-selector">
          <span className="speed-label">Simulation Speed</span>
          <div className="speed-options">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                className={`speed-btn ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
