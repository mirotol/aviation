package com.miro.aviation.service;

import com.miro.aviation.model.NavPoint;
import com.miro.aviation.utils.CsvNavDataLoader;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service responsible for loading and providing navigation data (airports, VORs, etc.).
 * <p>
 * The service loads data from a CSV resource at startup and allows querying for nearby
 * navigation points within a specified radius in nautical miles.
 * </p>
 */
@Service
public class NavDataService {

    private static final Logger logger = LoggerFactory.getLogger(NavDataService.class);

    /** List of all loaded airport navigation points */
    private final List<NavPoint> airports = new ArrayList<>();

    /**
     * Initializes the navigation data engine by loading airports from CSV.
     * <p>
     * This method is automatically called after Spring constructs the service
     * due to the {@link PostConstruct} annotation.
     * </p>
     */
    @PostConstruct
    public void init() {
        try {
            InputStream is = getClass().getResourceAsStream("/data/airports.csv");
            if (is == null) {
                throw new RuntimeException("airports.csv not found in resources");
            }

            List<NavPoint> loaded = CsvNavDataLoader.loadAirports(is);
            airports.addAll(loaded);

            logger.info("NavData Engine initialized with {} active airports.", airports.size());
        } catch (Exception e) {
            logger.error("Failed to initialize NavData Engine: {}", e.getMessage(), e);
        }
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
