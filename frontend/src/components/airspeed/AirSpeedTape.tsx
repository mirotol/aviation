import React from 'react';
import { useFlightData } from '../../hooks/useFlightData';
import './AirSpeedTape.css';

export default function AirSpeedTape() {
  const snapshot = useFlightData();
  const speed = snapshot?.airSpeed.speed ?? 0;

  // Update window height to match the new 600px total height minus the header/footer
  // Header: 45px, Footer: 20px -> Window: 535px
  const tapeWindowHeight = 535;

  // Each 10 knots = 60 pixels on our larger tape
  const pixelsPerKnot = 6;
  const tapeOffset = speed * pixelsPerKnot;

  // Optimization: Only render visible ticks (+/- 60 knots around current speed)
  const ticks = [];
  const minVisible = Math.max(0, Math.floor((speed - 60) / 10) * 10);
  const maxVisible = Math.floor((speed + 60) / 10) * 10;

  for (let i = minVisible; i <= maxVisible; i += 10) {
    ticks.push(i);
  }

  return (
    <div className="tape-container airspeed-tape-container">
      <div className="indicator-header">
        <span className="mode">IAS</span>
        <span className="unit">KT</span>
      </div>
      <div className="tape-window">
        {/* Added transition for buttery smooth movement */}
        <div
          className="tape-scale"
          style={{
            transform: `translateY(${tapeOffset}px)`,
            transition: 'transform 0.1s linear',
          }}
        >
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
