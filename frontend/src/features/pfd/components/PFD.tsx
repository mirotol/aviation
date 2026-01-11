import React from 'react';
import AttitudeIndicator from './AttitudeIndicator';
import AltimeterTape from './AltimeterTape';
import AirSpeedTape from './AirSpeedTape';
import '../../../components/common/styles/EFISUnit.css';
import { usePFDContext } from '../pages/PFDContext';
import { SoftkeyBar } from '../../cockpit/components/SoftkeyBar';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { PFDAnnunciationBar } from './PFDAnnunciationBar';

const PFD: React.FC = () => {
  const { pfdSoftkeyStack } = usePFDContext();

  return (
    <ScreenLayout
      top={<PFDAnnunciationBar />}
      content={
        <div
          className="pfd-content"
          style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}
        >
          <AirSpeedTape />
          <AttitudeIndicator />
          <AltimeterTape />

          {pfdSoftkeyStack.length > 0 && (
            <div
              className="pfd-mode-indicator"
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                color: 'var(--aviation-green)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                zIndex: 100,
                background: 'rgba(0,0,0,0.7)',
                padding: '2px 6px',
                borderRadius: '2px',
                border: '1px solid var(--aviation-green)',
              }}
            >
              {pfdSoftkeyStack.length > 1 ? 'SUB' : 'ROOT'}
            </div>
          )}
        </div>
      }
      bottom={<SoftkeyBar type="PFD" />}
    />
  );
};

export default PFD;
