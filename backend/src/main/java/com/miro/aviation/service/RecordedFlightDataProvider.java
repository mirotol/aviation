package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecordedFlightDataProvider implements FlightDataProvider {

    private List<FlightSnapshot> flightData; // custom DTO: Attitude + Altitude
    private int index = 0;

    @PostConstruct
    public void loadFlightData() {
        // TODO: load CSV or JSON into flightData list
        // Example: flightData = CsvLoader.load("flight1.csv");
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

    public void next() {
        if (index < flightData.size() - 1) index++;
    }

    public void reset() {
        index = 0;
    }
}
