import React, { useMemo, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightData } from '../../hooks/useFlightData';
import { useNearbyNavData } from '../../hooks/useNearbyNavData';
import './NavigationDisplay.css';

interface NavigationDisplayProps {
  initialRangeNM?: number;
}

const RANGES = [5, 10, 20, 40, 80, 160, 320];

const NavigationDisplay: React.FC<NavigationDisplayProps> = ({ initialRangeNM = 20 }) => {
  const snapshot = useFlightData();
  const [rangeIndex, setRangeIndex] = useState(RANGES.indexOf(initialRangeNM) || 2);
  const [brightness, setBrightness] = useState(75);
  const rangeNM = RANGES[rangeIndex];

  const navData = useNearbyNavData(Math.max(rangeNM, 100));

  const zoom = useMemo(() => {
    return Math.log2(21600 / rangeNM) - 1;
  }, [rangeNM]);

  const handleRangeChange = (delta: number) => {
    setRangeIndex((prev) => Math.min(Math.max(prev + delta, 0), RANGES.length - 1));
  };

  const handleBrightnessChange = (delta: number) => {
    setBrightness((prev) => Math.min(Math.max(prev + delta, 20), 100));
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

  // Read CSS variables in TS
  const getCssVar = (varName: string): string =>
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

  // Mapbox colors
  const largeAirportColor = getCssVar('--large-airport-color');
  const vorColor = getCssVar('--vor-color');
  const defaultWaypointColor = getCssVar('--default-waypoint-color');
  const strokeColor = getCssVar('--waypoint-stroke-color');
  const labelColor = getCssVar('--waypoint-label-color');
  const labelHalo = getCssVar('--waypoint-label-halo');

  return (
    <div className="navigation-display">
      <Map
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        attributionControl={false}
      >
        {navData && (
          <Source id="navdata" type="geojson" data={navData}>
            <Layer
              id="waypoint-icons"
              type="circle"
              paint={{
                'circle-radius': 5,
                'circle-color': [
                  'case',
                  ['all', ['in', 'airport', ['get', 'type']]],
                  largeAirportColor,
                  ['==', ['get', 'type'], 'VOR'],
                  vorColor,
                  defaultWaypointColor,
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': strokeColor,
              }}
            />

            <Layer
              id="waypoint-labels"
              type="symbol"
              layout={{
                'text-field': ['get', 'ident'],
                'text-size': 15,
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                'text-letter-spacing': 0.1,
                'text-offset': [0, 1.2],
                'text-anchor': 'top',
                'text-padding': 2,
                'text-allow-overlap': false,
              }}
              paint={{
                'text-color': labelColor,
                'text-halo-color': labelHalo,
                'text-halo-width': 3,
                'text-halo-blur': 1,
              }}
            />
          </Source>
        )}
      </Map>

      <div
        className="map-dimmer"
        style={{ backgroundColor: `rgba(0, 0, 0, ${1 - brightness / 100})` }}
      />

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

      <svg className="compass-rose-svg" viewBox="0 0 500 500">
        <g className="range-rings">
          <circle cx="250" cy="250" r="220" className="range-ring outer" />
          <circle cx="250" cy="250" r="110" className="range-ring inner" />
          <text x="250" y="135" className="range-ring-label">
            {rangeNM / 2}
          </text>
        </g>

        <g
          style={{
            transform: `rotate(${mapBearing}deg)`,
            transformOrigin: '250px 250px',
            transition: 'transform 0.1s linear',
          }}
        >
          <circle cx="250" cy="250" r="220" className="compass-ring" />
          {[...Array(72)].map((_, i) => (
            <line
              key={i}
              x1="250"
              y1={250 - 220}
              x2="250"
              y2={250 - 220 + (i % 6 === 0 ? 15 : 8)}
              className={`compass-tick ${i % 6 === 0 ? 'major' : ''}`}
              transform={`rotate(${i * 5}, 250, 250)`}
            />
          ))}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
            const labelRadius = 195;
            let label: string = (angle / 10).toString();
            let className = 'compass-label';
            if (angle === 0) {
              label = 'N';
              className += ' cardinal-label north-label';
            } else if (angle === 90) {
              label = 'E';
              className += ' cardinal-label';
            } else if (angle === 180) {
              label = 'S';
              className += ' cardinal-label';
            } else if (angle === 270) {
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

      <div className="ownship-symbol">
        <svg viewBox="0 0 24 24">
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
