package com.miro.aviation.utils;

import com.miro.aviation.model.NavPoint;
import com.miro.aviation.model.Runway;
import com.opencsv.CSVReaderHeaderAware;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CsvNavDataLoader {

    private static final Logger logger = LoggerFactory.getLogger(CsvNavDataLoader.class);

    public static List<NavPoint> loadAirports(InputStream is) {
        List<NavPoint> airports = new ArrayList<>();

        try (CSVReaderHeaderAware reader = new CSVReaderHeaderAware(new InputStreamReader(is))) {
            Map<String, String> row;
            int rowNum = 0;

            while ((row = reader.readMap()) != null) {
                rowNum++;
                try {
                    String type = row.get("type");
                    if (type == null || !type.contains("airport") || type.equals("closed")) {
                        continue; // skip non-airports or closed airports
                    }

                    String ident = row.get("ident");
                    String latStr = row.get("latitude_deg");
                    String lonStr = row.get("longitude_deg");

                    if (latStr == null || lonStr == null) continue;

                    // Normalize decimal separators (comma → dot)
                    latStr = latStr.replace(',', '.').trim();
                    lonStr = lonStr.replace(',', '.').trim();

                    double lat = Double.parseDouble(latStr);
                    double lon = Double.parseDouble(lonStr);

                    // Sanity check
                    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                        logger.warn("Skipping invalid coordinates at row {}: {},{}", rowNum, latStr, lonStr);
                        continue;
                    }

                    logger.debug("Loaded airport {} at coordinates: {},{}", ident, lat, lon);

                    NavPoint airport = new NavPoint(ident, type, lat, lon);

                    // Set additional fields
                    airport.setId(parseLong(row.get("id")));
                    airport.setName(row.get("name"));
                    airport.setElevation(parseInteger(row.get("elevation_ft")));
                    airport.setIcaoCode(row.get("icao_code"));
                    airport.setIataCode(row.get("iata_code"));
                    airport.setGpsCode(row.get("gps_code"));
                    airport.setLocalCode(row.get("local_code"));

                    airports.add(airport);

                } catch (Exception e) {
                    logger.warn("Skipping malformed row {}: {}", rowNum, e.getMessage());
                }
            }

            logger.info("Loaded {} airports successfully.", airports.size());
        } catch (Exception e) {
            logger.error("Failed to load navigation database", e);
            throw new RuntimeException("Failed to load navigation database", e);
        }

        return airports;
    }

    public static List<Runway> loadRunways(InputStream is) {
        List<Runway> runways = new ArrayList<>();

        try (CSVReaderHeaderAware reader = new CSVReaderHeaderAware(new InputStreamReader(is))) {
            Map<String, String> row;
            int rowNum = 0;

            while ((row = reader.readMap()) != null) {
                rowNum++;
                try {
                    Runway runway = new Runway();

                    runway.setId(parseLong(row.get("id")));
                    runway.setAirportRef(parseLong(row.get("airport_ref")));
                    runway.setAirportIdent(row.get("airport_ident"));
                    runway.setLengthFt(parseInteger(row.get("length_ft")));
                    runway.setWidthFt(parseInteger(row.get("width_ft")));
                    runway.setSurface(row.get("surface"));
                    runway.setLighted(parseBoolean(row.get("lighted")));
                    runway.setClosed(parseBoolean(row.get("closed")));

                    // Low End (LE) data
                    runway.setLeIdent(row.get("le_ident"));
                    runway.setLeLatitude(parseDouble(row.get("le_latitude_deg")));
                    runway.setLeLongitude(parseDouble(row.get("le_longitude_deg")));
                    runway.setLeElevationFt(parseInteger(row.get("le_elevation_ft")));
                    runway.setLeHeadingDegT(parseDouble(row.get("le_heading_degT")));
                    runway.setLeDisplacedThresholdFt(parseInteger(row.get("le_displaced_threshold_ft")));

                    // High End (HE) data
                    runway.setHeIdent(row.get("he_ident"));
                    runway.setHeLatitude(parseDouble(row.get("he_latitude_deg")));
                    runway.setHeLongitude(parseDouble(row.get("he_longitude_deg")));
                    runway.setHeElevationFt(parseInteger(row.get("he_elevation_ft")));
                    runway.setHeHeadingDegT(parseDouble(row.get("he_heading_degT")));
                    runway.setHeDisplacedThresholdFt(parseInteger(row.get("he_displaced_threshold_ft")));

                    runways.add(runway);

                } catch (Exception e) {
                    logger.warn("Skipping malformed runway row {}: {}", rowNum, e.getMessage());
                }
            }

            logger.info("Loaded {} runways successfully.", runways.size());
        } catch (Exception e) {
            logger.error("Failed to load runways database", e);
            throw new RuntimeException("Failed to load runways database", e);
        }

        return runways;
    }

    public static List<NavPoint> loadNavaids(InputStream is) {
        List<NavPoint> navaids = new ArrayList<>();

        try (CSVReaderHeaderAware reader = new CSVReaderHeaderAware(new InputStreamReader(is))) {
            Map<String, String> row;
            int rowNum = 0;

            while ((row = reader.readMap()) != null) {
                rowNum++;
                try {
                    String ident = row.get("ident");
                    String type = row.get("type"); // VOR, NDB, DME, etc.
                    String latStr = row.get("latitude_deg");
                    String lonStr = row.get("longitude_deg");

                    if (latStr == null || lonStr == null || latStr.isEmpty() || lonStr.isEmpty()) {
                        continue;
                    }

                    // Normalize decimal separators
                    latStr = latStr.replace(',', '.').trim();
                    lonStr = lonStr.replace(',', '.').trim();

                    double lat = Double.parseDouble(latStr);
                    double lon = Double.parseDouble(lonStr);

                    // Sanity check
                    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                        logger.warn("Skipping invalid navaid coordinates at row {}: {},{}", rowNum, latStr, lonStr);
                        continue;
                    }

                    NavPoint navaid = new NavPoint(ident, type, lat, lon);

                    navaid.setId(parseLong(row.get("id")));
                    navaid.setName(row.get("name"));
                    navaid.setElevation(parseInteger(row.get("elevation_ft")));
                    navaid.setFrequencyKhz(parseInteger(row.get("frequency_khz")));
                    navaid.setAssociatedAirport(row.get("associated_airport"));

                    navaids.add(navaid);

                } catch (Exception e) {
                    logger.warn("Skipping malformed navaid row {}: {}", rowNum, e.getMessage());
                }
            }

            logger.info("Loaded {} navaids successfully.", navaids.size());
        } catch (Exception e) {
            logger.error("Failed to load navaids database", e);
            throw new RuntimeException("Failed to load navaids database", e);
        }

        return navaids;
    }

    // Helper parsing methods
    private static Long parseLong(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer parseInteger(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Double.parseDouble(value.replace(',', '.').trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Boolean parseBoolean(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        String v = value.trim();
        return v.equals("1") || v.equalsIgnoreCase("true") || v.equalsIgnoreCase("yes");
    }
}
