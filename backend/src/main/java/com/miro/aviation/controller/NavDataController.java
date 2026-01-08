package com.miro.aviation.controller;

import com.miro.aviation.model.NavPoint;
import com.miro.aviation.service.NavDataService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for accessing the Global Navigation Database (NavData).
 * Serves airports and navigation aids filtered by spatial proximity.
 */
@RestController
@RequestMapping("/api/nav")
@CrossOrigin(origins = "http://localhost:5173")
public class NavDataController {

    private final NavDataService navDataService;

    public NavDataController(NavDataService navDataService) {
        this.navDataService = navDataService;
    }

    /**
     * Finds navigation points within a specific radius of a coordinate.
     *
     * @param lat Search center latitude
     * @param lon Search center longitude
     * @param radius Search radius in Nautical Miles (default 200)
     * @return List of NavPoints (Airports, Waypoints, VORs)
     */
    @GetMapping("/nearby")
    public List<NavPoint> getNearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "200") double radius) {
        return navDataService.findNearby(lat, lon, radius);
    }
}
