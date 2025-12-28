package com.miro.aviation.controller;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.service.FlightDataProvider;
import com.miro.aviation.service.RecordedFlightDataProvider;
import com.miro.aviation.service.SimulatedFlightDataProvider;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
public class FlightDataWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final SimulatedFlightDataProvider simulatedProvider;
    private final RecordedFlightDataProvider recordedProvider;

    // Start with simulated by default
    private FlightDataProvider activeProvider;

    public FlightDataWebSocketController(SimpMessagingTemplate messagingTemplate,
                                         SimulatedFlightDataProvider simulatedProvider,
                                         RecordedFlightDataProvider recordedProvider) {
        this.messagingTemplate = messagingTemplate;
        this.simulatedProvider = simulatedProvider;
        this.recordedProvider = recordedProvider;
        this.activeProvider = simulatedProvider;
    }

    // Broadcast every 50ms (~20Hz)
    @Scheduled(fixedRate = 50)
    public void broadcastFlightData() {
        Attitude attitude = activeProvider.getAttitude();
        Altitude altitude = activeProvider.getAltitude();
        AirSpeed airSpeed = activeProvider.getSpeed();

        // Converts Java classes into JSON using Jackson
        messagingTemplate.convertAndSend("/topic/attitude", attitude);
        messagingTemplate.convertAndSend("/topic/altitude", altitude);
        messagingTemplate.convertAndSend("/topic/airspeed", airSpeed);

        // advance recorded flight if active
        if (activeProvider instanceof RecordedFlightDataProvider) {
            ((RecordedFlightDataProvider) activeProvider).next();
        }
    }

    // Endpoint for frontend to switch provider
    @MessageMapping("/switchProvider")
    public void switchProvider(String providerName) {
        System.out.println("Switching provider to: " + providerName);
        if ("simulated".equalsIgnoreCase(providerName)) {
            activeProvider = simulatedProvider;
        } else if ("recorded".equalsIgnoreCase(providerName)) {
            activeProvider = recordedProvider;
            recordedProvider.reset(); // start from beginning
        }
    }
}
