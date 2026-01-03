package com.miro.aviation.controller;

import com.miro.aviation.model.FlightSnapshot;
import com.miro.aviation.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(FlightDataWebSocketController.class);

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
    public void switchProvider(Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String providerType = payload.get("type");
        String fileName = payload.get("fileName");

        logger.info("Switching provider for session: {} to {} {}", 
                sessionId, providerType, (fileName != null ? "file: " + fileName : ""));

        if ("recorded".equalsIgnoreCase(providerType)) {
            RecordedFlightDataProvider provider = recordedProviderFactory.getObject();
            String resourcePath = "/flights/" + (fileName != null ? fileName : "AY523_2025_12_28.csv");
            provider.initialize(resourcePath);
            userProviders.put(sessionId, provider);
        } else {
            userProviders.put(sessionId, simulatedProviderFactory.getObject());
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        logger.info("Removing session: {}", sessionId);
        userProviders.remove(sessionId);
    }

    private MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}
