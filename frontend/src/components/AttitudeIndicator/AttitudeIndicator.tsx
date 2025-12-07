import React, { useState, useEffect } from 'react';
import { useAttitude } from '../../hooks/useAttitude';

export default function AttitudeIndicator() {
  const attitude = useAttitude();
  const [displayPitch, setDisplayPitch] = useState(0);
  const [displayRoll, setDisplayRoll] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayPitch((prev) => prev + (attitude.pitch - prev) * 0.1);
      setDisplayRoll((prev) => prev + (attitude.roll - prev) * 0.1);
    }, 16);
    return () => clearInterval(interval);
  }, [attitude]);

  const pitchOffset = displayPitch * 2;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <h2>Attitude Indicator</h2>
      <svg width={250} height={250} viewBox="-125 -125 250 250">
        <defs>
          <clipPath id="circleClip">
            <circle cx="0" cy="0" r="100" />
          </clipPath>
          <linearGradient id="skyGrad" x1="0" y1="-100" x2="0" y2="0">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#4682B4" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="100">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
        </defs>

        {/* Circular background */}
        <circle cx="0" cy="0" r="100" fill="black" />

        {/* Horizon group with clipping */}
        <g clipPath="url(#circleClip)" transform={`rotate(${-displayRoll})`}>
          <rect x={-125} y={-125 + pitchOffset} width={250} height={125} fill="url(#skyGrad)" />
          <rect x={-125} y={pitchOffset} width={250} height={125} fill="url(#groundGrad)" />
          <line x1={-125} y1={pitchOffset} x2={125} y2={pitchOffset} stroke="white" strokeWidth={2} />
          {/* Pitch tick marks */}
          {[-30, -20, -10, 10, 20, 30].map((deg) => (
            <line
              key={deg}
              x1={-20}
              y1={pitchOffset + deg * 2}
              x2={20}
              y2={pitchOffset + deg * 2}
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Aircraft reference */}
        <polygon points="-10,0 10,0 0,10" fill="white" stroke="black" strokeWidth={1} />

        {/* Roll scale */}
        {[ -60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60 ].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = Math.sin(rad) * 90;
          const y = -Math.cos(rad) * 90;
          return <line key={deg} x1={x} y1={y} x2={x * 0.9} y2={y * 0.9} stroke="white" strokeWidth={2} />;
        })}
      </svg>

      <p>Pitch: {displayPitch.toFixed(2)}°</p>
      <p>Roll: {displayRoll.toFixed(2)}°</p>
    </div>
  );
}
