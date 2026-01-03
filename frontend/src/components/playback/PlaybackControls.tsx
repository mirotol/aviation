import React, { useState } from 'react';
import './PlaybackControls.css';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatZuluTime } from '../../utils/timeUtils';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4, 8, 16];

export const PlaybackControls: React.FC = () => {
  const { snapshot, isPaused, speed, setPaused, setSpeed, seek, activeProvider } = useWebSocket();

  // Local state to prevent the slider from "snapping" back while dragging
  const [localPercentage, setLocalPercentage] = useState<number | null>(null);

  if (activeProvider !== 'recorded' && activeProvider !== 'simulated') {
    return null;
  }

  const hasProgress = snapshot?.progress;

  // Display the manual dragging position if active, otherwise follow the backend
  const displayPercentage =
    localPercentage !== null ? localPercentage : (snapshot?.progress?.percentage ?? 0);

  const startDrag = () => {
    if (snapshot?.progress) {
      setLocalPercentage(snapshot.progress.percentage);
    }
  };

  // Calculate the percentage string for CSS
  const progressPercent = (displayPercentage * 100).toFixed(2);

  return (
    <div className="playback-controls-container">
      {/* Timeline Section */}
      {hasProgress && (
        <div className="timeline-container">
          <span className="time-label">{formatZuluTime(snapshot.progress!.startTime)}</span>

          <div className="slider-wrapper">
            <div className="time-tooltip" style={{ left: `${progressPercent}%` }}>
              {formatZuluTime(snapshot.timestamp, snapshot.progress!.startTime)}
            </div>

            <input
              type="range"
              className="timeline-slider"
              style={{
                background: `linear-gradient(to right, #3498db ${progressPercent}%, #222 ${progressPercent}%)`,
              }}
              min="0"
              max="1"
              step="0.0001"
              value={displayPercentage}
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              onInput={(e) => setLocalPercentage(parseFloat(e.currentTarget.value))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                seek(val);
                setLocalPercentage(null);
              }}
            />
          </div>

          <span className="time-label">
            {formatZuluTime(snapshot.progress!.endTime, snapshot.progress!.startTime)}
          </span>
        </div>
      )}

      {/* Control Board */}
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
                {s}X
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
