package com.miro.aviation.service;

import com.miro.aviation.model.NavPoint;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class NavDataServiceTest {

    private NavDataService navDataService;

    @BeforeEach
    void setUp() {
        navDataService = new NavDataService();
        // Manually inject some airports for testing findNearby
        List<NavPoint> airports = Arrays.asList(
                new NavPoint("EFHK", "large_airport", 60.3183, 24.9633),
                new NavPoint("EFNU", "small_airport", 60.3339, 24.2964),
                new NavPoint("KJFK", "large_airport", 40.6413, -73.7781)
        );
        ReflectionTestUtils.setField(navDataService, "airports", airports);
    }

    @Test
    void testFindNearby_ExactMatch() {
        // At EFHK
        List<NavPoint> nearby = navDataService.findNearby(60.3183, 24.9633, 1.0);
        assertEquals(1, nearby.size());
        assertEquals("EFHK", nearby.get(0).getIdent());
    }

    @Test
    void testFindNearby_WithinRadius() {
        // Between EFHK and EFNU (approx 20 miles apart)
        // From EFHK, EFNU is about 19.8 NM away
        List<NavPoint> nearby = navDataService.findNearby(60.3183, 24.9633, 25.0);
        assertEquals(2, nearby.size());
        assertTrue(nearby.stream().anyMatch(a -> a.getIdent().equals("EFHK")));
        assertTrue(nearby.stream().anyMatch(a -> a.getIdent().equals("EFNU")));
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
}
