package com.miro.aviation.service;

import com.miro.aviation.model.AirSpeed;
import com.miro.aviation.model.Altitude;
import com.miro.aviation.model.Attitude;
import com.miro.aviation.utils.CsvFlightLoader;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecordedFlightDataProvider implements FlightDataProvider {

    private List<FlightSnapshot> flightData;
    private int index = 0;

    @PostConstruct
    public void loadFlightData() {
        try {
            flightData = CsvFlightLoader.load(
                    getClass().getResourceAsStream("/flights/AY523_2025_12_28.csv") // test CSV
            );
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
        Altitude alt = flightData.get(index).getAltitude();
        System.out.println("REC index=" + index + " alt=" + alt.getAltitude());
        return alt;
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
