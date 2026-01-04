import React from 'react';
import { useFlightData } from '../../hooks/useFlightData';
import './AltimeterTape.css';

export default function AltimeterTape() {
  const snapshot = useFlightData();
  const altitude = snapshot?.altitude.altitude ?? 0;

  // Window: 600px - 45px (header) - 20px (footer) = 535px
  const tapeWindowHeight = 535;

  // Each 100 feet = 60 pixels on our tape
  const pixelsPerFoot = 0.6;
  const tapeOffset = altitude * pixelsPerFoot;

  // Optimization: Only render visible ticks (+/- 1000 feet around current altitude)
  const ticks = [];
  const minVisible = Math.max(0, Math.floor((altitude - 1000) / 100) * 100);
  const maxVisible = Math.floor((altitude + 1000) / 100) * 100;

  for (let i = minVisible; i <= maxVisible; i += 100) {
    ticks.push(i);
  }

  return (
    <div className="tape-container altimeter-tape-container">
      <div className="indicator-header">
        <span className="mode">ALT</span>
        <span className="unit">FT</span>
      </div>

      <div className="tape-window">
        <div
          className="tape-scale"
          style={{
            transform: `translateY(${tapeOffset}px)`,
            transition: 'transform 0.1s linear',
          }}
        >
          {ticks.map((t) => (
            <div key={t} className="tape-tick" style={{ bottom: `${t * pixelsPerFoot}px` }}>
              <div className="tick-line" />
              <span className="tick-label">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="readout-pointer">
        <div className="pointer-box">{altitude.toFixed(0)}</div>
      </div>
    </div>
  );
}
