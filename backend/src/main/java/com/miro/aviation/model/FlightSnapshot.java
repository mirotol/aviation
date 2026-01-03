package com.miro.aviation.model;

/**
 * Represents a single snapshot of flight data.
 */
public class FlightSnapshot {

    private long timestamp; // epoch seconds or millis
    private Attitude attitude;
    private Altitude altitude;
    private AirSpeed airSpeed;

    public FlightSnapshot(long timestamp, Attitude attitude, Altitude altitude, AirSpeed airSpeed) {
        this.timestamp = timestamp;
        this.attitude = attitude;
        this.altitude = altitude;
        this.airSpeed = airSpeed;
    }

    public FlightSnapshot() {
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public Attitude getAttitude() {
        return attitude;
    }

    public void setAttitude(Attitude attitude) {
        this.attitude = attitude;
    }

    public Altitude getAltitude() {
        return altitude;
    }

    public void setAltitude(Altitude altitude) {
        this.altitude = altitude;
    }

    public AirSpeed getAirSpeed() {
        return airSpeed;
    }

    public void setAirSpeed(AirSpeed airSpeed) {
        this.airSpeed = airSpeed;
    }
}
