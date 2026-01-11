import React from 'react';
import '../styles/PFDAnnunciationBar.css';

export const PFDAnnunciationBar: React.FC = () => {
  return (
    <div className="pfd-annunciation-bar">
      <div className="annunciation-section left">
        <div className="nav-info">
          <span className="label">GS</span> <span className="value">0</span>
          <span className="label">TAS</span> <span className="value">0</span>
        </div>
      </div>
      <div className="annunciation-section center">
        {/* Autopilot and flight director modes would go here */}
        <div className="afcs-status">
          <span className="mode">ROL</span>
          <span className="active">PIT</span>
          <span className="armed">ALTS</span>
        </div>
      </div>
      <div className="annunciation-section right">
        <div className="nav-data">
          <span className="waypoint">ENROUTE</span>
        </div>
      </div>
    </div>
  );
};
