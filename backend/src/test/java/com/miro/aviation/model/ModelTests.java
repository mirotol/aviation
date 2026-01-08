package com.miro.aviation.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ModelTests {

    @Test
    void testNavPoint() {
        NavPoint np = new NavPoint();
        np.setIdent("TEST");
        np.setType("airport");
        np.setLatitude(10.0);
        np.setLongitude(20.0);

        assertEquals("TEST", np.getIdent());
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
}
