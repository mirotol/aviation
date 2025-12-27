import React, { JSX } from 'react';

interface KollsmanWindowProps {
  width?: number | string;
  height?: number | string;
  value?: number; // current pressure in inHg, e.g., 29.92
  min?: number; // minimum displayed value, e.g., 29.5
  max?: number; // maximum displayed value, e.g., 30.5
  bgColor?: string; // background color of the window
}

export default function KollsmanWindow({
  width = 100,
  height = 100,
  value = 29.92,
  min = 29.5,
  max = 30.5,
  bgColor = '#171717ff',
}: KollsmanWindowProps) {
  const w = typeof width === 'number' ? width : parseFloat(width);
  const h = typeof height === 'number' ? height : parseFloat(height);
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) / 2.5;

  const elements: JSX.Element[] = [];

  const step = 0.1; // major tick step
  const minorPerMajor = 4;

  const tickOuterRadius = radius + 8;
  const tickInnerRadius = radius - 6;
  const labelRadius = radius - 22;

  // quarter-circle display
  const displayAngle = Math.PI / 2; // 90°
  const startAngle = -displayAngle / 2;

  // Compute drum rotation so that "value" aligns at 90° (window)
  const tValue = (value - min) / (max - min);
  const drumRotation = -tValue * displayAngle + displayAngle / 2;

  // Background circle
  elements.push(<circle key="bg" cx={centerX} cy={centerY} r={radius + 10} fill={bgColor} />);

  // Major ticks and labels
  const majorTickCount = Math.floor((max - min) / step) + 1;

  for (let i = 0; i < majorTickCount; i++) {
    const val = +(min + i * step).toFixed(1);
    const t = (val - min) / (max - min);

    const angle = startAngle + t * displayAngle + drumRotation;
    const deg = (angle * 180) / Math.PI; // convert to degrees for SVG rotation

    // Major tick (outer)
    const x1 = centerX + tickInnerRadius * Math.cos(angle);
    const y1 = centerY + tickInnerRadius * Math.sin(angle);
    const x2 = centerX + tickOuterRadius * Math.cos(angle);
    const y2 = centerY + tickOuterRadius * Math.sin(angle);

    elements.push(
      <line key={`major-${val}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={2} />
    );

    // Label (inner) rotated
    const lx = centerX + labelRadius * Math.cos(angle);
    const ly = centerY + labelRadius * Math.sin(angle);

    elements.push(
      <text
        key={`label-${val}`}
        x={lx}
        y={ly}
        fill="#fff"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(${deg}, ${lx}, ${ly})`}
      >
        {val.toFixed(1)}
      </text>
    );

    // Minor ticks
    if (i < majorTickCount - 1) {
      for (let j = 1; j <= minorPerMajor; j++) {
        const minorVal = val + (j * step) / (minorPerMajor + 1);
        const tMinor = (minorVal - min) / (max - min);
        const mAngle = startAngle + tMinor * displayAngle + drumRotation;

        const mx1 = centerX + (tickInnerRadius + 2) * Math.cos(mAngle);
        const my1 = centerY + (tickInnerRadius + 2) * Math.sin(mAngle);
        const mx2 = centerX + (tickOuterRadius - 2) * Math.cos(mAngle);
        const my2 = centerY + (tickOuterRadius - 2) * Math.sin(mAngle);

        elements.push(
          <line
            key={`minor-${minorVal}`}
            x1={mx1}
            y1={my1}
            x2={mx2}
            y2={my2}
            stroke="#aaa"
            strokeWidth={1}
          />
        );
      }
    }
  }

  return <g>{elements}</g>;
}
