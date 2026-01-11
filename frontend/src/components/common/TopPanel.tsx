import React from 'react';
import './styles/TopPanel.css';

export const TopPanel: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="top-panel">
      <div className="unit-label">{label}</div>
    </div>
  );
};
