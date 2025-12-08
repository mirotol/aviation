package com.miro.aviation.service;

import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import org.springframework.stereotype.Service;

@Service
public class SimulatedFlightDataProvider implements FlightDataProvider {

    private final AttitudeSimulatorService attitudeSim;
    private final AltitudeSimulatorService altitudeSim;

    public SimulatedFlightDataProvider(AttitudeSimulatorService attitudeSim,
                                       AltitudeSimulatorService altitudeSim) {
        this.attitudeSim = attitudeSim;
        this.altitudeSim = altitudeSim;
    }

    @Override
    public Attitude getAttitude() {
        return attitudeSim.getCurrentAttitude();
    }

    @Override
    public Altitude getAltitude() {
        return altitudeSim.getCurrentAltitude();
    }
}
