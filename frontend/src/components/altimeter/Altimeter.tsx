import React, { JSX } from 'react';
import { useAltitude } from '../../hooks/useAltitude';
import NeedleHundred from './NeedleHundred';
import NeedleThousand from './NeedleThousand';
import NeedleTenThousand from './NeedleTenThousand';

interface AltimeterProps {
  width?: number | string;
  height?: number | string;
}

export default function Altimeter({ width = 400, height = 400 }: AltimeterProps) {
  const { altitude } = useAltitude();

  // Ensure numeric values for calculations
  const w = typeof width === 'number' ? width : parseFloat(width);
  const h = typeof height === 'number' ? height : parseFloat(height);
  const centerX = w / 2;
  const centerY = h / 2;

  // Radii based on the smaller dimension
  const outerRadius = Math.min(w, h) / 2.4;
  const innerRadius = Math.min(w, h) / 4;

  const startAngle = -Math.PI / 11.5;
  const endAngle = Math.PI / 11.5;

  const polarToCartesian = (r: number, angle: number) => ({
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle),
  });

  const leftStart = polarToCartesian(innerRadius, startAngle);
  const leftEnd = polarToCartesian(innerRadius, endAngle);
  const rightEnd = polarToCartesian(outerRadius, endAngle);
  const rightStart = polarToCartesian(outerRadius, startAngle);

  // Ticks
  const majorTickCount = 10;
  const minorTickCount = 4; // between major ticks
  const tickRadius = Math.min(w, h) / 2.05;
  const tickLengthMajor = 30;
  const tickLengthMinor = 18;
  const majorTickWidth = 4;
  const minorTickWidth = 2;

  const ticks: JSX.Element[] = [];
  const totalAngle = 2 * Math.PI;
  const majorStep = totalAngle / majorTickCount;

  for (let i = 0; i < majorTickCount; i++) {
    const angle = i * majorStep - Math.PI / 2;
    const start = polarToCartesian(tickRadius - tickLengthMajor, angle);
    const end = polarToCartesian(tickRadius, angle);
    ticks.push(
      <line
        key={`major-${i}`}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#FFFFFF"
        strokeWidth={majorTickWidth}
      />
    );

    for (let j = 1; j <= minorTickCount; j++) {
      const minorAngle = angle + (j * majorStep) / (minorTickCount + 1);
      const minorStart = polarToCartesian(tickRadius - tickLengthMinor, minorAngle);
      const minorEnd = polarToCartesian(tickRadius, minorAngle);
      ticks.push(
        <line
          key={`minor-${i}-${j}`}
          x1={minorStart.x}
          y1={minorStart.y}
          x2={minorEnd.x}
          y2={minorEnd.y}
          stroke="#FFFFFF"
          strokeWidth={minorTickWidth}
        />
      );
    }
  }

  // Numbers for major ticks
  const numbers: JSX.Element[] = [];
  const labelRadius = tickRadius - tickLengthMajor - 15; // distance from center

  for (let i = 0; i < majorTickCount; i++) {
    if (i === 6) continue; // skip number 6

    let angle = i * majorStep - Math.PI / 2;

    // Shift numbers 2 and 3 slightly to avoid the gap
    if (i === 2) angle -= 0.13; // small clockwise shift
    if (i === 3) angle += 0.12; // small counter-clockwise shift

    const pos = polarToCartesian(labelRadius, angle);

    // Vertical offset
    const upperVerticalGroup = [0, 1, 2, 8, 9];
    const yOffset = upperVerticalGroup.includes(i) ? 15 : 7;

    numbers.push(
      <text
        key={`label-${i}`}
        x={pos.x}
        y={pos.y + yOffset}
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontSize={25}
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {i}
      </text>
    );
  }

  const needleRotationOffset = 90;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <mask id="altimeterHoleMask">
          <rect width={w} height={h} fill="white" />
          <path
            d={`
              M ${leftStart.x} ${leftStart.y}
              A ${innerRadius} ${innerRadius} 0 0 1 ${leftEnd.x} ${leftEnd.y}
              L ${rightEnd.x} ${rightEnd.y}
              A ${outerRadius} ${outerRadius} 0 0 0 ${rightStart.x} ${rightStart.y}
              Z
            `}
            fill="black"
          />
        </mask>
      </defs>
      <circle
        cx={centerX}
        cy={centerY}
        r={Math.min(w, h) / 2}
        fill="#232323"
        mask="url(#altimeterHoleMask)"
      />
      {ticks}
      {numbers}
      <NeedleTenThousand
        tipOffset={-131}
        transform={`translate(${centerX}, ${centerY}) rotate(${needleRotationOffset + altitude * 0.0036})`}
      />
      <NeedleThousand
        tipOffset={-133} // adjust this until the tip reaches the outer edge
        transform={`translate(${centerX}, ${centerY}) rotate(${altitude * 0.036})`}
      />
      <NeedleHundred
        tipOffset={-131} // adjust this until the tip reaches the outer edge
        transform={`translate(${centerX}, ${centerY}) rotate(${needleRotationOffset + altitude * 0.36})`}
      />
    </svg>
  );
}
