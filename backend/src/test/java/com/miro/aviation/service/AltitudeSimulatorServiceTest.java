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
    void kollsmanPressureShouldBeUpdatable() {
        AltitudeSimulatorService service = new AltitudeSimulatorService();
        service.setKollsmanPressure(30.01);
        
        assertEquals(30.01, service.getCurrentAltitude().getKollsmanPressure());
    }
}
