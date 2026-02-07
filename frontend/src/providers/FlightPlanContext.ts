import { createContext } from 'react';
import { NavPoint } from './WebSocketContext';

export interface FlightPlanContextType {
  flightPlan: NavPoint[] | null;
  updateFlightPlan: (waypoints: NavPoint[]) => void;
  setFlightPlan: (waypoints: NavPoint[] | null) => void;
}

export const FlightPlanContext = createContext<FlightPlanContextType | null>(null);
