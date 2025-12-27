package com.miro.aviation.model;

public class Altitude {
    private double altitude; // in feet
    private double kollsmanPressure; // in inHg

    public Altitude() {}

    public Altitude(double altitude, double kollsmanPressure) {
        this.altitude = altitude;
        this.kollsmanPressure = kollsmanPressure;
    }

    public double getAltitude() { return altitude; }
    public void setAltitude(double altitude) { this.altitude = altitude; }

    public double getKollsmanPressure() { return kollsmanPressure; }
    public void setKollsmanPressure(double kollsmanPressure) { this.kollsmanPressure = kollsmanPressure; }
}
