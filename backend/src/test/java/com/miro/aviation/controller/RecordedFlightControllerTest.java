package com.miro.aviation.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RecordedFlightControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnListOfAvailableFlightFiles() throws Exception {
        mockMvc.perform(get("/api/flights"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                // Verify that our main recorded flight file is in the list
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasItem("AY523_2025_12_28.csv")));
    }
}
