import React, { createContext, useContext, useState, useCallback } from 'react';

export type DisplayMode = 'AUTO' | 'MANUAL';

interface BrightnessContextType {
  pfdMode: DisplayMode;
  pfdBrightness: number;
  mfdMode: DisplayMode;
  mfdBrightness: number;
  setPfdMode: (mode: DisplayMode) => void;
  setPfdBrightness: (brightness: number) => void;
  setMfdMode: (mode: DisplayMode) => void;
  setMfdBrightness: (brightness: number) => void;
}

const BrightnessContext = createContext<BrightnessContextType | undefined>(undefined);

export const BrightnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pfdMode, setPfdMode] = useState<DisplayMode>('AUTO');
  const [pfdBrightness, setPfdBrightnessState] = useState(100);
  const [mfdMode, setMfdMode] = useState<DisplayMode>('AUTO');
  const [mfdBrightness, setMfdBrightnessState] = useState(100);

  const setPfdBrightness = useCallback((val: number) => {
    setPfdBrightnessState(Math.min(Math.max(val, 20), 100));
  }, []);

  const setMfdBrightness = useCallback((val: number) => {
    setMfdBrightnessState(Math.min(Math.max(val, 20), 100));
  }, []);

  return (
    <BrightnessContext.Provider
      value={{
        pfdMode,
        pfdBrightness,
        mfdMode,
        mfdBrightness,
        setPfdMode,
        setPfdBrightness,
        setMfdMode,
        setMfdBrightness,
      }}
    >
      {children}
    </BrightnessContext.Provider>
  );
};

export const useBrightness = () => {
  const context = useContext(BrightnessContext);
  if (!context) {
    throw new Error('useBrightness must be used within a BrightnessProvider');
  }
  return context;
};
