package com.miro.aviation.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // fallback for older browsers
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Add "/queue" to support private, user-specific messaging
        registry.enableSimpleBroker("/topic", "/queue"); 
        
        registry.setApplicationDestinationPrefixes("/app");
        
        // This tells Spring that any destination starting with /user is 
        // a "User Destination" and should be handled by the UserDestinationMessageHandler
        registry.setUserDestinationPrefix("/user");
    }
}
