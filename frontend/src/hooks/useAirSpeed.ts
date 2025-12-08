import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface AirSpeed {
  speed: number;
}

export function useAirspeed() {
  const [airspeed, setAirspeed] = useState<AirSpeed>({ speed: 0 });

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/airspeed', (message) => {
        const data: AirSpeed = JSON.parse(message.body);
        setAirspeed(data);
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return airspeed;
}
