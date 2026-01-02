import React from 'react';

export default function InstrumentContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a', // Darker background for the instrument well
        padding: '5px',
        borderRadius: '50%', // Circular housing for circular instruments
        border: '4px solid #333',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,1), 0 4px 10px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glass Reflection Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255,255,255,0) 50%)',
          pointerEvents: 'none',
          zIndex: 10,
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
