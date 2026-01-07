import React from 'react';
import NavigationDisplay from '../../navigation/NavigationDisplay';
import '../efis/EFIS.css';

const MFD: React.FC = () => {
  return (
    <NavigationDisplay initialRangeNM={20} />
  );
};

export default MFD;
