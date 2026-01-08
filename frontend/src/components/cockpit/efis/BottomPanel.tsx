import React from 'react';
import { BezelButton } from './BezelButton';
import './BottomPanel.css';

export const BottomPanel: React.FC<{ type: 'PFD' | 'MFD' }> = ({ type }) => {
  const prefix = `${type}_`;

  return (
    <div className="bottom-panel">
      <div className="softkeys-container">
        {[...Array(12)].map((_, i) => (
          <BezelButton
            key={i}
            id={`${prefix}SOFTKEY_${i + 1}`}
            variant="softkey"
            onClick={(id) => console.log(`${id} Clicked`)}
          />
        ))}
      </div>
    </div>
  );
};
