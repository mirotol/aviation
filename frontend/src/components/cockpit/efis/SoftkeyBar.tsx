import React from 'react';
import './SoftkeyBar.css';
import { usePageContext } from '../pages/PageContext';

interface SoftkeyBarProps {
  type: 'PFD' | 'MFD';
}

/**
 * Renders the row of 12 labels at the bottom of the screen.
 * These labels correspond to the physical bezel buttons.
 */
export const SoftkeyBar: React.FC<SoftkeyBarProps> = ({ type }) => {
  const { getVisibleSoftkeys } = usePageContext();
  const softkeys = getVisibleSoftkeys(type);

  return (
    <div className="softkey-bar">
      {softkeys.map((key, i) => (
        <div key={i} className={`softkey-label ${key.label ? 'has-label' : ''}`}>
          {key.label}
        </div>
      ))}
    </div>
  );
};
