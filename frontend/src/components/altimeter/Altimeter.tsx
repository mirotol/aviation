import React, { JSX } from 'react';
import { useAltitude } from '../../hooks/useAltitude';
import NeedleHundred from './NeedleHundred';
import NeedleThousand from './NeedleThousand';
import NeedleTenThousand from './NeedleTenThousand';
import KollsmanWindow from './KollsmanWindow';

interface AltimeterProps {
  width?: number | string;
  height?: number | string;
}

export default function Altimeter({ width = 400, height = 400 }: AltimeterProps) {
  const { altitude, kollsmanPressure } = useAltitude();

  // --- Kollsman Calculation ---
  const standardPressure = 29.92; // inHg
  const pressureCorrection = (standardPressure - kollsmanPressure) * 1000; // feet per inHg
  const adjustedAltitude = altitude + pressureCorrection;

  const w = typeof width === 'number' ? width : parseFloat(width);
  const h = typeof height === 'number' ? height : parseFloat(height);
  const centerX = w / 2;
  const centerY = h / 2;

  const outerRadius = Math.min(w, h) / 2.4;
  const innerRadius = Math.min(w, h) / 4;

  const polarToCartesian = (r: number, angle: number) => ({
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle),
  });

  const startAngle = -Math.PI / 11.5;
  const endAngle = Math.PI / 11.5;

  const leftStart = polarToCartesian(innerRadius, startAngle);
  const leftEnd = polarToCartesian(innerRadius, endAngle);
  const rightEnd = polarToCartesian(outerRadius, endAngle);
  const rightStart = polarToCartesian(outerRadius, startAngle);

  // --- Ticks ---
  const majorTickCount = 10;
  const minorTickCount = 4;
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

  // --- Numbers ---
  const numbers: JSX.Element[] = [];
  const labelRadius = tickRadius - tickLengthMajor - 15;

  for (let i = 0; i < majorTickCount; i++) {
    if (i === 6) continue;
    let angle = i * majorStep - Math.PI / 2;
    if (i === 2) angle -= 0.13;
    if (i === 3) angle += 0.12;

    const pos = polarToCartesian(labelRadius, angle);
    const upperVerticalGroup = [0, 1, 2, 8, 9];
    const yOffset = upperVerticalGroup.includes(i) ? 15 : 7;

    numbers.push(
      <text
        key={`number-${i}`}
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

  // --- Extra labels ---
  const labels: JSX.Element[] = [];
  const zeroAngle = -Math.PI / 2;
  const labelDistance = 140;

  const label100 = polarToCartesian(labelDistance, zeroAngle - Math.PI / 18);
  const labelFeet = polarToCartesian(labelDistance, zeroAngle + Math.PI / 18);

  labels.push(
    <text
      key="label-100"
      x={label100.x}
      y={label100.y}
      fill="#FFFFFF"
      fontFamily="sans-serif"
      fontSize={16}
      textAnchor="end"
      alignmentBaseline="middle"
    >
      100
    </text>
  );

  labels.push(
    <text
      key="label-feet"
      x={labelFeet.x}
      y={labelFeet.y}
      fill="#FFFFFF"
      fontFamily="sans-serif"
      fontSize={16}
      textAnchor="start"
      alignmentBaseline="middle"
    >
      FEET
    </text>
  );

  // Left-side "CALIBRATED TO 20,000 FEET"
  const calibratedDistance = 50;
  const calibratedAngle = Math.PI;
  const calibratedPos = polarToCartesian(calibratedDistance, calibratedAngle);

  labels.push(
    <text
      key="label-calibrated"
      x={calibratedPos.x}
      y={calibratedPos.y + 5}
      fill="#FFFFFF"
      fontFamily="sans-serif"
      fontSize={12}
      textAnchor="end"
      alignmentBaseline="middle"
    >
      <tspan x={calibratedPos.x} dy="-1.2em">
        CALIBRATED
      </tspan>
      <tspan x={calibratedPos.x} dy="1.2em">
        TO
      </tspan>
      <tspan x={calibratedPos.x} dy="1.2em">
        20,000 FEET
      </tspan>
    </text>
  );

  const needleRotationOffset = 90;

  // --- Kollsman Indicator ---
  const kollsmanPointerRadius = Math.min(w, h) / 2.2;
  const pointerAngle = 0;
  const pointerHeight = 12;
  const halfAngle = 0.025;

  const pointerTip = polarToCartesian(kollsmanPointerRadius - pointerHeight, pointerAngle);
  const pointerTop = polarToCartesian(kollsmanPointerRadius, pointerAngle - halfAngle);
  const pointerBottom = polarToCartesian(kollsmanPointerRadius, pointerAngle + halfAngle);

  const squareDepth = 14;
  const squareTopLeft = { x: pointerTop.x - 0.5, y: pointerTop.y };
  const squareTopRight = { x: pointerBottom.x - 0.5, y: pointerBottom.y };
  const squareBottomRight = { x: pointerBottom.x + squareDepth, y: pointerBottom.y };
  const squareBottomLeft = { x: pointerTop.x + squareDepth, y: pointerTop.y };

  const kollsmanIndicator = (
    <>
      <polygon
        points={`${pointerTip.x},${pointerTip.y} ${pointerTop.x},${pointerTop.y} ${pointerBottom.x},${pointerBottom.y}`}
        fill="#fff"
      />
      <polygon
        points={`
          ${squareTopLeft.x},${squareTopLeft.y} 
          ${squareTopRight.x},${squareTopRight.y} 
          ${squareBottomRight.x},${squareBottomRight.y} 
          ${squareBottomLeft.x},${squareBottomLeft.y}
        `}
        fill="#fff"
      />
    </>
  );

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

      <KollsmanWindow width={w} height={h} value={kollsmanPressure} min={29.5} max={30.5} />
      <circle
        cx={centerX}
        cy={centerY}
        r={Math.min(w, h) / 2}
        fill="#232323"
        mask="url(#altimeterHoleMask)"
      />

      {kollsmanIndicator}
      {ticks}
      {numbers}
      {labels}

      <NeedleTenThousand
        tipOffset={-131}
        transform={`translate(${centerX}, ${centerY}) rotate(${needleRotationOffset + adjustedAltitude * 0.0036})`}
      />
      <NeedleThousand
        tipOffset={-133}
        transform={`translate(${centerX}, ${centerY}) rotate(${adjustedAltitude * 0.036})`}
      />
      <NeedleHundred
        tipOffset={-131}
        transform={`translate(${centerX}, ${centerY}) rotate(${needleRotationOffset + adjustedAltitude * 0.36})`}
      />
    </svg>
  );
}
