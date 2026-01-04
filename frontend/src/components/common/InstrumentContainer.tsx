import React from 'react';
import './InstrumentContainer.css';

export default function InstrumentContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="instrument-well">
      {/* Glass Reflection Overlay */}
      <div className="instrument-glass-overlay" />

      <div className="instrument-content">
        {children}
      </div>
    </div>
  );
}
