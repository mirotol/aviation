import { useState, useEffect, useRef } from 'react';
import { useFlightData } from './useFlightData';
import { pointsToGeoJSON } from '../utils/navDataUtils';
import { getDistanceNM, GeoPoint } from '../utils/geoUtils';

/**
 * Custom hook to fetch real navigation data from the backend.
 */
export function useNearbyNavData(radiusNM = 100, refreshThresholdNM = 5) {
  const snapshot = useFlightData();
  const [navData, setNavData] = useState<GeoJSON.FeatureCollection | null>(null);

  const lastFetchPos = useRef<GeoPoint | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isFetching = useRef(false);

  useEffect(() => {
    // 1. Safety Check: Ensure we have position data
    if (!snapshot?.position?.latitude || !snapshot?.position?.longitude) return;
    if (isFetching.current) return;

    // 2. Time-based Throttle: Don't spam the network faster than every 10 seconds
    const now = Date.now();
    if (now - lastFetchTime.current < 10000) return;

    const currentPos: GeoPoint = {
      lat: snapshot.position.latitude,
      lon: snapshot.position.longitude
    };

    // 3. Distance Check
    const distanceMoved = lastFetchPos.current
      ? getDistanceNM(currentPos, lastFetchPos.current)
      : Infinity;

    if (distanceMoved >= refreshThresholdNM) {
        console.log('FETCH NEW DATA')
      isFetching.current = true;
      lastFetchTime.current = now;

      // Update this IMMEDIATELY to prevent repeat triggers during the async fetch
      lastFetchPos.current = currentPos;

      const url = `http://localhost:8080/api/nav/nearby?lat=${currentPos.lat}&lon=${currentPos.lon}&radius=${radiusNM}`;

      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          return res.json();
        })
        .then(data => {
          setNavData(pointsToGeoJSON(data));
        })
        .catch(err => {
          console.warn("NavData Fetch suppressed/failed. Retrying in next cycle.", err.message);
          // We don't reset lastFetchPos here so it won't try again until the plane moves more
        })
        .finally(() => {
          isFetching.current = false;
        });
    }
  }, [snapshot, radiusNM, refreshThresholdNM]);

  return navData;
}
