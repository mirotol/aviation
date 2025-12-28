import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface FlightSnapshot {
  timestamp: number;
  attitude: { pitch: number; roll: number; yaw: number };
  altitude: { altitude: number; kollsmanPressure: number };
  airSpeed: { speed: number };
}

export function useFlightData() {
  const [snapshot, setSnapshot] = useState<FlightSnapshot | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log(msg),
    });

    client.onConnect = () => {
      client.subscribe('/topic/flightData', (message) => {
        const data: FlightSnapshot = JSON.parse(message.body);
        setSnapshot(data);
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return snapshot;
}
