package com.miro.aviation.utils;

import com.miro.aviation.model.FlightSnapshot;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvFlightLoaderTest {

    @Test
    void shouldLoadValidCsvData() {
        InputStream is = getClass().getResourceAsStream("/flights/test_flight.csv");
        assertNotNull(is, "test_flight.csv not found in resources");

        List<FlightSnapshot> result = CsvFlightLoader.load(is);

        assertEquals(3, result.size(), "Should load 3 rows from test_flight.csv");

        // Verify First Row (Timestamp 1, Position "60.3172, 24.9633")
        FlightSnapshot first = result.get(0);
        assertEquals(1000L, first.getTimestamp());
        assertEquals(1000.0, first.getAltitude().getAltitude());
        assertEquals(100.0, first.getAirSpeed().getSpeed());

        assertNotNull(first.getPosition());
        assertEquals(60.3172, first.getPosition().getLatitude());
        assertEquals(24.9633, first.getPosition().getLongitude());

        // Verify Second Row (Timestamp 2, Direction 90)
        FlightSnapshot second = result.get(1);
        assertEquals(2000L, second.getTimestamp());
        assertEquals(90.0, second.getAttitude().getYaw(), "Direction should be mapped to Yaw");
    }

    @Test
    void shouldThrowExceptionOnInvalidInput() {
        InputStream is = getClass().getResourceAsStream("/flights/invalid_test_flight.csv");
        assertNotNull(is, "invalid_test_flight.csv not found in resources");

        // The loader should throw a RuntimeException when it can't find required headers like 'Timestamp'
        assertThrows(RuntimeException.class, () -> CsvFlightLoader.load(is));
    }
}
