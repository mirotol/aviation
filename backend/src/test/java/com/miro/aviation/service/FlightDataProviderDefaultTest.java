package com.miro.aviation.service;

import com.miro.aviation.model.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlightDataProviderDefaultTest {

    private final FlightDataProvider provider = new FlightDataProvider() {
        @Override
        public Attitude getAttitude() { return null; }
        @Override
        public Altitude getAltitude() { return null; }
        @Override
        public AirSpeed getSpeed() { return null; }
        @Override
        public Position getPosition() { return null; }
        @Override
        public FlightSnapshot getCurrentSnapshot() { return null; }
    };

    @Test
    void testDefaultMethods() {
        assertEquals(List.of(), provider.getFlightPlan());
        assertDoesNotThrow(() -> provider.updateFlightPlan(List.of()));
        assertEquals(0, provider.getActiveWaypointIndex());
        assertDoesNotThrow(provider::tick);
        assertDoesNotThrow(() -> provider.setPaused(true));
        assertDoesNotThrow(() -> provider.setSpeedMultiplier(1.0));
        assertNull(provider.getProgress());
        assertDoesNotThrow(() -> provider.setSeek(0.5));
    }
}
