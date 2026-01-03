import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAvailableFlights } from '../../hooks/useAvailableFlights';
import { formatZuluTime } from '../../utils/timeUtils';

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

  const buttonStyle = (active: boolean) => ({
    flex: 1,
    padding: '10px',
    backgroundColor: active ? '#4a90e2' : '#2a2a2a',
    color: active ? '#fff' : '#888',
    border: '1px solid ' + (active ? '#4a90e2' : '#444'),
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    transition: 'all 0.2s ease',
  });

  const dataRowStyle = (isLast = false) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: isLast ? 'none' : '1px solid #333',
    fontSize: '1rem',
    color: '#aaa',
  });

  const valueStyle = {
    color: '#4a90e2',
    fontSize: '1.1rem',
    fontFamily: 'monospace',
  };

  const selectStyle = {
    width: '100%',
    marginTop: '10px',
    padding: '8px',
    backgroundColor: '#1a1a1a',
    color: '#eee',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '0.8rem',
    outline: 'none',
  };

  return (
    <div style={{ color: '#eee', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', letterSpacing: '1px' }}>
          FLIGHT TELEMETRY
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#4caf50' : '#f44336',
              boxShadow: isConnected ? '0 0 8px #4caf50' : 'none',
              transition: 'background-color 0.3s ease',
            }}
          />
          <span
            style={{
              color: isConnected ? '#888' : '#f44336',
              fontWeight: isConnected ? 'normal' : 'bold',
            }}
          >
            SYSTEM: {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
          {!isConnected && reconnectCountdown !== null && (
            <span style={{ color: '#666', fontSize: '0.7rem', marginLeft: 'auto' }}>
              RECONNECTING IN {reconnectCountdown}s...
            </span>
          )}
        </div>
      </header>

      <section style={{ marginBottom: '30px' }}>
        <p
          style={{
            fontSize: '0.8rem',
            color: '#666',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          Data Source
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={buttonStyle(activeProvider === 'simulated')}
            onClick={() => switchProvider('simulated')}
          >
            Simulated
          </button>
          <button
            style={buttonStyle(activeProvider === 'recorded')}
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
            style={selectStyle}
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
        <p
          style={{
            fontSize: '0.8rem',
            color: '#666',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Live Telemetry
        </p>
        {snapshot ? (
          <div style={{ backgroundColor: '#111', padding: '10px 20px', borderRadius: '8px', border: '1px solid #222' }}>
            <div style={dataRowStyle()}>
              <span>Time (Z)</span>
              <span style={valueStyle}>{formatZuluTime(snapshot.timestamp)}</span>
            </div>
            <div style={dataRowStyle()}>
              <span>Altitude</span>
              <span style={valueStyle}>{snapshot.altitude.altitude.toFixed(0)} FT</span>
            </div>
            <div style={dataRowStyle()}>
              <span>Airspeed</span>
              <span style={valueStyle}>{snapshot.airSpeed.speed.toFixed(1)} KT</span>
            </div>
            <div style={dataRowStyle()}>
              <span>Pitch</span>
              <span style={valueStyle}>{snapshot.attitude.pitch.toFixed(1)}°</span>
            </div>
            <div style={dataRowStyle(true)}>
              <span>Roll</span>
              <span style={valueStyle}>{snapshot.attitude.roll.toFixed(1)}°</span>
            </div>
          </div>
        ) : (
          <div style={{ color: '#555', fontStyle: 'italic', fontSize: '0.8rem' }}>
            Awaiting telemetry stream...
          </div>
        )}
      </section>

      <section>
        <div
          onClick={() => setShowJson(!showJson)}
          style={{
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: '#4a90e2',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            userSelect: 'none',
          }}
        >
          {showJson ? '▼' : '▶'} RAW SNAPSHOT DATA
        </div>

        {showJson && (
          <pre
            style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#000',
              border: '1px solid #333',
              borderRadius: '4px',
              fontSize: '1rem',
              color: '#4a90e2',
              overflow: 'auto',
              maxHeight: '600px',
              lineHeight: '1.4',
            }}
          >
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
