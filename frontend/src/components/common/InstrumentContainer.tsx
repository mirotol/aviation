import React from 'react';

export default function InstrumentContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111',
        padding: '10px 0',
        borderRadius: '10px',
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      <h2
        style={{
          margin: '0 0 10px 0',
          fontSize: '1.2rem',
          color: 'white',
          fontFamily: 'monospace',
        }}
      >
        {title}
      </h2>

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
