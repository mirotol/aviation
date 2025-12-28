import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useRef } from 'react';

export function useFlightProviderSwitch() {
  const clientRef = useRef<Client | null>(null);
  const queueRef = useRef<string | null>(null); // hold first provider request if not connected

  const connectIfNeeded = () => {
    if (clientRef.current) return; // already initialized

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('STOMP connected!');

        // flush queue if we tried switching before connect
        if (queueRef.current) {
          client.publish({ destination: '/app/switchProvider', body: queueRef.current });
          queueRef.current = null;
        }
      },
    });

    client.activate();
    clientRef.current = client;
  };

  const switchProvider = (provider: 'simulated' | 'recorded') => {
    connectIfNeeded();

    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/switchProvider',
        body: provider,
      });
    } else {
      // client not ready, queue it for onConnect
      queueRef.current = provider;
    }
  };

  return { switchProvider };
}
