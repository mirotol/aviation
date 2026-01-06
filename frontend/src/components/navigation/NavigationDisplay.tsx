import React, { useMemo, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightData } from '../../hooks/useFlightData';
import { useFlightPlan } from '../../hooks/useFlightPlan';
import { useNearbyNavData } from '../../hooks/useNearbyNavData';
import { flightPlanToGeoJSON } from '../../utils/navDataUtils';
import './NavigationDisplay.css';
import mapStyleJson from '../../styles/mapStyle.json';
import type { StyleSpecification, VectorSourceSpecification } from 'maplibre-gl';

// Clone JSON so we don't mutate the original import
const mapStyle: StyleSpecification = JSON.parse(JSON.stringify(mapStyleJson));

// Get API key from .env
const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '';
console.log(apiKey);

// Replace vector tile source URL safely
const source = mapStyle.sources?.openmaptiles as VectorSourceSpecification | undefined;
if (source?.url) {
  source.url = source.url.replace('{MAPTILER_API_KEY}', apiKey);
}

// Replace glyphs URL safely
if (mapStyle.glyphs) {
  mapStyle.glyphs = mapStyle.glyphs.replace('{MAPTILER_API_KEY}', apiKey);
}

console.log(mapStyle);

interface NavigationDisplayProps {
  initialRangeNM?: number;
}

// Read CSS variables in TS
const getCssVar = (varName: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

// Mapbox colors
const universalMagenta = getCssVar('--universal-magenta');
const vorColor = getCssVar('--vor-color');
const defaultWaypointColor = getCssVar('--default-waypoint-color');
const strokeColor = getCssVar('--waypoint-stroke-color');
const labelColor = getCssVar('--waypoint-label-color');
const labelHalo = getCssVar('--waypoint-label-halo');

// Predefined range options in nautical miles
const RANGES = [2, 5, 10, 20, 40, 80, 160, 320];

const NavigationDisplay: React.FC<NavigationDisplayProps> = ({ initialRangeNM = 20 }) => {
  const snapshot = useFlightData();
  const { flightPlan } = useFlightPlan();
  const [rangeIndex, setRangeIndex] = useState(RANGES.indexOf(initialRangeNM) || 2);
  const [brightness, setBrightness] = useState(75);
  const rangeNM = RANGES[rangeIndex];

  const navData = useNearbyNavData(Math.max(rangeNM, 100));

  // Compute flight plan GeoJSON
  const flightPlanGeoJSON = useMemo(() => {
    if (!flightPlan || flightPlan.length < 2 || !snapshot) return null;

    return flightPlanToGeoJSON(
      {
        activeLegIndex: snapshot.activeWaypointIndex,
        waypoints: flightPlan,
      },
      snapshot.position
    );
  }, [flightPlan, snapshot]);

  /**
   * Convert MFD range (nautical miles) into a MapLibre zoom level.
   *
   * This uses a logarithmic scale:
   *  - Each range step halves/doubles the visible area
   *  - Zoom decreases by ~1 for every doubling of range
   *
   * Formula:
   *   zoom = log2(21600 / rangeNM) - 1
   *
   * Where:
   *  - rangeNM = selected display range in nautical miles
   *  - 21600 is a tuning constant representing a full-world scale in NM
   *  - "-1" is a visual offset to better match avionics-style scaling
   *
   * Resulting zoom levels for predefined ranges:
   *
   *   Range (NM) → MapLibre Zoom
   *   -------------------------
   *     2 NM   → ~12.4
   *     5 NM   → ~11.1
   *    10 NM   → ~10.1
   *    20 NM   → ~ 9.1
   *    40 NM   → ~ 8.1
   *    80 NM   → ~ 7.1
   *   160 NM   → ~ 6.1
   *   320 NM   → ~ 5.1
   *
   * These zoom levels are used to control layer visibility via
   * minzoom / maxzoom in the map style (airports, runways, airways, etc).
   */
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

  return (
    <div className="navigation-display">
      <Map
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
      >
        {/* Flight Plan Path (Magenta Line) */}
        {flightPlanGeoJSON && (
          <Source id="flightplan" type="geojson" data={flightPlanGeoJSON}>
            {/* Past Legs */}
            <Layer
              id="fpl-past-legs"
              type="line"
              filter={['==', ['get', 'role'], 'pastLeg']}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{
                'line-color': universalMagenta,
                'line-width': 3,
                'line-opacity': 0.3,
                'line-dasharray': [2, 4],
              }}
            />

            {/* Active Leg */}
            <Layer
              id="fpl-active-leg"
              type="line"
              filter={['==', ['get', 'role'], 'activeLeg']}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': universalMagenta, 'line-width': 5 }}
            />

            {/* Future Legs */}
            <Layer
              id="fpl-future-legs"
              type="line"
              filter={['==', ['get', 'role'], 'futureLeg']}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': universalMagenta, 'line-width': 3, 'line-opacity': 0.5 }}
            />
          </Source>
        )}

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
                  universalMagenta,
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
