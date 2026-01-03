package com.miro.aviation;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AviationApplicationTests {
	
	@Test
	void contextLoads() {
        // This test ensures the Spring context starts successfully.
    }

    @Test
    void mainMethodStartsApplication() {
        // This explicitly calls the main method to satisfy code coverage.
        // It's a "smoke test" for the entry point.
        AviationApplication.main(new String[] {});
    }
}
