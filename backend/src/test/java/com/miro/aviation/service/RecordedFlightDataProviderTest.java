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
        assertEquals(100, snapshot.getAirSpeed().getSpeed());
        
        // Ensure position data is carried through to the snapshot
        assertNotNull(snapshot.getPosition());
        assertEquals(60.3172, snapshot.getPosition().getLatitude());
    }

    @Test
    void shouldReturnCorrectPlaybackProgress() {
        provider.initialize(TEST_CSV); // 3 rows
        
        // Row 1 (Index 0)
        var progress1 = provider.getProgress();
        assertEquals(0.0, progress1.percentage());
        assertEquals(0, progress1.currentIndex());
        assertEquals(3, progress1.totalSamples());

        // Seek to Row 2 (Index 1)
        provider.setSeek(0.5);
        var progress2 = provider.getProgress();
        assertEquals(0.5, progress2.percentage());
        assertEquals(1, progress2.currentIndex());
    }

    @Test
    void seekShouldHandleOutOfBoundsGracefully() {
        provider.initialize(TEST_CSV);
        
        // Seek to 200% -> should cap at last row
        provider.setSeek(2.0);
        assertEquals(300, provider.getCurrentSnapshot().getAirSpeed().getSpeed());
        
        // Seek to -50% -> should cap at first row
        provider.setSeek(-0.5);
        assertEquals(100, provider.getCurrentSnapshot().getAirSpeed().getSpeed());
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

    @Test
    void shouldSeekToSpecificPercentage() {
        provider.initialize(TEST_CSV); // Assumes test_flight.csv has 3 rows (indices 0, 1, 2)
        
        // Seek to 50% (should be index 1 if there are 3 rows: 0.5 * 2 = 1.0)
        provider.setSeek(0.5);
        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should have jumped to middle row (200 speed)");
            
        // Seek to 100% (index 2)
        provider.setSeek(1.0);
        assertEquals(300, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should have jumped to last row (300 speed)");

        // Seek back to 0% (index 0)
        provider.setSeek(0.0);
        assertEquals(100, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should have jumped back to first row (100 speed)");
    }

    @Test
    void shouldContinuePlaybackNormallyAfterSeek() {
        provider.initialize(TEST_CSV);
        
        // 1. Seek to index 0 (Start)
        provider.setSeek(0.0);
        
        // 2. Advance time by 1100ms (threshold for Row 2 is 1000ms)
        testClock.advance(Duration.ofMillis(1100));
        provider.tick();
        
        // 3. Verify it moved to index 1
        assertEquals(200, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Should advance to row 2 normally after seeking to row 1");
    }

    @Test
    void shouldUpdateSpeedMultiplierEvenIfDataIsEmpty() {
        // 1. Initially, flightData is empty. 
        // Calling this hits the 'else' branch in RecordedFlightDataProvider.
        provider.setSpeedMultiplier(4.0);
        
        // 2. Now initialize with the CSV
        provider.initialize(TEST_CSV);
        
        // 3. Advance time by only 300ms.
        // At 1.0x speed, it wouldn't advance (needs 1000ms).
        // At 4.0x speed, the threshold is 250ms (1000ms / 4.0).
        testClock.advance(Duration.ofMillis(300));
        provider.tick();
        
        // 4. Verify we advanced to the second row (Speed 200)
        assertEquals(200.0, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Playback multiplier should have been preserved from the pre-initialization call");
    }

    @Test
    void shouldUpdateSpeedMultiplierEvenIfAtEnd() {
        provider.initialize(TEST_CSV);
        
        // 1. Seek to the very last record (Index 2)
        provider.setSeek(1.0); 
        
        // 2. Change playback speed to 2.0x.
        // This hits the 'else' branch because we are at the last index.
        provider.setSpeedMultiplier(2.0);
        
        // 3. Restart playback
        provider.reset();
        
        // 4. Advance 600ms (more than the 500ms threshold for 2x speed)
        testClock.advance(Duration.ofMillis(600));
        provider.tick();
        
        // 5. Verify we advanced
        assertEquals(200.0, provider.getCurrentSnapshot().getAirSpeed().getSpeed(), 
            "Playback multiplier should have been preserved from when we were at the end of the flight");
    }
}
