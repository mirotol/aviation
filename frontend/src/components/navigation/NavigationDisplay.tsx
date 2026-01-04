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
  const rangeNM = RANGES[rangeIndex];

  const zoom = useMemo(() => {
    // Exact calculation for Web Mercator zoom vs Nautical Miles
    // At Zoom 0, the world is 21600nm wide.
    return Math.log2(21600 / rangeNM) - 1;
  }, [rangeNM]);

  const handleRangeChange = (delta: number) => {
    setRangeIndex(prev => Math.min(Math.max(prev + delta, 0), RANGES.length - 1));
  };

  if (!snapshot) {
    return <div className="navigation-display">WAITING FOR GPS...</div>;
  }

  const { latitude, longitude } = snapshot.position;
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

      {/* Range Controls (Replacing standard Zoom) */}
      <div className="range-controls">
        <button onClick={() => handleRangeChange(-1)} disabled={rangeIndex === 0}>RNG −</button>
        <button onClick={() => handleRangeChange(1)} disabled={rangeIndex === RANGES.length - 1}>RNG +</button>
      </div>

      {/* Compass Rose Overlay */}
      <div
        className="compass-rose"
        style={{ transform: `translate(-50%, -50%) rotate(${mapBearing}deg)` }}
      >
        <div className="cardinal north">N</div>
        <div className="cardinal east">E</div>
        <div className="cardinal south">S</div>
        <div className="cardinal west">W</div>
        <div className="tick-marks">
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className="tick"
              style={{ transform: `rotate(${i * 10}deg) translateY(-225px)` }}
            />
          ))}
        </div>
      </div>

      {/* Ownship Symbol - Stays fixed in center */}
      <div className="ownship-symbol">
        <svg viewBox="0 0 24 24" fill="#00eeff" style={{ filter: 'drop-shadow(0 0 2px black)' }}>
          <path d="M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5L10,9L2,14L2,16L10,13.5L10,18L8,19.5L8,21L11.5,20L15,21L15,19.5L13,18L13,13.5L21,16Z" />
        </svg>
      </div>

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
