import React, { useEffect } from 'react';
import PFD from '../../pfd/components/PFD';
import MFD from '../../mfd/components/MFD';
import { EFISUnit } from '../../../components/common/EFISUnit';
import '../styles/Cockpit.css';
import { useFlightPlan } from '../../../hooks/useFlightPlan';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { PageProvider } from '../../mfd/pages/PageContext';

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
    <PageProvider>
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
    </PageProvider>
  );
}
