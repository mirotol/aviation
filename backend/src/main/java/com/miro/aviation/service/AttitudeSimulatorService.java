package com.miro.aviation.service;

import com.miro.aviation.model.Attitude;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@Scope("prototype") // Create new instance for each client
public class AttitudeSimulatorService {

    private final Random random = new Random();

    // persistent state
    private double currentPitch = 0;
    private double currentRoll = 0;
    private double currentYaw = 0;

    public void tick() {

        double maxPitchChange = 0.5;
        double maxRollChange = 1.0;
        double maxYawChange = 0.2;

        currentPitch += (random.nextDouble() * 2 - 1) * maxPitchChange;
        currentRoll  += (random.nextDouble() * 2 - 1) * maxRollChange;
        currentYaw   += (random.nextDouble() * 2 - 1) * maxYawChange;

        currentPitch = Math.max(-10, Math.min(10, currentPitch));
        currentRoll  = Math.max(-30, Math.min(30, currentRoll));
        currentYaw   = Math.max(0, Math.min(360, currentYaw));
    }

    public Attitude getCurrentAttitude() {
        return new Attitude(currentPitch, currentRoll, currentYaw);
    }
}
