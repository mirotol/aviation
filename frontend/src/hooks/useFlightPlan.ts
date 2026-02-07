import { useContext } from 'react';
import { FlightPlanContext } from '../providers/FlightPlanContext';

/**
 * Custom hook to access the current flight plan and the local modification method.
 * NOTE: This hook only manages LOCAL universal state.
 * To sync with backend, use the return values from useWebSocket.
 */
export function useFlightPlan() {
  const context = useContext(FlightPlanContext);

  if (!context) {
    throw new Error('useFlightPlan must be used within a FlightPlanProvider');
  }

  const { flightPlan, setFlightPlan } = context;

  return {
    flightPlan,
    setFlightPlan,
  };
}
