import React from 'react';

interface Props {
  idPrefix?: string;
  transform?: string;
  tipOffset?: number; // how far to move the needle tip outward to get pivot centered
}

export default function NeedleThousand({ transform, tipOffset = 0 }: Props) {
  const pivotX = 68;
  const pivotY = 200;

  return (
    <g transform={transform}>
      <defs>
        <filter filterUnits="objectBoundingBox" id="shadowFilter">
          <feGaussianBlur stdDeviation="5" result="blur" in="SourceAlpha"></feGaussianBlur>
          <feOffset dy="0" dx="0" result="offsetBlurredAlpha" in="blur"></feOffset>
          <feMerge>
            <feMergeNode in="offsetBlurredAlpha"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>

      {/* Translate pivot to origin, then move the tip outward */}
      <g filter="url(#shadowFilter)" transform={`translate(${-pivotX + tipOffset}, ${-pivotY})`}>
        <polygon
          fill="#FFFFFF"
          points="211.838,160.802 200.343,132.368 200.338,132.386 200.333,132.368 188.838,160.802 200.333,207 
		200.338,206.977 200.343,207 	"
        />
        <polygon
          fill="none"
          stroke="#B2B2B2"
          stroke-width="0.5"
          stroke-miterlimit="10"
          points="211.838,160.802 200.343,132.368 
		200.338,132.386 200.333,132.368 188.838,160.802 200.333,207 200.338,206.977 200.343,207 	"
        />
      </g>
      <g filter="url(#shadowFilter)" transform={`translate(${-pivotX + tipOffset}, ${-pivotY})`}>
        <path
          fill="#232323"
          d="M200.331,196.091c0,0-9.492,18.192-9.331,24.818c0.062,2.56,1.828,4.228,9.331,4.228
		s9.114-1.709,9.146-4.228c0.083-6.507-8.809-24.493-8.809-24.493"
        />
        <path
          fill="none"
          stroke="#353535"
          stroke-width="0.5"
          stroke-miterlimit="10"
          d="M200.331,196.091c0,0-9.492,18.192-9.331,24.818
		c0.062,2.56,1.828,4.228,9.331,4.228s9.114-1.709,9.146-4.228c0.083-6.507-8.809-24.493-8.809-24.493"
        />
      </g>
    </g>
  );
}
