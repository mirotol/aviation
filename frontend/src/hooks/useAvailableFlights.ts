import { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

export function useAvailableFlights() {
  const { switchProvider, activeProvider, selectedFlight } = useWebSocket();
  const [availableFlights, setAvailableFlights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:8080/api/flights')
      .then((res) => res.json())
      .then((data) => {
        setAvailableFlights(data);
        // Auto-select first flight if in recorded mode and none is selected
        if (activeProvider === 'recorded' && !selectedFlight && data.length > 0) {
          switchProvider('recorded', data[0]);
        }
      })
      .catch((err) => console.error('Failed to fetch flights', err))
      .finally(() => setIsLoading(false));
  }, []);

  return { availableFlights, isLoading };
}
