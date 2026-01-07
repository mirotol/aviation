import React from 'react';
import { SideKeys } from './SideKeys';
import { SoftKeys } from './SoftKeys';
import { DisplayViewport } from './DisplayViewport';
import './EFIS.css';

interface EFISUnitProps {
  type: 'PFD' | 'MFD';
  children: React.ReactNode;
}

export const EFISUnit: React.FC<EFISUnitProps> = ({ type, children }) => {
  return (
    <div className={`efis-unit efis-${type.toLowerCase()}`}>
      <div className="unit-label">{type}</div>
      <div className="screen-bezel">
        <SideKeys position="left" />
        <DisplayViewport>
          {children}
        </DisplayViewport>
        <SideKeys position="right" />
      </div>

      <SoftKeys type={type} />
    </div>
  );
};
