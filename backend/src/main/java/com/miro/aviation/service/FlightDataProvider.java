package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.model.FlightSnapshot;

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

}
