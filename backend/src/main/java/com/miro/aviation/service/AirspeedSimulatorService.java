package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AirspeedSimulatorService {

    private final Random random = new Random();

    // Configurable limits
    private final double minSpeed = 40;  // stall / minimum speed in kt
    private final double maxSpeed = 180; // maximum speed in kt
    private double currentSpeed = 60;    // start near min speed

    public AirSpeed getCurrentAirSpeed() {
        // simulate smooth changes
        double change = (random.nextDouble() - 0.5) * 5; // small random change ±2.5 kt
        currentSpeed += change;

        // Clamp to min/max
        if (currentSpeed < minSpeed) currentSpeed = minSpeed;
        if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;

        return new AirSpeed(currentSpeed);
    }
}
