package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Random;

@Component
@Scope("prototype") // Create new instance for each client
public class AirspeedSimulatorService {

    private final Random random = new Random();

    // Configurable limits
    private final double minSpeed = 40;  // stall / minimum speed in kt
    private final double maxSpeed = 180; // maximum speed in kt
    private double currentSpeed = 60;    // start near min speed

    public void tick(double deltaTime) {
        // simulate smooth changes scaled by deltaTime
        double change = ((random.nextDouble() - 0.5) * 5) * deltaTime; 
        currentSpeed += change;

        // Clamp to min/max
        if (currentSpeed < minSpeed) currentSpeed = minSpeed;
        if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;

        // Round to 1 decimal place
        currentSpeed = Math.round(currentSpeed * 10.0) / 10.0;
    }

    public AirSpeed getCurrentAirSpeed() {
        return new AirSpeed(currentSpeed);
    }
}
