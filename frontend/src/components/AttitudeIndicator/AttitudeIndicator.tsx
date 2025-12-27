import React, { useState, useEffect } from 'react';
import InstrumentContainer from '../common/InstrumentContainer';
import { useAttitude } from '../../hooks/useAttitude';

interface AttitudeIndicatorProps {
  width?: string | number;
  height?: string | number;
}

export default function AttitudeIndicator({ width = 400, height = 400 }: AttitudeIndicatorProps) {
  const attitude = useAttitude();

  const [displayPitch, setDisplayPitch] = useState(0);
  const [displayRoll, setDisplayRoll] = useState(0);

  // Smooth interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayPitch((prev) => prev + (attitude.pitch - prev) * 0.1);
      setDisplayRoll((prev) => prev + (attitude.roll - prev) * 0.1);
    }, 16);
    return () => clearInterval(interval);
  }, [attitude]);

  const pitchOffset = displayPitch * 2;

  // Roll tick marks
  const rollTicks = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];

  // Pitch markers (lines across horizon)
  const pitchMarkers = [30, 20, 10, -10, -20, -30];

  return (
    <InstrumentContainer title="Attitude Indicator">
      <svg width={width} height={height} viewBox="-125 -125 250 250">
        <defs>
          <clipPath id="circleClip">
            <circle cx="0" cy="0" r="100" />
          </clipPath>
          <linearGradient id="skyGrad" x1="0" y1="-100" x2="0" y2="0">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#4682B4" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="100">
            <stop offset="0%" stopColor="#a0512db2" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="0" cy="0" r="100" fill="black" />

        {/* Horizon + pitch group */}
        <g clipPath="url(#circleClip)" transform={`rotate(${-displayRoll})`}>
          {/* Sky and ground */}
          <rect x={-125} y={-125 + pitchOffset} width={250} height={125} fill="url(#skyGrad)" />
          <rect x={-125} y={pitchOffset} width={250} height={125} fill="url(#groundGrad)" />
          {/* Horizon line */}
          <line
            x1={-125}
            y1={pitchOffset}
            x2={125}
            y2={pitchOffset}
            stroke="white"
            strokeWidth={2}
          />
          {/* Pitch tick marks */}
          {pitchMarkers.map((deg) => (
            <g key={deg}>
              <line
                x1={-20}
                y1={pitchOffset - deg * 2}
                x2={20}
                y2={pitchOffset - deg * 2}
                stroke="white"
                strokeWidth={1.5}
              />
              <text
                x={25}
                y={pitchOffset - deg * 2 + 3}
                fill="white"
                fontSize="10"
                fontFamily="monospace"
              >
                {deg}°
              </text>
            </g>
          ))}
          {/* Roll arc */}
          {rollTicks.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const rOuter = 90;
            const rInner = deg % 30 === 0 ? 80 : 85;
            const x1 = Math.sin(rad) * rOuter;
            const y1 = -Math.cos(rad) * rOuter;
            const x2 = Math.sin(rad) * rInner;
            const y2 = -Math.cos(rad) * rInner;
            return (
              <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={2} />
            );
          })}
        </g>

        {/* Fixed aircraft reference symbol */}
        <g fill="none">
          {/* ORANGE WINGS */}
          <line
            x1={-50}
            y1={0}
            x2={-18}
            y2={0}
            stroke="orange"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={50}
            y1={0}
            x2={17}
            y2={0}
            stroke="orange"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* === DOWNWARD SEMICIRCLE WITH LARGER GRAY SECTION === */}
          {/* Short left orange arc */}
          <path d="M -17 0 A 30 15 0 0 0 -17 6" stroke="orange" strokeWidth={3} fill="none" />
          {/* Short right orange arc */}
          <path d="M 17 6 A 30 15 0 0 0 17 0" stroke="orange" strokeWidth={3} fill="none" />
          {/* **Large middle gray arc** */}
          <path d="M -17 6 A 18 15 0 0 0 17 6" stroke="#b0a899" strokeWidth={3} fill="none" />
          {/* CENTER VERTICAL BAR */}
          <line x1={0} y1={0} x2={0} y2={15} stroke="#b0a899" strokeWidth={3} />
          <line
            x1={0}
            y1={15}
            x2={0}
            y2={30}
            stroke="#b0a899"
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* ORANGE CENTER DOT */}
          <circle cx={0} cy={0} r={3} fill="orange" />
          {/* BANK POINTER CHEVRON, ORANGE TRIANGLE */}
          <polygon points="-5,-70 0,-78 5,-70" fill="none" stroke="orange" strokeWidth="2" />
        </g>
      </svg>
    </InstrumentContainer>
  );
}
