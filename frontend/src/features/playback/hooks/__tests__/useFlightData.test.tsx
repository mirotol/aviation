import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useFlightData } from '../useFlightData';
import { WebSocketProvider } from '../../../../providers/WebSocketProvider';
import { FlightSnapshot } from '../../../../providers/WebSocketContext';

// Mock SockJS
jest.mock('sockjs-client', () => {
  return jest.fn().mockImplementation(() => ({}));
});

const mockTimestamp = Date.now();
const fakeSnapshot: FlightSnapshot = {
  timestamp: mockTimestamp,
  attitude: { pitch: 1, roll: 2, yaw: 3 },
  altitude: { altitude: 1000, kollsmanPressure: 29.92 },
  airSpeed: { speed: 250 },
  position: { latitude: 0, longitude: 0 },
  progress: null,
  activeWaypointIndex: 0,
};

// Mock STOMP client
jest.mock('@stomp/stompjs', () => {
  return {
    Client: jest.fn().mockImplementation((config) => {
      const client = {
        activate: jest.fn(() => {
          if (config.onConnect) {
            config.onConnect({});
          }
        }),
        deactivate: jest.fn(),
        subscribe: jest.fn((_dest, callback) => {
          callback({ body: JSON.stringify(fakeSnapshot) });
        }),
        publish: jest.fn(),
        connected: true,
      };
      return client;
    }),
  };
});

describe('useFlightData hook', () => {
  it('receives a complete flight snapshot', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WebSocketProvider>{children}</WebSocketProvider>
    );

    const { result } = renderHook(() => useFlightData(), { wrapper });

    await waitFor(
      () => {
        expect(result.current).not.toBeNull();
      },
      { timeout: 2000 }
    );

    const snapshot = result.current!;

    // Core Metadata
    expect(snapshot.timestamp).toBe(mockTimestamp);

    // Attitude verification
    expect(snapshot.attitude.pitch).toBe(1);
    expect(snapshot.attitude.roll).toBe(2);
    expect(snapshot.attitude.yaw).toBe(3);

    // Altitude verification
    expect(snapshot.altitude.altitude).toBe(1000);
    expect(snapshot.altitude.kollsmanPressure).toBe(29.92);

    // Airspeed verification
    expect(snapshot.airSpeed.speed).toBe(250);
  });
});
