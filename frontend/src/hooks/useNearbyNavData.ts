import { useState, useEffect, useRef } from 'react';
import { useFlightData } from './useFlightData';
import { pointsToGeoJSON } from '../utils/navDataUtils';
import { getDistanceNM, GeoPoint } from '../utils/geoUtils';

/**
 * Fetches nearby navigation data (airports, navaids, fixes, etc.)
 * around the aircraft position.
 *
 * The fetch logic is designed to work correctly for:
 *  - Live flight
 *  - Simulated flight (accelerated time)
 *  - Recorded flight playback (including rewind and looping)
 *
 * Fetching is primarily driven by distance traveled, with a
 * secondary throttle based on *simulation time* (not wall-clock time).
 */
export function useNearbyNavData(
  fetchRadiusNM = 200, // Radius (NM) sent to backend for nav data
  refreshThresholdNM = 100 // Minimum distance (NM) before refetch
) {
  const snapshot = useFlightData();
  const [navData, setNavData] = useState<GeoJSON.FeatureCollection | null>(null);

  /**
   * Position where the last successful fetch occurred.
   * Used to determine how far the aircraft has moved.
   */
  const lastFetchPos = useRef<GeoPoint | null>(null);

  /**
   * Simulation timestamp (epoch ms) of the last successful fetch.
   * Used for simulation-time-based throttling.
   *
   * NOTE:
   *  - This must tolerate non-monotonic time during replay
   *    (rewind, looping, scrubbing).
   */
  const lastFetchTime = useRef<number>(0);

  /**
   * Prevents overlapping fetches if the effect fires rapidly
   * (e.g. during fast simulation or replay).
   */
  const isFetching = useRef(false);

  useEffect(() => {
    // Require a valid aircraft position
    if (!snapshot?.position?.latitude || !snapshot?.position?.longitude) {
      return;
    }

    // Simulation / replay timestamp (epoch ms)
    const nowSim = snapshot.timestamp;

    /**
     * Handle recorded-flight replay behavior.
     *
     * In replay mode, simulation time may:
     *  - Jump backwards (rewind / scrub)
     *  - Reset (loop)
     *  - Stall (pause)
     *
     * If time is not strictly moving forward, reset throttling
     * so a fresh fetch can occur immediately.
     */
    if (nowSim <= lastFetchTime.current) {
      lastFetchTime.current = 0;
      lastFetchPos.current = null;
    }

    // Avoid starting a new request while one is already in flight
    if (isFetching.current) {
      return;
    }

    /**
     * Simulation-time-based throttle.
     *
     * After the first fetch, limit requests to at most once every
     * 10 seconds of *simulation time* (not wall-clock time).
     *
     * This automatically scales with replay speed:
     *  - 1× replay → ~10s real time
     *  - 16× replay → ~0.6s real time
     */
    if (lastFetchTime.current && nowSim - lastFetchTime.current < 10_000) {
      return;
    }

    // Current aircraft position
    const currentPos: GeoPoint = {
      lat: snapshot.position.latitude,
      lon: snapshot.position.longitude,
    };

    /**
     * Distance traveled since the last fetch.
     *
     * If we have never fetched before (lastFetchPos === null),
     * force an initial fetch by treating the distance as infinite.
     */
    const distanceMoved = lastFetchPos.current
      ? getDistanceNM(currentPos, lastFetchPos.current)
      : Infinity;

    /**
     * Primary fetch trigger:
     * Fetch new nav data once the aircraft has moved at least
     * `refreshThresholdNM` nautical miles.
     *
     * This ensures fast updates during high-speed replay while
     * remaining efficient during normal flight.
     */
    if (distanceMoved >= refreshThresholdNM) {
      isFetching.current = true;
      lastFetchTime.current = nowSim;
      lastFetchPos.current = currentPos;

      const url =
        `http://localhost:8080/api/nav/nearby` +
        `?lat=${currentPos.lat}` +
        `&lon=${currentPos.lon}` +
        `&radius=${fetchRadiusNM}`;

      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setNavData(pointsToGeoJSON(data));
        })
        .catch((err) => {
          console.warn('NavData fetch failed:', err.message);
        })
        .finally(() => {
          isFetching.current = false;
        });
    }
  }, [snapshot, fetchRadiusNM, refreshThresholdNM]);

  return navData;
}
