import React from 'react';
import { LeftSidePanel } from './LeftSidePanel';
import { RightSidePanel } from './RightSidePanel';
import { BottomPanel } from './BottomPanel';
import { TopPanel } from './TopPanel';
import { DisplayViewport } from './DisplayViewport';
import './Bezel.css';

interface BezelProps {
  type: 'PFD' | 'MFD';
  children: React.ReactNode;
}

export const Bezel: React.FC<BezelProps> = ({ type, children }) => {
  return (
    <div className="bezel-frame">
      <TopPanel label={type} />

      <div className="bezel-middle-row">
        <LeftSidePanel unitType={type} />
        <DisplayViewport>{children}</DisplayViewport>
        <RightSidePanel unitType={type} />
      </div>

      <BottomPanel type={type} />
    </div>
  );
};
