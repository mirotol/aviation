import React, { useState } from 'react';
import AttitudeIndicator from '../attitudeindicator/AttitudeIndicator';
import Altimeter from '../altimeter/Altimeter';
import InfoPanel from '../infopanel/InfoPanel';
import AirspeedIndicator from '../airspeed/AirSpeedIndicator';

export default function Dashboard() {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#1c1c1c',
        minHeight: '100vh',
        width: '100vw',
        boxSizing: 'border-box',
        position: 'relative',
        justifyContent: 'center',
      }}
    >
      <AttitudeIndicator width={400} height={400} />
      <Altimeter width={400} height={400} />
      <AirspeedIndicator width={400} height={400} />

      {/* Overlay Info Panel */}
      {showInfo && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '100%',
            backgroundColor: '#2a2a2a',
            borderLeft: '1px solid #444',
            zIndex: 999,
            paddingTop: '60px', // <-- keeps text clear from button
            paddingRight: '20px',
            overflowY: 'auto',
            opacity: 0.8,
          }}
        >
          <InfoPanel />
        </div>
      )}

      {/* Fixed toggle button - ALWAYS in same spot */}
      <button
        onClick={() => setShowInfo((prev) => !prev)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px', // ⭐ never changes
          padding: '10px 18px',
          background: '#2e2e2e',
          border: '1px solid #555',
          color: 'white',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 2000, // ABOVE panel
        }}
      >
        {showInfo ? 'Hide Info' : 'Show Info'}
      </button>
    </div>
  );
}
