import React from 'react';
import PFD from './PFD';
import MFD from './MFD';
import './Cockpit.css';

export default function Cockpit() {
  return (
    <main className="cockpit-main">
      <div className="instrument-panel">
        <div className="efis-container">
          <PFD />
          <MFD />
        </div>
      </div>
    </main>
  );
}
