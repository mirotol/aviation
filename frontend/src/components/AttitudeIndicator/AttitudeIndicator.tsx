import React from 'react';
import { useFlightData } from '../../hooks/useFlightData';
import './AttitudeIndicator.css';

const RADIUS = 220;
const TICK_MAX_ANGLE = 60;
const ARC_EXTENSION = 0.27;

export default function AttitudeIndicator() {
  const snapshot = useFlightData();
  const pitch = snapshot?.attitude.pitch ?? 0;
  const roll = snapshot?.attitude.roll ?? 0;

  // Helper to convert polar angles to SVG coordinates
  const getCoords = (angleInDegrees: number) => {
    const rad = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: RADIUS * Math.cos(rad),
      y: RADIUS * Math.sin(rad),
    };
  };

  const startCoords = getCoords(-TICK_MAX_ANGLE - ARC_EXTENSION);
  const endCoords = getCoords(TICK_MAX_ANGLE + ARC_EXTENSION);

  const arcPath = `M ${startCoords.x} ${startCoords.y} A ${RADIUS} ${RADIUS} 0 0 1 ${endCoords.x} ${endCoords.y}`;

  const pitchPixelsPerDegree = 16; // Was 10
  const pitchOffset = pitch * pitchPixelsPerDegree;

  // Every 5 degrees from -30 to 30
  const pitchMarkers = [];
  for (let i = 45; i >= -45; i -= 5) {
    if (i !== 0) pitchMarkers.push(i);
  }

  const rollTicks = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];

  return (
    <div className="attitude-container">
      {/* The Horizon and Pitch Ladder (Rotates and Slides) */}
      <div
        className="horizon-layer"
        style={{
          transform: `rotate(${-roll}deg) translateY(${pitchOffset}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        <div className="sky" />
        <div className="ground" />
        <div className="horizon-line" />

        {/* Pitch Ladder */}
        <div className="pitch-ladder">
          {pitchMarkers.map((deg) => {
            const isMajor = deg % 10 === 0;
            const type = isMajor ? 'major' : 'mid';

            return (
              <div
                key={deg}
                className={`pitch-line ${type}`}
                style={{ top: `${-deg * pitchPixelsPerDegree}px` }}
              >
                <div className="pitch-line-content">
                  {isMajor && <span className="line-label left">{Math.abs(deg)}</span>}
                  <div className={`line-bar-container ${isMajor ? 'major' : ''}`}>
                    {isMajor && <div className="line-bar-tick left" />}
                    <div className="line-bar" />
                    {isMajor && <div className="line-bar-tick right" />}
                  </div>
                  {isMajor && <span className="line-label right">{Math.abs(deg)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="roll-scale">
        <svg className="roll-scale-svg" viewBox="-300 -300 600 600">
          <path className="roll-arc-path" d={arcPath} fill="none" strokeWidth="2" />

          {/* Scaled Static White Center Triangle - Positioned above the arc */}
          <polygon points="-15,-240 0,-220 15,-240" className="zero-index-triangle" />

          {/* Scaled Moving Yellow Sky Pointer & Slip/Skid Bar */}
          <g transform={`rotate(${-roll})`} style={{ transition: 'transform 0.1s linear' }}>
            {/* Sky Pointer Triangle */}
            <polygon
              points="-15,-200 0,-215 15,-200"
              fill="var(--instrument-yellow)"
              className="sky-pointer-triangle"
              stroke="black"
              strokeWidth="1"
            />
            {/* Slip/Skid Bar (Trapezoid) - G1000 style */}
            <polygon
              points="-18,-195 18,-195 14,-185 -14,-185"
              fill="white"
              stroke="black"
              strokeWidth="1"
              className="slip-skid-bar"
            />
          </g>

          {rollTicks.map((deg) => {
            if (deg === 0) return null;
            const isMajor = Math.abs(deg) === 30 || Math.abs(deg) === 60;
            const length = isMajor ? 25 : 12;
            const coords = getCoords(deg);
            const rad = ((deg - 90) * Math.PI) / 180;

            return (
              <line
                key={deg}
                className={`roll-tick-line ${isMajor ? 'major' : ''}`}
                x1={coords.x}
                y1={coords.y}
                x2={(RADIUS + length) * Math.cos(rad)}
                y2={(RADIUS + length) * Math.sin(rad)}
                strokeWidth={isMajor ? 3 : 1.5}
              />
            );
          })}
        </svg>
      </div>

      <div className="aircraft-symbol">
        <svg viewBox="0 0 200 60" className="aircraft-svg">
          {/* Central Dot */}
          <circle
            cx="100"
            cy="30"
            r="3"
            fill="var(--instrument-yellow)"
            stroke="black"
            strokeWidth="1"
          />
          {/* Left Wing */}
          <path d="M 10 30 L 75 30 L 75 42 L 70 42 L 70 34 L 10 34 Z" className="aircraft-shape" />
          {/* Right Wing */}
          <path
            d="M 190 30 L 125 30 L 125 42 L 130 42 L 130 34 L 190 34 Z"
            className="aircraft-shape"
          />
        </svg>
      </div>
    </div>
  );
}
