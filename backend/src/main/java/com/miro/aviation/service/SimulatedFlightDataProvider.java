package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype") // Every client gets their own provider
public class SimulatedFlightDataProvider implements FlightDataProvider {

    private final AttitudeSimulatorService attitudeSim;
    private final AltitudeSimulatorService altitudeSim;
    private final AirspeedSimulatorService speedSim;

    public SimulatedFlightDataProvider() {
        // Instantiate the simulators so they are unique to this provider instance
        this.attitudeSim = new AttitudeSimulatorService();
        this.altitudeSim = new AltitudeSimulatorService();
        this.speedSim = new AirspeedSimulatorService();
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
        FlightDataProvider.super.tick();
    }


}
