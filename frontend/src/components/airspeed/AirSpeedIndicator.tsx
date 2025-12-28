import React, { useEffect, useState } from 'react';
import { useFlightData } from '../../hooks/useFlightData';
import InstrumentContainer from '../common/InstrumentContainer';

interface AirspeedIndicatorProps {
  width?: string | number;
  height?: string | number;
}

export default function AirspeedIndicator({ width = 400, height = 400 }: AirspeedIndicatorProps) {
  const snapshot = useFlightData();
  const speed = snapshot?.airSpeed.speed ?? 0;
  const [displaySpeed, setDisplaySpeed] = useState(0);

  const minSpeed = 40;
  const maxSpeed = 180;

  // Arc ranges
  const greenStart = 50;
  const greenEnd = 130;
  const yellowEnd = 160;
  const redLine = 170;

  // Smooth needle interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySpeed((prev) => prev + (speed - prev) * 0.1);
    }, 16);
    return () => clearInterval(interval);
  }, [speed]);

  // Map speed to visual angle: 40 kt → ~1 o'clock, 180 kt → ~7 o'clock
  const visualStart = -45; // 40 kt
  const visualEnd = 225; // 180 kt
  const speedToAngle = (s: number) =>
    ((s - minSpeed) / (maxSpeed - minSpeed)) * (visualEnd - visualStart) + visualStart;

  const ticks = [40, 60, 80, 100, 120, 140, 160, 180];

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const needleAngle = speedToAngle(displaySpeed);

  return (
    <InstrumentContainer title="Airspeed">
      <svg width={width} height={height} viewBox="-125 -125 250 250">
        {/* Outer circle */}
        <circle cx={0} cy={0} r={100} fill="#222" stroke="white" strokeWidth={2} />

        {/* Green arc */}
        <path
          d={describeArc(0, 0, 90, speedToAngle(greenStart), speedToAngle(greenEnd))}
          stroke="green"
          strokeWidth={6}
          fill="none"
        />

        {/* Yellow arc */}
        <path
          d={describeArc(0, 0, 90, speedToAngle(greenEnd), speedToAngle(yellowEnd))}
          stroke="yellow"
          strokeWidth={6}
          fill="none"
        />

        {/* Red line */}
        <line
          x1={polarToCartesian(0, 0, 90, speedToAngle(redLine)).x}
          y1={polarToCartesian(0, 0, 90, speedToAngle(redLine)).y}
          x2={polarToCartesian(0, 0, 80, speedToAngle(redLine)).x}
          y2={polarToCartesian(0, 0, 80, speedToAngle(redLine)).y}
          stroke="red"
          strokeWidth={3}
        />

        {/* Tick marks and numbers */}
        {ticks.map((tick) => {
          const angle = speedToAngle(tick);
          const rOuter = 90;
          const rInner = 80;

          const x1 = Math.cos((angle * Math.PI) / 180) * rOuter;
          const y1 = Math.sin((angle * Math.PI) / 180) * rOuter;
          const x2 = Math.cos((angle * Math.PI) / 180) * rInner;
          const y2 = Math.sin((angle * Math.PI) / 180) * rInner;

          // Number slightly inside tick
          const tx = Math.cos((angle * Math.PI) / 180) * (rInner - 10);
          const ty = Math.sin((angle * Math.PI) / 180) * (rInner - 10);

          return (
            <g key={tick}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={2} />
              <text
                x={tx}
                y={ty + 2}
                fill="white"
                fontSize={12}
                fontFamily="monospace"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <line
          x1={0}
          y1={0}
          x2={Math.cos((needleAngle * Math.PI) / 180) * 70}
          y2={Math.sin((needleAngle * Math.PI) / 180) * 70}
          stroke="red"
          strokeWidth={2}
        />

        {/* Center knob */}
        <circle cx={0} cy={0} r={5} fill="white" />

        <text x={0} y={-25} fill="white" fontSize={14} fontFamily="monospace" textAnchor="middle">
          AIRSPEED
        </text>
        <text x={0} y={30} fill="white" fontSize={14} fontFamily="monospace" textAnchor="middle">
          KNOTS
        </text>
      </svg>
    </InstrumentContainer>
  );
}
