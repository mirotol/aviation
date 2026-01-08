import React from 'react';
import { Bezel } from './Bezel';
import './EFISUnit.css';

interface EFISUnitProps {
  type: 'PFD' | 'MFD';
  children: React.ReactNode;
}

export const EFISUnit: React.FC<EFISUnitProps> = ({ type, children }) => {
  return (
    <div className={`efis-unit efis-${type.toLowerCase()}`}>
      <Bezel type={type}>{children}</Bezel>
    </div>
  );
};
