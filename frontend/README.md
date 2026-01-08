# Aviation Project - Frontend

The frontend for the Aviation project is a React-based simulation of a modern glass cockpit, featuring both a Primary Flight Display (PFD) and a Multi-Function Display (MFD).

## Key Features

- **Primary Flight Display (PFD):** A unified glass cockpit dashboard including:
  - **Attitude Indicator:** High-precision SVG-based artificial horizon with synchronized bank scale and sky-pointer.
  - **Altimeter Tape:** Vertical sliding scale for altitude tracking.
  - **Airspeed Tape:** Vertical sliding scale for velocity tracking.
- **Multi-Function Display (MFD):** Modern navigation unit including:
  - **Navigation Display (ND):** Features a moving map with real-time aircraft positioning.
  - **Flight Plan Visualization:** Displays waypoints and the current active leg of the flight plan.
- **Cockpit Hardware Simulation:**
  - **Interactive Bezels:** Realistic PFD and MFD frames with physical control simulations.
  - **Knobs & Buttons:** Functional dual-concentric knobs (outer/inner rings) and tactile buttons for system interaction.
  - **Softkeys:** Context-sensitive buttons at the bottom of each display, aligned with the screen content.
- **Simulation Control Panel:**
  - **Precision Playback**: Integrated controller for deterministic simulation speeds (0.25x to 16x).
  - **Data Link Monitoring**: Real-time telemetry feed monitoring.
- **Unified WebSocket Management:** Robust STOMP integration with automatic state synchronization.

## Architecture

- **Aviation Design System**: Centralized color palette and "electronic glow" variables in `index.css` following "Quiet Dark Cockpit" standards.
- **Performance Optimized Tapes**: Airspeed and Altimeter tapes utilize visible-only tick rendering to ensure smooth performance.
- **SVG Synchronicity**: Instrument scales and indicators use integrated SVG coordinate systems for mathematical precision.
- **Dampened Transitions**: All instrument movements and panel transitions use dampened linear interpolation for a "mechanical hardware" feel.

## Technical Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Real-time Communication:** STOMP over WebSockets (SockJS)
- **Linting & Formatting:** ESLint & Prettier

## Project Structure

- `src/components/pfd`: Primary Flight Display assembly and components.
- `src/components/mfd`: Multi-Function Display assembly.
- `src/components/navigation`: Moving map and navigation display logic.
- `src/components/cockpit`: Unified cockpit layout (PFD + MFD).
- `src/components/cockpit/efis`: Electronic Flight Instrument System (EFIS) components like Bezels, Knobs, and Buttons.
- `src/components/attitudeindicator`: The ADI (Attitude Director Indicator) core.
- `src/components/altimeter`: Altimeter tape module.
- `src/components/airspeed`: Airspeed tape module.
- `src/contexts`: Global state management (WebSocket, Flight Plan).
- `src/hooks`: Custom hooks for telemetry consumption and playback state.

## Getting Started

### Prerequisites

Ensure you have **Node.js** installed on your machine (latest LTS recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mirotol/aviation.git
   ```
2. Navigate to the frontend directory:
   ```bash
   cd aviation/frontend
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
