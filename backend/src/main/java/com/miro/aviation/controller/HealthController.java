package com.miro.aviation.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/systems/health")
    public Map<String, Object> healthCheck() {
        return Map.of(
                "status", "GREEN",
                "message", "All flight systems operating within normal parameters.",
                "timestamp", Instant.now().toString()
        );
    }
}
