import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightData } from '../../hooks/useFlightData';
import { useFlightPlan } from '../../hooks/useFlightPlan';
import { useNearbyNavData } from '../../hooks/useNearbyNavData';
import { flightPlanToGeoJSON } from '../../utils/navDataUtils';
import { shouldShowNavPoint } from '../../utils/navDisplayPolicy';
import './NavigationDisplay.css';
import mapStyleJson from '../../styles/mapStyle.json';
import type { StyleSpecification, VectorSourceSpecification } from 'maplibre-gl';

// Clone JSON so we don't mutate the original import
const mapStyle: StyleSpecification = JSON.parse(JSON.stringify(mapStyleJson));

// Get API key from .env
const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '';

// Replace vector tile source URL safely
const source =
  mapStyle.sources && 'openmaptiles' in mapStyle.sources
    ? (mapStyle.sources.openmaptiles as VectorSourceSpecification)
    : undefined;
if (source?.url) {
  source.url = source.url.replace('{MAPTILER_API_KEY}', apiKey);
}

// Replace glyphs URL safely
if (mapStyle.glyphs) {
  mapStyle.glyphs = mapStyle.glyphs.replace('{MAPTILER_API_KEY}', apiKey);
}

interface NavigationDisplayProps {
  initialRangeNM?: number;
}

// Read CSS variables in TS
const getCssVar = (varName: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

// Predefined range options in nautical miles
const RANGES = [2, 5, 10, 20, 40, 80, 160, 320];

const NavigationDisplay: React.FC<NavigationDisplayProps> = ({ initialRangeNM = 20 }) => {
  const snapshot = useFlightData();
  const { flightPlan } = useFlightPlan();

  const containerRef = useRef<HTMLDivElement>(null);

  const [mapSizePx, setMapSizePx] = useState(500);

  // Measure actual rendered map size (critical for correct scaling)
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMapSizePx(Math.min(rect.width, rect.height));
  }, []);

  const initialIndex = RANGES.indexOf(initialRangeNM);
  const [rangeIndex, setRangeIndex] = useState(initialIndex >= 0 ? initialIndex : 2);
  const [brightness, setBrightness] = useState(75);
  const rangeNM = RANGES[rangeIndex];

  // Mapbox colors
  const colors = useMemo(
    () => ({
      universalMagenta: getCssVar('--universal-magenta'),
      vorColor: getCssVar('--vor-color'),
      defaultWaypointColor: getCssVar('--default-waypoint-color'),
      strokeColor: getCssVar('--waypoint-stroke-color'),
      labelColor: getCssVar('--waypoint-label-color'),
      labelHalo: getCssVar('--waypoint-label-halo'),
    }),
    []
  );

  const rawNavData = useNearbyNavData(200, 100); // Fetch 200 NM around aircraft, refetch only after moving 100 NM

  // Filter nav points based on MFD range
  const navData = useMemo(() => {
    if (!rawNavData) return null;
    return {
      ...rawNavData,
      features: rawNavData.features.filter((feature) =>
        shouldShowNavPoint(feature.properties, rangeNM)
      ),
    };
  }, [rawNavData, rangeNM]);

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

  const handleRangeChange = (delta: number) => {
    setRangeIndex((prev) => Math.min(Math.max(prev + delta, 0), RANGES.length - 1));
  };

  const handleBrightnessChange = (delta: number) => {
    setBrightness((prev) => Math.min(Math.max(prev + delta, 20), 100));
  };

  const latitude = snapshot?.position?.latitude ?? 0;
  const longitude = snapshot?.position?.longitude ?? 0;
  const track = snapshot?.attitude?.yaw ?? 0;
  const mapBearing = -track;

  // Correct zoom calculation using actual rendered pixel radius
  // Example: approximate conversion table for a 500px map at latitude 60°
  // Using the formula:
  //   zoom = log2( (metersPerPixelAtZoom0 * pixelsRadius) / metersRadius )

  /*
  | rangeNM | metersRadius | zoom
  |---------|--------------|------
  | 2       | 3,704        | 12.0
  | 5       | 9,260        | 10.7
  | 10      | 18,520       | 9.7
  | 20      | 37,040       | 8.7
  | 40      | 74,080       | 7.7
  | 80      | 148,160      | 6.7
  | 160     | 296,320      | 5.7
  | 320     | 592,640      | 4.7
*/
  const zoom = useMemo(() => {
    const metersPerNM = 1852;
    const metersRadius = rangeNM * metersPerNM;

    // Ground resolution at zoom 0: Equator circumference / tile size
    // Using 512 as the standard tile size for zoom level calculations in most GL map providers
    const worldSizeAtZoom0 = 40075016.686; // Earth circumference in meters
    const metersPerPixelAtZoom0 = (worldSizeAtZoom0 * Math.cos((latitude * Math.PI) / 180)) / 512;

    const pixelsRadius = mapSizePx / 2;

    // Formula: zoom = log2( (metersPerPixelAtZoom0 * pixelsRadius) / metersRadius )
    return Math.log2((metersPerPixelAtZoom0 * pixelsRadius) / metersRadius);
  }, [rangeNM, latitude, mapSizePx]);

  const viewState = useMemo(
    () => ({
      latitude,
      longitude,
      zoom,
      bearing: mapBearing,
      pitch: 0,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    }),
    [latitude, longitude, zoom, mapBearing]
  );

  // JSX Rendering — safe to early-return now
  if (!snapshot) {
    return <div className="navigation-display">WAITING FOR GPS...</div>;
  }

  return (
    <div className="navigation-display" ref={containerRef}>
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
                'line-color': colors.universalMagenta,
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
              paint={{ 'line-color': colors.universalMagenta, 'line-width': 5 }}
            />

            {/* Future Legs */}
            <Layer
              id="fpl-future-legs"
              type="line"
              filter={['==', ['get', 'role'], 'futureLeg']}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{
                'line-color': colors.universalMagenta,
                'line-width': 3,
                'line-opacity': 0.5,
              }}
            />
          </Source>
        )}

        {/* Navigation Data (Waypoints, VORs, NDBs, etc) */}
        {navData && (
          <Source id="navdata" type="geojson" data={navData}>
            <Layer
              id="airport-icons-small"
              type="circle"
              filter={['==', ['get', 'type'], 'small_airport']}
              minzoom={7}
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 5, 12, 5],
                'circle-color': colors.universalMagenta,
                'circle-stroke-width': 2,
                'circle-stroke-color': colors.strokeColor,
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.7, 12, 1],
              }}
            />
            <Layer
              id="airport-icons-medium-large"
              type="circle"
              filter={['in', ['get', 'type'], ['literal', ['medium_airport', 'large_airport']]]}
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 6, 10, 10],
                'circle-color': colors.universalMagenta,
                'circle-stroke-width': 2.5,
                'circle-stroke-color': colors.strokeColor,
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 9, 1],
              }}
            />
            <Layer
              id="vor-icons"
              type="circle"
              filter={['==', ['get', 'type'], 'VOR']}
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3.5, 10, 5],
                'circle-color': colors.vorColor,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': colors.strokeColor,
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.7, 9, 1],
              }}
            />
            <Layer
              id="ndb-icons"
              type="circle"
              filter={['==', ['get', 'type'], 'NDB']}
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3, 10, 5],
                'circle-color': '#00ffff', // cyan-ish
                'circle-stroke-width': 1.5,
                'circle-stroke-color': colors.strokeColor,
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.6, 9, 1],
              }}
            />
            <Layer
              id="fix-icons"
              type="circle"
              filter={['==', ['get', 'type'], 'FIX']}
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 2.5, 10, 4],
                'circle-color': colors.defaultWaypointColor,
                'circle-stroke-width': 1,
                'circle-stroke-color': colors.strokeColor,
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 10, 1],
              }}
            />
            <Layer
              id="airport-labels-small"
              type="symbol"
              filter={['==', ['get', 'type'], 'small_airport']}
              minzoom={8.5}
              layout={{
                'text-field': ['get', 'ident'],
                'text-size': 13,
                'text-font': ['DIN Pro Bold'],
                'text-offset': [0, 1],
                'text-anchor': 'top',
                'text-allow-overlap': false,
              }}
              paint={{
                'text-color': colors.labelColor,
                'text-halo-color': colors.labelHalo,
                'text-halo-width': 3,
                'text-halo-blur': 1,
              }}
            />
            <Layer
              id="airport-labels-major"
              type="symbol"
              filter={['in', ['get', 'type'], ['literal', ['medium_airport', 'large_airport']]]}
              minzoom={6}
              layout={{
                'text-field': ['get', 'ident'],
                'text-size': 15,
                'text-font': ['DIN Pro Bold'],
                'text-offset': [0, 1.3],
                'text-anchor': 'top',
              }}
              paint={{
                'text-color': colors.labelColor,
                'text-halo-color': colors.labelHalo,
                'text-halo-width': 3,
                'text-halo-blur': 1,
              }}
            />
            <Layer
              id="navaid-labels"
              type="symbol"
              filter={['in', ['get', 'type'], ['literal', ['VOR', 'NDB']]]}
              minzoom={7}
              layout={{
                'text-field': ['get', 'ident'],
                'text-size': 14,
                'text-font': ['DIN Pro Medium'],
                'text-offset': [0, 1.2],
                'text-anchor': 'top',
              }}
              paint={{
                'text-color': colors.labelColor,
                'text-halo-color': colors.labelHalo,
                'text-halo-width': 2.5,
                'text-halo-blur': 0.8,
              }}
            />
            <Layer
              id="fix-labels"
              type="symbol"
              filter={['==', ['get', 'type'], 'FIX']}
              minzoom={10}
              layout={{
                'text-field': ['get', 'ident'],
                'text-size': 12,
                'text-font': ['DIN Pro Medium'],
                'text-offset': [0, 1.0],
                'text-anchor': 'top',
              }}
              paint={{
                'text-color': colors.labelColor,
                'text-halo-color': colors.labelHalo,
                'text-halo-width': 2,
                'text-halo-blur': 0.5,
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

      <svg className="compass-rose-svg" viewBox={`0 0 ${mapSizePx} ${mapSizePx}`}>
        {(() => {
          const center = mapSizePx / 2;
          const outerRadius = center; // full outer ring
          const innerRadius = outerRadius / 2; // half ring

          return (
            <>
              {/* Range Rings */}
              <g className="range-rings">
                <circle cx={center} cy={center} r={outerRadius} className="range-ring outer" />
                <circle cx={center} cy={center} r={innerRadius} className="range-ring inner" />

                {/* Inner ring label with background */}
                <g>
                  <rect
                    x={center + 90 - 20}
                    y={center - innerRadius + 45 - 10}
                    width={40}
                    height={17}
                    rx={3} // rounded corners
                    ry={3}
                    fill="rgba(0,0,0,0.7)" // semi-transparent dark background
                  />
                  <text
                    x={center + 90}
                    y={center - innerRadius + 45}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {rangeNM / 2} NM
                  </text>
                </g>
              </g>

              {/* Compass ticks and labels*/}
              <g
                style={{
                  transform: `rotate(${mapBearing}deg)`,
                  transformOrigin: `${center}px ${center}px`,
                }}
              >
                {Array.from({ length: 360 / 5 }, (_, i) => {
                  const angle = i * 5;
                  const angleRad = (angle * Math.PI) / 180;

                  // Tick lengths
                  let tickLength = 5; // short
                  if (angle % 10 === 0) tickLength = 10; // medium
                  if (angle % 30 === 0) tickLength = 15; // long

                  // Tick coordinates
                  const x1 = center + (outerRadius - tickLength) * Math.sin(angleRad);
                  const y1 = center - (outerRadius - tickLength) * Math.cos(angleRad);
                  const x2 = center + outerRadius * Math.sin(angleRad);
                  const y2 = center - outerRadius * Math.cos(angleRad);

                  // Labels only on 30° ticks
                  let label = '';
                  if (angle % 30 === 0) {
                    switch (angle) {
                      case 0:
                        label = 'N';
                        break;
                      case 90:
                        label = 'E';
                        break;
                      case 180:
                        label = 'S';
                        break;
                      case 270:
                        label = 'W';
                        break;
                      default:
                        label = label = ((angle / 10) % 36).toString(); // 30° → 3, 300° → 30
                    }
                  }

                  // Label coordinates
                  const labelRadius = outerRadius - 25; // Inside outer circle near major ticks
                  const lx = center + labelRadius * Math.sin(angleRad);
                  const ly = center - labelRadius * Math.cos(angleRad);

                  return (
                    <g key={angle}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#fff"
                        strokeWidth={angle % 30 === 0 ? 2 : 1}
                      />
                      {label && (
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#fff"
                          fontSize="12"
                          fontWeight="bold"
                          transform={`rotate(${-mapBearing}, ${lx}, ${ly})`} // keeps label upright
                        >
                          {label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </>
          );
        })()}
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
