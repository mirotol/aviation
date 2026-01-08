import React from 'react';
import './TopPanel.css';

export const TopPanel: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="top-panel">
      <div className="unit-label">{label}</div>
    </div>
  );
};
