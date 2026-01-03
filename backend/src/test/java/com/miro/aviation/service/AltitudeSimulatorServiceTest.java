package com.miro.aviation.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AltitudeSimulatorServiceTest {

    @Test
    void altitudeShouldInitializeCorrectly() {
        AltitudeSimulatorService service = new AltitudeSimulatorService();
        double initialAltitude = service.getCurrentAltitude().getAltitude();
        
        // Should be around the starting 25,500ft
        assertTrue(initialAltitude >= 25490 && initialAltitude <= 25510);
    }

    @Test
    void shouldChangeAltitudeOnlyOnTick() {
        AltitudeSimulatorService service = new AltitudeSimulatorService();
        double initialAlt = service.getCurrentAltitude().getAltitude();

        // Verify stability
        assertEquals(initialAlt, service.getCurrentAltitude().getAltitude(), "Altitude must be stable between ticks");

        // Verify evolution with deltaTime
        service.tick(1.0);
        assertNotEquals(initialAlt, service.getCurrentAltitude().getAltitude(), "Altitude should change after tick");
    }

    @Test
    void shouldRespectKollsmanPressureChanges() {
        AltitudeSimulatorService service = new AltitudeSimulatorService();
        double newPressure = 30.15;
        
        service.setKollsmanPressure(newPressure);
        
        assertEquals(newPressure, service.getCurrentAltitude().getKollsmanPressure());
    }
}
