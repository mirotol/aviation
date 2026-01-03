import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useAvailableFlights } from '../useAvailableFlights';
import { WebSocketProvider } from '../../contexts/WebSocketContext';

/**
 * Note: This test relies on src/setupTests.ts to provide TextEncoder/TextDecoder globals,
 * which are required by the underlying STOMP library used in WebSocketProvider.
 */

// Mock the WebSocket Context to prevent real connections
jest.mock('sockjs-client', () =>
  jest.fn().mockImplementation(() => ({
    onopen: jest.fn(),
    onmessage: jest.fn(),
    onclose: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
  }))
);

describe('useAvailableFlights hook', () => {
  const mockFlights = ['flight1.csv', 'flight2.csv'];

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFlights),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches available flights on mount', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WebSocketProvider>{children}</WebSocketProvider>
    );

    const { result } = renderHook(() => useAvailableFlights(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the fetch to complete and state to update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availableFlights).toEqual(mockFlights);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/flights');
  });

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockImplementation(() => Promise.reject(new Error('Network error')));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WebSocketProvider>{children}</WebSocketProvider>
    );

    const { result } = renderHook(() => useAvailableFlights(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availableFlights).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch flights', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
