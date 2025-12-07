import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function AttitudeIndicator() {
  const [attitude, setAttitude] = useState({ pitch: 0, roll: 0, yaw: 0 });

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws/attitude');
    const stompClient = new Client({
      webSocketFactory: () => socket
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/attitude', (message) => {
        const data = JSON.parse(message.body);
        setAttitude(data);
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <h2>Attitude Indicator</h2>
      <p>Pitch: {attitude.pitch.toFixed(2)}°</p>
      <p>Roll: {attitude.roll.toFixed(2)}°</p>
      <p>Yaw: {attitude.yaw.toFixed(2)}°</p>
    </div>
  );
}
