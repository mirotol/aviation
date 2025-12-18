import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Update interface to include kollsmanPressure
export interface AltitudeData {
  altitude: number;
  kollsmanPressure: number;
}

export function useAltitude() {
  const [alt, setAlt] = useState<AltitudeData>({
    altitude: 0,
    kollsmanPressure: 29.92, // default sea-level
  });

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/altitude', (message) => {
        const data: AltitudeData = JSON.parse(message.body);
        // Ensure both altitude and Kollsman pressure are updated
        setAlt({
          altitude: data.altitude,
          kollsmanPressure: data.kollsmanPressure,
        });
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return alt;
}
