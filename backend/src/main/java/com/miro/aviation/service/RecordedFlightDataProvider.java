package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.utils.CsvFlightLoader;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class RecordedFlightDataProvider implements FlightDataProvider {

    private static final Logger logger = LoggerFactory.getLogger(RecordedFlightDataProvider.class);

    private List<FlightSnapshot> flightData;
    private int index = 0;

    // time (in ms) at which the next snapshot should be shown
    private long nextAdvanceTime = 0;

    @PostConstruct
    public void loadFlightData() {
        try {
            flightData = CsvFlightLoader.load(
                    getClass().getResourceAsStream("/flights/AY523_2025_12_28.csv")
            );

            // init nextAdvanceTime to current time plus the delta between snapshot[0] and snapshot[1]
            if (!flightData.isEmpty()) {
                nextAdvanceTime = System.currentTimeMillis()
                        + flightData.get(1).getTimestamp()
                        - flightData.get(0).getTimestamp();
            }

        } catch (Exception e) {
            e.printStackTrace();
            flightData = List.of(); // fallback empty list
        }
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

    public void tick() {
        if (flightData.isEmpty() || index >= flightData.size() - 1) return;

        // Current wall clock time in milliseconds
        long now = System.currentTimeMillis();

        FlightSnapshot current = flightData.get(index);
        FlightSnapshot next = flightData.get(index + 1);

        // Compute how much time (in ms) should elapse between the current and next snapshot
        long deltaMillis = next.getTimestamp() - current.getTimestamp();

        // Debug logging, in future there might be more calculations done for debug
        if (logger.isDebugEnabled()) {
            long millisUntilNext = nextAdvanceTime - now;
            double secondsUntilNext = millisUntilNext / 1000.0;

            logger.debug("Tick: index={} -> next index={}, seconds until next snapshot: {}",
                    index, index + 1, secondsUntilNext);
        }


        // If enough real time has passed to move to the next snapshot
        if (now >= nextAdvanceTime) {
            index++;  // advance to the next snapshot

            // Schedule the next advance by adding the delta from the CSV
            nextAdvanceTime = now + deltaMillis;
        }
    }


    public void reset() {
        index = 0;
        if (!flightData.isEmpty()) {
            nextAdvanceTime = System.currentTimeMillis()
                    + flightData.get(1).getTimestamp()
                    - flightData.get(0).getTimestamp();
        }
    }
}
