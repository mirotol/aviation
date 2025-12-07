package com.miro.aviation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AviationApplication {

	public static void main(String[] args) {
		SpringApplication.run(AviationApplication.class, args);
	}

}
