# Aviation Project - Frontend

The frontend for the Aviation project is a React-based simulation of a modern Primary Flight Display (PFD). It is built with a focus on precision, performance, and professional aviation design standards.

## Current Features

- **Primary Flight Display (PFD):** A unified glass cockpit dashboard including:
    - **Attitude Indicator:** High-precision SVG-based artificial horizon with synchronized bank scale and sky-pointer.
    - **Altimeter Tape:** Performance-optimized vertical sliding scale for altitude tracking.
    - **Airspeed Tape:** Responsive vertical velocity tape with signal-dampened movement.
- **Simulation Control Panel:** "Quiet Dark Cockpit" style hardware controls:
    - **Master Toggle:** Smoothly animated "Data Link" panel for deep telemetry monitoring.
    - **Precision Playback**: Integrated segmented controller for deterministic simulation speeds (0.25x to 16x).
- **Unified WebSocket Management:** Robust STOMP integration with automatic state synchronization.

## Architecture

- **Aviation Design System**: Centralized color palette and "electronic glow" variables in `index.css` following the "Quiet Dark Cockpit" standard.
- **Performance Optimized Tapes**: Airspeed and Altimeter tapes utilize visible-only tick rendering to ensure smooth performance even at high simulation speeds.
- **SVG Synchronicity**: The bank scale and sky-pointer are integrated into a single SVG coordinate system for mathematical precision.
- **Dampened Transitions**: All instrument movements and panel transitions use dampened linear interpolation for a "mechanical hardware" feel.

## Project Structure

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Real-time Communication:** STOMP over SockJS
- **Linting & Formatting:** ESLint & Prettier

## Project Structure

- `src/components/attitudeindicator`: The ADI (Attitude Director Indicator) core.
- `src/components/altimeter`: The Altimeter Tape module.
- `src/components/airspeed`: The AirSpeed Tape module.
- `src/components/cockpit`: The unified PFD assembly and layout.
- `src/components/playback`: High-fidelity simulation controls.
- `src/components/infopanel`: The "Data Link" telemetry sidebar.
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
