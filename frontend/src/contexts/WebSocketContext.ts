import { createContext } from 'react';

export interface FlightSnapshot {
  timestamp: number;
  attitude: { pitch: number; roll: number; yaw: number };
  altitude: { altitude: number; kollsmanPressure: number };
  airSpeed: { speed: number };
}

export interface WebSocketContextType {
  snapshot: FlightSnapshot | null;
  switchProvider: (provider: 'simulated' | 'recorded', fileName?: string) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  isPaused: boolean;
  speed: number;
  isConnected: boolean;
  activeProvider: 'simulated' | 'recorded';
  selectedFlight: string | null;
  reconnectCountdown: number | null;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);
