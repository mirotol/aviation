package com.miro.aviation.utils;

import com.miro.aviation.model.NavPoint;
import com.opencsv.CSVReaderHeaderAware;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CsvNavDataLoader {

    public static List<NavPoint> loadAirports(InputStream is) {
        List<NavPoint> airports = new ArrayList<>();

        try (CSVReaderHeaderAware reader = new CSVReaderHeaderAware(new InputStreamReader(is))) {
            Map<String, String> row;
            while ((row = reader.readMap()) != null) {
                try {
                    String type = row.get("type");
                    // Aviation Engineering Filter: Focus on active airports
                    if (type != null && type.contains("airport") && !type.equals("closed")) {
                        String ident = row.get("ident");
                        double lat = Double.parseDouble(row.get("latitude_deg"));
                        double lon = Double.parseDouble(row.get("longitude_deg"));

                        airports.add(new NavPoint(ident, type, lat, lon));
                    }
                } catch (Exception e) {
                    // Skip malformed rows
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load navigation database", e);
        }

        return airports;
    }
}
