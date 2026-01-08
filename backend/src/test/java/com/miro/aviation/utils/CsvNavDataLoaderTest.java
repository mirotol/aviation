package com.miro.aviation.utils;

import com.miro.aviation.model.NavPoint;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvNavDataLoaderTest {

    @Test
    void testLoadAirports_ValidData() {
        String csv = "\"ident\",\"type\",\"latitude_deg\",\"longitude_deg\"\n" +
                "\"EFHK\",\"large_airport\",\"60.3183\",\"24.9633\"\n" +
                "\"EFNU\",\"small_airport\",\"60.3339\",\"24.2964\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> airports = CsvNavDataLoader.loadAirports(is);

        assertEquals(2, airports.size());
        assertEquals("EFHK", airports.get(0).getIdent());
        assertEquals("large_airport", airports.get(0).getType());
        assertEquals(60.3183, airports.get(0).getLatitude(), 0.0001);
        assertEquals(24.9633, airports.get(0).getLongitude(), 0.0001);
    }

    @Test
    void testLoadAirports_SkipNonAirports() {
        String csv = "\"ident\",\"type\",\"latitude_deg\",\"longitude_deg\"\n" +
                "\"TEST1\",\"heliport\",\"10.0\",\"20.0\"\n" + // CsvNavDataLoader skips if type doesn't contain "airport"
                "\"TEST2\",\"closed\",\"10.0\",\"20.0\"\n" +
                "\"TEST3\",\"small_airport\",\"10.0\",\"20.0\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> airports = CsvNavDataLoader.loadAirports(is);

        assertEquals(1, airports.size());
        assertEquals("TEST3", airports.get(0).getIdent());
    }

    @Test
    void testLoadAirports_MalformedRows() {
        String csv = "\"ident\",\"type\",\"latitude_deg\",\"longitude_deg\"\n" +
                "\"EFHK\",\"large_airport\",\"60.3183\",\"24.9633\"\n" +
                "\"BAD\",\"small_airport\",\"not_a_number\",\"24.2964\"\n" +
                "\"GOOD\",\"small_airport\",\"61.0\",\"25.0\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> airports = CsvNavDataLoader.loadAirports(is);

        assertEquals(2, airports.size());
        assertEquals("EFHK", airports.get(0).getIdent());
        assertEquals("GOOD", airports.get(1).getIdent());
    }

    @Test
    void testLoadAirports_InvalidCoordinates() {
        String csv = "\"ident\",\"type\",\"latitude_deg\",\"longitude_deg\"\n" +
                "\"EFHK\",\"large_airport\",\"95.3183\",\"24.9633\"\n" + // Invalid latitude
                "\"EFNU\",\"small_airport\",\"60.3339\",\"190.2964\"\n"; // Invalid longitude
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> airports = CsvNavDataLoader.loadAirports(is);

        assertTrue(airports.isEmpty());
    }

    @Test
    void testLoadAirports_CommaDecimalSeparator() {
        String csv = "\"ident\",\"type\",\"latitude_deg\",\"longitude_deg\"\n" +
                "\"EFHK\",\"large_airport\",\"60,3183\",\"24,9633\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> airports = CsvNavDataLoader.loadAirports(is);

        assertEquals(1, airports.size());
        assertEquals(60.3183, airports.get(0).getLatitude(), 0.0001);
        assertEquals(24.9633, airports.get(0).getLongitude(), 0.0001);
    }
}
