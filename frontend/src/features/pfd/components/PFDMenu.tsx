import React from 'react';
import { usePFDContext } from '../pages/PFDContext';
import { PFDSetupMenu } from '../pages/menus/PFDSetupMenu';
import { PlaceholderMenu } from '../pages/menus/PlaceholderMenu';
import './PFDMenu.css';

export const PFDMenu: React.FC = () => {
  const { pfdMenuMode } = usePFDContext();

  if (!pfdMenuMode) return null;

  return (
    <div className="pfd-menu-overlay">
      <div className="pfd-menu-window">
        {pfdMenuMode === 'SETUP' && <PFDSetupMenu />}
        {pfdMenuMode === 'DIRECT_TO' && <PlaceholderMenu title="Direct To" />}
        {pfdMenuMode === 'FPL' && <PlaceholderMenu title="Flight Plan" />}
        {pfdMenuMode === 'PROC' && <PlaceholderMenu title="Procedures" />}
      </div>
    </div>
  );
};
