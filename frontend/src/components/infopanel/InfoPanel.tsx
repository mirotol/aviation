import React, { useState } from 'react';
import { useAttitude } from '../../hooks/useAttitude';
import { useAltitude } from '../../hooks/useAltitude';
import { useAirspeed } from '../../hooks/useAirSpeed';
import { useFlightProviderSwitch } from '../../hooks/useFlightProviderSwitch';

export default function InfoPanel() {
  const attitude = useAttitude();
  const { altitude, kollsmanPressure } = useAltitude();
  const airspeed = useAirspeed();

  const { switchProvider } = useFlightProviderSwitch();
  const [active, setActive] = useState<'simulated' | 'recorded'>('simulated');

  const buttonStyle = (type: 'simulated' | 'recorded') => ({
    padding: '6px 10px',
    marginRight: '8px',
    background: active === type ? '#4caf50' : '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
  });

  return (
    <div
      style={{
        background: '#222',
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '15px',
        fontFamily: 'monospace',
        height: 'fit-content',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Flight Data</h3>

      <div style={{ marginBottom: '10px' }}>
        <button
          style={buttonStyle('simulated')}
          onClick={() => {
            switchProvider('simulated');
            setActive('simulated');
          }}
        >
          Simulated
        </button>

        <button
          style={buttonStyle('recorded')}
          onClick={() => {
            switchProvider('recorded');
            setActive('recorded');
          }}
        >
          Recorded
        </button>
      </div>

      <div>Pitch: {attitude.pitch.toFixed(2)}°</div>
      <div>Roll: {attitude.roll.toFixed(2)}°</div>
      <div>Yaw: {attitude.yaw.toFixed(2)}°</div>

      <br />

      <div>Altitude: {altitude.toFixed(2)} ft</div>
      <div>Kollsman Pressure: {kollsmanPressure.toFixed(2)} inHg</div>

      <br />

      <div>Airspeed: {airspeed.speed.toFixed(2)} kt</div>
    </div>
  );
}
