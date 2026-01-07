import React, { useEffect } from 'react';
import PFD from './PFD';
import MFD from './MFD';
import { EFISUnit } from './EFISUnit';
import './Cockpit.css';
import { useFlightPlan } from '../../hooks/useFlightPlan';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function Cockpit() {
  const { updateFlightPlan } = useFlightPlan();
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    console.log('Injecting initial Flight Plan...');
    updateFlightPlan([
      { ident: 'EFHK', type: 'large_airport', latitude: 60.318363, longitude: 24.963341 },
      { ident: 'EFNU', type: 'small_airport', latitude: 60.3339, longitude: 24.2964 },
      { ident: 'EFNS', type: 'small_airport', latitude: 60.52, longitude: 24.831699 },
      { ident: 'EFHV', type: 'small_airport', latitude: 60.6544, longitude: 24.8811 },
    ]);

    return () => {};
  }, [isConnected]);

  return (
    <main className="cockpit-main">
      <div className="instrument-panel">
        <EFISUnit type="PFD">
          <PFD />
        </EFISUnit>

        <EFISUnit type="MFD">
          <MFD />
        </EFISUnit>
      </div>
    </main>
  );
}
