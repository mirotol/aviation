import React, { useState } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { formatZuluTime } from '../../utils/timeUtils';

export default function InfoPanel() {
  const { snapshot, switchProvider, isConnected, activeProvider, reconnectCountdown } =
    useWebSocket();
  const [showJson, setShowJson] = useState(false);

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

  const dataRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #333',
    fontSize: '0.9rem',
    color: '#ccc',
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
            fontSize: '0.7rem',
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
            onClick={() => switchProvider('recorded')}
          >
            Recorded
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <p
          style={{
            fontSize: '0.7rem',
            color: '#666',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          Live Data
        </p>
        {snapshot ? (
          <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '6px' }}>
            <div style={dataRowStyle}>
              <span>Time (Z / UTC)</span>
              <span style={{ color: '#4a90e2' }}>{formatZuluTime(snapshot.timestamp)}</span>
            </div>
            {/* ... rest of the rows ... */}
            <div style={dataRowStyle}>
              <span>Altitude</span>
              <span style={{ color: '#4a90e2' }}>{snapshot.altitude.altitude.toFixed(0)} FT</span>
            </div>
            <div style={dataRowStyle}>
              <span>Airspeed</span>
              <span style={{ color: '#4a90e2' }}>{snapshot.airSpeed.speed.toFixed(1)} KTS</span>
            </div>
            <div style={dataRowStyle}>
              <span>Pitch</span>
              <span style={{ color: '#4a90e2' }}>{snapshot.attitude.pitch.toFixed(1)}°</span>
            </div>
            <div style={dataRowStyle}>
              <span>Roll</span>
              <span style={{ color: '#4a90e2' }}>{snapshot.attitude.roll.toFixed(1)}°</span>
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
              border: '1px solid #222',
              borderRadius: '4px',
              fontSize: '0.7rem',
              color: '#0f0',
              overflowX: 'auto',
              maxHeight: '200px',
            }}
          >
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
