package com.miro.aviation.controller;

import com.miro.aviation.model.AirportDetails;
import com.miro.aviation.model.NavPoint;
import com.miro.aviation.model.Runway;
import com.miro.aviation.service.NavDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for accessing the Global Navigation Database (NavData).
 * Serves airports, runways, and navigation aids filtered by spatial proximity.
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
     * @return List of NavPoints (Airports)
     */
    @GetMapping("/nearby")
    public List<NavPoint> getNearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "200") double radius) {
        return navDataService.findNearby(lat, lon, radius);
    }

    /**
     * Search for navigation points by identifier or name.
     *
     * @param q The search query
     * @return List of matching NavPoints
     */
    @GetMapping("/search")
    public List<NavPoint> search(@RequestParam String q) {
        return navDataService.search(q);
    }

    /**
     * Gets complete airport details including runways and associated navaids.
     *
     * @param code Airport identifier (ICAO, IATA, or local code)
     * @return AirportDetails object with all related information
     */
    @GetMapping("/airport/{code}")
    public ResponseEntity<AirportDetails> getAirportDetails(@PathVariable String code) {
        AirportDetails details = navDataService.getAirportDetails(code);
        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(details);
    }

    /**
     * Gets runways for a specific airport.
     *
     * @param code Airport identifier
     * @return List of runways
     */
    @GetMapping("/airport/{code}/runways")
    public List<Runway> getRunways(@PathVariable String code) {
        return navDataService.getRunwaysForAirport(code);
    }

    /**
     * Finds navaids within a specific radius of a coordinate.
     *
     * @param lat Search center latitude
     * @param lon Search center longitude
     * @param radius Search radius in Nautical Miles (default 200)
     * @return List of NavPoints (VORs, NDBs, DMEs)
     */
    @GetMapping("/navaids/nearby")
    public List<NavPoint> getNearbyNavaids(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "200") double radius) {
        return navDataService.findNearbyNavaids(lat, lon, radius);
    }
}
