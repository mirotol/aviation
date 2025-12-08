import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Altitude {
  altitude: number;
}

export function useAltitude() {
  const [alt, setAlt] = useState<Altitude>({ altitude: 0 });

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/altitude', (message) => {
        const data: Altitude = JSON.parse(message.body);
        setAlt(data);
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return alt;
}
