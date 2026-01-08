package com.miro.aviation.controller;

import com.miro.aviation.model.NavPoint;
import com.miro.aviation.service.NavDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
}
