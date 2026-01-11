import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { NavigationMapPage, TrafficMapPage, PlaceholderPage } from './PageDefinitions';

export type MFDPageGroup = 'MAP' | 'WPT' | 'AUX' | 'NRST' | 'FPL' | 'PROC';

export interface SoftkeyConfig {
  label?: string;
  id?: string;
  status?: 'active' | 'inactive' | 'toggle-on' | 'toggle-off';
  action?: () => void;
}

export type SoftkeyLayer = SoftkeyConfig[];

export interface PageDefinition {
  id: string;
  name: string;
  component: React.FC;

  onInnerKnob?: (dir: 'inc' | 'dec') => void;
  onOuterKnob?: (dir: 'inc' | 'dec') => void;
  onEnt?: () => void;
  onClr?: () => void;

  softkeys?: () => SoftkeyLayer;
}

interface PageStateContextType {
  // MFD State
  mfdPageGroup: MFDPageGroup;
  mfdPageSelection: number; // Index within the group
  mfdModalPage: MFDPageGroup | null;

  // PFD State
  pfdPageSelection: number;
  pfdSoftkeyStack: SoftkeyLayer[];

  // MFD Softkey stack
  mfdSoftkeyStack: SoftkeyLayer[];

  // Navigation Actions
  setMfdPageGroup: (group: MFDPageGroup) => void;
  nextMfdPageGroup: () => void;
  prevMfdPageGroup: () => void;
  nextMfdPageSelection: () => void;
  prevMfdPageSelection: () => void;
  setMfdPageSelection: (index: number) => void;
  toggleMfdModal: (modal: MFDPageGroup) => void;

  // Softkey Stack Actions
  pushSoftkeys: (unit: 'PFD' | 'MFD', layer: SoftkeyLayer) => void;
  popSoftkeys: (unit: 'PFD' | 'MFD') => void;
  resetSoftkeys: (unit: 'PFD' | 'MFD', root: SoftkeyLayer) => void;

  // Current Visible Softkeys
  getVisibleSoftkeys: (unit: 'PFD' | 'MFD') => SoftkeyLayer;
}

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

  const [pfdPageSelection, setPfdPageSelection] = useState(0);

  const [pfdSoftkeyStack, setPfdSoftkeyStack] = useState<SoftkeyLayer[]>([]);
  const [mfdSoftkeyStack, setMfdSoftkeyStack] = useState<SoftkeyLayer[]>([]);

  const groups: MFDPageGroup[] = ['MAP', 'WPT', 'AUX', 'NRST'];

  const pushSoftkeys = useCallback((unit: 'PFD' | 'MFD', layer: SoftkeyLayer) => {
    if (unit === 'PFD') {
      setPfdSoftkeyStack((prev) => [...prev, layer]);
    } else {
      setMfdSoftkeyStack((prev) => [...prev, layer]);
    }
  }, []);

  const popSoftkeys = useCallback((unit: 'PFD' | 'MFD') => {
    if (unit === 'PFD') {
      setPfdSoftkeyStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    } else {
      setMfdSoftkeyStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    }
  }, []);

  const resetSoftkeys = useCallback((unit: 'PFD' | 'MFD', root: SoftkeyLayer) => {
    if (unit === 'PFD') {
      setPfdSoftkeyStack([root]);
    } else {
      setMfdSoftkeyStack([root]);
    }
  }, []);

  const getVisibleSoftkeys = useCallback(
    (unit: 'PFD' | 'MFD'): SoftkeyLayer => {
      const stack = unit === 'PFD' ? pfdSoftkeyStack : mfdSoftkeyStack;
      if (stack.length > 0) {
        return stack[stack.length - 1];
      }

      // Default root softkeys if stack is empty
      if (unit === 'PFD') {
        return [
          {
            label: 'INSET',
            id: 'PFD_INSET',
            action: () =>
              pushSoftkeys('PFD', [
                { label: 'OFF', action: () => popSoftkeys('PFD') },
                { label: 'DCLTR' },
                { label: 'TRAFFIC' },
                { label: 'TOPO' },
                {},
                {},
                {},
                {},
                {},
                {},
                { label: 'BACK', action: () => popSoftkeys('PFD') },
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
              pushSoftkeys('PFD', [
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
                { label: 'BACK', action: () => popSoftkeys('PFD') },
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
      } else {
        const currentGroup = mfdModalPage || mfdPageGroup;
        const pageIdx = mfdGroupSelections[currentGroup];
        const pageDef = MFD_PAGES[currentGroup][pageIdx];
        const baseKeys = pageDef.softkeys?.() ?? [];
        const keys: SoftkeyLayer = Array(12).fill({});
        baseKeys.forEach((k, i) => {
          keys[i] = k;
        });
        return keys;
      }
    },
    [
      pfdSoftkeyStack,
      mfdSoftkeyStack,
      mfdModalPage,
      mfdPageGroup,
      mfdGroupSelections,
      pushSoftkeys,
      popSoftkeys,
    ]
  );

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
        pfdPageSelection,
        pfdSoftkeyStack,
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
