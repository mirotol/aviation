package com.miro.aviation.model;

import java.time.Instant;

public class Attitude {
    private double pitch; // degrees (nose up/down)
    private double roll;  // degrees (bank/tilt left or right)
    private double yaw; // degrees (heading, 360 max value)
    private Instant timestamp;

    public Attitude(double pitch, double roll, double yaw) {
        this.pitch = pitch;
        this.roll = roll;
        this.yaw = yaw;
        this.timestamp = Instant.now();
    }

    public double getPitch() { return pitch; }
    public double getRoll() { return roll; }
    public double getYaw() { return yaw; }
    public Instant getTimestamp() { return timestamp; }
}
