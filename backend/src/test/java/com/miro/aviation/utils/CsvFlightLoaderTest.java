package com.miro.aviation.utils;

import com.miro.aviation.model.FlightSnapshot;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvFlightLoaderTest {

    @Test
    void shouldLoadValidCsvData() {
        String csvContent = "Timestamp,Altitude,Speed,Direction\n" +
                            "1672531200,10000,120,90\n" +
                            "1672531201,10100,125,95";
        
        ByteArrayInputStream bais = new ByteArrayInputStream(csvContent.getBytes());
        List<FlightSnapshot> result = CsvFlightLoader.load(bais);

        assertEquals(2, result.size());
        
        // Verify conversion: seconds (1672531200) to millis (1672531200000)
        assertEquals(1672531200000L, result.get(0).getTimestamp());
        assertEquals(10000.0, result.get(0).getAltitude().getAltitude());
    }

    @Test
    void shouldThrowExceptionOnInvalidInput() {
        String invalidCsv = "invalid,header\ndata";
        ByteArrayInputStream bais = new ByteArrayInputStream(invalidCsv.getBytes());

        assertThrows(RuntimeException.class, () -> CsvFlightLoader.load(bais));
    }
}
