package com.miro.aviation.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flights")
public class RecordedFlightController {

    private final ResourcePatternResolver resourcePatternResolver;

    public RecordedFlightController(ResourcePatternResolver resourcePatternResolver) {
        this.resourcePatternResolver = resourcePatternResolver;
    }

    @GetMapping
    public List<String> listAvailableFlights() throws IOException {
        Resource[] resources = resourcePatternResolver.getResources("classpath:flights/*.csv");
        return Arrays.stream(resources)
                .map(Resource::getFilename)
                .collect(Collectors.toList());
    }
}
