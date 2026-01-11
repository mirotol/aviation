import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

export function useAvailableFlights() {
  const { switchProvider, activeProvider, selectedFlight } = useWebSocket();
  const [availableFlights, setAvailableFlights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false); // Add a ref to track if we've already tried fetching

  useEffect(() => {
    if (fetchedRef.current) return; // Don't fetch again if we already started
    fetchedRef.current = true;

    fetch('http://localhost:8080/api/flights')
      .then((res) => res.json())
      .then((data) => {
        setAvailableFlights(data);
        if (activeProvider === 'recorded' && !selectedFlight && data.length > 0) {
          switchProvider('recorded', data[0]);
        }
      })
      .catch((err) => {
        console.warn('Backend unavailable, retrying fetch on next mount...');
        fetchedRef.current = false; // Allow retry if it failed
      })
      .finally(() => setIsLoading(false));
  }, []); // Empty dependency array: fetch ONLY on mount

  return { availableFlights, isLoading };
}
