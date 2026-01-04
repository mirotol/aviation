import React from 'react';
import { useFlightData } from '../../hooks/useFlightData';
import './AirSpeedTape.css';

export default function AirSpeedTape() {
  const snapshot = useFlightData();
  const speed = snapshot?.airSpeed.speed ?? 0;

  // Each 10 knots = 60 pixels on our larger tape
  const pixelsPerKnot = 6;
  const tapeOffset = speed * pixelsPerKnot;

  // Generate tick marks (e.g., from 0 to 300 knots)
  const ticks = [];
  for (let i = 0; i <= 800; i += 10) {
    ticks.push(i);
  }

  return (
    <div className="tape-container airspeed-tape-container">
      <div className="indicator-header">
        <span className="mode">IAS</span>
        <span className="unit">KT</span>
      </div>
      <div className="tape-window">
        <div className="tape-scale" style={{ transform: `translateY(${tapeOffset}px)` }}>
          {ticks.map((t) => (
            <div key={t} className="tape-tick" style={{ bottom: `${t * pixelsPerKnot}px` }}>
              <span className="tick-label">{t}</span>
              <div className="tick-line" />
            </div>
          ))}
        </div>
      </div>
      <div className="readout-pointer">
        <div className="pointer-box">{speed.toFixed(0)}</div>
      </div>
    </div>
  );
}
