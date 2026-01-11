import React from 'react';
import { Knob } from './Knob';
import { BezelButton } from './BezelButton';
import './styles/RightSidePanel.css';
import { usePageContext, MFD_PAGES } from '../../features/mfd/pages/PageContext';

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

export const RightSidePanel: React.FC<{ unitType?: 'PFD' | 'MFD' }> = ({ unitType = 'PFD' }) => {
  const prefix = `${unitType}_`;
  const {
    mfdPageGroup,
    mfdPageSelection,
    mfdModalPage,
    nextMfdPageGroup,
    prevMfdPageGroup,
    nextMfdPageSelection,
    prevMfdPageSelection,
    toggleMfdModal,
  } = usePageContext();

  const currentGroup = mfdModalPage ?? mfdPageGroup;
  const pageDef = unitType === 'MFD' ? MFD_PAGES[currentGroup][mfdPageSelection] : null;

  const handleFmsOuter = (dir: 'inc' | 'dec') => {
    if (unitType === 'MFD') {
      if (pageDef?.onOuterKnob) {
        pageDef.onOuterKnob(dir);
      } else {
        if (dir === 'inc') nextMfdPageGroup();
        else prevMfdPageGroup();
      }
    }
  };

  const handleFmsInner = (dir: 'inc' | 'dec') => {
    if (unitType === 'MFD') {
      if (pageDef?.onInnerKnob) {
        pageDef.onInnerKnob(dir);
      } else {
        if (dir === 'inc') nextMfdPageSelection();
        else prevMfdPageSelection();
      }
    }
  };

  const handleButtonClick = (btn: string) => {
    if (unitType === 'MFD') {
      if (btn === 'FPL') toggleMfdModal('FPL');
      else if (btn === 'PROC') toggleMfdModal('PROC');
      else if (btn === 'ENT' && pageDef?.onEnt) pageDef.onEnt();
      else if (btn === 'CLR' && pageDef?.onClr) pageDef.onClr();
    }
    console.log(`${prefix}${btn} Clicked`);
  };

  return (
    <div className="side-panel right-side-panel">
      <div className="side-panel-top-group">
        <Knob id={`${prefix}VOL_ID`} label="VOL/ID" onPush={(id) => console.log(`${id} Pushed`)} />
        <BezelButton
          id={`${prefix}COM_SWAP`}
          label={<DoubleArrowIcon />}
          onClick={(id) => console.log(`${id} Clicked`)}
        />
        <Knob
          id={`${prefix}COM`}
          label="COM"
          onOuterChange={(dir, id) => console.log(`${id} Outer ${dir}`)}
          onInnerChange={(dir, id) => console.log(`${id} Inner ${dir}`)}
          onPush={(id) => console.log(`${id} Pushed`)}
        />
      </div>

      <div className="side-panel-row">
        <Knob
          id={`${prefix}CRS_BARO`}
          label="CRS/BARO"
          onPush={(id) => console.log(`${id} Reset`)}
        />
      </div>

      <div className="side-panel-row">
        <Knob
          id={`${prefix}RANGE`}
          label="RANGE"
          onOuterChange={(dir, id) => console.log(`${id} Outer ${dir}`)}
          onInnerChange={(dir, id) => console.log(`${id} Inner ${dir}`)}
          onPush={(id) => console.log(`${id} Pushed`)}
        />
        <div className="button-grid-6">
          {['DIR', 'MENU', 'FPL', 'PROC', 'CLR', 'ENT'].map((btn) => (
            <BezelButton
              key={btn}
              id={`${prefix}${btn}`}
              label={btn}
              variant="small"
              className={
                (btn === 'FPL' && mfdModalPage === 'FPL') ||
                (btn === 'PROC' && mfdModalPage === 'PROC')
                  ? 'active'
                  : ''
              }
              onClick={() => handleButtonClick(btn)}
            />
          ))}
        </div>
      </div>

      <div className="side-panel-row">
        <Knob
          id={`${prefix}FMS`}
          label="FMS"
          onOuterChange={(dir) => handleFmsOuter(dir)}
          onInnerChange={(dir) => handleFmsInner(dir)}
          onPush={(id) => console.log(`${id} Pushed`)}
        />
      </div>
    </div>
  );
};
