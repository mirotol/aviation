import React from 'react';
import { BezelButton } from './BezelButton';
import './styles/BottomPanel.css';
import { usePageContext } from '../../features/mfd/pages/PageContext';

const ArrowUpIcon = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 1 L 11 9 L 1 9 Z" fill="white" />
  </svg>
);

export const BottomPanel: React.FC<{ type: 'PFD' | 'MFD' }> = ({ type }) => {
  const prefix = `${type}_`;
  const { getVisibleSoftkeys } = usePageContext();

  const softkeys = getVisibleSoftkeys(type);

  return (
    <div className="bottom-panel">
      <div className="softkeys-container">
        {softkeys.map((key, i) => (
          <BezelButton
            key={i}
            id={`${prefix}SOFTKEY_${i + 1}`}
            variant="softkey"
            label={<ArrowUpIcon />}
            onClick={key.action}
          />
        ))}
      </div>
    </div>
  );
};
