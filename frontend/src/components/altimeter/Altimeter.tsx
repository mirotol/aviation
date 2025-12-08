import React, { useState, useEffect } from 'react';
import { useAttitude } from '../../hooks/useAttitude'; // temporary, or create useAltitude hook
import InstrumentContainer from '../common/InstrumentContainer';

interface AltimeterProps {
  width?: string | number;
  height?: string | number;
}

export default function Altimeter({ width = 400, height = 400 }: AltimeterProps) {
  // Replace useAttitude with real altitude data later
  const attitude = useAttitude();
  const targetAltitude = (attitude.yaw || 0) * 1000; // mock altitude from yaw for demo

  const [displayAltitude, setDisplayAltitude] = useState(0);

  // Smooth interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayAltitude((prev) => prev + (targetAltitude - prev) * 0.05);
    }, 16);
    return () => clearInterval(interval);
  }, [targetAltitude]);

  // Convert altitude to needle angle (0-360°)
  const needleAngle = ((displayAltitude % 10000) / 10000) * 360;

  return (
    <InstrumentContainer title="Altimeter">
      <svg width={width} height={height} viewBox="-125 -125 250 250">
        {/* Outer circle */}
        <circle cx="0" cy="0" r="100" fill="#222" stroke="white" strokeWidth={2} />

        {/* Tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const rOuter = 90;
          const rInner = 80;
          const x1 = Math.sin(rad) * rOuter;
          const y1 = -Math.cos(rad) * rOuter;
          const x2 = Math.sin(rad) * rInner;
          const y2 = -Math.cos(rad) * rInner;
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

        {/* Digital altitude */}
        <text x="0" y="60" fill="white" fontSize="18" fontFamily="monospace" textAnchor="middle">
          {Math.round(displayAltitude)} ft
        </text>
      </svg>
    </InstrumentContainer>
  );
}
