import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAvailableFlights } from '../../hooks/useAvailableFlights';
import { formatZuluTime } from '../../utils/timeUtils';
import './InfoPanel.css';

export default function InfoPanel() {
  const {
    snapshot,
    switchProvider,
    isConnected,
    activeProvider,
    selectedFlight,
    reconnectCountdown,
  } = useWebSocket();
  const [showJson, setShowJson] = useState(false);
  const { availableFlights } = useAvailableFlights();

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
            className={activeProvider === 'simulated' ? 'engaged' : ''}
            onClick={() => switchProvider('simulated')}
          >
            Simulated
          </button>
          <button
            className={activeProvider === 'recorded' ? 'engaged' : ''}
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
          </div>
        ) : (
          <div className="empty-state">Awaiting telemetry stream...</div>
        )}
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
