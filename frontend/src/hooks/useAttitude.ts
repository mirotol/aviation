import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Attitude {
  pitch: number;
  roll: number;
  yaw: number;
}

export function useAttitude() {
  const [attitude, setAttitude] = useState<Attitude>({ pitch: 0, roll: 0, yaw: 0 });

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/attitude', (message) => {
        const data: Attitude = JSON.parse(message.body);
        setAttitude(data);
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return attitude;
}
