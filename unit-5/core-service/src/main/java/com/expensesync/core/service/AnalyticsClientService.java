package com.expensesync.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsClientService {

    private final RestTemplate restTemplate;

    @Value("${analytics.service.url:http://localhost:8082/api/analytics}")
    private String analyticsServiceUrl;

    public AnalyticsClientService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(3))
                .build();
    }

    /**
     * Inter-service REST call: Core Service -> Analytics Microservice (Port 8082)
     */
    public Map<String, Object> fetchMonthlyAnalytics(Long userId, String monthYear) {
        try {
            String url = String.format("%s/summary?userId=%d&monthYear=%s", analyticsServiceUrl, userId, monthYear);
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            // Graceful circuit-breaker fallback when microservice is spun down
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "FALLBACK");
            fallback.put("message", "Analytics microservice temporarily unreachable. Returning local aggregates.");
            fallback.put("userId", userId);
            fallback.put("monthYear", monthYear);
            return fallback;
        }
    }
}

