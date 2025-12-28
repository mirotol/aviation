import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useRef } from 'react';

export function useFlightProviderSwitch() {
  const clientRef = useRef<Client | null>(null);

  const connectIfNeeded = () => {
    if (clientRef.current?.connected) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
    });

    client.activate();
    clientRef.current = client;
  };

  const switchProvider = (provider: 'simulated' | 'recorded') => {
    connectIfNeeded();

    clientRef.current?.publish({
      destination: '/app/switchProvider',
      body: provider,
    });
  };

  return { switchProvider };
}
