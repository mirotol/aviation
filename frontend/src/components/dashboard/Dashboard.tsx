import React from 'react';
import AttitudeIndicator from '../attitudeindicator/AttitudeIndicator';
import Altimeter from '../altimeter/Altimeter';

export default function Dashboard() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '100%',
        height: '100%',
      }}
    >
      <AttitudeIndicator width="120%" height="120%" />
      <Altimeter width="120%" height="120%" />
    </div>
  );
}
