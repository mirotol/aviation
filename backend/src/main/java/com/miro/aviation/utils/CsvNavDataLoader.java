package com.miro.aviation.utils;

import com.miro.aviation.model.NavPoint;
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

                    airports.add(new NavPoint(ident, type, lat, lon));

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
}
