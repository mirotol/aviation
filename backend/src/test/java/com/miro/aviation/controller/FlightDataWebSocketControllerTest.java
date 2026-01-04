package com.miro.aviation.controller;

import com.miro.aviation.model.FlightSnapshot;
import com.miro.aviation.service.RecordedFlightDataProvider;
import com.miro.aviation.service.SimulatedFlightDataProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class FlightDataWebSocketControllerTest {

    private FlightDataWebSocketController controller;
    private SimpMessagingTemplate messagingTemplate;
    private ObjectProvider<SimulatedFlightDataProvider> simulatedProviderFactory;
    private ObjectProvider<RecordedFlightDataProvider> recordedProviderFactory;

    private SimulatedFlightDataProvider mockSimulatedProvider;
    private RecordedFlightDataProvider mockRecordedProvider;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        // Use Mockito.mock() or the static mock() if the import is resolved
        messagingTemplate = mock(SimpMessagingTemplate.class);
        simulatedProviderFactory = mock(ObjectProvider.class);
        recordedProviderFactory = mock(ObjectProvider.class);

        mockSimulatedProvider = mock(SimulatedFlightDataProvider.class);
        mockRecordedProvider = mock(RecordedFlightDataProvider.class);

        when(simulatedProviderFactory.getObject()).thenReturn(mockSimulatedProvider);
        when(recordedProviderFactory.getObject()).thenReturn(mockRecordedProvider);

        controller = new FlightDataWebSocketController(
                messagingTemplate,
                simulatedProviderFactory,
                recordedProviderFactory
        );
    }

    @Test
    void shouldAssignAndBroadcastDataForMultipleClients() {
        String session1 = "session-1";
        String session2 = "session-2";

        // Setup session 1 with Recorded
        SimpMessageHeaderAccessor header1 = SimpMessageHeaderAccessor.create();
        header1.setSessionId(session1);
        controller.switchProvider(Map.of("type", "recorded", "fileName", "test.csv"), header1);

        // Setup session 2 with Simulated
        SimpMessageHeaderAccessor header2 = SimpMessageHeaderAccessor.create();
        header2.setSessionId(session2);
        controller.switchProvider(Map.of("type", "simulated"), header2);

        // Mock snapshots
        FlightSnapshot snap1 = mock(FlightSnapshot.class);
        FlightSnapshot snap2 = mock(FlightSnapshot.class);
        when(mockRecordedProvider.getCurrentSnapshot()).thenReturn(snap1);
        when(mockSimulatedProvider.getCurrentSnapshot()).thenReturn(snap2);

        // Run broadcast
        controller.broadcastFlightData();

        // Verify ticks occurred
        verify(mockRecordedProvider).tick();
        verify(mockRecordedProvider).initialize("/flights/test.csv");
        verify(mockSimulatedProvider).tick();

        // Verify messages sent to specific sessions
        ArgumentCaptor<MessageHeaders> headersCaptor = ArgumentCaptor.forClass(MessageHeaders.class);

        verify(messagingTemplate).convertAndSendToUser(
                eq(session1), eq("/queue/flightData"), eq(snap1), headersCaptor.capture());
        assertEquals(session1, SimpMessageHeaderAccessor.getSessionId(headersCaptor.getValue()));

        verify(messagingTemplate).convertAndSendToUser(
                eq(session2), eq("/queue/flightData"), eq(snap2), headersCaptor.capture());
        assertEquals(session2, SimpMessageHeaderAccessor.getSessionId(headersCaptor.getValue()));
    }

    @Test
    void shouldRemoveProviderOnDisconnect() {
        String sessionId = "disconnect-me";
        SimpMessageHeaderAccessor header = SimpMessageHeaderAccessor.create();
        header.setSessionId(sessionId);
        controller.switchProvider(Map.of("type", "simulated"), header);

        // Create mock disconnect event
        SessionDisconnectEvent disconnectEvent = mock(SessionDisconnectEvent.class);
        when(disconnectEvent.getSessionId()).thenReturn(sessionId);

        controller.handleDisconnect(disconnectEvent);

        // Broadcast should no longer trigger ticks for this session
        controller.broadcastFlightData();
        verify(mockSimulatedProvider, never()).tick();
    }

    @Test
    void shouldMaintainIsolatedStateBetweenSessions() {
        String sessionA = "user-a";
        String sessionB = "user-b";

        // Create two distinct mock providers
        SimulatedFlightDataProvider providerA = mock(SimulatedFlightDataProvider.class);
        SimulatedFlightDataProvider providerB = mock(SimulatedFlightDataProvider.class);

        // Configure factory to return providerA then providerB
        when(simulatedProviderFactory.getObject())
                .thenReturn(providerA)
                .thenReturn(providerB);

        // Connect user A
        SimpMessageHeaderAccessor headerA = SimpMessageHeaderAccessor.create();
        headerA.setSessionId(sessionA);
        controller.switchProvider(Map.of("type", "simulated"), headerA);

        // Connect user B
        SimpMessageHeaderAccessor headerB = SimpMessageHeaderAccessor.create();
        headerB.setSessionId(sessionB);
        controller.switchProvider(Map.of("type", "simulated"), headerB);

        // Action: Pause ONLY user A
        controller.setPaused(Map.of("paused", true), headerA);

        // Verification
        verify(providerA).setPaused(true);
        verify(providerB, never()).setPaused(anyBoolean());

        // Action: Change speed ONLY for user B
        controller.setSpeed(Map.of("speed", 2.0), headerB);

        // Verification
        verify(providerB).setSpeedMultiplier(2.0);
        verify(providerA, never()).setSpeedMultiplier(anyDouble());
    }

    @Test
    void shouldApplyInitialStateWhenSwitchingProvider() {
        String sessionId = "user-1";
        SimulatedFlightDataProvider newProvider = mock(SimulatedFlightDataProvider.class);
        when(simulatedProviderFactory.getObject()).thenReturn(newProvider);

        SimpMessageHeaderAccessor header = SimpMessageHeaderAccessor.create();
        header.setSessionId(sessionId);

        // Switch to a provider while already specifying speed and pause state
        controller.switchProvider(Map.of(
                "type", "simulated",
                "paused", true,
                "speed", 4.0
        ), header);

        // Verify that the new provider was immediately configured with the passed state
        verify(newProvider).setPaused(true);
        verify(newProvider).setSpeedMultiplier(4.0);
    }

    @Test
    void shouldInvokeSeekOnProvider() {
        String sessionId = "user-seek";
        SimpMessageHeaderAccessor header = SimpMessageHeaderAccessor.create();
        header.setSessionId(sessionId);
        
        // We need a provider in the map first
        controller.switchProvider(Map.of("type", "recorded"), header);
        
        // Action: Seek to 75%
        controller.seek(Map.of("percentage", 0.75), header);
        
        // Verification
        verify(mockRecordedProvider).setSeek(0.75);
    }
}