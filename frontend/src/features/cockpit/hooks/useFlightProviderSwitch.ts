import { useWebSocket } from '../../../hooks/useWebSocket';

export function useFlightProviderSwitch() {
  const { switchProvider } = useWebSocket();

  return { switchProvider };
}
