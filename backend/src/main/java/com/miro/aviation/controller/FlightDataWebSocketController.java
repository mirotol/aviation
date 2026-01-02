package com.miro.aviation.controller;

import com.miro.aviation.service.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class FlightDataWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectProvider<SimulatedFlightDataProvider> simulatedProviderFactory;
    private final ObjectProvider<RecordedFlightDataProvider> recordedProviderFactory;

    private final Map<String, FlightDataProvider> userProviders = new ConcurrentHashMap<>();

    public FlightDataWebSocketController(SimpMessagingTemplate messagingTemplate,
                                         ObjectProvider<SimulatedFlightDataProvider> simulatedProviderFactory,
                                         ObjectProvider<RecordedFlightDataProvider> recordedProviderFactory) {
        this.messagingTemplate = messagingTemplate;
        this.simulatedProviderFactory = simulatedProviderFactory;
        this.recordedProviderFactory = recordedProviderFactory;
    }

    @Scheduled(fixedRate = 50)
    public void broadcastFlightData() {
        userProviders.forEach((sessionId, provider) -> {
            // 1. Advance the simulation/data state
            provider.tick();

            // 2. Get the data resulting from that tick
            FlightSnapshot snapshot = provider.getCurrentSnapshot();
            if (snapshot != null) {
                messagingTemplate.convertAndSendToUser(sessionId, "/queue/flightData", snapshot, createHeaders(sessionId));
            }
        });
    }

    @MessageMapping("/switchProvider")
    public void switchProvider(String providerName, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        System.out.println("Switching provider for session: " + sessionId); // LOG THIS
        
        if ("recorded".equalsIgnoreCase(providerName)) {
            userProviders.put(sessionId, recordedProviderFactory.getObject());
        } else {
            userProviders.put(sessionId, simulatedProviderFactory.getObject());
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        System.out.println("Removing session: " + sessionId); // LOG THIS
        userProviders.remove(sessionId);
    }

    private MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}
