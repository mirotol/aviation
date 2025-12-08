package com.miro.aviation.controller;

import com.miro.aviation.model.Altitude;
import com.miro.aviation.service.AltitudeSimulatorService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
public class AltitudeWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AltitudeSimulatorService simulator;

    public AltitudeWebSocketController(SimpMessagingTemplate messagingTemplate,
                                       AltitudeSimulatorService simulator) {
        this.messagingTemplate = messagingTemplate;
        this.simulator = simulator;
    }

    // Send update every 50ms (~20 Hz)
    @Scheduled(fixedRate = 50)
    public void sendAltitudeUpdate() {
        Altitude altitude = simulator.getCurrentAltitude();
        messagingTemplate.convertAndSend("/topic/altitude", altitude);
    }
}
