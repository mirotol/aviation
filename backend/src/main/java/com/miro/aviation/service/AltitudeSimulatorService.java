package com.miro.aviation.service;

import com.miro.aviation.model.Altitude;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AltitudeSimulatorService {

    private final Random random = new Random();
    private final Altitude currentAltitude = new Altitude(0);

    public AltitudeSimulatorService() {
        // Initial altitude (feet)
        currentAltitude.setAltitude(25500.0);
    }

    /**
     * Simulates gentle altitude movement every time it is called.
     * Similar behavior to AttitudeSimulatorService.
     */
    public Altitude getCurrentAltitude() {
        double change = random.nextDouble() * 20 - 10; // -10 to +10 ft per update
        double newAltitude = currentAltitude.getAltitude() + change;

        // Clamp altitude for realism (0 to 40,000 ft)
        newAltitude = Math.max(0, Math.min(40000, newAltitude));

        currentAltitude.setAltitude(newAltitude);
        return currentAltitude;
    }
}
