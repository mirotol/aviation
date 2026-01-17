import React, { useState, useEffect } from 'react';
import { usePFDContext } from '../PFDContext';
import { useBrightness } from '../../../../context/BrightnessContext';

export const PFDSetupMenu: React.FC = () => {
  const { setOnPfdFmsOuter, setOnPfdFmsInner, closePfdMenu, setOnPfdClr, setOnPfdEnt } =
    usePFDContext();
  const {
    pfdMode,
    setPfdMode,
    pfdBrightness,
    setPfdBrightness,
    mfdMode,
    setMfdMode,
    mfdBrightness,
    setMfdBrightness,
  } = useBrightness();

  // Focusable items
  type Focusable = 'PFD_MODE' | 'PFD_BRIGHT' | 'MFD_MODE' | 'MFD_BRIGHT';
  const [focus, setFocus] = useState<Focusable>('PFD_MODE');

  const getNextFocus = (current: Focusable, dir: 'inc' | 'dec'): Focusable => {
    const items: Focusable[] = ['PFD_MODE', 'PFD_BRIGHT', 'MFD_MODE', 'MFD_BRIGHT'];

    const idx = items.indexOf(current);
    if (dir === 'inc') {
      return items[(idx + 1) % items.length];
    } else {
      return items[(idx - 1 + items.length) % items.length];
    }
  };

  useEffect(() => {
    setOnPfdFmsOuter(() => (dir: 'inc' | 'dec') => {
      setFocus((prev) => getNextFocus(prev, dir));
    });

    setOnPfdFmsInner(() => (dir: 'inc' | 'dec') => {
      if (focus === 'PFD_MODE') {
        setPfdMode(pfdMode === 'AUTO' ? 'MANUAL' : 'AUTO');
      } else if (focus === 'PFD_BRIGHT') {
        const delta = dir === 'inc' ? 1 : -1;
        setPfdBrightness(pfdBrightness + delta);
      } else if (focus === 'MFD_MODE') {
        setMfdMode(mfdMode === 'AUTO' ? 'MANUAL' : 'AUTO');
      } else if (focus === 'MFD_BRIGHT') {
        const delta = dir === 'inc' ? 1 : -1;
        setMfdBrightness(mfdBrightness + delta);
      }
    });

    setOnPfdClr(() => () => closePfdMenu());
    setOnPfdEnt(() => () => closePfdMenu());

    return () => {
      setOnPfdFmsOuter(undefined);
      setOnPfdFmsInner(undefined);
      setOnPfdClr(undefined);
      setOnPfdEnt(undefined);
    };
  }, [
    focus,
    setOnPfdFmsOuter,
    setOnPfdFmsInner,
    setOnPfdClr,
    setOnPfdEnt,
    closePfdMenu,
    pfdMode,
    pfdBrightness,
    mfdMode,
    mfdBrightness,
    setPfdMode,
    setPfdBrightness,
    setMfdMode,
    setMfdBrightness,
  ]);

  return (
    <>
      <div className="pfd-menu-header">PFD SETUP MENU</div>
      <div className="pfd-menu-content">
        <div className="pfd-menu-row">
          <span>PFD DISPLAY</span>
          <div className="pfd-menu-values">
            <span className={`value ${focus === 'PFD_MODE' ? 'focused' : ''}`}>{pfdMode}</span>
            <span className={`value ${focus === 'PFD_BRIGHT' ? 'focused' : ''}`}>
              {pfdBrightness.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="pfd-menu-row">
          <span>MFD DISPLAY</span>
          <div className="pfd-menu-values">
            <span className={`value ${focus === 'MFD_MODE' ? 'focused' : ''}`}>{mfdMode}</span>
            <span className={`value ${focus === 'MFD_BRIGHT' ? 'focused' : ''}`}>
              {mfdBrightness.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
