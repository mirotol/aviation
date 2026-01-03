import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface FlightSnapshot {
  timestamp: number;
  attitude: { pitch: number; roll: number; yaw: number };
  altitude: { altitude: number; kollsmanPressure: number };
  airSpeed: { speed: number };
}

interface WebSocketContextType {
  snapshot: FlightSnapshot | null;
  switchProvider: (provider: 'simulated' | 'recorded', fileName?: string) => void;
  isConnected: boolean;
  activeProvider: 'simulated' | 'recorded';
  selectedFlight: string | null;
  reconnectCountdown: number | null;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const RECONNECT_INTERVAL = 5000;

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [snapshot, setSnapshot] = useState<FlightSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'simulated' | 'recorded'>('simulated');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [reconnectCountdown, setReconnectCountdown] = useState<number | null>(null);
  const clientRef = useRef<Client | null>(null);
  const timerRef = useRef<number | null>(null);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let seconds = RECONNECT_INTERVAL / 1000;
    setReconnectCountdown(seconds);

    timerRef.current = window.setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        seconds = RECONNECT_INTERVAL / 1000; // Reset for next attempt if connection fails
      }
      setReconnectCountdown(seconds);
    }, 1000);
  };

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setReconnectCountdown(null);
  };

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: RECONNECT_INTERVAL,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        stopCountdown();

        client.subscribe('/user/queue/flightData', (message) => {
          setSnapshot(JSON.parse(message.body));
        });

        // Re-apply the current provider upon connection/reconnection
        client.publish({
          destination: '/app/switchProvider',
          body: JSON.stringify({
            type: activeProvider,
            fileName: selectedFlight,
          }),
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        setSnapshot(null);
        stopCountdown();
      },
      onWebSocketClose: () => {
        setIsConnected(false);
        setSnapshot(null);
        startCountdown();
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      stopCountdown();
    };
  }, [activeProvider, selectedFlight]);

  const switchProvider = (provider: 'simulated' | 'recorded', fileName?: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/switchProvider',
        body: JSON.stringify({
          type: provider,
          fileName: fileName,
        }),
      });
    }
    setActiveProvider(provider);
    if (fileName) setSelectedFlight(fileName);
  };

  return (
    <WebSocketContext.Provider
      value={{
        snapshot,
        switchProvider,
        isConnected,
        activeProvider,
        selectedFlight,
        reconnectCountdown,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
