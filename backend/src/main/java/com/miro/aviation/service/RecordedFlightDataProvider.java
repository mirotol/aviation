package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.model.FlightSnapshot;
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
    public FlightSnapshot getCurrentSnapshot() {
        if (flightData == null || flightData.isEmpty()) return null;
        return flightData.get(index);
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
