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
    void shouldUpdateValuesOnConsecutiveCalls() {
        AttitudeSimulatorService service = new AttitudeSimulatorService();

        // First call captures initial (or first random) state
        Attitude first = service.getCurrentAttitude();

        // Calling it again triggers the internal random update
        Attitude second = service.getCurrentAttitude();

        // The values should change because the service updates state on every get
        assertNotEquals(first.getPitch(), second.getPitch(), "Pitch should evolve on every call");
        assertNotEquals(first.getRoll(), second.getRoll(), "Roll should evolve on every call");
    }

}