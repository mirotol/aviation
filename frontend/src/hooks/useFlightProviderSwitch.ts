import { useWebSocket } from '../contexts/WebSocketContext';

export function useFlightProviderSwitch() {
  const { switchProvider } = useWebSocket();
  
  return { switchProvider };
}
