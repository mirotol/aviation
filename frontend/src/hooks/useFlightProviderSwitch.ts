import { useWebSocket } from './useWebSocket';

export function useFlightProviderSwitch() {
  const { switchProvider } = useWebSocket();

  return { switchProvider };
}
