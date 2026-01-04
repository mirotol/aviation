import React from 'react';
import NavigationDisplay from '../navigation/NavigationDisplay';
import './EFIS.css';

const MFD: React.FC = () => {
  return (
    <div className="efis-screen mfd">
      <div className="screen-bezel">
        <NavigationDisplay initialRangeNM={20} />
      </div>
      <div className="screen-label">MFD</div>
    </div>
  );
};

export default MFD;