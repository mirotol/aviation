import { useWebSocket } from './useWebSocket';

/**
 * Custom hook to access the current flight plan and the modification method.
 */
export function useFlightPlan() {
  const { flightPlan, updateFlightPlan } = useWebSocket();
  return { flightPlan, updateFlightPlan };
}
