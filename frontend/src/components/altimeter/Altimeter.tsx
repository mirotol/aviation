import React, { useState, useEffect } from 'react';
import { useAltitude } from '../../hooks/useAltitude';
import InstrumentContainer from '../common/InstrumentContainer';

interface AltimeterProps {
  width?: string | number;
  height?: string | number;
}

export default function Altimeter({ width = 400, height = 400 }: AltimeterProps) {
  const { altitude } = useAltitude(); // ⭐ real altitude data coming from backend

  const [displayAltitude, setDisplayAltitude] = useState(0);

  // Smooth interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayAltitude((prev) => prev + (altitude - prev) * 0.05);
    }, 16);
    return () => clearInterval(interval);
  }, [altitude]);

  // Convert altitude to needle angle (0–360 per 10,000 ft)
  const needleAngle = ((displayAltitude % 10000) / 10000) * 360;

  return (
    <InstrumentContainer title="Altimeter">
      <svg width={width} height={height} viewBox="-125 -125 250 250">
        {/* Outer circle */}
        <circle cx="0" cy="0" r="100" fill="#222" stroke="white" strokeWidth={2} />

        {/* Tick marks (every 30 degrees / 1000 ft) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = Math.sin(rad) * 90;
          const y1 = -Math.cos(rad) * 90;
          const x2 = Math.sin(rad) * 80;
          const y2 = -Math.cos(rad) * 80;

          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={2} />;
        })}

        {/* Needle */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-70}
          stroke="red"
          strokeWidth={2}
          transform={`rotate(${needleAngle})`}
        />

        {/* Center knob */}
        <circle cx="0" cy="0" r="5" fill="white" />

        {/* Digital altitude readout */}
        <text x="0" y="60" fill="white" fontSize="18" fontFamily="monospace" textAnchor="middle">
          {Math.round(displayAltitude)} ft
        </text>
      </svg>
    </InstrumentContainer>
  );
}
