import React from 'react';
import NavigationDisplay from '../navigation/NavigationDisplay';
import './EFIS.css';

const MFD: React.FC = () => {
  return (
    <NavigationDisplay initialRangeNM={20} />
  );
};

export default MFD;
