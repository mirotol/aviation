/**
 * This file contains the actual React components for each page.
 * To add a new page:
 * 1. Define a new React component here (or import it from another file).
 * 2. Register it in the MFD_PAGES object in PageContext.tsx.
 */

import React from 'react';
import NavigationDisplay from '../components/NavigationDisplay';

export const NavigationMapPage: React.FC = () => <NavigationDisplay initialRangeNM={20} />;

export const TrafficMapPage: React.FC = () => (
  <div style={{ color: 'white', padding: '20px' }}>Traffic Map Content</div>
);

export const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ color: 'white', padding: '20px' }}>{name} Content (Placeholder)</div>
);
