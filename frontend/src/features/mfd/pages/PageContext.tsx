import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { NavigationMapPage, TrafficMapPage, PlaceholderPage } from './PageDefinitions';

/**
 * MFD Page Group identifiers.
 * To add a new group (e.g., 'SYSTEM'), add it here and update MFD_PAGES.
 */
export type MFDPageGroup = 'MAP' | 'WPT' | 'AUX' | 'NRST' | 'FPL' | 'PROC';

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

/**
 * Definition of a screen/page in the EFIS system.
 */
export interface PageDefinition {
  /** Unique ID for the page */
  id: string;
  /** Human-readable name shown in headers */
  name: string;
  /** The React component to render when this page is active */
  component: React.FC;

  /** Handler for the inner (smaller) knob rotation */
  onInnerKnob?: (dir: 'inc' | 'dec') => void;
  /** Handler for the outer (larger) knob rotation */
  onOuterKnob?: (dir: 'inc' | 'dec') => void;
  /** Handler for the ENT (Enter) button */
  onEnt?: () => void;
  /** Handler for the CLR (Clear) button */
  onClr?: () => void;

  /**
   * Function returning the base softkeys for this page.
   * If not provided, the page will have empty softkeys by default.
   */
  softkeys?: () => SoftkeyLayer;
}

interface PageStateContextType {
  // MFD State
  /** Currently active page group on the MFD */
  mfdPageGroup: MFDPageGroup;
  /** Currently active page index within the group */
  mfdPageSelection: number;
  /** If set, shows this group as a modal (e.g. FPL or PROC) instead of the main navigation groups */
  mfdModalPage: MFDPageGroup | null;

  // MFD Softkey stack
  /** Stack of softkey layers for MFD. Overrides page-default softkeys if not empty. */
  mfdSoftkeyStack: SoftkeyLayer[];

  // Navigation Actions
  setMfdPageGroup: (group: MFDPageGroup) => void;
  /** Cycle to the next major MFD group (MAP -> WPT -> AUX -> NRST) */
  nextMfdPageGroup: () => void;
  /** Cycle to the previous major MFD group */
  prevMfdPageGroup: () => void;
  /** Cycle to the next page within the current group */
  nextMfdPageSelection: () => void;
  /** Cycle to the previous page within the current group */
  prevMfdPageSelection: () => void;
  setMfdPageSelection: (index: number) => void;
  /** Open/close a modal group like FPL or PROC */
  toggleMfdModal: (modal: MFDPageGroup) => void;

  // Softkey Stack Actions
  /** Push a new layer of softkeys (e.g., entering a sub-menu) */
  pushSoftkeys: (layer: SoftkeyLayer) => void;
  /** Remove the top layer of softkeys */
  popSoftkeys: () => void;
  /** Clear stack and set a specific root layer */
  resetSoftkeys: (root: SoftkeyLayer) => void;

  // Current Visible Softkeys
  /** Get the 12 softkeys that should be rendered right now */
  getVisibleSoftkeys: () => SoftkeyLayer;
}

/**
 * Registry of all available pages on the MFD, organized by group.
 * To add a new page:
 * 1. Create the component in PageDefinitions.tsx (or elsewhere)
 * 2. Add a new entry to the appropriate group array below.
 */
export const MFD_PAGES: Record<MFDPageGroup, PageDefinition[]> = {
  MAP: [
    {
      id: 'MAP_NAV',
      name: 'Navigation Map',
      component: NavigationMapPage,
      softkeys: () => [
        { label: 'TRAFFIC', id: 'MAP_TRAFFIC' },
        { label: 'TOPO', id: 'MAP_TOPO' },
        { label: 'TERRAIN', id: 'MAP_TERRAIN' },
      ],
    },
    {
      id: 'MAP_TFC',
      name: 'Traffic Map',
      component: TrafficMapPage,
    },
    {
      id: 'MAP_WEATHER',
      name: 'Weather Data Link',
      component: () => <PlaceholderPage name="Weather Data Link" />,
    },
    {
      id: 'MAP_TERRAIN',
      name: 'Terrain Proximity',
      component: () => <PlaceholderPage name="Terrain Proximity" />,
    },
  ],
  WPT: [
    {
      id: 'WPT_AIRPORT',
      name: 'Airport Information',
      component: () => <PlaceholderPage name="Airport Information" />,
      softkeys: () => [
        { label: 'INFO', id: 'WPT_INFO' },
        { label: 'DP', id: 'WPT_DP' },
      ],
    },
    {
      id: 'WPT_INT',
      name: 'Intersection Information',
      component: () => <PlaceholderPage name="Intersection Information" />,
    },
    {
      id: 'WPT_NDB',
      name: 'NDB Information',
      component: () => <PlaceholderPage name="NDB Information" />,
    },
    {
      id: 'WPT_VOR',
      name: 'VOR Information',
      component: () => <PlaceholderPage name="VOR Information" />,
    },
    {
      id: 'WPT_USER',
      name: 'User Waypoint Information',
      component: () => <PlaceholderPage name="User Waypoint Information" />,
    },
  ],
  AUX: [
    {
      id: 'AUX_TRIP',
      name: 'Trip Planning',
      component: () => <PlaceholderPage name="Trip Planning" />,
    },
    {
      id: 'AUX_UTIL',
      name: 'Utility',
      component: () => <PlaceholderPage name="Utility" />,
    },
    {
      id: 'AUX_GPS',
      name: 'GPS Status',
      component: () => <PlaceholderPage name="GPS Status" />,
    },
    {
      id: 'AUX_SETUP',
      name: 'System Setup',
      component: () => <PlaceholderPage name="System Setup" />,
    },
    {
      id: 'AUX_XM',
      name: 'XM Satellite screens',
      component: () => <PlaceholderPage name="XM Satellite screens" />,
      softkeys: () => [
        { label: 'INFO', id: 'XM_INFO' },
        { label: 'RADIO', id: 'XM_RADIO' },
      ],
    },
    {
      id: 'AUX_STATUS',
      name: 'System Status',
      component: () => <PlaceholderPage name="System Status" />,
    },
  ],
  NRST: [
    {
      id: 'NRST_APT',
      name: 'Nearest Airports',
      component: () => <PlaceholderPage name="Nearest Airports" />,
    },
    {
      id: 'NRST_INT',
      name: 'Nearest Intersections',
      component: () => <PlaceholderPage name="Nearest Intersections" />,
    },
    {
      id: 'NRST_NDB',
      name: 'Nearest NDB',
      component: () => <PlaceholderPage name="Nearest NDB" />,
    },
    {
      id: 'NRST_VOR',
      name: 'Nearest VOR',
      component: () => <PlaceholderPage name="Nearest VOR" />,
    },
    {
      id: 'NRST_USER',
      name: 'Nearest User Waypoints',
      component: () => <PlaceholderPage name="Nearest User Waypoints" />,
    },
    {
      id: 'NRST_FREQ',
      name: 'Nearest Frequencies',
      component: () => <PlaceholderPage name="Nearest Frequencies" />,
    },
    {
      id: 'NRST_AIRSPACE',
      name: 'Nearest Airspaces',
      component: () => <PlaceholderPage name="Nearest Airspaces" />,
    },
  ],
  FPL: [
    {
      id: 'FPL_ACTIVE',
      name: 'Active Flight Plan',
      component: () => <PlaceholderPage name="Active Flight Plan" />,
    },
    {
      id: 'FPL_CATALOG',
      name: 'Flight Plan Catalog',
      component: () => <PlaceholderPage name="Flight Plan Catalog" />,
      softkeys: () => [{ label: 'NEW', id: 'FPL_NEW' }],
    },
    {
      id: 'FPL_VNAV',
      name: 'Vertical Navigation',
      component: () => <PlaceholderPage name="Vertical Navigation" />,
    },
  ],
  PROC: [
    {
      id: 'PROC_DEP',
      name: 'Departure Loading',
      component: () => <PlaceholderPage name="Departure Loading" />,
    },
    {
      id: 'PROC_ARR',
      name: 'Arrival Loading',
      component: () => <PlaceholderPage name="Arrival Loading" />,
    },
    {
      id: 'PROC_APP',
      name: 'Approach Loading',
      component: () => <PlaceholderPage name="Approach Loading" />,
    },
  ],
};

const PageStateContext = createContext<PageStateContextType | null>(null);

/**
 * The PageProvider manages the global state of the avionics displays,
 * including which page is active and what softkeys are currently shown.
 */
export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mfdPageGroup, setMfdPageGroup] = useState<MFDPageGroup>('MAP');
  const [mfdGroupSelections, setMfdGroupSelections] = useState<Record<MFDPageGroup, number>>({
    MAP: 0,
    WPT: 0,
    AUX: 0,
    NRST: 0,
    FPL: 0,
    PROC: 0,
  });
  const [mfdModalPage, setMfdModalPage] = useState<MFDPageGroup | null>(null);

  const [mfdSoftkeyStack, setMfdSoftkeyStack] = useState<SoftkeyLayer[]>([]);

  /**
   * The list of major page groups that can be cycled using the outer knob on MFD.
   */
  const groups: MFDPageGroup[] = ['MAP', 'WPT', 'AUX', 'NRST'];

  const pushSoftkeys = useCallback((layer: SoftkeyLayer) => {
    setMfdSoftkeyStack((prev) => [...prev, layer]);
  }, []);

  const popSoftkeys = useCallback(() => {
    setMfdSoftkeyStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const resetSoftkeys = useCallback((root: SoftkeyLayer) => {
    setMfdSoftkeyStack([root]);
  }, []);

  /**
   * Helper function to get currently visible softkeys.
   * Logic:
   * 1. If there's a softkey stack (e.g. pushed by a button), use the top layer.
   * 2. Otherwise:
   *    - returns softkeys defined in the active page's PageDefinition.
   */
  const getVisibleSoftkeys = useCallback((): SoftkeyLayer => {
    if (mfdSoftkeyStack.length > 0) {
      return mfdSoftkeyStack[mfdSoftkeyStack.length - 1];
    }

    const currentGroup = mfdModalPage || mfdPageGroup;
    const pageIdx = mfdGroupSelections[currentGroup];
    const pageDef = MFD_PAGES[currentGroup][pageIdx];
    const baseKeys = pageDef.softkeys?.() ?? [];
    const keys: SoftkeyLayer = Array(12).fill({});
    baseKeys.forEach((k, i) => {
      keys[i] = k;
    });
    return keys;
  }, [mfdSoftkeyStack, mfdModalPage, mfdPageGroup, mfdGroupSelections]);

  const nextMfdPageGroup = useCallback(() => {
    if (mfdModalPage) return;
    setMfdPageGroup((prev) => {
      const idx = groups.indexOf(prev);
      const nextIdx = (idx + 1) % groups.length;
      return groups[nextIdx];
    });
  }, [mfdModalPage, groups]);

  const prevMfdPageGroup = useCallback(() => {
    if (mfdModalPage) return;
    setMfdPageGroup((prev) => {
      const idx = groups.indexOf(prev);
      const prevIdx = (idx - 1 + groups.length) % groups.length;
      return groups[prevIdx];
    });
  }, [mfdModalPage, groups]);

  const nextMfdPageSelection = useCallback(() => {
    setMfdGroupSelections((prev) => {
      const currentGroup = mfdModalPage || mfdPageGroup;
      return {
        ...prev,
        [currentGroup]: (prev[currentGroup] + 1) % MFD_PAGES[currentGroup].length,
      };
    });
  }, [mfdModalPage, mfdPageGroup]);

  const prevMfdPageSelection = useCallback(() => {
    setMfdGroupSelections((prev) => {
      const currentGroup = mfdModalPage || mfdPageGroup;
      return {
        ...prev,
        [currentGroup]:
          (prev[currentGroup] - 1 + MFD_PAGES[currentGroup].length) %
          MFD_PAGES[currentGroup].length,
      };
    });
  }, [mfdModalPage, mfdPageGroup]);

  const setMfdPageSelection = useCallback(
    (index: number) => {
      setMfdGroupSelections((prev) => {
        const currentGroup = mfdModalPage || mfdPageGroup;
        return {
          ...prev,
          [currentGroup]: index,
        };
      });
    },
    [mfdModalPage, mfdPageGroup]
  );

  const toggleMfdModal = useCallback((modal: MFDPageGroup) => {
    setMfdModalPage((prev) => {
      if (prev === modal) return null;
      return modal;
    });
  }, []);

  return (
    <PageStateContext.Provider
      value={{
        mfdPageGroup,
        mfdPageSelection: mfdGroupSelections[mfdModalPage || mfdPageGroup],
        mfdModalPage,
        mfdSoftkeyStack,
        setMfdPageGroup,
        nextMfdPageGroup,
        prevMfdPageGroup,
        nextMfdPageSelection,
        prevMfdPageSelection,
        setMfdPageSelection,
        toggleMfdModal,
        pushSoftkeys,
        popSoftkeys,
        resetSoftkeys,
        getVisibleSoftkeys,
      }}
    >
      {children}
    </PageStateContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageStateContext);
  if (!context) throw new Error('usePageContext must be used within PageProvider');
  return context;
};
