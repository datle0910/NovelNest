package com.example.novelnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NovelnestApplication {
    public static void main(String[] args) {
        SpringApplication.run(NovelnestApplication.class, args);
    }
}
