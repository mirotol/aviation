package com.miro.aviation.service;

import com.miro.aviation.model.*;
import com.miro.aviation.utils.CsvFlightLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.List;

@Component
@Scope("prototype") // Create new instance for each client
public class RecordedFlightDataProvider implements FlightDataProvider {

    private static final Logger logger = LoggerFactory.getLogger(RecordedFlightDataProvider.class);
    private final Clock clock;

    private List<FlightSnapshot> flightData = List.of();
    private int index = 0;
    private long lastAdvanceTime = 0;
    private long nextAdvanceTime = 0;
    private long lastTickTime = 0; // Track the last time tick() was processed
    private double speedMultiplier = 1.0;
    private boolean paused = false;

    public RecordedFlightDataProvider(Clock clock) {
        this.clock = clock;
    }

    @Override
    public Attitude getAttitude() {
        return flightData.get(index).getAttitude();
    }

    @Override
    public Altitude getAltitude() {
        return flightData.get(index).getAltitude();
    }

    @Override
    public AirSpeed getSpeed() {
        return flightData.get(index).getAirSpeed();
    }

    @Override
    public Position getPosition() {
        return flightData.get(index).getPosition();
    }

    @Override
    public PlaybackProgress getProgress() {
        if (flightData.isEmpty()) return null;
        
        double rawPercentage = (double) index / (flightData.size() - 1);
        // Round to 4 decimal places
        double roundedPercentage = Math.round(rawPercentage * 10000.0) / 10000.0;
        
        return new PlaybackProgress(
            index,
            flightData.size(),
            roundedPercentage,
            flightData.get(0).getTimestamp(),
            flightData.get(flightData.size() - 1).getTimestamp()
        );
    }

    @Override
    public FlightSnapshot getCurrentSnapshot() {
        if (flightData == null || flightData.isEmpty()) return null;
        FlightSnapshot snapshot = flightData.get(index);
        
        // Return a copy with current progress metadata
        return new FlightSnapshot(
            snapshot.getTimestamp(),
            snapshot.getAttitude(),
            snapshot.getAltitude(),
            snapshot.getAirSpeed(),
            getProgress(),
            snapshot.getPosition()
        );
    }
    
    public void initialize(String resourcePath) {
        try {
            flightData = CsvFlightLoader.load(getClass().getResourceAsStream(resourcePath));
            if (!flightData.isEmpty()) {
                index = 0;
                long now = clock.millis();
                lastAdvanceTime = now;
                lastTickTime = now;
                calculateNextAdvanceTime();
            }

        } catch (Exception e) {
            logger.error("Failed to load flight data from {}", resourcePath, e);
            flightData = List.of();
        }
    }

    public void tick() {
        if (flightData.isEmpty() || index >= flightData.size() - 1) return;

        long now = clock.millis();
        long elapsedSinceLastTick = now - lastTickTime;
        lastTickTime = now;

        if (paused) {
            // If paused, we simply push the scheduled times forward by 
            // the amount of real-world time that just passed.
            lastAdvanceTime += elapsedSinceLastTick;
            nextAdvanceTime += elapsedSinceLastTick;
            return;
        }

        if (now >= nextAdvanceTime) {
            index++;
            lastAdvanceTime = now;
            calculateNextAdvanceTime();
        }
    }

    private void calculateNextAdvanceTime() {
        if (index >= flightData.size() - 1) return;

        FlightSnapshot current = flightData.get(index);
        FlightSnapshot next = flightData.get(index + 1);
        long deltaMillis = next.getTimestamp() - current.getTimestamp();

        this.nextAdvanceTime = lastAdvanceTime + (long) (deltaMillis / speedMultiplier);
    }

    public void reset() {
        index = 0;
        long now = clock.millis();
        lastAdvanceTime = now;
        lastTickTime = now;
        calculateNextAdvanceTime();
    }

    public void setPaused(boolean paused) {
        this.paused = paused;
    }

    /**
     * Jumps to a specific position in the flight.
     * @param percentage Value between 0.0 and 1.0
     */
    @Override
    public void setSeek(double percentage) {
        if (flightData.isEmpty()) return;

        // 1. Calculate new index
        int newIndex = (int) (percentage * (flightData.size() - 1));
        this.index = Math.max(0, Math.min(flightData.size() - 1, newIndex));

        // 2. Re-anchor the clocks to current time
        long now = clock.millis();
        this.lastTickTime = now;
        this.lastAdvanceTime = now;
        
        // 3. Recalculate when the NEXT sample should happen
        calculateNextAdvanceTime();
        
        logger.info("Seek performed to index {} ({})", index, percentage);
    }

    public void setSpeedMultiplier(double multiplier) {
        if (!flightData.isEmpty() && index < flightData.size() - 1) {
            long now = clock.millis();
            long elapsedCsvTime = (long) ((now - lastAdvanceTime) * this.speedMultiplier);

            this.speedMultiplier = multiplier;
            // Re-anchor lastAdvanceTime based on the new multiplier
            this.lastAdvanceTime = now - (long) (elapsedCsvTime / speedMultiplier);
            
            calculateNextAdvanceTime();
        } else {
            this.speedMultiplier = multiplier;
        }
    }
}
