import React from 'react';
import PFD from '../../pfd/components/PFD';
import MFD from '../../mfd/components/MFD';
import { EFISUnit } from '../../../components/common/EFISUnit';
import '../styles/Cockpit.css';
import { PageProvider as MFDProvider } from '../../mfd/pages/PageContext';
import { PFDProvider } from '../../pfd/pages/PFDContext';
import { BrightnessProvider } from '../../../context/BrightnessContext';

export default function Cockpit() {
  return (
    <BrightnessProvider>
      <MFDProvider>
        <PFDProvider>
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
        </PFDProvider>
      </MFDProvider>
    </BrightnessProvider>
  );
}
