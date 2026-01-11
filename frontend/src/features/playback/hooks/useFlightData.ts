import { useWebSocket } from '../../../hooks/useWebSocket';

export function useFlightData() {
  const { snapshot } = useWebSocket();
  return snapshot;
}
