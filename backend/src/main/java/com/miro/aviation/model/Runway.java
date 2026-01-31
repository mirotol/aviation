package com.miro.aviation.model;

/**
 * Represents a runway at an airport.
 * Contains information about both runway ends (LE - Low End, HE - High End).
 */
public class Runway {
    private Long id; // Unique runway ID
    private Long airportRef; // Reference to airport ID
    private String airportIdent; // Airport identifier
    private Integer lengthFt; // Runway length in feet
    private Integer widthFt; // Runway width in feet
    private String surface; // Surface type (e.g., ASPH, CONC, GRVL, TURF)
    private Boolean lighted; // Whether runway is lighted
    private Boolean closed; // Whether runway is closed

    // Low End (LE) information
    private String leIdent; // Low end identifier (e.g., "09L")
    private Double leLatitude;
    private Double leLongitude;
    private Integer leElevationFt;
    private Double leHeadingDegT; // True heading in degrees
    private Integer leDisplacedThresholdFt;

    // High End (HE) information
    private String heIdent; // High end identifier (e.g., "27R")
    private Double heLatitude;
    private Double heLongitude;
    private Integer heElevationFt;
    private Double heHeadingDegT; // True heading in degrees
    private Integer heDisplacedThresholdFt;

    public Runway() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAirportRef() {
        return airportRef;
    }

    public void setAirportRef(Long airportRef) {
        this.airportRef = airportRef;
    }

    public String getAirportIdent() {
        return airportIdent;
    }

    public void setAirportIdent(String airportIdent) {
        this.airportIdent = airportIdent;
    }

    public Integer getLengthFt() {
        return lengthFt;
    }

    public void setLengthFt(Integer lengthFt) {
        this.lengthFt = lengthFt;
    }

    public Integer getWidthFt() {
        return widthFt;
    }

    public void setWidthFt(Integer widthFt) {
        this.widthFt = widthFt;
    }

    public String getSurface() {
        return surface;
    }

    public void setSurface(String surface) {
        this.surface = surface;
    }

    public Boolean getLighted() {
        return lighted;
    }

    public void setLighted(Boolean lighted) {
        this.lighted = lighted;
    }

    public Boolean getClosed() {
        return closed;
    }

    public void setClosed(Boolean closed) {
        this.closed = closed;
    }

    public String getLeIdent() {
        return leIdent;
    }

    public void setLeIdent(String leIdent) {
        this.leIdent = leIdent;
    }

    public Double getLeLatitude() {
        return leLatitude;
    }

    public void setLeLatitude(Double leLatitude) {
        this.leLatitude = leLatitude;
    }

    public Double getLeLongitude() {
        return leLongitude;
    }

    public void setLeLongitude(Double leLongitude) {
        this.leLongitude = leLongitude;
    }

    public Integer getLeElevationFt() {
        return leElevationFt;
    }

    public void setLeElevationFt(Integer leElevationFt) {
        this.leElevationFt = leElevationFt;
    }

    public Double getLeHeadingDegT() {
        return leHeadingDegT;
    }

    public void setLeHeadingDegT(Double leHeadingDegT) {
        this.leHeadingDegT = leHeadingDegT;
    }

    public Integer getLeDisplacedThresholdFt() {
        return leDisplacedThresholdFt;
    }

    public void setLeDisplacedThresholdFt(Integer leDisplacedThresholdFt) {
        this.leDisplacedThresholdFt = leDisplacedThresholdFt;
    }

    public String getHeIdent() {
        return heIdent;
    }

    public void setHeIdent(String heIdent) {
        this.heIdent = heIdent;
    }

    public Double getHeLatitude() {
        return heLatitude;
    }

    public void setHeLatitude(Double heLatitude) {
        this.heLatitude = heLatitude;
    }

    public Double getHeLongitude() {
        return heLongitude;
    }

    public void setHeLongitude(Double heLongitude) {
        this.heLongitude = heLongitude;
    }

    public Integer getHeElevationFt() {
        return heElevationFt;
    }

    public void setHeElevationFt(Integer heElevationFt) {
        this.heElevationFt = heElevationFt;
    }

    public Double getHeHeadingDegT() {
        return heHeadingDegT;
    }

    public void setHeHeadingDegT(Double heHeadingDegT) {
        this.heHeadingDegT = heHeadingDegT;
    }

    public Integer getHeDisplacedThresholdFt() {
        return heDisplacedThresholdFt;
    }

    public void setHeDisplacedThresholdFt(Integer heDisplacedThresholdFt) {
        this.heDisplacedThresholdFt = heDisplacedThresholdFt;
    }
}
