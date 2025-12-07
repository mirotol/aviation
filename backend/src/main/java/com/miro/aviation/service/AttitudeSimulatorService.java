package com.miro.aviation.service;

import com.miro.aviation.model.Attitude;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AttitudeSimulatorService {

    private final Random random = new Random();

    public Attitude getCurrentAttitude() {
        // simulate pitch ±10 degrees, roll ±30 degrees
        double pitch = -10 + 20 * random.nextDouble();
        double roll = -30 + 60 * random.nextDouble();
        double yaw = 0; // keep yaw fixed for now
        return new Attitude(pitch, roll, yaw);
    }
}
