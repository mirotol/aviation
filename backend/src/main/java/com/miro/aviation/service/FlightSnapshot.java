package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;

/**
 * Represents a single snapshot of flight data.
 */
public class FlightSnapshot {

    private Attitude attitude;
    private Altitude altitude;
    private AirSpeed airSpeed;

    public FlightSnapshot() {
        // default constructor
    }

    public FlightSnapshot(Attitude attitude, Altitude altitude) {
        this.attitude = attitude;
        this.altitude = altitude;
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
