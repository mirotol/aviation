import React from 'react';
import NavigationDisplay from '../../navigation/NavigationDisplay';

export const NavigationMapPage: React.FC = () => <NavigationDisplay initialRangeNM={20} />;

export const TrafficMapPage: React.FC = () => (
  <div style={{ color: 'white', padding: '20px' }}>Traffic Map Content</div>
);

export const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ color: 'white', padding: '20px' }}>{name} Content (Placeholder)</div>
);
