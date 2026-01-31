package com.miro.aviation.utils;

import com.miro.aviation.model.NavPoint;
import com.miro.aviation.model.Runway;
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
        assertEquals("EFHK", airports.get(0).getIdentifier());
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
        assertEquals("TEST3", airports.get(0).getIdentifier());
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
        assertEquals("EFHK", airports.get(0).getIdentifier());
        assertEquals("GOOD", airports.get(1).getIdentifier());
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

    @Test
    void testLoadAirports_WithExtendedFields() {
        String csv = "\"id\",\"ident\",\"type\",\"name\",\"latitude_deg\",\"longitude_deg\",\"elevation_ft\",\"icao_code\",\"iata_code\",\"gps_code\",\"local_code\"\n" +
                "\"12345\",\"EFHK\",\"large_airport\",\"Helsinki Vantaa Airport\",\"60.3183\",\"24.9633\",\"179\",\"EFHK\",\"HEL\",\"EFHK\",\"\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> airports = CsvNavDataLoader.loadAirports(is);

        assertEquals(1, airports.size());
        NavPoint airport = airports.get(0);
        assertEquals(12345L, airport.getId());
        assertEquals("EFHK", airport.getIdentifier());
        assertEquals("Helsinki Vantaa Airport", airport.getName());
        assertEquals(179, airport.getElevation());
        assertEquals("EFHK", airport.getIcaoCode());
        assertEquals("HEL", airport.getIataCode());
        assertEquals("EFHK", airport.getGpsCode());
    }

    @Test
    void testLoadRunways_ValidData() {
        String csv = "\"id\",\"airport_ref\",\"airport_ident\",\"length_ft\",\"width_ft\",\"surface\",\"lighted\",\"closed\",\"le_ident\",\"le_latitude_deg\",\"le_longitude_deg\",\"le_elevation_ft\",\"le_heading_degT\",\"le_displaced_threshold_ft\",\"he_ident\",\"he_latitude_deg\",\"he_longitude_deg\",\"he_elevation_ft\",\"he_heading_degT\",\"he_displaced_threshold_ft\"\n" +
                "\"12345\",\"6789\",\"EFHK\",\"10000\",\"150\",\"ASPH\",\"1\",\"0\",\"15\",\"60.317222\",\"24.963333\",\"179\",\"151.0\",\"0\",\"33\",\"60.331667\",\"24.976111\",\"179\",\"331.0\",\"0\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<Runway> runways = CsvNavDataLoader.loadRunways(is);

        assertEquals(1, runways.size());
        Runway runway = runways.get(0);
        assertEquals(12345L, runway.getId());
        assertEquals(6789L, runway.getAirportRef());
        assertEquals("EFHK", runway.getAirportIdent());
        assertEquals(10000, runway.getLengthFt());
        assertEquals(150, runway.getWidthFt());
        assertEquals("ASPH", runway.getSurface());
        assertTrue(runway.getLighted());
        assertFalse(runway.getClosed());
        assertEquals("15", runway.getLeIdent());
        assertEquals(60.317222, runway.getLeLatitude(), 0.0001);
        assertEquals("33", runway.getHeIdent());
        assertEquals(60.331667, runway.getHeLatitude(), 0.0001);
    }

    @Test
    void testLoadRunways_WithNullableFields() {
        String csv = "\"id\",\"airport_ref\",\"airport_ident\",\"length_ft\",\"width_ft\",\"surface\",\"lighted\",\"closed\",\"le_ident\",\"le_latitude_deg\",\"le_longitude_deg\",\"le_elevation_ft\",\"le_heading_degT\",\"le_displaced_threshold_ft\",\"he_ident\",\"he_latitude_deg\",\"he_longitude_deg\",\"he_elevation_ft\",\"he_heading_degT\",\"he_displaced_threshold_ft\"\n" +
                "\"12345\",\"6789\",\"EFHK\",\"10000\",\"150\",\"ASPH\",\"1\",\"0\",\"15\",\"\",\"\",\"\",\"\",\"\",\"33\",\"\",\"\",\"\",\"\",\"\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<Runway> runways = CsvNavDataLoader.loadRunways(is);

        assertEquals(1, runways.size());
        Runway runway = runways.get(0);
        assertEquals("15", runway.getLeIdent());
        assertNull(runway.getLeLatitude());
        assertNull(runway.getLeLongitude());
        assertNull(runway.getLeElevationFt());
    }

    @Test
    void testLoadNavaids_ValidData() {
        String csv = "\"id\",\"ident\",\"name\",\"type\",\"frequency_khz\",\"latitude_deg\",\"longitude_deg\",\"elevation_ft\",\"associated_airport\"\n" +
                "\"85050\",\"1A\",\"Williams Harbour\",\"NDB\",\"373\",\"52.558899\",\"-55.782200\",\"70\",\"CCA6\"\n" +
                "\"85052\",\"1CD\",\"Nanaimo\",\"DME\",\"111450\",\"49.057201\",\"-123.872002\",\"83\",\"CYCD\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> navaids = CsvNavDataLoader.loadNavaids(is);

        assertEquals(2, navaids.size());
        NavPoint navaid1 = navaids.get(0);
        assertEquals(85050L, navaid1.getId());
        assertEquals("1A", navaid1.getIdentifier());
        assertEquals("Williams Harbour", navaid1.getName());
        assertEquals("NDB", navaid1.getType());
        assertEquals(373, navaid1.getFrequencyKhz());
        assertEquals(52.558899, navaid1.getLatitude(), 0.0001);
        assertEquals(-55.782200, navaid1.getLongitude(), 0.0001);
        assertEquals(70, navaid1.getElevation());
        assertEquals("CCA6", navaid1.getAssociatedAirport());

        NavPoint navaid2 = navaids.get(1);
        assertEquals("DME", navaid2.getType());
        assertEquals("CYCD", navaid2.getAssociatedAirport());
    }

    @Test
    void testLoadNavaids_SkipMissingCoordinates() {
        String csv = "\"id\",\"ident\",\"name\",\"type\",\"frequency_khz\",\"latitude_deg\",\"longitude_deg\",\"elevation_ft\",\"associated_airport\"\n" +
                "\"85050\",\"1A\",\"Williams Harbour\",\"NDB\",\"373\",\"\",\"\",\"70\",\"CCA6\"\n" +
                "\"85052\",\"1CD\",\"Nanaimo\",\"DME\",\"111450\",\"49.057201\",\"-123.872002\",\"83\",\"CYCD\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> navaids = CsvNavDataLoader.loadNavaids(is);

        assertEquals(1, navaids.size());
        assertEquals("1CD", navaids.get(0).getIdentifier());
    }

    @Test
    void testLoadNavaids_InvalidCoordinates() {
        String csv = "\"id\",\"ident\",\"name\",\"type\",\"frequency_khz\",\"latitude_deg\",\"longitude_deg\",\"elevation_ft\",\"associated_airport\"\n" +
                "\"85050\",\"1A\",\"Williams Harbour\",\"NDB\",\"373\",\"95.0\",\"-55.782200\",\"70\",\"CCA6\"\n" + // Invalid lat
                "\"85052\",\"1CD\",\"Nanaimo\",\"DME\",\"111450\",\"49.057201\",\"-123.872002\",\"83\",\"CYCD\"\n";
        InputStream is = new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8));

        List<NavPoint> navaids = CsvNavDataLoader.loadNavaids(is);

        assertEquals(1, navaids.size());
        assertEquals("1CD", navaids.get(0).getIdentifier());
    }
}
