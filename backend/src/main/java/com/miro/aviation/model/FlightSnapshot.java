package com.miro.aviation.model;

/**
 * Represents a single snapshot of flight data.
 * In future can use JsonPropertyOrder for ordering JSON properties for frontend if needed
 */
//
public class FlightSnapshot {

    private long timestamp; // epoch seconds or millis
    private Attitude attitude;
    private Altitude altitude;
    private AirSpeed airSpeed;
    private Position position;
    private PlaybackProgress progress;
    private int activeWaypointIndex = 0;

    public FlightSnapshot(long timestamp, Attitude attitude, Altitude altitude, AirSpeed airSpeed, PlaybackProgress progress, Position position, int activeWaypointIndex) {
        this.timestamp = timestamp;
        this.attitude = attitude;
        this.altitude = altitude;
        this.airSpeed = airSpeed;
        this.progress = progress;
        this.position = position;
        this.activeWaypointIndex = activeWaypointIndex;
    }

    public FlightSnapshot() {}

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

    public PlaybackProgress getProgress() {
        return progress;
    }

    public void setProgress(PlaybackProgress progress) {
        this.progress = progress;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public int getActiveWaypointIndex() {
        return activeWaypointIndex;
    }

    public void setActiveWaypointIndex(int activeWaypointIndex) {
        this.activeWaypointIndex = activeWaypointIndex;
    }
}
