import React, { useMemo, useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightData } from '../../hooks/useFlightData';
import './NavigationDisplay.css';

interface NavigationDisplayProps {
  initialRangeNM?: number;
}

const RANGES = [5, 10, 20, 40, 80, 160, 320];

const NavigationDisplay: React.FC<NavigationDisplayProps> = ({ initialRangeNM = 20 }) => {
  const snapshot = useFlightData();
  const [rangeIndex, setRangeIndex] = useState(RANGES.indexOf(initialRangeNM) || 2);
  const [brightness, setBrightness] = useState(75); // 100% is full bright (0% dimming), 0% is dark
  const rangeNM = RANGES[rangeIndex];

  const zoom = useMemo(() => {
    // Exact calculation for Web Mercator zoom vs Nautical Miles
    // At Zoom 0, the world is 21600nm wide.
    return Math.log2(21600 / rangeNM) - 1;
  }, [rangeNM]);

  const handleRangeChange = (delta: number) => {
    setRangeIndex((prev) => Math.min(Math.max(prev + delta, 0), RANGES.length - 1));
  };

  const handleBrightnessChange = (delta: number) => {
    // Finer 5% increments for professional brightness balancing
    setBrightness((prev) => Math.min(Math.max(prev + delta, 20), 100));
  };

  if (!snapshot) {
    return <div className="navigation-display">WAITING FOR GPS...</div>;
  }

  const { latitude, longitude } = snapshot.position;
  /**
   * BACKEND CONVENTION: 0-360 clockwise from North.
   * To achieve TRACK UP:
   * - Map bearing must be -track (rotates the world left when we turn right)
   * - Compass rotation must match the map bearing exactly.
   */
  const track = snapshot.attitude.yaw;
  const mapBearing = -track;

  const viewState = {
    latitude,
    longitude,
    zoom,
    bearing: mapBearing,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  };

  return (
    <div className="navigation-display">
      <Map
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        attributionControl={false}
      />

      <div
        className="map-dimmer"
        style={{ backgroundColor: `rgba(0, 0, 0, ${1 - brightness / 100})` }}
      />

      {/* Range Controls */}
      <div className="range-controls">
        <div className="control-group">
          <button onClick={() => handleRangeChange(-1)} disabled={rangeIndex === 0}>
            RNG −
          </button>
          <button onClick={() => handleRangeChange(1)} disabled={rangeIndex === RANGES.length - 1}>
            RNG +
          </button>
        </div>
        <div className="control-group">
          <button onClick={() => handleBrightnessChange(-5)}>BRT −</button>
          <button onClick={() => handleBrightnessChange(5)}>BRT +</button>
        </div>
      </div>

      {/* Modern SVG Compass Rose */}
      <svg className="compass-rose-svg" viewBox="0 0 500 500">
        <g
          style={{
            transform: `rotate(${mapBearing}deg)`,
            transformOrigin: '250px 250px',
            transition: 'transform 0.1s linear',
          }}
        >
          <circle cx="250" cy="250" r="220" className="compass-ring" />
          {[...Array(72)].map((_, i) => {
            const angle = i * 5;
            const isMajor = i % 6 === 0;
            const radius = 220;
            const length = isMajor ? 15 : 8;
            return (
              <line
                key={i}
                x1="250"
                y1={250 - radius}
                x2="250"
                y2={250 - radius + length}
                className={`compass-tick ${isMajor ? 'major' : ''}`}
                transform={`rotate(${angle}, 250, 250)`}
              />
            );
          })}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
            const labelRadius = 195;
            let label: string = (angle / 10).toString();
            let className = 'compass-label';
            if (angle === 0) {
              label = 'N';
              className += ' cardinal-label north-label';
            }
            if (angle === 90) {
              label = 'E';
              className += ' cardinal-label';
            }
            if (angle === 180) {
              label = 'S';
              className += ' cardinal-label';
            }
            if (angle === 270) {
              label = 'W';
              className += ' cardinal-label';
            }

            const x = 250 + labelRadius * Math.sin((angle * Math.PI) / 180);
            const y = 250 - labelRadius * Math.cos((angle * Math.PI) / 180);

            return (
              <text
                key={angle}
                x={x}
                y={y}
                className={className}
                style={{
                  // Counter-rotate the label so it stays upright relative to the screen
                  transform: `rotate(${-mapBearing}deg)`,
                  transformOrigin: `${x}px ${y}px`,
                  transition: 'transform 0.1s linear',
                }}
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Ownship Symbol */}
      <div className="ownship-symbol">
        <svg viewBox="0 0 24 24" fill="#00eeff" style={{ filter: 'drop-shadow(0 0 2px black)' }}>
          <path d="M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5L10,9L2,14L2,16L10,13.5L10,18L8,19.5L8,21L11.5,20L15,21L15,19.5L13,18L13,13.5L21,16Z" />
        </svg>
      </div>

      {/* GS and TRK Data Readouts */}
      <div className="map-overlay">
        <div className="stat">
          GS <span className="value">{Math.round(snapshot.airSpeed.speed)} KT</span>
        </div>
        <div className="stat">
          TRK <span className="value">{Math.round(track).toString().padStart(3, '0')}°</span>
        </div>
      </div>

      <div className="range-indicator">{rangeNM} NM</div>
    </div>
  );
};

export default NavigationDisplay;
