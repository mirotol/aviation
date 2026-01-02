package com.miro.aviation.controller;

import com.miro.aviation.service.FlightSnapshot;
import com.miro.aviation.service.RecordedFlightDataProvider;
import com.miro.aviation.service.SimulatedFlightDataProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

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
        controller.switchProvider("recorded", header1);

        // Setup session 2 with Simulated
        SimpMessageHeaderAccessor header2 = SimpMessageHeaderAccessor.create();
        header2.setSessionId(session2);
        controller.switchProvider("simulated", header2);

        // Mock snapshots
        FlightSnapshot snap1 = mock(FlightSnapshot.class);
        FlightSnapshot snap2 = mock(FlightSnapshot.class);
        when(mockRecordedProvider.getCurrentSnapshot()).thenReturn(snap1);
        when(mockSimulatedProvider.getCurrentSnapshot()).thenReturn(snap2);

        // Run broadcast
        controller.broadcastFlightData();

        // Verify ticks occurred
        verify(mockRecordedProvider).tick();
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
        controller.switchProvider("simulated", header);

        // Create mock disconnect event
        SessionDisconnectEvent disconnectEvent = mock(SessionDisconnectEvent.class);
        when(disconnectEvent.getSessionId()).thenReturn(sessionId);

        controller.handleDisconnect(disconnectEvent);

        // Broadcast should no longer trigger ticks for this session
        controller.broadcastFlightData();
        verify(mockSimulatedProvider, never()).tick();
    }
}