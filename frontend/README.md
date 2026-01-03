# Aviation Project - Frontend

This is the frontend application for the Aviation Project, built with React, TypeScript, and Vite. It provides a real-time cockpit dashboard interface for tracking and managing flight telemetry data.

## Current Features

- **Real-time Flight Instruments:** High-fidelity, reactive dashboard including:
  - **Attitude Indicator:** Visual representation of aircraft pitch and roll.
  - **Altimeter:** Real-time altitude monitoring with Kollsman pressure sync.
  - **Airspeed Indicator:** Velocity tracking with smooth signal interpolation.
- **Simulation Control Panel:** Floating "Glass Cockpit" style controls for simulation manipulation:
  - **Universal Pause/Play**: Instantly freeze simulation telemetry.
  - **Precision Speed Control**: Integrated segmented controller for speeds ranging from **0.25x** (Analysis) to **16x** (Travel).
- **Unified WebSocket Management:** Robust STOMP integration with automatic state synchronization on reconnection.

## Architecture

- **Context-Driven State**: The application uses a centralized `WebSocketContext` to manage both telemetry snapshots and simulation control state.
- **Signal Interpolation**: Instruments use internal timers and interpolation factors to ensure needle movement remains fluid even at low data frequencies or in slow motion.
- **Optimistic UI**: Control actions (Pause, Speed) are reflected immediately in the UI while synchronization with the backend happens asynchronously via WebSockets.

## Project Structure

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Real-time Communication:** STOMP over SockJS
- **Linting & Formatting:** ESLint & Prettier

## Project Structure

- `src/components/cockpit`: Main entry point for the cockpit interface.
- `src/components/attitudeindicator`: Logic and styles for the artificial horizon.
- `src/components/altimeter`: Vertical flight data visualization.
- `src/components/airspeed`: Velocity data visualization.
- `src/components/infopanel`: Supplemental flight and system information.
- `src/components/playback`: Unified simulation controls and timeline management.
- `src/contexts`: Global state management including `WebSocketContext`.
- `src/hooks`: Custom hooks for telemetry consumption and playback state.

### Prerequisites

Ensure you have Node.js installed on your machine (latest LTS).

### Installation

1. Clone the repository.
   ```bash
   git clone https://github.com/mirotol/aviation.git
   ```
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

By default, the application will be available at `http://localhost:5173`.

## Linting and Formatting

To maintain code quality, this project uses ESLint and Prettier.

- **Run linter:** `npm run lint`
- **Format check:** Formatting rules are defined in `.prettierrc`
