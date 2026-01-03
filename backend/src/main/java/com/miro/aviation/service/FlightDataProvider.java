package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.model.FlightSnapshot;
import com.miro.aviation.model.PlaybackProgress;

public interface FlightDataProvider {

    Attitude getAttitude();

    Altitude getAltitude();

    AirSpeed getSpeed();

    //TODO: Extend with more statistics

    FlightSnapshot getCurrentSnapshot();

    default void tick() {
        // providers may override
    }

    /**
     * Pause or resume the data generation/playback.
     */
    default void setPaused(boolean paused) {
        // providers may override
    }

    /**
     * Set the speed factor for the simulation or playback.
     */
    default void setSpeedMultiplier(double multiplier) {
        // providers may override
    }

    /**
     * @return progress metadata if applicable (Recorded), or null (Simulated).
     */
    default PlaybackProgress getProgress() {
        return null;
    }

    /**
     * Jump to a specific position in the recorded flight
     */
    default void setSeek(double percentage) {
        // providers may override
    }
}
