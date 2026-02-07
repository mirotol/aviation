import React, { useState, useCallback, ReactNode } from 'react';
import { NavPoint } from './WebSocketContext';
import { FlightPlanContext } from './FlightPlanContext';

interface FlightPlanProviderProps {
  children: ReactNode;
}

export const FlightPlanProvider: React.FC<FlightPlanProviderProps> = ({ children }) => {
  const [flightPlan, setFlightPlanState] = useState<NavPoint[] | null>(null);

  const updateFlightPlan = useCallback((waypoints: NavPoint[]) => {
    setFlightPlanState(waypoints);
  }, []);

  return (
    <FlightPlanContext.Provider
      value={{ flightPlan, updateFlightPlan, setFlightPlan: setFlightPlanState }}
    >
      {children}
    </FlightPlanContext.Provider>
  );
};
