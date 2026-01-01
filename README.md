# Aviation Project

A full-stack application for real-time flight telemetry visualization. This project features a Spring Boot backend that streams flight data via WebSockets and a React-based frontend cockpit dashboard.

## Project Overview

The **Aviation Project** provides a real-time cockpit interface with live flight instruments. It supports two modes of data:
- **Simulated**: Real-time generation of flight data using simulator services.
- **Recorded**: Playback of historical flight data from CSV logs.

### Project Structure

- **`/backend`**: Spring Boot application handling telemetry logic, CSV parsing, and WebSocket streaming.
- **`/frontend`**: React/TypeScript application providing the visual cockpit dashboard and flight instruments.

## Key Features

- **Live Flight Instruments**: Visual Attitude Indicator (Pitch/Roll), Altimeter, and Airspeed Indicator.
- **WebSocket Streaming**: Low-latency data delivery using STOMP over SockJS.
- **Data Flexibility**: Ability to switch between live simulations and recorded CSV data.

## Getting Started

### Prerequisites

- **Java**: JDK 21 or higher
- **Node.js**: Latest LTS version
- **Gradle**: Included via Wrapper