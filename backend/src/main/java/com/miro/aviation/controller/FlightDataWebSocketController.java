package com.miro.aviation.controller;

import com.miro.aviation.service.FlightDataProvider;
import com.miro.aviation.service.FlightSnapshot;
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
        FlightSnapshot snapshot = activeProvider.getCurrentSnapshot();
        messagingTemplate.convertAndSend("/topic/flightData", snapshot);

        if (activeProvider instanceof RecordedFlightDataProvider) {
            activeProvider.tick();
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
