import React from 'react';
import AttitudeIndicator from '../attitudeindicator/AttitudeIndicator';
import Altimeter from '../altimeter/Altimeter';
import AirspeedIndicator from '../airspeed/AirSpeedIndicator';

export default function Cockpit() {
  return (
    <main
      style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
        backgroundColor: '#121212',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          backgroundColor: '#1a1a1a',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #333',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Basic T-Arrangement: Airspeed - Attitude - Altimeter */}
        <AirspeedIndicator width={400} height={400} />
        <AttitudeIndicator width={450} height={450} />
        <Altimeter width={400} height={400} />
      </div>
    </main>
  );
}
