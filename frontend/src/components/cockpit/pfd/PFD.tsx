import React from 'react';
import AttitudeIndicator from '../../attitudeindicator/AttitudeIndicator';
import AltimeterTape from '../../altimeter/AltimeterTape';
import AirSpeedTape from '../../airspeed/AirSpeedTape';
import '../efis/EFISUnit.css';
import { usePageContext } from '../pages/PageContext';
import { SoftkeyBar } from '../efis/SoftkeyBar';
import { ScreenLayout } from '../efis/ScreenLayout';
import { PFDAnnunciationBar } from './PFDAnnunciationBar';
import { EngineDisplay } from '../mfd/EngineDisplay';

const PFD: React.FC = () => {
  const { pfdSoftkeyStack } = usePageContext();

  return (
    <ScreenLayout
      top={<PFDAnnunciationBar />}
      leftSide={<EngineDisplay />}
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
