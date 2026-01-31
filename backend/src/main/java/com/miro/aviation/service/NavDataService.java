package com.miro.aviation.service;

import com.miro.aviation.model.AirportDetails;
import com.miro.aviation.model.NavPoint;
import com.miro.aviation.model.Runway;
import com.miro.aviation.utils.CsvNavDataLoader;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service responsible for loading and providing navigation data (airports, VORs, etc.).
 * <p>
 * The service loads data from CSV resources at startup and provides efficient lookup
 * through various indexes.
 * </p>
 */
@Service
public class NavDataService {

    private static final Logger logger = LoggerFactory.getLogger(NavDataService.class);

    // Data lists
    private final List<NavPoint> airports = new ArrayList<>();
    private final List<NavPoint> navaids = new ArrayList<>();
    private final List<Runway> runways = new ArrayList<>();

    // Fast lookup indexes
    private final Map<Long, NavPoint> airportById = new HashMap<>();
    private final Map<String, NavPoint> airportByIdent = new HashMap<>();
    private final Map<String, NavPoint> airportByIcao = new HashMap<>();
    private final Map<String, NavPoint> airportByIata = new HashMap<>();
    private final Map<String, NavPoint> airportByGps = new HashMap<>();
    private final Map<Long, List<Runway>> runwaysByAirportRef = new HashMap<>();
    private final Map<String, List<NavPoint>> navaidsByAssociatedAirport = new HashMap<>();

    /**
     * Initializes the navigation data engine by loading all navigation data from CSVs.
     * <p>
     * This method is automatically called after Spring constructs the service
     * due to the {@link PostConstruct} annotation.
     * </p>
     */
    @PostConstruct
    public void init() {
        try {
            loadAirports();
            loadRunways();
            loadNavaids();

            logger.info(
                "NavData Engine initialized: airports={}, runways={}, navaids={}",
                airports.size(), runways.size(), navaids.size()
            );
        } catch (Exception e) {
            logger.error("Failed to initialize NavData Engine: {}", e.getMessage(), e);
        }
    }

    private void loadAirports() {
        InputStream is = getClass().getResourceAsStream("/data/airports.csv");
        if (is == null) {
            throw new RuntimeException("airports.csv not found in resources");
        }

        List<NavPoint> loaded = CsvNavDataLoader.loadAirports(is);
        airports.addAll(loaded);

        // Build indexes
        for (NavPoint airport : airports) {
            if (airport.getId() != null) {
                airportById.put(airport.getId(), airport);
            }
            if (airport.getIdentifier() != null) {
                airportByIdent.put(airport.getIdentifier().toUpperCase(), airport);
            }
            if (airport.getIcaoCode() != null && !airport.getIcaoCode().isEmpty()) {
                airportByIcao.put(airport.getIcaoCode().toUpperCase(), airport);
            }
            if (airport.getIataCode() != null && !airport.getIataCode().isEmpty()) {
                airportByIata.put(airport.getIataCode().toUpperCase(), airport);
            }
            if (airport.getGpsCode() != null && !airport.getGpsCode().isEmpty()) {
                airportByGps.put(airport.getGpsCode().toUpperCase(), airport);
            }
        }

        logger.info("Built airport indexes: {} by ID, {} by ident",
            airportById.size(), airportByIdent.size());
    }

    private void loadRunways() {
        InputStream is = getClass().getResourceAsStream("/data/runways.csv");
        if (is == null) {
            throw new RuntimeException("runways.csv not found in resources");
        }

        List<Runway> loaded = CsvNavDataLoader.loadRunways(is);
        runways.addAll(loaded);

        // Build runway index by airport_ref
        for (Runway runway : runways) {
            if (runway.getAirportRef() != null) {
                runwaysByAirportRef
                    .computeIfAbsent(runway.getAirportRef(), k -> new ArrayList<>())
                    .add(runway);
            }
        }

        logger.info("Built runway index: {} airports have runways", runwaysByAirportRef.size());
    }

    private void loadNavaids() {
        InputStream is = getClass().getResourceAsStream("/data/navaids.csv");
        if (is == null) {
            throw new RuntimeException("navaids.csv not found in resources");
        }

        List<NavPoint> loaded = CsvNavDataLoader.loadNavaids(is);
        navaids.addAll(loaded);

        // Build navaid index by associated_airport
        for (NavPoint navaid : navaids) {
            String assocAirport = navaid.getAssociatedAirport();
            if (assocAirport != null && !assocAirport.isEmpty()) {
                navaidsByAssociatedAirport
                    .computeIfAbsent(assocAirport.toUpperCase(), k -> new ArrayList<>())
                    .add(navaid);
            }
        }

        logger.info("Built navaid index: {} airports have associated navaids",
            navaidsByAssociatedAirport.size());
    }

    /**
     * Finds all navigation points (airports) within the specified radius of a given location.
     *
     * @param lat      Latitude of the reference point in decimal degrees
     * @param lon      Longitude of the reference point in decimal degrees
     * @param radiusNM Radius in nautical miles
     * @return List of {@link NavPoint} objects within the radius
     */
    public List<NavPoint> findNearby(double lat, double lon, double radiusNM) {
        return airports.stream()
                .filter(a -> calculateDistanceNM(lat, lon, a.getLatitude(), a.getLongitude()) <= radiusNM)
                .collect(Collectors.toList());
    }

    /**
     * Searches for navigation points by identifier or name.
     *
     * @param query The search string (e.g. "EFHK")
     * @return List of matching {@link NavPoint} objects
     */
    public List<NavPoint> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String upperQuery = query.toUpperCase();
        return airports.stream()
                .filter(a -> a.getIdentifier().toUpperCase().contains(upperQuery))
                .limit(20)
                .collect(Collectors.toList());
    }

    /**
     * Finds an airport by its identifier (tries ident, ICAO, IATA, GPS codes).
     *
     * @param code The airport code to search for
     * @return The airport NavPoint, or null if not found
     */
    public NavPoint findAirportByCode(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }
        String upperCode = code.toUpperCase();

        // Try all possible code types
        NavPoint airport = airportByIdent.get(upperCode);
        if (airport != null) return airport;

        airport = airportByIcao.get(upperCode);
        if (airport != null) return airport;

        airport = airportByIata.get(upperCode);
        if (airport != null) return airport;

        airport = airportByGps.get(upperCode);
        return airport;
    }

    /**
     * Gets complete airport details including runways and associated navaids.
     *
     * @param airportCode The airport identifier
     * @return AirportDetails object with all related information
     */
    public AirportDetails getAirportDetails(String airportCode) {
        NavPoint airport = findAirportByCode(airportCode);
        if (airport == null) {
            return null;
        }

        // Get runways for this airport
        List<Runway> airportRunways = runwaysByAirportRef.getOrDefault(airport.getId(), List.of());

        // Get associated navaids - try all possible codes
        List<NavPoint> associatedNavaids = new ArrayList<>();
        if (airport.getIdentifier() != null) {
            associatedNavaids.addAll(navaidsByAssociatedAirport
                .getOrDefault(airport.getIdentifier().toUpperCase(), List.of()));
        }
        if (airport.getIcaoCode() != null && !airport.getIcaoCode().isEmpty()) {
            associatedNavaids.addAll(navaidsByAssociatedAirport
                .getOrDefault(airport.getIcaoCode().toUpperCase(), List.of()));
        }

        // Remove duplicates if any
        associatedNavaids = associatedNavaids.stream().distinct().collect(Collectors.toList());

        return new AirportDetails(airport, airportRunways, associatedNavaids);
    }

    /**
     * Gets runways for a specific airport.
     *
     * @param airportCode The airport identifier
     * @return List of runways for the airport
     */
    public List<Runway> getRunwaysForAirport(String airportCode) {
        NavPoint airport = findAirportByCode(airportCode);
        if (airport == null || airport.getId() == null) {
            return List.of();
        }
        return runwaysByAirportRef.getOrDefault(airport.getId(), List.of());
    }

    /**
     * Gets all navaids.
     *
     * @return List of all navaids
     */
    public List<NavPoint> getAllNavaids() {
        return new ArrayList<>(navaids);
    }

    /**
     * Finds navaids within a specific radius.
     *
     * @param lat Latitude
     * @param lon Longitude
     * @param radiusNM Radius in nautical miles
     * @return List of navaids within the radius
     */
    public List<NavPoint> findNearbyNavaids(double lat, double lon, double radiusNM) {
        return navaids.stream()
                .filter(n -> calculateDistanceNM(lat, lon, n.getLatitude(), n.getLongitude()) <= radiusNM)
                .collect(Collectors.toList());
    }

    /**
     * Calculates the distance between two geographic coordinates using the Haversine formula.
     *
     * @param lat1 Latitude of first point in decimal degrees
     * @param lon1 Longitude of first point in decimal degrees
     * @param lat2 Latitude of second point in decimal degrees
     * @param lon2 Longitude of second point in decimal degrees
     * @return Distance between the two points in nautical miles
     */
    private double calculateDistanceNM(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return 3440.065 * c; // Convert radians to nautical miles
    }
}
