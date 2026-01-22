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
    const allItems: Focusable[] = ['PFD_MODE', 'PFD_BRIGHT', 'MFD_MODE', 'MFD_BRIGHT'];
    const items = allItems.filter((item) => {
      if (item === 'PFD_BRIGHT' && pfdMode === 'AUTO') return false;
      if (item === 'MFD_BRIGHT' && mfdMode === 'AUTO') return false;
      return true;
    });

    const idx = items.indexOf(current);
    // If current is not in the filtered list (e.g. just switched to AUTO), find nearest
    if (idx === -1) {
      // Find the index in allItems and then find the closest available item in items
      const originalIdx = allItems.indexOf(current);
      if (dir === 'inc') {
        for (let i = 1; i < allItems.length; i++) {
          const next = allItems[(originalIdx + i) % allItems.length];
          if (items.includes(next)) return next;
        }
      } else {
        for (let i = 1; i < allItems.length; i++) {
          const prev = allItems[(originalIdx - i + allItems.length) % allItems.length];
          if (items.includes(prev)) return prev;
        }
      }
      return items[0] || 'PFD_MODE';
    }

    if (dir === 'inc') {
      return items[(idx + 1) % items.length];
    } else {
      return items[(idx - 1 + items.length) % items.length];
    }
  };

  useEffect(() => {
    if (focus === 'PFD_BRIGHT' && pfdMode === 'AUTO') {
      setFocus('PFD_MODE');
    }
    if (focus === 'MFD_BRIGHT' && mfdMode === 'AUTO') {
      setFocus('MFD_MODE');
    }
  }, [pfdMode, mfdMode, focus]);

  useEffect(() => {
    setOnPfdFmsOuter(() => (dir: 'inc' | 'dec') => {
      setFocus((prev) => getNextFocus(prev, dir));
    });

    setOnPfdFmsInner(() => (dir: 'inc' | 'dec') => {
      if (focus === 'PFD_MODE') {
        const newMode = pfdMode === 'AUTO' ? 'MANUAL' : 'AUTO';
        setPfdMode(newMode);
        if (newMode === 'AUTO' && focus === 'PFD_MODE') {
          // If we were at PFD_MODE and switched to AUTO, it doesn't affect current focus
          // but if we were at PFD_BRIGHT (not possible here) it would.
        }
      } else if (focus === 'PFD_BRIGHT') {
        if (pfdMode === 'MANUAL') {
          const delta = dir === 'inc' ? 1 : -1;
          setPfdBrightness(pfdBrightness + delta);
        }
      } else if (focus === 'MFD_MODE') {
        const newMode = mfdMode === 'AUTO' ? 'MANUAL' : 'AUTO';
        setMfdMode(newMode);
      } else if (focus === 'MFD_BRIGHT') {
        if (mfdMode === 'MANUAL') {
          const delta = dir === 'inc' ? 1 : -1;
          setMfdBrightness(mfdBrightness + delta);
        }
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
            <span className={`value mode ${focus === 'PFD_MODE' ? 'focused' : ''}`}>{pfdMode}</span>
            <span className={`value ${focus === 'PFD_BRIGHT' ? 'focused' : ''}`}>
              {pfdBrightness.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="pfd-menu-row">
          <span>MFD DISPLAY</span>
          <div className="pfd-menu-values">
            <span className={`value mode ${focus === 'MFD_MODE' ? 'focused' : ''}`}>{mfdMode}</span>
            <span className={`value ${focus === 'MFD_BRIGHT' ? 'focused' : ''}`}>
              {mfdBrightness.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
