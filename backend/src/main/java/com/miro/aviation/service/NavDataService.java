package com.miro.aviation.service;

import com.miro.aviation.model.NavPoint;
import com.miro.aviation.utils.CsvNavDataLoader;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NavDataService {

    private final List<NavPoint> airports = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            InputStream is = getClass().getResourceAsStream("/data/airports.csv");
            if (is == null) {
                throw new RuntimeException("airports.csv not found in resources");
            }
            List<NavPoint> loaded = CsvNavDataLoader.loadAirports(is);
            airports.addAll(loaded);
            System.out.println("NavData Engine initialized with " + airports.size() + " active airports.");
        } catch (Exception e) {
            System.err.println("Failed to initialize NavData Engine: " + e.getMessage());
        }
    }

    public List<NavPoint> findNearby(double lat, double lon, double radiusNM) {
        return airports.stream()
                .filter(a -> calculateDistanceNM(lat, lon, a.getLatitude(), a.getLongitude()) <= radiusNM)
                .collect(Collectors.toList());
    }

    /**
     * Haversine formula for professional-grade coordinate distance calculation (NM)
     */
    private double calculateDistanceNM(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 3440.065 * c; // Mean Earth radius in nautical miles
    }
}
