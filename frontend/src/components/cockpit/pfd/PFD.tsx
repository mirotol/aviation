import React from 'react';
import AttitudeIndicator from '../../attitudeindicator/AttitudeIndicator';
import AltimeterTape from '../../altimeter/AltimeterTape';
import AirSpeedTape from '../../airspeed/AirSpeedTape';
import '../efis/EFIS.css';

const PFD: React.FC = () => {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <AirSpeedTape />
      <AttitudeIndicator />
      <AltimeterTape />
    </div>
  );
};

export default PFD;
