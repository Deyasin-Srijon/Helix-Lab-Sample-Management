package com.letustech.lab_sample_management_backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> map = new HashMap<>();

        map.put("status", "UP");
        map.put("message", "Backend is running");

        return new ResponseEntity<>(
                map,
                HttpStatus.OK
        );
    }
}