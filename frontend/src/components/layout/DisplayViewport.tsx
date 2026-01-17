import React from 'react';
import './styles/DisplayViewport.css';
import { useBrightness } from '../../context/BrightnessContext';

interface DisplayViewportProps {
  children: React.ReactNode;
  type?: 'PFD' | 'MFD';
}

export const DisplayViewport: React.FC<DisplayViewportProps> = ({ children, type }) => {
  const { pfdBrightness, mfdBrightness } = useBrightness();

  const brightness = type === 'PFD' ? pfdBrightness : mfdBrightness;
  const dimAmount = 1 - brightness / 100;

  return (
    <div className="display-viewport">
      {children}
      <div className="display-dimmer" style={{ backgroundColor: `rgba(0, 0, 0, ${dimAmount})` }} />
    </div>
  );
};
