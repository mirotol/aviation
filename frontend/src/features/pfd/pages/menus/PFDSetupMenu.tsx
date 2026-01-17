import React, { useState, useEffect } from 'react';
import { usePFDContext } from '../PFDContext';

export const PFDSetupMenu: React.FC = () => {
  const { setOnPfdFmsOuter, setOnPfdFmsInner, closePfdMenu, setOnPfdClr, setOnPfdEnt } =
    usePFDContext();

  const [pfdDisplayMode, setPfdDisplayMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [pfdBrightness, setPfdBrightness] = useState(100);
  const [mfdDisplayMode, setMfdDisplayMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [mfdBrightness, setMfdBrightness] = useState(100);

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
        setPfdDisplayMode((prev) => (prev === 'AUTO' ? 'MANUAL' : 'AUTO'));
      } else if (focus === 'PFD_BRIGHT') {
        setPfdBrightness((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return Math.min(Math.max(prev + delta, 0), 100);
        });
      } else if (focus === 'MFD_MODE') {
        setMfdDisplayMode((prev) => (prev === 'AUTO' ? 'MANUAL' : 'AUTO'));
      } else if (focus === 'MFD_BRIGHT') {
        setMfdBrightness((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return Math.min(Math.max(prev + delta, 0), 100);
        });
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
  ]);

  return (
    <>
      <div className="pfd-menu-header">PFD SETUP MENU</div>
      <div className="pfd-menu-content">
        <div className="pfd-menu-row">
          <span>PFD DISPLAY</span>
          <div className="pfd-menu-values">
            <span className={`value ${focus === 'PFD_MODE' ? 'focused' : ''}`}>
              {pfdDisplayMode}
            </span>
            <span className={`value ${focus === 'PFD_BRIGHT' ? 'focused' : ''}`}>
              {pfdBrightness.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="pfd-menu-row">
          <span>MFD DISPLAY</span>
          <div className="pfd-menu-values">
            <span className={`value ${focus === 'MFD_MODE' ? 'focused' : ''}`}>
              {mfdDisplayMode}
            </span>
            <span className={`value ${focus === 'MFD_BRIGHT' ? 'focused' : ''}`}>
              {mfdBrightness.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
