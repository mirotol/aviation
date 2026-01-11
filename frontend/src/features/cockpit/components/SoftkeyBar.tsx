import React from 'react';
import '../styles/SoftkeyBar.css';
import { usePageContext } from '../../mfd/pages/PageContext';
import { usePFDContext } from '../../pfd/pages/PFDContext';

interface SoftkeyBarProps {
  type: 'PFD' | 'MFD';
}

/**
 * Renders the row of 12 labels at the bottom of the screen.
 * These labels correspond to the physical bezel buttons.
 */
export const SoftkeyBar: React.FC<SoftkeyBarProps> = ({ type }) => {
  const mfdContext = usePageContext();
  const pfdContext = usePFDContext();
  const softkeys = type === 'MFD' ? mfdContext.getVisibleSoftkeys() : pfdContext.getVisibleSoftkeys();

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
