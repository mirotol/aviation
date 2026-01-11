import React, { useState } from 'react';
import './styles/Knob.css';

interface KnobProps {
  id?: string;
  size?: 'small' | 'large';
  label?: string;
  onOuterChange?: (direction: 'inc' | 'dec', id?: string) => void;
  onInnerChange?: (direction: 'inc' | 'dec', id?: string) => void;
  onPush?: (id?: string) => void;
}

export const Knob: React.FC<KnobProps> = ({
  id,
  size = 'large',
  label,
  onOuterChange,
  onInnerChange,
  onPush,
}) => {
  const [hoverRing, setHoverRing] = useState<'outer' | 'inner' | null>(null);
  const [outerRotation, setOuterRotation] = useState(0);
  const [innerRotation, setInnerRotation] = useState(0);

  const handleWheel = (e: React.WheelEvent, target: 'inner' | 'outer') => {
    e.preventDefault();
    e.stopPropagation();

    const direction: 'inc' | 'dec' = e.deltaY < 0 ? 'inc' : 'dec';

    // Visual rotation step, with 36 it means 10 steps for full circle
    const rotationStep = 36;

    if (target === 'outer') {
      setOuterRotation((prev) => prev + (direction === 'inc' ? rotationStep : -rotationStep));
      onOuterChange?.(direction, id);
    } else {
      setInnerRotation((prev) => prev + (direction === 'inc' ? rotationStep : -rotationStep));
      onInnerChange?.(direction, id);
    }
  };

  return (
    <div className={`bezel-knob-container ${size}`}>
      <div
        className={`bezel-knob outer-ring ${hoverRing === 'outer' ? 'hover' : ''}`}
        onMouseEnter={() => setHoverRing('outer')}
        onMouseLeave={() => setHoverRing(null)}
        onWheel={(e) => handleWheel(e, 'outer')}
        onClick={() => onPush?.(id)}
        style={{ '--knob-rotation': `${outerRotation}deg` } as React.CSSProperties}
      >
        <div className="knob-indicator outer" />

        <div
          className={`inner-ring ${hoverRing === 'inner' ? 'hover' : ''}`}
          onMouseEnter={() => setHoverRing('inner')}
          onMouseLeave={() => setHoverRing('outer')}
          onWheel={(e) => {
            e.stopPropagation();
            handleWheel(e, 'inner');
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPush?.(id);
          }}
          style={
            {
              '--inner-rotation': `${innerRotation}deg`,
              '--knob-rotation': `${outerRotation}deg`,
            } as React.CSSProperties
          }
        >
          <div className="knob-indicator inner" />
        </div>
      </div>

      {label && <div className="knob-label">{label}</div>}
    </div>
  );
};
