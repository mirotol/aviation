import { useWebSocket } from '../contexts/WebSocketContext';

export function useFlightData() {
  const { snapshot } = useWebSocket();
  return snapshot;
}
