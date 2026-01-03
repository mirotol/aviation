package com.miro.aviation.model;

/**
 * Metadata about the current position in a recorded flight.
 */
public record PlaybackProgress(
    int currentIndex,
    int totalSamples,
    double percentage,
    long startTime,
    long endTime
) {}
