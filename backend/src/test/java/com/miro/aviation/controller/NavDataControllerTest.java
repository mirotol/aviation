package com.miro.aviation.controller;

import com.miro.aviation.model.AirportDetails;
import com.miro.aviation.model.NavPoint;
import com.miro.aviation.model.Runway;
import com.miro.aviation.service.NavDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(NavDataController.class)
class NavDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NavDataService navDataService;

    @Test
    void testGetNearby() throws Exception {
        when(navDataService.findNearby(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Collections.singletonList(new NavPoint("EFHK", "large_airport", 60.31, 24.96)));

        mockMvc.perform(get("/api/nav/nearby")
                        .param("lat", "60.0")
                        .param("lon", "25.0")
                        .param("radius", "50"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetAirportDetails() throws Exception {
        NavPoint airport = new NavPoint("EFHK", "large_airport", 60.3183, 24.9633);
        airport.setName("Helsinki Vantaa Airport");
        airport.setIcaoCode("EFHK");

        Runway runway1 = new Runway();
        runway1.setLeIdent("15");
        runway1.setHeIdent("33");
        runway1.setLengthFt(10000);

        Runway runway2 = new Runway();
        runway2.setLeIdent("04L");
        runway2.setHeIdent("22R");
        runway2.setLengthFt(11286);

        NavPoint navaid = new NavPoint();
        navaid.setType("VOR");
        navaid.setIdentifier("HEL");

        AirportDetails details = new AirportDetails(
            airport,
            Arrays.asList(runway1, runway2),
            Collections.singletonList(navaid)
        );

        when(navDataService.getAirportDetails("EFHK")).thenReturn(details);

        mockMvc.perform(get("/api/nav/airport/EFHK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.airport.ident", is("EFHK")))
                .andExpect(jsonPath("$.airport.name", is("Helsinki Vantaa Airport")))
                .andExpect(jsonPath("$.runways", hasSize(2)))
                .andExpect(jsonPath("$.runways[0].leIdent", is("15")))
                .andExpect(jsonPath("$.runways[1].leIdent", is("04L")))
                .andExpect(jsonPath("$.associatedNavaids", hasSize(1)))
                .andExpect(jsonPath("$.associatedNavaids[0].type", is("VOR")));
    }

    @Test
    void testGetAirportDetails_NotFound() throws Exception {
        when(navDataService.getAirportDetails("XXXX")).thenReturn(null);

        mockMvc.perform(get("/api/nav/airport/XXXX"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetRunways() throws Exception {
        Runway runway1 = new Runway();
        runway1.setLeIdent("15");
        runway1.setHeIdent("33");
        runway1.setLengthFt(10000);
        runway1.setSurface("ASPH");

        Runway runway2 = new Runway();
        runway2.setLeIdent("04L");
        runway2.setHeIdent("22R");
        runway2.setLengthFt(11286);
        runway2.setSurface("ASPH");

        List<Runway> runways = Arrays.asList(runway1, runway2);

        when(navDataService.getRunwaysForAirport("EFHK")).thenReturn(runways);

        mockMvc.perform(get("/api/nav/airport/EFHK/runways"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].leIdent", is("15")))
                .andExpect(jsonPath("$[0].heIdent", is("33")))
                .andExpect(jsonPath("$[0].lengthFt", is(10000)))
                .andExpect(jsonPath("$[0].surface", is("ASPH")))
                .andExpect(jsonPath("$[1].leIdent", is("04L")));
    }

    @Test
    void testGetRunways_EmptyList() throws Exception {
        when(navDataService.getRunwaysForAirport("EFNU")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/nav/airport/EFNU/runways"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testGetNearbyNavaids() throws Exception {
        NavPoint navaid1 = new NavPoint();
        navaid1.setIdentifier("HEL");
        navaid1.setType("VOR");
        navaid1.setLatitude(60.320);
        navaid1.setLongitude(24.965);
        navaid1.setFrequencyKhz(117500);

        NavPoint navaid2 = new NavPoint();
        navaid2.setIdentifier("HEL");
        navaid2.setType("NDB");
        navaid2.setLatitude(60.318);
        navaid2.setLongitude(24.963);
        navaid2.setFrequencyKhz(385);

        List<NavPoint> navaids = Arrays.asList(navaid1, navaid2);

        when(navDataService.findNearbyNavaids(60.3183, 24.9633, 50.0)).thenReturn(navaids);

        mockMvc.perform(get("/api/nav/navaids/nearby")
                        .param("lat", "60.3183")
                        .param("lon", "24.9633")
                        .param("radius", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].type", is("VOR")))
                .andExpect(jsonPath("$[0].frequencyKhz", is(117500)))
                .andExpect(jsonPath("$[1].type", is("NDB")))
                .andExpect(jsonPath("$[1].frequencyKhz", is(385)));
    }

    @Test
    void testGetNearbyNavaids_DefaultRadius() throws Exception {
        when(navDataService.findNearbyNavaids(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/nav/navaids/nearby")
                        .param("lat", "60.0")
                        .param("lon", "25.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
