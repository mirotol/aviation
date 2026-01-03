package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.model.FlightSnapshot;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype") // // Create new instance for each client
public class SimulatedFlightDataProvider implements FlightDataProvider {

    private final AttitudeSimulatorService attitudeSim;
    private final AltitudeSimulatorService altitudeSim;
    private final AirspeedSimulatorService speedSim;

    public SimulatedFlightDataProvider(
            AttitudeSimulatorService attitudeSim,
            AltitudeSimulatorService altitudeSim,
            AirspeedSimulatorService speedSim) {
        this.attitudeSim = attitudeSim;
        this.altitudeSim = altitudeSim;
        this.speedSim = speedSim;
    }

    @Override
    public Attitude getAttitude() {
        return attitudeSim.getCurrentAttitude();
    }

    @Override
    public Altitude getAltitude() {
        return altitudeSim.getCurrentAltitude();
    }

    @Override
    public AirSpeed getSpeed() {
        return speedSim.getCurrentAirSpeed();
    }

    @Override
    public FlightSnapshot getCurrentSnapshot() {
        return new FlightSnapshot(
                System.currentTimeMillis(),
                getAttitude(),
                getAltitude(),
                getSpeed()
        );
    }

    @Override
    public void tick() {
        // Trigger the heartbeat for all internal simulators
        attitudeSim.tick();
        altitudeSim.tick();
        speedSim.tick();
    }
}
