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

  // Every 2.5 degrees from -30 to 30
  const pitchMarkers = [];
  for (let i = 30; i >= -30; i -= 2.5) {
    if (i !== 0) pitchMarkers.push(i);
  }

  const rollTicks = [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60];

  return (
    <div className="attitude-container">
      {/* The Horizon and Pitch Ladder (Rotates and Slides) */}
      <div
        className="horizon-layer"
        style={{
          transform: `rotate(${-roll}deg) translateY(${pitchOffset}px)`,
          transition: 'transform 0.1s linear' // Add this
        }}
      >
        <div className="sky" />
        <div className="ground" />
        <div className="horizon-line" />

        {/* Pitch Ladder */}
        <div className="pitch-ladder">
          {pitchMarkers.map((deg) => {
            const isMajor = deg % 10 === 0;
            const isMid = deg % 5 === 0 && !isMajor;
            const type = isMajor ? 'major' : isMid ? 'mid' : 'minor';

            return (
              <div
                key={deg}
                className={`pitch-line ${type}`}
                style={{ top: `${-deg * pitchPixelsPerDegree}px` }}
              >
                <div className="pitch-line-content">
                  {isMajor && <span className="line-label left">{Math.abs(deg)}</span>}
                  <div className="line-bar" />
                  {isMajor && <span className="line-label right">{Math.abs(deg)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="roll-scale">
        <svg className="roll-scale-svg" viewBox="-300 -300 600 600">
          <path className="roll-arc-path" d={arcPath} fill="none" strokeWidth="3" />

          {/* Scaled Static White Center Triangle */}
          <polygon points="-15,-240 0,-220 15,-240" className="zero-index-triangle" />

          {/* Scaled Moving Yellow Sky Pointer */}
          <g transform={`rotate(${-roll})`} style={{ transition: 'transform 0.1s linear' }}>
            <polygon
              points="-15,-200 0,-215 15,-200"
              fill="none"
              className="sky-pointer-triangle"
              strokeWidth="3"
            />
          </g>

          {rollTicks.map((deg) => {
            const isMajor = Math.abs(deg) === 30;
            const length = isMajor ? 30 : 15;
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
                strokeWidth={isMajor ? 4 : 2}
              />
            );
          })}
        </svg>
      </div>

      <div className="aircraft-symbol">
        <div className="wing-left" />
        <div className="center-dot" />
        <div className="wing-right" />
      </div>
    </div>
  );
}
