package com.miro.aviation.service;

import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;

public interface FlightDataProvider {

    Attitude getAttitude();

    Altitude getAltitude();

    // You can extend later with Airspeed, Heading, etc.
}
