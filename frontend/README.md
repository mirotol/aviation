# Aviation Project - Frontend

This is the frontend application for the Aviation Project, built with React, TypeScript, and Vite. It provides a real-time cockpit dashboard interface for tracking and managing flight telemetry data.

## Current Features

- **Real-time Flight Instruments:** Live updates for flight data including:
  - **Attitude Indicator:** Visual representation of aircraft pitch and roll.
  - **Altimeter:** Real-time altitude monitoring.
  - **Airspeed Indicator:** Current velocity tracking.
- **WebSocket Integration:** Low-latency data streaming using STOMP over SockJS to ensure instrument precision.

## Tech Stack

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
- `src/hooks`: Custom hooks for managing WebSocket state and telemetry data.

## Getting Started

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
