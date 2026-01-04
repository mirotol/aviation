import React from 'react';
import AttitudeIndicator from '../attitudeindicator/AttitudeIndicator';
import Altimeter from '../altimeter/Altimeter';
import AirspeedIndicator from '../airspeed/AirSpeedIndicator';
import './Cockpit.css';

export default function Cockpit() {
  return (
    <main className="cockpit-main">
      <div className="instrument-panel">
        {/* Basic T-Arrangement: Airspeed - Attitude - Altimeter */}
        <AirspeedIndicator width={400} height={400} />
        <AttitudeIndicator width={450} height={450} />
        <Altimeter width={400} height={400} />
      </div>
    </main>
  );
}
