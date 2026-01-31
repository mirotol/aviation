package com.miro.aviation.service;

import com.miro.aviation.model.AirportDetails;
import com.miro.aviation.model.NavPoint;
import com.miro.aviation.model.Runway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class NavDataServiceTest {

    private NavDataService navDataService;

    @BeforeEach
    void setUp() {
        navDataService = new NavDataService();

        // Create test airports with extended fields
        NavPoint efhk = new NavPoint("EFHK", "large_airport", 60.3183, 24.9633);
        efhk.setId(12345L);
        efhk.setName("Helsinki Vantaa Airport");
        efhk.setIcaoCode("EFHK");
        efhk.setIataCode("HEL");
        efhk.setGpsCode("EFHK");

        NavPoint efnu = new NavPoint("EFNU", "small_airport", 60.3339, 24.2964);
        efnu.setId(12346L);
        efnu.setIcaoCode("EFNU");

        NavPoint kjfk = new NavPoint("KJFK", "large_airport", 40.6413, -73.7781);
        kjfk.setId(12347L);
        kjfk.setIcaoCode("KJFK");
        kjfk.setIataCode("JFK");

        List<NavPoint> airports = Arrays.asList(efhk, efnu, kjfk);
        ReflectionTestUtils.setField(navDataService, "airports", airports);

        // Create test indexes
        Map<Long, NavPoint> airportById = new HashMap<>();
        Map<String, NavPoint> airportByIdent = new HashMap<>();
        Map<String, NavPoint> airportByIcao = new HashMap<>();
        Map<String, NavPoint> airportByIata = new HashMap<>();
        Map<String, NavPoint> airportByGps = new HashMap<>();

        for (NavPoint airport : airports) {
            if (airport.getId() != null) airportById.put(airport.getId(), airport);
            if (airport.getIdentifier() != null) airportByIdent.put(airport.getIdentifier().toUpperCase(), airport);
            if (airport.getIcaoCode() != null) airportByIcao.put(airport.getIcaoCode().toUpperCase(), airport);
            if (airport.getIataCode() != null) airportByIata.put(airport.getIataCode().toUpperCase(), airport);
            if (airport.getGpsCode() != null) airportByGps.put(airport.getGpsCode().toUpperCase(), airport);
        }

        ReflectionTestUtils.setField(navDataService, "airportById", airportById);
        ReflectionTestUtils.setField(navDataService, "airportByIdent", airportByIdent);
        ReflectionTestUtils.setField(navDataService, "airportByIcao", airportByIcao);
        ReflectionTestUtils.setField(navDataService, "airportByIata", airportByIata);
        ReflectionTestUtils.setField(navDataService, "airportByGps", airportByGps);

        // Create test runways
        Runway runway1 = new Runway();
        runway1.setId(1L);
        runway1.setAirportRef(12345L);
        runway1.setAirportIdent("EFHK");
        runway1.setLeIdent("15");
        runway1.setHeIdent("33");
        runway1.setLengthFt(10000);

        Runway runway2 = new Runway();
        runway2.setId(2L);
        runway2.setAirportRef(12345L);
        runway2.setAirportIdent("EFHK");
        runway2.setLeIdent("04L");
        runway2.setHeIdent("22R");
        runway2.setLengthFt(11286);

        List<Runway> runways = Arrays.asList(runway1, runway2);
        ReflectionTestUtils.setField(navDataService, "runways", runways);

        Map<Long, List<Runway>> runwaysByAirportRef = new HashMap<>();
        runwaysByAirportRef.put(12345L, runways);
        ReflectionTestUtils.setField(navDataService, "runwaysByAirportRef", runwaysByAirportRef);

        // Create test navaids
        NavPoint navaid1 = new NavPoint();
        navaid1.setId(85050L);
        navaid1.setIdentifier("HEL");
        navaid1.setType("VOR");
        navaid1.setLatitude(60.320);
        navaid1.setLongitude(24.965);
        navaid1.setFrequencyKhz(117500);
        navaid1.setAssociatedAirport("EFHK");

        NavPoint navaid2 = new NavPoint();
        navaid2.setId(85051L);
        navaid2.setIdentifier("HEL");
        navaid2.setType("NDB");
        navaid2.setLatitude(60.318);
        navaid2.setLongitude(24.963);
        navaid2.setFrequencyKhz(385);
        navaid2.setAssociatedAirport("EFHK");

        List<NavPoint> navaids = Arrays.asList(navaid1, navaid2);
        ReflectionTestUtils.setField(navDataService, "navaids", navaids);

        Map<String, List<NavPoint>> navaidsByAssociatedAirport = new HashMap<>();
        navaidsByAssociatedAirport.put("EFHK", navaids);
        ReflectionTestUtils.setField(navDataService, "navaidsByAssociatedAirport", navaidsByAssociatedAirport);
    }

    @Test
    void testFindNearby_ExactMatch() {
        // At EFHK
        List<NavPoint> nearby = navDataService.findNearby(60.3183, 24.9633, 1.0);
        assertEquals(1, nearby.size());
        assertEquals("EFHK", nearby.get(0).getIdentifier());
    }

    @Test
    void testFindNearby_WithinRadius() {
        // Between EFHK and EFNU (approx 20 miles apart)
        // From EFHK, EFNU is about 19.8 NM away
        List<NavPoint> nearby = navDataService.findNearby(60.3183, 24.9633, 25.0);
        assertEquals(2, nearby.size());
        assertTrue(nearby.stream().anyMatch(a -> a.getIdentifier().equals("EFHK")));
        assertTrue(nearby.stream().anyMatch(a -> a.getIdentifier().equals("EFNU")));
    }

    @Test
    void testFindNearby_NoneFound() {
        // Somewhere in the Pacific
        List<NavPoint> nearby = navDataService.findNearby(0, 0, 100.0);
        assertTrue(nearby.isEmpty());
    }

    @Test
    void testInit_FileNotFound() {
        NavDataService service = new NavDataService();
        // This will log an error and throw RuntimeException which is caught in init()
        // We can't easily mock getClass().getResourceAsStream() without Powermock or similar,
        // but we can test that it doesn't crash the application if file is missing.
        assertDoesNotThrow(service::init);
    }

    @Test
    void testFindAirportByCode_ByIdent() {
        NavPoint airport = navDataService.findAirportByCode("EFHK");
        assertNotNull(airport);
        assertEquals("EFHK", airport.getIdentifier());
        assertEquals("Helsinki Vantaa Airport", airport.getName());
    }

    @Test
    void testFindAirportByCode_ByIcao() {
        NavPoint airport = navDataService.findAirportByCode("EFHK");
        assertNotNull(airport);
        assertEquals("EFHK", airport.getIcaoCode());
    }

    @Test
    void testFindAirportByCode_ByIata() {
        NavPoint airport = navDataService.findAirportByCode("HEL");
        assertNotNull(airport);
        assertEquals("HEL", airport.getIataCode());
        assertEquals("EFHK", airport.getIdentifier());
    }

    @Test
    void testFindAirportByCode_ByIataJFK() {
        NavPoint airport = navDataService.findAirportByCode("JFK");
        assertNotNull(airport);
        assertEquals("JFK", airport.getIataCode());
        assertEquals("KJFK", airport.getIdentifier());
    }

    @Test
    void testFindAirportByCode_CaseInsensitive() {
        NavPoint airport1 = navDataService.findAirportByCode("efhk");
        NavPoint airport2 = navDataService.findAirportByCode("EFHK");
        NavPoint airport3 = navDataService.findAirportByCode("hel");

        assertNotNull(airport1);
        assertNotNull(airport2);
        assertNotNull(airport3);
        assertEquals(airport1.getId(), airport2.getId());
        assertEquals(airport1.getId(), airport3.getId());
    }

    @Test
    void testFindAirportByCode_NotFound() {
        NavPoint airport = navDataService.findAirportByCode("XXXX");
        assertNull(airport);
    }

    @Test
    void testFindAirportByCode_Null() {
        NavPoint airport = navDataService.findAirportByCode(null);
        assertNull(airport);
    }

    @Test
    void testGetRunwaysForAirport() {
        List<Runway> runways = navDataService.getRunwaysForAirport("EFHK");
        assertNotNull(runways);
        assertEquals(2, runways.size());
        assertTrue(runways.stream().anyMatch(r -> r.getLeIdent().equals("15")));
        assertTrue(runways.stream().anyMatch(r -> r.getLeIdent().equals("04L")));
    }

    @Test
    void testGetRunwaysForAirport_ByIata() {
        List<Runway> runways = navDataService.getRunwaysForAirport("HEL");
        assertNotNull(runways);
        assertEquals(2, runways.size());
    }

    @Test
    void testGetRunwaysForAirport_NoRunways() {
        List<Runway> runways = navDataService.getRunwaysForAirport("EFNU");
        assertNotNull(runways);
        assertTrue(runways.isEmpty());
    }

    @Test
    void testGetRunwaysForAirport_AirportNotFound() {
        List<Runway> runways = navDataService.getRunwaysForAirport("XXXX");
        assertNotNull(runways);
        assertTrue(runways.isEmpty());
    }

    @Test
    void testGetAirportDetails() {
        AirportDetails details = navDataService.getAirportDetails("EFHK");
        assertNotNull(details);
        assertNotNull(details.airport());
        assertEquals("EFHK", details.airport().getIdentifier());
        assertEquals(2, details.runways().size());
        assertEquals(2, details.associatedNavaids().size());
        assertTrue(details.associatedNavaids().stream().anyMatch(n -> n.getType().equals("VOR")));
        assertTrue(details.associatedNavaids().stream().anyMatch(n -> n.getType().equals("NDB")));
    }

    @Test
    void testGetAirportDetails_ByIata() {
        AirportDetails details = navDataService.getAirportDetails("HEL");
        assertNotNull(details);
        assertEquals("EFHK", details.airport().getIdentifier());
    }

    @Test
    void testGetAirportDetails_NotFound() {
        AirportDetails details = navDataService.getAirportDetails("XXXX");
        assertNull(details);
    }

    @Test
    void testFindNearbyNavaids() {
        // Near EFHK, should find both navaids
        List<NavPoint> navaids = navDataService.findNearbyNavaids(60.3183, 24.9633, 5.0);
        assertEquals(2, navaids.size());
        assertTrue(navaids.stream().anyMatch(n -> n.getType().equals("VOR")));
        assertTrue(navaids.stream().anyMatch(n -> n.getType().equals("NDB")));
    }

    @Test
    void testFindNearbyNavaids_NoneFound() {
        // Far from any navaids
        List<NavPoint> navaids = navDataService.findNearbyNavaids(0, 0, 100.0);
        assertTrue(navaids.isEmpty());
    }

    @Test
    void testGetAllNavaids() {
        List<NavPoint> navaids = navDataService.getAllNavaids();
        assertNotNull(navaids);
        assertEquals(2, navaids.size());
    }
}
