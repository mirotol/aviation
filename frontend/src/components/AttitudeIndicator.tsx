import React from 'react';
import { useAttitude } from '../hooks/useAttitude';

export default function AttitudeIndicator() {
  const attitude = useAttitude();

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <h2>Attitude Indicator</h2>
      <p>Pitch: {attitude.pitch.toFixed(2)}°</p>
      <p>Roll: {attitude.roll.toFixed(2)}°</p>
      <p>Yaw: {attitude.yaw.toFixed(2)}°</p>
    </div>
  );
}
