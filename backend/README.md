[![codecov](https://codecov.io/gh/mirotol/aviation/branch/master/graph/badge.svg)](https://codecov.io/gh/mirotol/aviation)

## Features

*   **Real-time Flight Telemetry**: Stream flight data snapshots including altitude, airspeed, and attitude (roll, pitch, yaw).
*   **Universal Simulation Control**: 
    - **Pause/Resume**: Support for freezing simulation state across all data providers.
    - **Speed Scaling**: Dynamic speed manipulation (0.25x to 16x) using a time-deterministic `deltaTime` architecture.
*   **Dual Data Providers**:
    *   **Recorded**: Parses and plays back historical flight data from CSV files.
*   **WebSocket Integration**: Efficient, low-latency data streaming to clients.

## Getting Started

### Prerequisites

*   JDK 21 or higher
*   Gradle (included via Wrapper)

### Running the Application

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mirotol/aviation.git
    cd backend
    ```

2.  **Build the project**:
    ```bash
    ./gradlew build
    ```

3.  **Run the application**:
    ```bash
    ./gradlew bootRun
    ```
    The server will start on `http://localhost:8080` (default Spring Boot port).

## API & WebSockets

### WebSocket Connection
The application uses STOMP over WebSockets for real-time data delivery.

*   **Telemetry Stream**: Subscribe to `/user/queue/flightData` to receive `FlightSnapshot` objects (Session-isolated).
    *   **Broadcast Frequency**: 20 Hz (every 50 ms).
*   **Control Mappings**:
    - `/app/switchProvider`: payload `{"type": "simulated" | "recorded", "fileName": string?}`
    - `/app/pause`: payload `{"paused": boolean}`
    - `/app/speed`: payload `{"speed": double}`

### Simulation Architecture
The backend utilizes a polymorphic `FlightDataProvider` interface. 
- **`SimulatedFlightDataProvider`**: Uses internal simulation clocking (`simulatedTime`) and `tick(deltaTime)` scaling to ensure smooth, high-fidelity physics regardless of playback speed.
- **`RecordedFlightDataProvider`**: Manages CSV index calculations with time-anchoring to allow seamless speed changes and pausing of historical data.

## Data Format

The system expects flight data in CSV format located in `src/main/resources/flights/`. 
Default file: `AY523_2025_12_28.csv`.

**Required CSV Headers:**
`Timestamp`, `Altitude`, `Speed`, `Direction`.

## Code Coverage
![Coverage History](https://codecov.io/gh/mirotol/aviation/graphs/icicle.svg)
    