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
        // simulated providers may override
    }

}
