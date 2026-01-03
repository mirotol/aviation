import { useWebSocket } from './useWebSocket';

export function useFlightData() {
  const { snapshot } = useWebSocket();
  return snapshot;
}
