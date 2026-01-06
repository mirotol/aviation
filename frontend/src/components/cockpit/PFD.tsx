import React from 'react';
import AttitudeIndicator from '../attitudeindicator/AttitudeIndicator';
import AltimeterTape from '../altimeter/AltimeterTape';
import AirSpeedTape from '../airspeed/AirSpeedTape';
import './EFIS.css';

const PFD: React.FC = () => {
  return (
    <div className="efis-screen pfd">
      <div className="screen-bezel">
        <AirSpeedTape />
        <AttitudeIndicator />
        <AltimeterTape />
      </div>
      <div className="screen-label">PFD</div>
    </div>
  );
};

export default PFD;
