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

        // Tick should advance all simulator services once
        verify(attitudeSim, times(1)).tick();
        verify(altitudeSim, times(1)).tick();
        verify(speedSim, times(1)).tick();
    }
}
