package com.miro.aviation.service;

import com.miro.aviation.model.Altitude;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import java.util.Random;

@Component
@Scope("prototype") // Create new instance for each client
public class AltitudeSimulatorService {

    private final Random random = new Random();
    private final Altitude currentAltitude = new Altitude(0, 29.92); // standard pressure

    public AltitudeSimulatorService() {
        // Initial altitude (feet)
        currentAltitude.setAltitude(25500.0);
        currentAltitude.setKollsmanPressure(29.92); // default sea-level
    }

    /**
     * Simulates gentle altitude movement
     */
    public void tick(double deltaTime) {
        double change = (random.nextDouble() * 20 - 10) * deltaTime; // Scaled by deltaTime
        double newAltitude = currentAltitude.getAltitude() + change;

        // Clamp altitude for realism (0 to 40,000 ft)
        newAltitude = Math.max(0, Math.min(40000, newAltitude));

        currentAltitude.setAltitude(newAltitude);
    }

    public Altitude getCurrentAltitude() {
        // Return a copy to ensure snapshot integrity
        return new Altitude(currentAltitude.getAltitude(), currentAltitude.getKollsmanPressure());
    }

    /** Allows external control of Kollsman (e.g., from frontend knob) */
    public void setKollsmanPressure(double kollsmanPressure) {
        currentAltitude.setKollsmanPressure(kollsmanPressure);
    }
}