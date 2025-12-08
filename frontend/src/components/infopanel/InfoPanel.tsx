import React from 'react';
import { useAttitude } from '../../hooks/useAttitude';
import { useAltitude } from '../../hooks/useAltitude';
import { useAirspeed } from '../../hooks/useAirSpeed';

export default function InfoPanel() {
  const attitude = useAttitude();
  const altitude = useAltitude();
  const airspeed = useAirspeed();

  return (
    <div
      style={{
        background: '#222',
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '15px',
        fontFamily: 'monospace',
        height: 'fit-content',
        opacity: 1,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Flight Data</h3>
      <div>Pitch: {attitude.pitch.toFixed(2)}°</div>
      <div>Roll: {attitude.roll.toFixed(2)}°</div>
      <div>Yaw: {attitude.yaw.toFixed(2)}°</div>
      <br />
      <div>Altitude: {altitude.altitude.toFixed(2)} ft</div>
      <br />
      <div>Airspeed: {airspeed.speed.toFixed(2)} kt</div>
    </div>
  );
}
