import React, { useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebSocketContext, FlightSnapshot } from './WebSocketContext';

interface WebSocketProviderProps {
  children: ReactNode;
}

const RECONNECT_INTERVAL = 5000;

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [snapshot, setSnapshot] = useState<FlightSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'simulated' | 'recorded'>('simulated');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [reconnectCountdown, setReconnectCountdown] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeedState] = useState(1.0);

  const clientRef = useRef<Client | null>(null);
  const timerRef = useRef<number | null>(null);

  // Keep track of current state in refs
  const stateRef = useRef({ isPaused, speed, activeProvider, selectedFlight });
  useEffect(() => {
    stateRef.current = { isPaused, speed, activeProvider, selectedFlight };
  }, [isPaused, speed, activeProvider, selectedFlight]);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let seconds = RECONNECT_INTERVAL / 1000;
    setReconnectCountdown(seconds);

    timerRef.current = window.setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        seconds = RECONNECT_INTERVAL / 1000;
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

        // Initial sync on connection
        const current = stateRef.current;
        client.publish({
          destination: '/app/switchProvider',
          body: JSON.stringify({ type: current.activeProvider, fileName: current.selectedFlight }),
        });
        client.publish({
          destination: '/app/pause',
          body: JSON.stringify({ paused: current.isPaused }),
        });
        client.publish({
          destination: '/app/speed',
          body: JSON.stringify({ speed: current.speed }),
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
    // The connection should stay open during provider switches.
  }, []);

  const switchProvider = useCallback((provider: 'simulated' | 'recorded', fileName?: string) => {
    if (clientRef.current?.connected) {
      // Send everything in ONE payload to avoid race conditions
      clientRef.current.publish({
        destination: '/app/switchProvider',
        body: JSON.stringify({
          type: provider,
          fileName: fileName,
          paused: stateRef.current.isPaused, // Use current UI state
          speed: stateRef.current.speed,
        }),
      });
    }
    setActiveProvider(provider);
    if (fileName) setSelectedFlight(fileName);
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    setIsPaused(paused);
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/pause',
        body: JSON.stringify({ paused }),
      });
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/speed',
        body: JSON.stringify({ speed: newSpeed }),
      });
    }
  }, []);

  const seek = useCallback((percentage: number) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/seek',
        body: JSON.stringify({ percentage }),
      });
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        snapshot,
        switchProvider,
        setPaused,
        setSpeed,
        seek,
        isPaused,
        speed,
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
