import React from 'react';
import AttitudeIndicator from '../attitudeindicator/AttitudeIndicator';
import AltimeterTape from '../altimeter/AltimeterTape';
import AirSpeedTape from '../airspeed/AirSpeedTape';
import './Cockpit.css';

export default function Cockpit() {
  return (
    <main className="cockpit-main">
      <div className="instrument-panel">
        <AirSpeedTape />
        <AttitudeIndicator />
        <AltimeterTape />
      </div>
    </main>
  );
}
