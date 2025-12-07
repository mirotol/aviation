package com.miro.aviation.controller;

import com.miro.aviation.model.Attitude;
import com.miro.aviation.service.AttitudeSimulatorService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
public class AttitudeWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AttitudeSimulatorService simulator;

    public AttitudeWebSocketController(SimpMessagingTemplate messagingTemplate,
                                       AttitudeSimulatorService simulator) {
        this.messagingTemplate = messagingTemplate;
        this.simulator = simulator;
    }

    // Send update every 50ms (~20Hz)
    @Scheduled(fixedRate = 50)
    public void sendAttitudeUpdate() {
        Attitude attitude = simulator.getCurrentAttitude();
        messagingTemplate.convertAndSend("/topic/attitude", attitude);
    }
}
