import React from 'react';
import NavigationDisplay from '../../navigation/NavigationDisplay';
import '../efis/EFISUnit.css';

const MFD: React.FC = () => {
  return <NavigationDisplay initialRangeNM={20} />;
};

export default MFD;
