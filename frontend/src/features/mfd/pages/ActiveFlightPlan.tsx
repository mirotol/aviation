import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePageContext } from './PageContext';
import { useFlightPlan } from '../../../hooks/useFlightPlan';
import { NavPoint } from '../../../providers/WebSocketContext';
import '../styles/ActiveFlightPlan.css';

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const ActiveFlightPlan: React.FC = () => {
  const { setOnMfdFmsOuter, setOnMfdFmsInner, setOnMfdEnt, setOnMfdClr, toggleMfdModal } =
    usePageContext();
  const { flightPlan, updateFlightPlan } = useFlightPlan();

  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [charIndex, setCharIndex] = useState(0); // Which character of the 4-5 char ident we are editing
  const [searchResults, setSearchResults] = useState<NavPoint[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const totalRows = (flightPlan?.length || 0) + 1; // Always waypoints + 1 placeholder

  const origin = flightPlan?.[0]?.ident || '----';
  const destination =
    flightPlan?.length && flightPlan.length > 1 ? flightPlan[flightPlan.length - 1].ident : '----';

  // Reset focus when entering/leaving adding mode
  useEffect(() => {
    if (isAdding) {
      setSearchQuery('     '); // 5 spaces
      setCharIndex(0);
      setSearchResults([]);
      setSelectedResultIndex(0);
    }
  }, [isAdding]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/nav/search?q=${trimmed}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setSelectedResultIndex(0);
      }
    } catch (error) {
      console.error('Search failed', error);
    }
  }, []);

  useEffect(() => {
    if (isAdding) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, isAdding, handleSearch]);

  useEffect(() => {
    setOnMfdFmsOuter(() => (dir: 'inc' | 'dec') => {
      if (isAdding) {
        // Move cursor in the input field
        setCharIndex((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return Math.max(0, Math.min(4, prev + delta));
        });
      } else {
        setFocusIndex((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return (prev + delta + totalRows) % totalRows;
        });
      }
    });

    setOnMfdFmsInner(() => (dir: 'inc' | 'dec') => {
      if (isAdding) {
        if (searchResults.length > 0) {
          setSelectedResultIndex((prev) => {
            const delta = dir === 'inc' ? 1 : -1;
            return (prev + delta + searchResults.length) % searchResults.length;
          });
        } else {
          setSearchQuery((prev) => {
            const chars = prev.split('');
            const currentCol = charIndex;
            const currentChar = chars[currentCol];
            const idx = CHARS.indexOf(currentChar);
            const delta = dir === 'inc' ? 1 : -1;
            const nextIdx = (idx + delta + CHARS.length) % CHARS.length;
            chars[currentCol] = CHARS[nextIdx];
            return chars.join('');
          });
        }
      } else {
        // Inner knob can also scroll in FPL
        setFocusIndex((prev) => {
          const delta = dir === 'inc' ? 1 : -1;
          return (prev + delta + totalRows) % totalRows;
        });
      }
    });

    setOnMfdEnt(() => () => {
      if (isAdding) {
        if (searchResults.length > 0) {
          const selected = searchResults[selectedResultIndex];
          const newPlan = [...(flightPlan || [])];
          // Insert at focusIndex
          newPlan.splice(focusIndex, 0, selected);
          updateFlightPlan(newPlan);
          setIsAdding(false);
          setFocusIndex(focusIndex + 1);
        } else {
          // If no results, maybe just try to search for whatever is there?
          // For now, do nothing or close if empty
          if (searchQuery.trim() === '') setIsAdding(false);
          else {
            // If they pressed ENT with text but no results yet, maybe wait or try one last search?
            // Actually, search is triggered by query change, so if no results, there are no results.
            setIsAdding(false);
          }
        }
      } else {
        setIsAdding(true);
      }
    });

    setOnMfdClr(() => () => {
      if (isAdding) {
        setIsAdding(false);
      } else {
        toggleMfdModal('FPL'); // Close FPL
      }
    });

    return () => {
      setOnMfdFmsOuter(undefined);
      setOnMfdFmsInner(undefined);
      setOnMfdEnt(undefined);
      setOnMfdClr(undefined);
    };
  }, [
    isAdding,
    focusIndex,
    totalRows,
    flightPlan,
    updateFlightPlan,
    searchQuery,
    charIndex,
    searchResults,
    selectedResultIndex,
    setOnMfdFmsOuter,
    setOnMfdFmsInner,
    setOnMfdEnt,
    setOnMfdClr,
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
        <span className="col-dtk">DTK</span>
        <span className="col-dis">DIS</span>
        <span className="col-alt">ALT</span>
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
            {flightPlan?.length && flightPlan.length > 0 ? (
              <>
                <div
                  key="origin-runway"
                  className={`fpl-row fpl-runway-row ${focusIndex === 0 && !isAdding ? 'focused' : ''}`}
                >
                  <span className="col-ident">Runway</span>
                  <span className="col-dtk"></span>
                  <span className="col-dis"></span>
                  <span className="col-alt"></span>
                </div>
              </>
            ) : null}
            {!isAdding && (!flightPlan || flightPlan.length === 0) && focusIndex === 0 && (
              <div className="fpl-row focused">
                <span className="col-ident">_ _ _ _ _</span>
                <span className="col-dtk"></span>
                <span className="col-dis"></span>
                <span className="col-alt"></span>
              </div>
            )}
            {!isAdding && (!flightPlan || flightPlan.length === 0) && focusIndex !== 0 && (
              <div className="fpl-row">
                <span className="col-ident">_ _ _ _ _</span>
                <span className="col-dtk"></span>
                <span className="col-dis"></span>
                <span className="col-alt"></span>
              </div>
            )}

            {isAdding && focusIndex === 0 && (
              <div className="fpl-row focused fpl-runway-row">
                <div className="adding-row">
                  <div className="ident-input">
                    {searchQuery.split('').map((c, i) => (
                      <span key={i} className={charIndex === i ? 'char-focused' : ''}>
                        {c === ' ' ? '_' : c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Procedures could be injected here if they existed in the model */}

            <div className="fpl-section-header">ENROUTE</div>
            {flightPlan?.slice(1, -1).map((wp, i) => {
              const actualIndex = i + 1;
              return (
                <div
                  key={`enroute-${i}`}
                  className={`fpl-row ${focusIndex === actualIndex && !isAdding ? 'focused' : ''}`}
                >
                  <span className="col-ident">{wp.ident}</span>
                  <span className="col-dtk">---°</span>
                  <span className="col-dis">---NM</span>
                  <span className="col-alt"></span>
                </div>
              );
            })}

            {/* Enroute placeholder should be here if we have at least origin and destination */}
            {(flightPlan?.length || 0) >= 2 &&
              (!isAdding || (focusIndex > 0 && focusIndex < (flightPlan?.length || 0))) && (
                <div
                  className={`fpl-row ${focusIndex > 0 && focusIndex < (flightPlan?.length || 0) && !isAdding ? 'focused' : ''}`}
                >
                  <span className="col-ident">_ _ _ _ _</span>
                  <span className="col-dtk">---°</span>
                  <span className="col-dis">---NM</span>
                  <span className="col-alt"></span>
                </div>
              )}

            {isAdding && focusIndex > 0 && focusIndex < (flightPlan?.length || 0) && (
              <div className="fpl-row focused">
                <div className="adding-row">
                  <div className="ident-input">
                    {searchQuery.split('').map((c, i) => (
                      <span key={i} className={charIndex === i ? 'char-focused' : ''}>
                        {c === ' ' ? '_' : c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="fpl-section-header">DESTINATION</div>
            {flightPlan?.length && flightPlan.length > 1 ? (
              <div
                className={`fpl-row ${focusIndex === flightPlan.length - 1 && !isAdding ? 'focused' : ''}`}
              >
                <span className="col-ident">{flightPlan[flightPlan.length - 1].ident}</span>
                <span className="col-dtk">---°</span>
                <span className="col-dis">---NM</span>
                <span className="col-alt"></span>
              </div>
            ) : !isAdding || focusIndex < (flightPlan?.length || 0) ? (
              <div
                className={`fpl-row ${focusIndex === (flightPlan?.length || 0) && !isAdding ? 'focused' : ''}`}
              >
                <span className="col-ident">_ _ _ _ _</span>
                <span className="col-dtk">---°</span>
                <span className="col-dis">---NM</span>
                <span className="col-alt"></span>
              </div>
            ) : null}

            {isAdding && focusIndex >= (flightPlan?.length || 0) && (
              <div className="fpl-row focused">
                <div className="adding-row">
                  <div className="ident-input">
                    {searchQuery.split('').map((c, i) => (
                      <span key={i} className={charIndex === i ? 'char-focused' : ''}>
                        {c === ' ' ? '_' : c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isAdding && searchResults.length > 0 && (
          <div className="search-results-overlay">
            <div className="search-results-header">WAYPOINT INFORMATION</div>
            <div className="search-results-list">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className={`search-result-item ${selectedResultIndex === i ? 'focused' : ''}`}
                >
                  <span className="res-ident">{res.ident}</span>
                  <span className="res-type">{res.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fpl-vnv-profile">
        <div className="section-title">ACTIVE VNV PROFILE</div>
        <div className="vnv-content placeholder">VNV Profile Visualization Placeholder</div>
      </div>

      <div className="fpl-weather">
        <div className="section-title">SELECTED WAYPOINT WEATHER</div>
        <div className="weather-content placeholder">
          {isAdding || focusIndex >= (flightPlan?.length || 0)
            ? 'No waypoint selected'
            : `Weather for ${flightPlan?.[focusIndex]?.ident || '---'}`}
        </div>
      </div>
    </div>
  );
};
