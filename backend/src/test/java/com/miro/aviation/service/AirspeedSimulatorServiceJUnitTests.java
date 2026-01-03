package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AirspeedSimulatorServiceTest {

    @Test
    void shouldInitializeWithStartingSpeed() {
        AirspeedSimulatorService service = new AirspeedSimulatorService();
        AirSpeed initial = service.getCurrentAirSpeed();
        
        // Based on the code, it starts at 60 kt
        assertEquals(60.0, initial.getSpeed());
    }

    @Test
    void shouldMaintainStabilityUntilTicked() {
        AirspeedSimulatorService service = new AirspeedSimulatorService();
        
        double first = service.getCurrentAirSpeed().getSpeed();
        double second = service.getCurrentAirSpeed().getSpeed();

        assertEquals(first, second, "Speed should not change without a tick");
    }

    @Test
    void shouldChangeSpeedOnTick() {
        AirspeedSimulatorService service = new AirspeedSimulatorService();
        double initial = service.getCurrentAirSpeed().getSpeed();

        service.tick();
        double afterTick = service.getCurrentAirSpeed().getSpeed();

        assertNotEquals(initial, afterTick, "Speed should evolve after a tick");
        // Verify it stays within the logical bounds (±2.5 kt per tick)
        assertTrue(Math.abs(afterTick - initial) <= 2.51); 
    }

    @Test
    void shouldStayWithinClampedLimits() {
        AirspeedSimulatorService service = new AirspeedSimulatorService();
        
        // Tick many times to hit limits
        for (int i = 0; i < 500; i++) {
            service.tick();
            double speed = service.getCurrentAirSpeed().getSpeed();
            assertTrue(speed >= 40.0 && speed <= 180.0, "Speed " + speed + " out of bounds");
        }
    }
}
