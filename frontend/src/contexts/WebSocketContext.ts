import { createContext } from 'react';

export interface FlightSnapshot {
  timestamp: number;
  attitude: { pitch: number; roll: number; yaw: number };
  altitude: { altitude: number; kollsmanPressure: number };
  airSpeed: { speed: number };
  position: { latitude: number; longitude: number };
  progress: {
    currentIndex: number;
    totalSamples: number;
    percentage: number;
    startTime: number;
    endTime: number;
  } | null;
}

export interface WebSocketContextType {
  snapshot: FlightSnapshot | null;
  switchProvider: (provider: 'simulated' | 'recorded', fileName?: string) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  seek: (percentage: number) => void; // New method for scrubbing
  isPaused: boolean;
  speed: number;
  isConnected: boolean;
  activeProvider: 'simulated' | 'recorded';
  selectedFlight: string | null;
  reconnectCountdown: number | null;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);
