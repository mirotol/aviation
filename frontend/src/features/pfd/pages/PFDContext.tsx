import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Configuration for a single softkey (buttons at the bottom of the screen).
 */
export interface SoftkeyConfig {
  /** Text displayed above the physical button */
  label?: string;
  /** Unique identifier for the softkey */
  id?: string;
  /** Visual status of the softkey label */
  status?: 'active' | 'inactive' | 'toggle-on' | 'toggle-off';
  /** Function called when the corresponding bezel button is pressed */
  action?: () => void;
}

/**
 * A layer of 12 softkeys representing the current state of the bottom bar.
 */
export type SoftkeyLayer = SoftkeyConfig[];

export type PFDMenuMode = 'SETUP' | 'DIRECT_TO' | 'FPL' | 'PROC';

interface PFDContextType {
  // PFD State
  pfdPageSelection: number;
  /** Stack of softkey layers for PFD. Last element is the current one. */
  pfdSoftkeyStack: SoftkeyLayer[];

  // Menu State
  pfdMenuMode: PFDMenuMode | null;

  // Knob Handlers
  onPfdFmsOuter?: (dir: 'inc' | 'dec') => void;
  setOnPfdFmsOuter: (handler: ((dir: 'inc' | 'dec') => void) | undefined) => void;
  onPfdFmsInner?: (dir: 'inc' | 'dec') => void;
  setOnPfdFmsInner: (handler: ((dir: 'inc' | 'dec') => void) | undefined) => void;
  onPfdEnt?: () => void;
  setOnPfdEnt: (handler: (() => void) | undefined) => void;
  onPfdClr?: () => void;
  setOnPfdClr: (handler: (() => void) | undefined) => void;

  // Actions
  setPfdPageSelection: (index: number) => void;
  pushSoftkeys: (layer: SoftkeyLayer) => void;
  popSoftkeys: () => void;
  resetSoftkeys: (root: SoftkeyLayer) => void;
  getVisibleSoftkeys: () => SoftkeyLayer;
  togglePfdMenu: (mode: PFDMenuMode) => void;
  closePfdMenu: () => void;
}

const PFDContext = createContext<PFDContextType | null>(null);

export const PFDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pfdPageSelection, setPfdPageSelection] = useState(0);
  const [pfdSoftkeyStack, setPfdSoftkeyStack] = useState<SoftkeyLayer[]>([]);
  const [pfdMenuMode, setPfdMenuMode] = useState<PFDMenuMode | null>(null);

  const [onPfdFmsOuter, setOnPfdFmsOuter] = useState<((dir: 'inc' | 'dec') => void) | undefined>();
  const [onPfdFmsInner, setOnPfdFmsInner] = useState<((dir: 'inc' | 'dec') => void) | undefined>();
  const [onPfdEnt, setOnPfdEnt] = useState<(() => void) | undefined>();
  const [onPfdClr, setOnPfdClr] = useState<(() => void) | undefined>();

  const pushSoftkeys = useCallback((layer: SoftkeyLayer) => {
    setPfdSoftkeyStack((prev) => [...prev, layer]);
  }, []);

  const popSoftkeys = useCallback(() => {
    setPfdSoftkeyStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const resetSoftkeys = useCallback((root: SoftkeyLayer) => {
    setPfdSoftkeyStack([root]);
  }, []);

  const togglePfdMenu = useCallback((mode: PFDMenuMode) => {
    setPfdMenuMode((prev) => (prev === mode ? null : mode));
  }, []);

  const closePfdMenu = useCallback(() => {
    setPfdMenuMode(null);
  }, []);

  const getVisibleSoftkeys = useCallback((): SoftkeyLayer => {
    if (pfdSoftkeyStack.length > 0) {
      return pfdSoftkeyStack[pfdSoftkeyStack.length - 1];
    }

    // Default root softkeys for PFD
    return [
      {
        label: 'INSET',
        id: 'PFD_INSET',
        action: () =>
          pushSoftkeys([
            { label: 'OFF', action: () => popSoftkeys() },
            { label: 'DCLTR' },
            { label: 'TRAFFIC' },
            { label: 'TOPO' },
            {},
            {},
            {},
            {},
            {},
            {},
            { label: 'BACK', action: () => popSoftkeys() },
            { label: 'ALERTS' },
          ]),
      },
      {},
      {},
      {},
      {},
      {
        label: 'PFD',
        id: 'PFD_PFD',
        action: () =>
          pushSoftkeys([
            {},
            { label: 'METRIC' },
            { label: 'DFLTS' },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            { label: 'BACK', action: () => popSoftkeys() },
            { label: 'ALERTS' },
          ]),
      },
      {},
      {},
      {},
      {},
      {},
      { label: 'ALERTS' },
    ];
  }, [pfdSoftkeyStack, pushSoftkeys, popSoftkeys]);

  return (
    <PFDContext.Provider
      value={{
        pfdPageSelection,
        pfdSoftkeyStack,
        pfdMenuMode,
        onPfdFmsOuter,
        setOnPfdFmsOuter,
        onPfdFmsInner,
        setOnPfdFmsInner,
        onPfdEnt,
        setOnPfdEnt,
        onPfdClr,
        setOnPfdClr,
        setPfdPageSelection,
        pushSoftkeys,
        popSoftkeys,
        resetSoftkeys,
        getVisibleSoftkeys,
        togglePfdMenu,
        closePfdMenu,
      }}
    >
      {children}
    </PFDContext.Provider>
  );
};

export const usePFDContext = () => {
  const context = useContext(PFDContext);
  if (!context) throw new Error('usePFDContext must be used within PFDProvider');
  return context;
};
