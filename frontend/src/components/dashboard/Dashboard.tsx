import React from 'react';
import AttitudeIndicator from '../AttitudeIndicator/AttitudeIndicator';

export default function Dashboard() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <AttitudeIndicator width="120%" height="120%" />
    </div>
  );
}
