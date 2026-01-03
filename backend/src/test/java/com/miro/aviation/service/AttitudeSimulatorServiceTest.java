package com.miro.aviation.service;

import com.miro.aviation.model.Attitude;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AttitudeSimulatorServiceTest {

    @Test
    void shouldInitializeWithReasonableValues() {
        AttitudeSimulatorService service = new AttitudeSimulatorService();
        Attitude initial = service.getCurrentAttitude();

        assertNotNull(initial);
        // Assuming pitch and roll start near zero for level flight
        assertTrue(Math.abs(initial.getPitch()) < 45);
    }

    @Test
    void shouldMaintainStabilityUntilTicked() {
        AttitudeSimulatorService service = new AttitudeSimulatorService();
        
        Attitude firstCall = service.getCurrentAttitude();
        Attitude secondCall = service.getCurrentAttitude();

        // Values should be identical because we haven't called tick()
        assertEquals(firstCall.getPitch(), secondCall.getPitch(), "State should not change without a tick");
        assertEquals(firstCall.getRoll(), secondCall.getRoll(), "State should not change without a tick");
    }

    @Test
    void shouldUpdateValuesWhenTicked() {
        AttitudeSimulatorService service = new AttitudeSimulatorService();
        Attitude initial = service.getCurrentAttitude();

        service.tick(); 
        Attitude afterTick = service.getCurrentAttitude();

        // Now values should be different
        assertNotEquals(initial.getPitch(), afterTick.getPitch(), "Pitch should evolve after a tick");
    }
}