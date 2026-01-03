package com.miro.aviation.service;

import com.miro.aviation.model.FlightSnapshot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

class RecordedFlightDataProviderTest {

    private RecordedFlightDataProvider provider;
    private TestClock testClock;
    private static final String TEST_CSV = "/flights/test_flight.csv";

    @BeforeEach
    void setUp() {
        testClock = new TestClock();
        provider = new RecordedFlightDataProvider(testClock);
    }

    @Test
    void shouldInitializeAndReturnFirstSnapshot() {
        provider.initialize(TEST_CSV);
        FlightSnapshot snapshot = provider.getCurrentSnapshot();

        assertNotNull(snapshot);
        assertEquals(100, snapshot.getAirSpeed().getSpeed(), "Should start with the first row's speed");
    }

    @Test
    void shouldAdvanceWhenTimePasses() {
        provider.initialize(TEST_CSV);
        
        // CSV has snapshots at 1000ms, 2000ms, 3000ms. 
        // Delta between Row 1 and 2 is 1000ms.
        testClock.advance(Duration.ofMillis(1100));
        provider.tick();

        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should have advanced to the second row");
    }

    @Test
    void shouldResumeCorrectlyAfterPause() {
        provider.initialize(TEST_CSV);
        
        // 1. Advance halfway (500ms)
        testClock.advance(Duration.ofMillis(500));
        provider.tick();
        
        // 2. Pause and wait a long time
        provider.setPaused(true);
        testClock.advance(Duration.ofSeconds(10));
        provider.tick(); // Logic shifts the timeline forward
        
        assertEquals(100, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), "Should stay at row 1 while paused");

        // 3. Unpause
        provider.setPaused(false);
        
        // 4. Advance just a bit more (remaining 500ms + buffer)
        testClock.advance(Duration.ofMillis(600));
        provider.tick();
        
        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should advance to row 2 after unpausing and waiting the remaining delta");
    }

    @Test
    void shouldRespectSpeedMultiplierMidWay() {
        provider.initialize(TEST_CSV);
        
        // 1. Wait 500ms at 1x speed (50% through the 1000ms gap)
        testClock.advance(Duration.ofMillis(500));
        provider.tick();
        
        // 2. Switch to 2x speed mid-way
        // The remaining 500ms at 1x should become 250ms at 2x.
        provider.setSpeedMultiplier(2.0);
        
        // 3. Advance only 300ms more (500ms + 300ms = 800ms total real time)
        // At 1x speed, this wouldn't advance (800 < 1000).
        // But with the switch, the threshold moved to 750ms total.
        testClock.advance(Duration.ofMillis(300));
        provider.tick();
        
        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should have advanced because mid-way speed change shortened the remaining wait");
    }

    @Test
    void resetShouldRestoreInitialStateAfterAdvancing() {
        provider.initialize(TEST_CSV);

        // Advance to row 2
        testClock.advance(Duration.ofMillis(1500));
        provider.tick();
        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed());

        // Reset
        provider.reset();
        
        assertEquals(100, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "After reset, we should be back at the first row");
    }

    @Test
    void shouldRespectSpeedMultiplier() {
        provider.initialize(TEST_CSV);
        provider.setSpeedMultiplier(2.0); // 2x speed means 1000ms delta becomes 500ms
        
        // Advance only 600ms (more than 500ms, but less than the original 1000ms)
        testClock.advance(Duration.ofMillis(600));
        provider.tick();
        
        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should have advanced because of 2x speed multiplier");
    }

    @Test
    void shouldNotAdvanceWhenPaused() {
        provider.initialize(TEST_CSV);
        provider.setPaused(true);
        
        // Advance time significantly
        testClock.advance(Duration.ofSeconds(10));
        provider.tick();
        
        assertEquals(100, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should not have moved because simulation is paused");
    }

    @Test
    void shouldHandleEmptyDataGracefully() {
        provider.initialize("/non/existent/file.csv");
        
        assertNull(provider.getCurrentSnapshot());
        assertDoesNotThrow(() -> provider.tick());
    }

    /**
     * Helper class to control time deterministically in tests.
     */
    private static class TestClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T12:00:00Z");

        public void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override public Instant instant() { return now; }
        @Override public long millis() { return now.toEpochMilli(); }
        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
    }
}
