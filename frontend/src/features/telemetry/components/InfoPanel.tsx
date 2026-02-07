import React, { useState } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFlightPlan } from '../../../hooks/useFlightPlan';
import { useAvailableFlights } from '../../playback/hooks/useAvailableFlights';
import { formatZuluTime } from '../../../utils/timeUtils';
import '../styles/InfoPanel.css';
import { NavPoint } from '../../../providers/WebSocketContext';
import { FLIGHT_PLAN_PRESETS } from '../../navigation/data/flightPlanPresets';

export default function InfoPanel() {
  const {
    snapshot,
    switchProvider,
    isConnected,
    activeProvider,
    selectedFlight,
    reconnectCountdown,
    updateFlightPlan,
  } = useWebSocket();
  const { flightPlan, setFlightPlan } = useFlightPlan();
  const [showJson, setShowJson] = useState(false);
  const { availableFlights } = useAvailableFlights();

  const activeWaypointIndex = snapshot?.activeWaypointIndex ?? -1;

  const handleLoadPreset = (name: string) => {
    const preset = FLIGHT_PLAN_PRESETS[name];
    if (preset) {
      if (isPresetActive(preset)) {
        // If already active, clear it
        setFlightPlan(null);
        updateFlightPlan([]);
      } else {
        // Otherwise load it
        setFlightPlan(preset);
        updateFlightPlan(preset);
      }
    }
  };

  const isPresetActive = (presetWaypoints: NavPoint[]) => {
    if (!flightPlan || flightPlan.length !== presetWaypoints.length) return false;
    return flightPlan.every((wp, i) => wp.ident === presetWaypoints[i].ident);
  };

  return (
    <div className="info-panel-container">
      <header className="info-panel-header">
        <h2>FLIGHT TELEMETRY</h2>
        <div className="status-indicator">
          <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span className={`status-text ${!isConnected ? 'offline' : ''}`}>
            SYSTEM: {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
          {!isConnected && reconnectCountdown !== null && (
            <span className="reconnect-timer">RECONNECTING IN {reconnectCountdown}s...</span>
          )}
        </div>
      </header>

      <section style={{ marginBottom: '30px' }}>
        <p className="section-label">Data Source</p>
        <div className="source-buttons">
          <button
            className={`source-btn ${activeProvider === 'simulated' ? 'active' : ''}`}
            onClick={() => switchProvider('simulated')}
          >
            Simulated
          </button>
          <button
            className={`source-btn ${activeProvider === 'recorded' ? 'active' : ''}`}
            onClick={() => {
              if (availableFlights.length > 0) {
                switchProvider('recorded', selectedFlight || availableFlights[0]);
              } else {
                switchProvider('recorded');
              }
            }}
          >
            Recorded
          </button>
        </div>

        {activeProvider === 'recorded' && availableFlights.length > 0 && (
          <select
            className="flight-select"
            value={selectedFlight || ''}
            onChange={(e) => switchProvider('recorded', e.target.value)}
          >
            {availableFlights.map((flight) => (
              <option key={flight} value={flight}>
                {flight}
              </option>
            ))}
          </select>
        )}
      </section>

      {activeProvider === 'simulated' && (
        <section style={{ marginBottom: '30px' }}>
          <p className="section-label">Flight Plan Presets</p>
          <div
            className="preset-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}
          >
            {Object.keys(FLIGHT_PLAN_PRESETS).map((name) => (
              <button
                key={name}
                className={`source-btn ${isPresetActive(FLIGHT_PLAN_PRESETS[name]) ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', padding: '8px 4px' }}
                onClick={() => handleLoadPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: '30px' }}>
        <p className="section-label">Live Telemetry</p>
        {snapshot ? (
          <div className="telemetry-card">
            <div className="data-row">
              <span>Time (Z)</span>
              <span className="data-value">{formatZuluTime(snapshot.timestamp)}</span>
            </div>
            <div className="data-row">
              <span>Altitude</span>
              <span className="data-value">{snapshot.altitude.altitude.toFixed(0)} FT</span>
            </div>
            <div className="data-row">
              <span>Airspeed</span>
              <span className="data-value">{snapshot.airSpeed.speed.toFixed(1)} KT</span>
            </div>
            <div className="data-row">
              <span>Pitch</span>
              <span className="data-value">{snapshot.attitude.pitch.toFixed(1)}°</span>
            </div>
            <div className="data-row">
              <span>Roll</span>
              <span className="data-value">{snapshot.attitude.roll.toFixed(1)}°</span>
            </div>
            <div className="data-row">
              <span>Position</span>
              <span className="data-value">
                {snapshot.position.latitude >= 0 ? 'N' : 'S'}
                {Math.abs(snapshot.position.latitude).toFixed(2)}°{' '}
                {snapshot.position.longitude >= 0 ? 'E' : 'W'}
                {Math.abs(snapshot.position.longitude).toFixed(2)}°
              </span>
            </div>
          </div>
        ) : (
          <div className="empty-state">Awaiting telemetry stream...</div>
        )}
      </section>

      <section style={{ marginBottom: '30px' }}>
        <p className="section-label">Active Flight Plan</p>
        <div className="fpl-card">
          {flightPlan && flightPlan.length > 0 ? (
            <div className="fpl-list">
              {flightPlan.map((wp, index) => (
                <div
                  key={`${wp.ident}-${index}`}
                  className={`fpl-item ${index === activeWaypointIndex ? 'active-leg' : ''}`}
                >
                  <span className="wp-ident">{wp.ident}</span>
                  <span className="wp-name">{wp.name || wp.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No flight plan loaded</div>
          )}
        </div>
      </section>

      <section>
        <div className="json-toggle" onClick={() => setShowJson(!showJson)}>
          {showJson ? '▼' : '▶'} RAW SNAPSHOT DATA
        </div>

        {showJson && <pre className="json-raw">{JSON.stringify(snapshot, null, 2)}</pre>}
      </section>
    </div>
  );
}
