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

interface PFDContextType {
  // PFD State
  pfdPageSelection: number;
  /** Stack of softkey layers for PFD. Last element is the current one. */
  pfdSoftkeyStack: SoftkeyLayer[];

  // Actions
  setPfdPageSelection: (index: number) => void;
  pushSoftkeys: (layer: SoftkeyLayer) => void;
  popSoftkeys: () => void;
  resetSoftkeys: (root: SoftkeyLayer) => void;
  getVisibleSoftkeys: () => SoftkeyLayer;
}

const PFDContext = createContext<PFDContextType | null>(null);

export const PFDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pfdPageSelection, setPfdPageSelection] = useState(0);
  const [pfdSoftkeyStack, setPfdSoftkeyStack] = useState<SoftkeyLayer[]>([]);

  const pushSoftkeys = useCallback((layer: SoftkeyLayer) => {
    setPfdSoftkeyStack((prev) => [...prev, layer]);
  }, []);

  const popSoftkeys = useCallback(() => {
    setPfdSoftkeyStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const resetSoftkeys = useCallback((root: SoftkeyLayer) => {
    setPfdSoftkeyStack([root]);
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
        setPfdPageSelection,
        pushSoftkeys,
        popSoftkeys,
        resetSoftkeys,
        getVisibleSoftkeys,
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
