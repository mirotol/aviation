import React, { useState, useEffect, useCallback } from 'react';
import { usePageContext } from './PageContext';
import { useFlightPlan } from '../../../hooks/useFlightPlan';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFlightData } from '../../playback/hooks/useFlightData';
import { NavPoint } from '../../../providers/WebSocketContext';
import { WaypointInfoPopup } from '../components/WaypointInfoPopup';
import { DuplicateSelectionPopup } from '../components/DuplicateSelectionPopup';
import '../styles/ActiveFlightPlan.css';

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

type ColumnType = 'ident' | 'runway' | 'dtk' | 'dis' | 'alt';

export const ActiveFlightPlan: React.FC = () => {
  const {
    setOnMfdFmsOuter,
    setOnMfdFmsInner,
    setOnMfdEnt,
    setOnMfdClr,
    setOnMfdCrsr,
    toggleMfdModal,
  } = usePageContext();
  const { flightPlan, setFlightPlan } = useFlightPlan();
  const { updateFlightPlan } = useWebSocket();

  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [focusColumn, setFocusColumn] = useState<ColumnType>('ident');
  const [cursorActive, setCursorActive] = useState(false);
  const [lastCursorPosition, setLastCursorPosition] = useState<{ row: number; col: ColumnType }>({
    row: 0,
    col: 'ident',
  });
  const [showWaypointInfo, setShowWaypointInfo] = useState(false);
  const [showDuplicateSelection, setShowDuplicateSelection] = useState(false);
  const [waypointSearchQuery, setWaypointSearchQuery] = useState('     '); // 5 spaces for waypoint info popup
  const [waypointCharIndex, setWaypointCharIndex] = useState(0); // Which character we're editing in waypoint popup
  const [searchResults, setSearchResults] = useState<NavPoint[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isExplicitlySelected, setIsExplicitlySelected] = useState(false);

  // Index mapping:
  // - Origin (runway): always index 0
  // - Enroute waypoints: indices 1 to flightPlan.length - 2 (if they exist)
  // - Enroute placeholder: next available index after existing enroute waypoints
  // - Destination: last index

  const hasFlightPlan = flightPlan && flightPlan.length > 0;
  const hasMultiplePoints = flightPlan && flightPlan.length > 1;

  const originIndex = 0;
  const enrouteStartIndex = 1;
  const enrouteEndIndex = hasFlightPlan ? flightPlan.length - 1 : 1;
  const enroutePlaceholderIndex = enrouteEndIndex;
  const destinationIndex = hasFlightPlan ? flightPlan.length : 1;

  const totalRows = destinationIndex + 1;
  const snapshot = useFlightData();
  const activeWaypointIndex = snapshot?.activeWaypointIndex ?? -1;

  const origin = flightPlan?.[0]?.ident || '----';
  const destination =
    flightPlan?.length && flightPlan.length > 1 ? flightPlan[flightPlan.length - 1].ident : '----';

  // Helper to check if a cell is focused
  const isCellFocused = (rowIndex: number, column: ColumnType) => {
    return (
      cursorActive &&
      focusIndex === rowIndex &&
      focusColumn === column &&
      !showWaypointInfo &&
      !showDuplicateSelection
    );
  };

  // Save cursor position when cursor is active
  useEffect(() => {
    if (cursorActive) {
      setLastCursorPosition({ row: focusIndex, col: focusColumn });
    }
  }, [focusIndex, focusColumn, cursorActive]);

  useEffect(() => {
    if (showWaypointInfo && !showDuplicateSelection) {
      // If we are already displaying search results (e.g. from a duplicate selection)
      // we DON'T want to reset them or re-trigger a search.
      // But if we're on an existing waypoint, we DO want to pre-fill it.

      if (isExplicitlySelected) {
        return;
      }

      const isOnExistingWaypoint = hasFlightPlan && focusIndex < (flightPlan?.length || 0);

      if (searchResults.length > 0) {
        // If we have results, check if they match the current focus if it's an existing waypoint
        if (isOnExistingWaypoint) {
          const currentWaypoint = flightPlan![focusIndex];
          if (searchResults.length === 1 && searchResults[0].ident === currentWaypoint.ident) {
            return;
          }
        }
      }

      if (isOnExistingWaypoint) {
        // Pre-fill with existing waypoint ident
        const currentWaypoint = flightPlan![focusIndex];
        setWaypointSearchQuery(currentWaypoint.ident.padEnd(5, ' '));
        setSearchResults([currentWaypoint]);
        setSelectedResultIndex(0);
        setWaypointCharIndex(0);
        setIsExplicitlySelected(true);
      } else if (!isExplicitlySelected) {
        // Fresh open for a new waypoint
        setWaypointSearchQuery('     ');
        setSearchResults([]);
        setSelectedResultIndex(0);
        setWaypointCharIndex(0);
        setIsExplicitlySelected(false);
      }
    } else if (!showWaypointInfo && !showDuplicateSelection) {
      // When both popups are closed, we can safely reset isExplicitlySelected
      // but only if we're NOT in the middle of a transition (which we aren't here)
      if (isExplicitlySelected) {
        setIsExplicitlySelected(false);
      }
    }
  }, [showWaypointInfo, showDuplicateSelection, focusIndex, isExplicitlySelected]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      setSearchResults([]);
      return;
    }
    try {
      const url = `/api/nav/search?q=${trimmed}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setSelectedResultIndex(0);
      }
    } catch (error) {
      console.error('[FPL Search] Failed', error);
    }
  }, []);

  useEffect(() => {
    if (showWaypointInfo && !showDuplicateSelection && !isExplicitlySelected) {
      handleSearch(waypointSearchQuery);
    }
  }, [
    waypointSearchQuery,
    showWaypointInfo,
    showDuplicateSelection,
    handleSearch,
    isExplicitlySelected,
  ]);

  useEffect(() => {
    setOnMfdFmsOuter(() => (dir: 'inc' | 'dec') => {
      if (!cursorActive && !showWaypointInfo && !showDuplicateSelection) return;

      if (showDuplicateSelection) {
        // Navigate duplicate list
        if (searchResults.length > 1) {
          setSelectedResultIndex((prev) => {
            const delta = dir === 'inc' ? 1 : -1;
            return (prev + delta + searchResults.length) % searchResults.length;
          });
        }
      } else if (showWaypointInfo) {
        // Move cursor in the waypoint search field
        setWaypointCharIndex((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return Math.max(0, Math.min(4, prev + delta));
        });
      } else {
        // Navigate flight plan rows
        setFocusIndex((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return (prev + delta + totalRows) % totalRows;
        });
      }
    });

    setOnMfdFmsInner(() => (dir: 'inc' | 'dec') => {
      if (!cursorActive && !showWaypointInfo && !showDuplicateSelection) return;

      if (showDuplicateSelection) {
        // Do nothing - inner knob doesn't do anything in duplicate selection
        return;
      } else if (showWaypointInfo) {
        // Cycle characters in the waypoint search field
        setIsExplicitlySelected(false);
        setWaypointSearchQuery((prev) => {
          const chars = prev.split('');
          const currentChar = chars[waypointCharIndex];
          const idx = CHARS.indexOf(currentChar);
          const delta = dir === 'inc' ? 1 : -1;
          const nextIdx = (idx + delta + CHARS.length) % CHARS.length;
          chars[waypointCharIndex] = CHARS[nextIdx];

          // Clear characters after the currently edited character index
          for (let i = waypointCharIndex + 1; i < chars.length; i++) {
            chars[i] = ' ';
          }

          return chars.join('');
        });
      } else {
        // Open waypoint info when on ident column, otherwise move between columns
        if (focusColumn === 'ident') {
          setShowWaypointInfo(true);
        } else {
          // Inner knob moves between columns
          const columns: ColumnType[] = ['ident', 'dtk', 'dis', 'alt'];
          setFocusColumn((prev) => {
            const currentIdx = columns.indexOf(prev);
            const delta = dir === 'inc' ? 1 : -1;
            const nextIdx = (currentIdx + delta + columns.length) % columns.length;
            return columns[nextIdx];
          });
        }
      }
    });

    setOnMfdEnt(() => () => {
      if (!cursorActive && !showWaypointInfo && !showDuplicateSelection) return;

      if (showDuplicateSelection) {
        // Accept selected duplicate and go back to waypoint info
        const selected = searchResults[selectedResultIndex];
        setSearchResults([selected]);
        setWaypointSearchQuery(selected.ident.padEnd(5, ' '));
        setIsExplicitlySelected(true);
        setShowDuplicateSelection(false);
      } else if (showWaypointInfo) {
        const trimmedQuery = waypointSearchQuery.trim();

        if (trimmedQuery.length === 0) {
          // Empty query, close popup
          setShowWaypointInfo(false);
        } else if (searchResults.length > 1) {
          // Multiple results, show duplicate selection popup
          setShowDuplicateSelection(true);
        } else if (searchResults.length === 1 || isExplicitlySelected) {
          // Single result or explicitly selected, accept it
          const selected = searchResults[0];
          if (!selected) {
            // If we are explicitly selected but results were cleared, try one more search or show error
            return;
          }
          const newPlan = [...(flightPlan || [])];

          // Check if we're editing existing waypoint or adding new
          const isOnExistingWaypoint = hasFlightPlan && focusIndex < (flightPlan?.length || 0);
          if (isOnExistingWaypoint) {
            // Replace existing waypoint
            newPlan[focusIndex] = selected;
          } else {
            // Insert new waypoint
            newPlan.splice(focusIndex, 0, selected);
          }

          setFlightPlan(newPlan);
          updateFlightPlan(newPlan);
          setShowWaypointInfo(false);
          setWaypointSearchQuery('     ');
          setSearchResults([]);
          setSelectedResultIndex(0);
          setWaypointCharIndex(0);
          setIsExplicitlySelected(false);

          if (!isOnExistingWaypoint) {
            setFocusIndex(focusIndex + 1);
          }
        }
        // If no results, do nothing (let user continue editing)
      }
    });

    setOnMfdClr(() => () => {
      if (showDuplicateSelection) {
        // Close duplicate selection, go back to waypoint info
        setShowDuplicateSelection(false);
      } else if (showWaypointInfo) {
        // Close waypoint info and reset states
        setShowWaypointInfo(false);
        setWaypointSearchQuery('     ');
        setSearchResults([]);
        setSelectedResultIndex(0);
        setWaypointCharIndex(0);
        setIsExplicitlySelected(false);
      } else {
        // Close FPL
        toggleMfdModal('FPL');
      }
    });

    setOnMfdCrsr(() => () => {
      if (showWaypointInfo || showDuplicateSelection) return; // Don't toggle cursor during waypoint operations

      setCursorActive((prev) => {
        if (!prev) {
          // Activating cursor - restore last position
          setFocusIndex(lastCursorPosition.row);
          setFocusColumn(lastCursorPosition.col);
        }
        return !prev;
      });
    });

    return () => {
      setOnMfdFmsOuter(undefined);
      setOnMfdFmsInner(undefined);
      setOnMfdEnt(undefined);
      setOnMfdClr(undefined);
      setOnMfdCrsr(undefined);
    };
  }, [
    showWaypointInfo,
    showDuplicateSelection,
    cursorActive,
    focusIndex,
    focusColumn,
    lastCursorPosition,
    totalRows,
    flightPlan,
    hasFlightPlan,
    updateFlightPlan,
    waypointSearchQuery,
    waypointCharIndex,
    searchResults,
    selectedResultIndex,
    isExplicitlySelected,
    setOnMfdFmsOuter,
    setOnMfdFmsInner,
    setOnMfdEnt,
    setOnMfdClr,
    setOnMfdCrsr,
    toggleMfdModal,
  ]);

  return (
    <div className="active-fpl-container">
      <div className="fpl-header">ACTIVE FLIGHT PLAN</div>

      <div className="fpl-route-header">
        <div className="col-ident">
          <span className="origin">{origin}</span>
          <span className="arrow"> / </span>
          <span className="destination">{destination}</span>
        </div>
        <div className="col-dtk">DTK</div>
        <div className="col-dis">DIS</div>
        <div className="col-alt">ALT</div>
      </div>

      <div className="fpl-content">
        <div className="fpl-table">
          <div className="fpl-table-header">
            <span className="col-ident"></span>
          </div>
          <div className="fpl-waypoint-list">
            <div
              className={`fpl-section-header ${flightPlan?.length && flightPlan.length > 0 ? 'has-origin' : ''}`}
            >
              <div>
                <span>ORIGIN</span>
                {flightPlan?.length && flightPlan.length > 0 && (
                  <span className="origin-ident">{flightPlan[0].ident}</span>
                )}
              </div>
            </div>
            {/* Origin row - always shown */}
            {hasFlightPlan ? (
              <div
                key="origin-runway"
                className={`fpl-row fpl-runway-row ${activeWaypointIndex === 0 ? 'active-leg' : ''}`}
              >
                <span
                  className={`col-ident ${isCellFocused(originIndex, 'ident') ? 'cell-focused' : ''}`}
                >
                  Runway
                </span>
                <span
                  className={`col-dtk ${isCellFocused(originIndex, 'dtk') ? 'cell-focused' : ''}`}
                ></span>
                <span
                  className={`col-dis ${isCellFocused(originIndex, 'dis') ? 'cell-focused' : ''}`}
                ></span>
                <span
                  className={`col-alt ${isCellFocused(originIndex, 'alt') ? 'cell-focused' : ''}`}
                ></span>
              </div>
            ) : (
              <div className="fpl-row">
                <span
                  className={`col-ident ${isCellFocused(originIndex, 'ident') ? 'cell-focused' : ''}`}
                >
                  _ _ _ _ _
                </span>
                <span
                  className={`col-dtk ${isCellFocused(originIndex, 'dtk') ? 'cell-focused' : ''}`}
                ></span>
                <span
                  className={`col-dis ${isCellFocused(originIndex, 'dis') ? 'cell-focused' : ''}`}
                ></span>
                <span
                  className={`col-alt ${isCellFocused(originIndex, 'alt') ? 'cell-focused' : ''}`}
                ></span>
              </div>
            )}

            {/* Procedures could be injected here if they existed in the model */}

            <div className="fpl-section-header">ENROUTE</div>
            {/* Enroute waypoints - only exist if we have 3+ waypoints */}
            {hasMultiplePoints &&
              flightPlan.slice(1, -1).map((wp, i) => {
                const wpIndex = enrouteStartIndex + i;
                return (
                  <div
                    key={`enroute-${i}`}
                    className={`fpl-row ${wpIndex === activeWaypointIndex ? 'active-leg' : ''}`}
                  >
                    <span
                      className={`col-ident ${isCellFocused(wpIndex, 'ident') ? 'cell-focused' : ''}`}
                    >
                      {wp.ident}
                    </span>
                    <span
                      className={`col-dtk ${isCellFocused(wpIndex, 'dtk') ? 'cell-focused' : ''}`}
                    >
                      ---°
                    </span>
                    <span
                      className={`col-dis ${isCellFocused(wpIndex, 'dis') ? 'cell-focused' : ''}`}
                    >
                      ---NM
                    </span>
                    <span
                      className={`col-alt ${isCellFocused(wpIndex, 'alt') ? 'cell-focused' : ''}`}
                    ></span>
                  </div>
                );
              })}

            {/* Enroute placeholder - shown when we have origin and destination but want to add enroute waypoint */}
            {hasMultiplePoints && (
              <div className="fpl-row">
                <span
                  className={`col-ident ${isCellFocused(enroutePlaceholderIndex, 'ident') ? 'cell-focused' : ''}`}
                >
                  _ _ _ _ _
                </span>
                <span
                  className={`col-dtk ${isCellFocused(enroutePlaceholderIndex, 'dtk') ? 'cell-focused' : ''}`}
                >
                  ---°
                </span>
                <span
                  className={`col-dis ${isCellFocused(enroutePlaceholderIndex, 'dis') ? 'cell-focused' : ''}`}
                >
                  ---NM
                </span>
                <span
                  className={`col-alt ${isCellFocused(enroutePlaceholderIndex, 'alt') ? 'cell-focused' : ''}`}
                ></span>
              </div>
            )}

            <div className="fpl-section-header">DESTINATION</div>
            {/* Destination - show actual waypoint if we have 2+ points, otherwise placeholder */}
            {hasMultiplePoints ? (
              <div className="fpl-row">
                <span
                  className={`col-ident ${isCellFocused(destinationIndex - 1, 'ident') ? 'cell-focused' : ''}`}
                >
                  {flightPlan[flightPlan.length - 1].ident}
                </span>
                <span
                  className={`col-dtk ${isCellFocused(destinationIndex - 1, 'dtk') ? 'cell-focused' : ''}`}
                >
                  ---°
                </span>
                <span
                  className={`col-dis ${isCellFocused(destinationIndex - 1, 'dis') ? 'cell-focused' : ''}`}
                >
                  ---NM
                </span>
                <span
                  className={`col-alt ${isCellFocused(destinationIndex - 1, 'alt') ? 'cell-focused' : ''}`}
                ></span>
              </div>
            ) : (
              <div className="fpl-row">
                <span
                  className={`col-ident ${isCellFocused(destinationIndex, 'ident') ? 'cell-focused' : ''}`}
                >
                  _ _ _ _ _
                </span>
                <span
                  className={`col-dtk ${isCellFocused(destinationIndex, 'dtk') ? 'cell-focused' : ''}`}
                >
                  ---°
                </span>
                <span
                  className={`col-dis ${isCellFocused(destinationIndex, 'dis') ? 'cell-focused' : ''}`}
                >
                  ---NM
                </span>
                <span
                  className={`col-alt ${isCellFocused(destinationIndex, 'alt') ? 'cell-focused' : ''}`}
                ></span>
              </div>
            )}
          </div>
        </div>

        {/* Waypoint Information Popup */}
        {showWaypointInfo && !showDuplicateSelection && (
          <WaypointInfoPopup
            waypointSearchQuery={waypointSearchQuery}
            waypointCharIndex={waypointCharIndex}
            searchResults={searchResults}
          />
        )}

        {/* Duplicate Selection Popup */}
        {showDuplicateSelection && searchResults.length > 1 && (
          <DuplicateSelectionPopup
            waypointSearchQuery={waypointSearchQuery}
            searchResults={searchResults}
            selectedResultIndex={selectedResultIndex}
          />
        )}
      </div>

      <div className="fpl-vnv-profile">
        <div className="section-title">ACTIVE VNV PROFILE</div>
        <div className="vnv-content placeholder">VNV Profile Visualization Placeholder</div>
      </div>

      <div className="fpl-weather">
        <div className="section-title">SELECTED WAYPOINT WEATHER</div>
        <div className="weather-content placeholder">
          {focusIndex >= (flightPlan?.length || 0)
            ? 'No waypoint selected'
            : `Weather for ${flightPlan?.[focusIndex]?.ident || '---'}`}
        </div>
      </div>
    </div>
  );
};
