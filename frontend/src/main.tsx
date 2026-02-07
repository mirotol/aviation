import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { FlightPlanProvider } from './providers/FlightPlanProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlightPlanProvider>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </FlightPlanProvider>
  </StrictMode>
);
