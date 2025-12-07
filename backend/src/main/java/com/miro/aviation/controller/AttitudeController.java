package com.miro.aviation.controller;

import com.miro.aviation.model.Attitude;
import com.miro.aviation.service.AttitudeSimulatorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AttitudeController {

    private final AttitudeSimulatorService simulator;

    public AttitudeController(AttitudeSimulatorService simulator) {
        this.simulator = simulator;
    }

    @GetMapping("/systems/attitude")
    public Attitude getAttitude() {
        return simulator.getCurrentAttitude();
    }
}
