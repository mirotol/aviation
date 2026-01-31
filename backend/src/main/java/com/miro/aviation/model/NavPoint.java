package com.miro.aviation.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NavPoint {
    private Long id; // Database ID for linking (e.g., airports.csv id)
    @JsonProperty("ident")
    private String identifier; // Primary identifier (ident column)
    private String name; // Full name
    private String type; // e.g., small_airport, medium_airport, large_airport, VOR, NDB, DME
    private double latitude;
    private double longitude;
    private Integer elevation; // Elevation in feet
    private String icaoCode; // ICAO code (e.g., EFHK)
    private String iataCode; // IATA code (e.g., HEL)
    private String gpsCode; // GPS code
    private String localCode; // Local code
    private Integer frequencyKhz; // For navaids
    private String associatedAirport; // For navaids - links to airport

    public NavPoint() {
    }

    public NavPoint(String identifier, String type, double latitude, double longitude) {
        this.identifier = identifier;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Integer getElevation() {
        return elevation;
    }

    public void setElevation(Integer elevation) {
        this.elevation = elevation;
    }

    public String getIcaoCode() {
        return icaoCode;
    }

    public void setIcaoCode(String icaoCode) {
        this.icaoCode = icaoCode;
    }

    public String getIataCode() {
        return iataCode;
    }

    public void setIataCode(String iataCode) {
        this.iataCode = iataCode;
    }

    public String getGpsCode() {
        return gpsCode;
    }

    public void setGpsCode(String gpsCode) {
        this.gpsCode = gpsCode;
    }

    public String getLocalCode() {
        return localCode;
    }

    public void setLocalCode(String localCode) {
        this.localCode = localCode;
    }

    public Integer getFrequencyKhz() {
        return frequencyKhz;
    }

    public void setFrequencyKhz(Integer frequencyKhz) {
        this.frequencyKhz = frequencyKhz;
    }

    public String getAssociatedAirport() {
        return associatedAirport;
    }

    public void setAssociatedAirport(String associatedAirport) {
        this.associatedAirport = associatedAirport;
    }
}
