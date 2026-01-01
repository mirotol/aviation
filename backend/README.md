## Features

*   **Real-time Flight Telemetry**: Stream flight data snapshots including altitude, airspeed, and attitude (roll, pitch, yaw).
*   **Dual Data Providers**:
    *   **Simulated**: Generates dynamic flight data using specialized simulator services.
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

*   **Telemetry Stream**: Subscribe to `/topic/flightData` to receive `FlightSnapshot` objects.
    *   **Broadcast Frequency**: 20Hz (every 50ms).
*   **Provider Switching**: Send a message to `/app/switchProvider` with one of the following strings to toggle the data source:
    *   `"simulated"`: Starts the dynamic math-based simulator.
    *   `"recorded"`: Begins playback of the CSV flight log from the start.

### REST Endpoints
*   `GET /health`: Basic health check to verify the application is running.

## Data Format

The system expects flight data in CSV format located in `src/main/resources/flights/`. 
Default file: `AY523_2025_12_28.csv`.

**Required CSV Headers:**
`Timestamp`, `Altitude`, `Speed`, `Direction`.