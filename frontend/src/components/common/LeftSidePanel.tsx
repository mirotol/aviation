import React from 'react';
import { Knob } from './Knob';
import { BezelButton } from './BezelButton';
import './styles/LeftSidePanel.css';
import { usePageContext } from '../../features/mfd/pages/PageContext';
import { usePFDContext } from '../../features/pfd/pages/PFDContext';

const DoubleArrowIcon = () => (
  <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 6 2 L 1 7 L 6 12"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M 1 7 L 23 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <path
      d="M 18 2 L 23 7 L 18 12"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LeftSidePanel: React.FC<{ unitType?: 'PFD' | 'MFD' }> = ({ unitType = 'PFD' }) => {
  const prefix = `${unitType}_`;
  const mfdContext = usePageContext();
  const pfdContext = usePFDContext();

  const handleKnobChange = (id: string, type: 'inner' | 'outer', dir: 'inc' | 'dec') => {
    // Shared knob logic could be added here later if needed
    console.log(`${id} ${type} ${dir}`);
  };

  return (
    <div className="side-panel left-side-panel">
      <div className="side-panel-top-group">
        <Knob id={`${prefix}VOL_SQ`} label="VOL/SQ" onPush={(id) => console.log(`${id} Pushed`)} />
        <BezelButton
          id={`${prefix}NAV_SWAP`}
          label={<DoubleArrowIcon />}
          onClick={(id) => console.log(`${id} Clicked`)}
        />
        <Knob
          id={`${prefix}NAV`}
          label="NAV"
          onOuterChange={(dir, id) => console.log(`${id} Outer ${dir}`)}
          onInnerChange={(dir, id) => console.log(`${id} Inner ${dir}`)}
          onPush={(id) => console.log(`${id} Pushed`)}
        />
      </div>

      <div className="side-panel-row">
        <Knob id={`${prefix}HDG`} label="HDG" onPush={(id) => console.log(`${id} Sync`)} />
      </div>

      <div className="side-panel-row">
        <div className="button-grid-12">
          {['AP', 'FD', 'HDG', 'ALT', 'NAV', 'VNV', 'APR', 'BC', 'VS', 'NU', 'FLC', 'ND'].map(
            (btn) => (
              <BezelButton
                key={btn}
                id={`${prefix}${btn}`}
                label={btn}
                variant="small"
                onClick={(id) => console.log(`${id} Clicked`)}
              />
            )
          )}
        </div>
      </div>

      <div className="side-panel-row">
        <Knob id={`${prefix}ALT`} label="ALT" onPush={(id) => console.log(`${id} Sync`)} />
      </div>
    </div>
  );
};
