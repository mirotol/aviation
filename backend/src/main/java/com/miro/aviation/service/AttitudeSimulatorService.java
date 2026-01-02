package com.miro.aviation.service;

import com.miro.aviation.model.Attitude;
import org.springframework.stereotype.Service;

import java.util.Random;

public class AttitudeSimulatorService {

    private final Random random = new Random();

    // persistent state
    private double currentPitch = 0;
    private double currentRoll = 0;
    private double currentYaw = 0;

    public Attitude getCurrentAttitude() {
        // max rate of change per update
        double maxPitchChange = 0.5;  // degrees per call
        double maxRollChange = 1.0;   // degrees per call
        double maxYawChange = 0.2;    // optional, if we later animate yaw

        // small random change
        currentPitch += (random.nextDouble() * 2 - 1) * maxPitchChange;
        currentRoll  += (random.nextDouble() * 2 - 1) * maxRollChange;
        currentYaw   += (random.nextDouble() * 2 - 1) * maxYawChange;

        // clamp values for realism
        currentPitch = Math.max(-10, Math.min(10, currentPitch));
        currentRoll  = Math.max(-30, Math.min(30, currentRoll));
        currentYaw   = Math.max(0, Math.min(360, currentYaw));

        return new Attitude(currentPitch, currentRoll, currentYaw);
    }
}
