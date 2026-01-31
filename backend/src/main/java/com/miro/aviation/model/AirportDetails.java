package com.miro.aviation.model;

import java.util.List;

/**
 * Comprehensive airport information including the airport itself, its runways, and associated navaids.
 */
public record AirportDetails(
    NavPoint airport,
    List<Runway> runways,
    List<NavPoint> associatedNavaids
) {}
