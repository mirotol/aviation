package com.miro.aviation.model;

public class NavPoint {
    private String ident;
    private String type; // e.g., small_airport, medium_airport, large_airport
    private double latitude;
    private double longitude;

    public NavPoint() {
    }

    public NavPoint(String ident, String type, double latitude, double longitude) {
        this.ident = ident;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getIdent() {
        return ident;
    }

    public void setIdent(String ident) {
        this.ident = ident;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}
