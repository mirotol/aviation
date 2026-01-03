package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.model.FlightSnapshot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class SimulatedFlightDataProviderTest {

    private SimulatedFlightDataProvider provider;
    private AttitudeSimulatorService attitudeSim;
    private AltitudeSimulatorService altitudeSim;
    private AirspeedSimulatorService speedSim;

    @BeforeEach
    void setUp() {
        attitudeSim = mock(AttitudeSimulatorService.class);
        altitudeSim = mock(AltitudeSimulatorService.class);
        speedSim = mock(AirspeedSimulatorService.class);
        
        provider = new SimulatedFlightDataProvider(attitudeSim, altitudeSim, speedSim);
    }

    @Test
    void shouldReturnSnapshotWithDataFromSimulators() {
        Attitude expectedAttitude = new Attitude(1.0, 2.0, 3.0);
        Altitude expectedAltitude = new Altitude(10000.0, 29.92);
        AirSpeed expectedSpeed = new AirSpeed(150.0);

        when(attitudeSim.getCurrentAttitude()).thenReturn(expectedAttitude);
        when(altitudeSim.getCurrentAltitude()).thenReturn(expectedAltitude);
        when(speedSim.getCurrentAirSpeed()).thenReturn(expectedSpeed);

        FlightSnapshot snapshot = provider.getCurrentSnapshot();

        assertEquals(expectedAttitude, snapshot.getAttitude());
        assertEquals(expectedAltitude, snapshot.getAltitude());
        assertEquals(expectedSpeed, snapshot.getAirSpeed());
        assertTrue(snapshot.getTimestamp() > 0);
        
        verify(attitudeSim).getCurrentAttitude();
        verify(altitudeSim).getCurrentAltitude();
        verify(speedSim).getCurrentAirSpeed();
    }

    @Test
    void tickShouldAdvanceAllSubSimulators() {
        provider.tick();

        // Tick should advance all simulator services once with default multiplier 1.0
        verify(attitudeSim, times(1)).tick(1.0);
        verify(altitudeSim, times(1)).tick(1.0);
        verify(speedSim, times(1)).tick(1.0);
    }

    @Test
    void tickShouldRespectPause() {
        provider.setPaused(true);
        provider.tick();

        // Sub-simulators should NOT be ticked when paused
        verify(attitudeSim, never()).tick(anyDouble());
        verify(altitudeSim, never()).tick(anyDouble());
        verify(speedSim, never()).tick(anyDouble());
    }

    @Test
    void tickShouldRespectSpeedMultiplier() {
        double customSpeed = 4.0;
        provider.setSpeedMultiplier(customSpeed);
        provider.tick();

        // Tick should pass the multiplier as deltaTime
        verify(attitudeSim).tick(customSpeed);
        verify(altitudeSim).tick(customSpeed);
        verify(speedSim).tick(customSpeed);
    }

    @Test
    void timestampShouldStopAdvancingWhenPaused() {
        FlightSnapshot snap1 = provider.getCurrentSnapshot();
        
        provider.setPaused(true);
        provider.tick();
        
        FlightSnapshot snap2 = provider.getCurrentSnapshot();
        
        assertEquals(snap1.getTimestamp(), snap2.getTimestamp(), "Timestamp should not advance while paused");
    }
}
