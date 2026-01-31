package com.miro.aviation.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ModelTests {

    @Test
    void testNavPoint() {
        NavPoint np = new NavPoint();
        np.setIdentifier("TEST");
        np.setType("airport");
        np.setLatitude(10.0);
        np.setLongitude(20.0);

        assertEquals("TEST", np.getIdentifier());
        assertEquals("airport", np.getType());
        assertEquals(10.0, np.getLatitude());
        assertEquals(20.0, np.getLongitude());
    }

    @Test
    void testAirSpeed() {
        AirSpeed as = new AirSpeed();
        as.setSpeed(150.0);
        assertEquals(150.0, as.getSpeed());
    }

    @Test
    void testAltitude() {
        Altitude alt = new Altitude();
        alt.setAltitude(5000.0);
        alt.setKollsmanPressure(29.92);
        assertEquals(5000.0, alt.getAltitude());
        assertEquals(29.92, alt.getKollsmanPressure());
    }

    @Test
    void testPosition() {
        Position pos = new Position();
        pos.setLatitude(60.0);
        pos.setLongitude(24.0);
        assertEquals(60.0, pos.getLatitude());
        assertEquals(24.0, pos.getLongitude());
    }

    @Test
    void testFlightSnapshot() {
        FlightSnapshot fs = new FlightSnapshot();
        fs.setTimestamp(123456789L);
        fs.setActiveWaypointIndex(2);

        assertEquals(123456789L, fs.getTimestamp());
        assertEquals(2, fs.getActiveWaypointIndex());

        Attitude att = new Attitude(1.0, 2.0, 3.0);
        fs.setAttitude(att);
        assertEquals(att, fs.getAttitude());

        Altitude alt = new Altitude(5000.0, 29.92);
        fs.setAltitude(alt);
        assertEquals(alt, fs.getAltitude());

        AirSpeed as = new AirSpeed(150.0);
        fs.setAirSpeed(as);
        assertEquals(as, fs.getAirSpeed());

        Position pos = new Position(60.0, 24.0);
        fs.setPosition(pos);
        assertEquals(pos, fs.getPosition());

        PlaybackProgress progress = new PlaybackProgress(1, 10, 10.0, 0, 100);
        fs.setProgress(progress);
        assertEquals(progress, fs.getProgress());
    }

    @Test
    void testRunway() {
        Runway runway = new Runway();
        runway.setId(12345L);
        runway.setAirportRef(6789L);
        runway.setAirportIdent("EFHK");
        runway.setLengthFt(10000);
        runway.setWidthFt(150);
        runway.setSurface("ASPH");
        runway.setLighted(true);
        runway.setClosed(false);

        // Test low end
        runway.setLeIdent("15");
        runway.setLeLatitude(60.317222);
        runway.setLeLongitude(24.963333);
        runway.setLeElevationFt(179);
        runway.setLeHeadingDegT(151.0);
        runway.setLeDisplacedThresholdFt(0);

        // Test high end
        runway.setHeIdent("33");
        runway.setHeLatitude(60.331667);
        runway.setHeLongitude(24.976111);
        runway.setHeElevationFt(179);
        runway.setHeHeadingDegT(331.0);
        runway.setHeDisplacedThresholdFt(0);

        assertEquals(12345L, runway.getId());
        assertEquals(6789L, runway.getAirportRef());
        assertEquals("EFHK", runway.getAirportIdent());
        assertEquals(10000, runway.getLengthFt());
        assertEquals(150, runway.getWidthFt());
        assertEquals("ASPH", runway.getSurface());
        assertTrue(runway.getLighted());
        assertFalse(runway.getClosed());

        assertEquals("15", runway.getLeIdent());
        assertEquals(60.317222, runway.getLeLatitude(), 0.0001);
        assertEquals(24.963333, runway.getLeLongitude(), 0.0001);
        assertEquals(179, runway.getLeElevationFt());
        assertEquals(151.0, runway.getLeHeadingDegT());
        assertEquals(0, runway.getLeDisplacedThresholdFt());

        assertEquals("33", runway.getHeIdent());
        assertEquals(60.331667, runway.getHeLatitude(), 0.0001);
        assertEquals(24.976111, runway.getHeLongitude(), 0.0001);
        assertEquals(179, runway.getHeElevationFt());
        assertEquals(331.0, runway.getHeHeadingDegT());
        assertEquals(0, runway.getHeDisplacedThresholdFt());
    }

    @Test
    void testNavPointWithExtendedFields() {
        NavPoint np = new NavPoint();
        np.setId(12345L);
        np.setIdentifier("EFHK");
        np.setName("Helsinki Vantaa Airport");
        np.setType("large_airport");
        np.setLatitude(60.317222);
        np.setLongitude(24.963333);
        np.setElevation(179);
        np.setIcaoCode("EFHK");
        np.setIataCode("HEL");
        np.setGpsCode("EFHK");
        np.setLocalCode(null);

        assertEquals(12345L, np.getId());
        assertEquals("EFHK", np.getIdentifier());
        assertEquals("Helsinki Vantaa Airport", np.getName());
        assertEquals("large_airport", np.getType());
        assertEquals(60.317222, np.getLatitude(), 0.0001);
        assertEquals(24.963333, np.getLongitude(), 0.0001);
        assertEquals(179, np.getElevation());
        assertEquals("EFHK", np.getIcaoCode());
        assertEquals("HEL", np.getIataCode());
        assertEquals("EFHK", np.getGpsCode());
        assertNull(np.getLocalCode());
    }

    @Test
    void testNavPointAsNavaid() {
        NavPoint navaid = new NavPoint();
        navaid.setId(85050L);
        navaid.setIdentifier("1A");
        navaid.setName("Williams Harbour");
        navaid.setType("NDB");
        navaid.setLatitude(52.558899);
        navaid.setLongitude(-55.782200);
        navaid.setElevation(70);
        navaid.setFrequencyKhz(373);
        navaid.setAssociatedAirport("CCA6");

        assertEquals(85050L, navaid.getId());
        assertEquals("1A", navaid.getIdentifier());
        assertEquals("Williams Harbour", navaid.getName());
        assertEquals("NDB", navaid.getType());
        assertEquals(52.558899, navaid.getLatitude(), 0.0001);
        assertEquals(-55.782200, navaid.getLongitude(), 0.0001);
        assertEquals(70, navaid.getElevation());
        assertEquals(373, navaid.getFrequencyKhz());
        assertEquals("CCA6", navaid.getAssociatedAirport());
    }

    @Test
    void testAirportDetails() {
        NavPoint airport = new NavPoint("EFHK", "large_airport", 60.317222, 24.963333);

        Runway runway1 = new Runway();
        runway1.setLeIdent("15");
        runway1.setHeIdent("33");

        Runway runway2 = new Runway();
        runway2.setLeIdent("04L");
        runway2.setHeIdent("22R");

        NavPoint navaid = new NavPoint();
        navaid.setType("VOR");
        navaid.setIdentifier("HEL");

        AirportDetails details = new AirportDetails(
            airport,
            java.util.List.of(runway1, runway2),
            java.util.List.of(navaid)
        );

        assertEquals(airport, details.airport());
        assertEquals(2, details.runways().size());
        assertEquals(1, details.associatedNavaids().size());
        assertEquals("15", details.runways().get(0).getLeIdent());
        assertEquals("VOR", details.associatedNavaids().get(0).getType());
    }
}
