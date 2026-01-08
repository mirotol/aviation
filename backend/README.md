# Aviation Project - Backend

The backend for the Aviation project is a Spring Boot application designed to handle real-time flight telemetry, CSV data parsing, and high-frequency WebSocket broadcasting.

[![codecov](https://codecov.io/gh/mirotol/aviation/branch/master/graph/badge.svg)](https://codecov.io/gh/mirotol/aviation)

## Core Features

- **Real-time Flight Telemetry**: Streams flight data snapshots including altitude, airspeed, and attitude (roll, pitch, yaw).
- **Universal Simulation Control**:
  - **Pause/Resume**: Support for freezing simulation state across all data providers.
  - **Speed Scaling**: Dynamic speed manipulation (0.25x to 16x) using a time-deterministic `deltaTime` architecture.
- **Dual Data Providers**:
  - **Simulated**: Generates real-time flight data for testing and demonstration.
  - **Recorded**: Parses and plays back historical flight data from CSV files.
- **WebSocket Integration**: Efficient, low-latency data streaming using STOMP over WebSockets.

## Getting Started

### Prerequisites

- **JDK 21** or higher
- **Gradle** (included via Wrapper)

### Running the Application

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/mirotol/aviation.git
    cd aviation/backend
    ```

2.  **Build the project**:

    ```bash
    ./gradlew build
    ```

3.  **Run the application**:
    ```bash
    ./gradlew bootRun
    ```
    The server will start on `http://localhost:8080`.

## API & WebSockets

### WebSocket Connection

The application uses STOMP over WebSockets for real-time data delivery.

- **Telemetry Stream**: Subscribe to `/user/queue/flightData` to receive `FlightSnapshot` objects.
- **Broadcast Frequency**: 20 Hz (every 50 ms).
- **Control Mappings**:
  - `/app/switchProvider`: payload `{"type": "simulated" | "recorded", "fileName": string?}`
  - `/app/pause`: payload `{"paused": boolean}`
  - `/app/speed`: payload `{"speed": double}`

## Simulation Architecture

The backend utilizes a polymorphic `FlightDataProvider` interface to handle different data sources:

- **`SimulatedFlightDataProvider`**: Uses internal simulation clocking and `tick(deltaTime)` scaling to ensure smooth, high-fidelity physics regardless of playback speed.
- **`RecordedFlightDataProvider`**: Manages CSV index calculations with time-anchoring to allow seamless speed changes and pausing of historical data.

## Data Format

The system expects flight data in CSV format located in `src/main/resources/flights/`.

**Required CSV Headers:**
`Timestamp`, `Altitude`, `Speed`, `Direction`, `Pitch`, `Roll`.

## Code Coverage

![Coverage History](https://codecov.io/gh/mirotol/aviation/graphs/icicle.svg)
