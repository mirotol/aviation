import { renderHook, waitFor } from '@testing-library/react';
import { useFlightData, FlightSnapshot } from '../useFlightData';

// Mock SockJS
jest.mock('sockjs-client', () => {
  return jest.fn().mockImplementation(() => ({}));
});

// Mock STOMP client
const mockTimestamp = Date.now();
jest.mock('@stomp/stompjs', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      const client = {
        activate: jest.fn(() => {
          // Trigger onConnect when activate is called
          if (client.onConnect) {
            client.onConnect({});
          }
        }),
        deactivate: jest.fn(),
        subscribe: jest.fn((destination: string, callback: any) => {
          // Simulate receiving a flight snapshot immediately
          const fakeSnapshot: FlightSnapshot = {
            timestamp: mockTimestamp,
            attitude: { pitch: 1, roll: 2, yaw: 3 },
            altitude: { altitude: 1000, kollsmanPressure: 29.92 },
            airSpeed: { speed: 250 },
          };
          callback({ body: JSON.stringify(fakeSnapshot) });
        }),
        onConnect: null as any,
      };
      return client;
    }),
  };
});

describe('useFlightData hook', () => {
  it('receives a flight snapshot', async () => {
    const { result } = renderHook(() => useFlightData());

    // Wait for the hook state to be updated
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const snapshot = result.current!;
    expect(snapshot.timestamp).toBe(mockTimestamp);
    expect(snapshot.attitude.pitch).toBe(1);
    expect(snapshot.attitude.roll).toBe(2);
    expect(snapshot.attitude.yaw).toBe(3);
    expect(snapshot.altitude.altitude).toBe(1000);
    expect(snapshot.altitude.kollsmanPressure).toBe(29.92);
    expect(snapshot.airSpeed.speed).toBe(250);
  });
});
