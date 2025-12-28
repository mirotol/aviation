package com.miro.aviation.utils;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.service.FlightSnapshot;
import com.opencsv.CSVReaderHeaderAware;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CsvFlightLoader {

    private static final double DEFAULT_KOLLSMAN = 29.92;

    public static List<FlightSnapshot> load(InputStream is) {
        List<FlightSnapshot> snapshots = new ArrayList<>();

        try (CSVReaderHeaderAware reader =
                     new CSVReaderHeaderAware(new InputStreamReader(is))) {

            Map<String, String> row;
            while ((row = reader.readMap()) != null) {

                long timestampSeconds = Long.parseLong(row.get("Timestamp"));
                double altitudeFt = Double.parseDouble(row.get("Altitude"));
                double speedKt = Double.parseDouble(row.get("Speed"));
                double heading = Double.parseDouble(row.get("Direction"));

                // Attitude (limited data → simulate roll/pitch)
                Attitude attitude = new Attitude(
                        0.0,        // roll
                        0.0,        // pitch
                        heading     // yaw
                );

                Altitude altitude = new Altitude(
                        altitudeFt,
                        DEFAULT_KOLLSMAN
                );

                AirSpeed airSpeed = new AirSpeed(speedKt);

                FlightSnapshot snapshot = new FlightSnapshot();
                snapshot.setTimestamp(timestampSeconds * 1000); // convert to millis
                snapshot.setAttitude(attitude);
                snapshot.setAltitude(altitude);
                snapshot.setAirSpeed(airSpeed);

                snapshots.add(snapshot);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to load flight CSV", e);
        }

        return snapshots;
    }
}
