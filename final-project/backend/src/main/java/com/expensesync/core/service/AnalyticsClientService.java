package com.expensesync.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.*;

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
    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchMonthlyAnalytics(Long userId, String monthYear, BigDecimal budgetLimit, List<Map<String, Object>> expenses) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("monthYear", monthYear);
            payload.put("budgetLimit", budgetLimit);
            payload.put("expenses", expenses);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            return restTemplate.postForObject(analyticsServiceUrl + "/summary", request, Map.class);
        } catch (Exception e) {
            return calculateFallbackSummary(userId, monthYear, budgetLimit, expenses);
        }
    }

    public Map<String, Object> fetchMonthlyAnalytics(Long userId, String monthYear) {
        return fetchMonthlyAnalytics(userId, monthYear, new BigDecimal("25000.00"), Collections.emptyList());
    }

    public String fetchCsvReport(Long userId, String monthYear, List<Map<String, Object>> expenses) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("monthYear", monthYear);
            payload.put("expenses", expenses);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            return restTemplate.postForObject(analyticsServiceUrl + "/export-csv", request, String.class);
        } catch (Exception e) {
            return calculateFallbackCsv(expenses);
        }
    }

    public String fetchCsvReport(Long userId, String monthYear) {
        return fetchCsvReport(userId, monthYear, Collections.emptyList());
    }

    private Map<String, Object> calculateFallbackSummary(Long userId, String monthYear, BigDecimal budgetLimit, List<Map<String, Object>> expenses) {
        Map<String, Object> fallback = new LinkedHashMap<>();
        fallback.put("serviceName", "ExpenseSync Analytics Microservice (Fallback)");
        fallback.put("userId", userId);
        fallback.put("monthYear", monthYear);
        fallback.put("generatedAt", new Date().toString());

        BigDecimal total = BigDecimal.ZERO;
        Map<String, BigDecimal> breakdown = new LinkedHashMap<>();
        if (expenses != null) {
            for (Map<String, Object> exp : expenses) {
                if (exp == null) continue;
                BigDecimal amt = BigDecimal.ZERO;
                if (exp.get("amount") != null) {
                    try {
                        amt = new BigDecimal(exp.get("amount").toString());
                    } catch (Exception ignored) {}
                }
                total = total.add(amt);
                String cat = exp.get("category") != null ? exp.get("category").toString().toUpperCase() : "OTHER";
                breakdown.put(cat, breakdown.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            }
        }
        total = total.setScale(2, RoundingMode.HALF_UP);
        fallback.put("totalMonthlySpent", total);
        fallback.put("budgetLimit", budgetLimit != null ? budgetLimit : new BigDecimal("25000.00"));
        fallback.put("budgetUsedPercentage", 0.0);
        fallback.put("overspendWarning", false);
        fallback.put("categoryBreakdown", breakdown);
        fallback.put("insights", Collections.singletonList("Total spending for " + monthYear + " is ₹" + total + "."));
        return fallback;
    }

    private String calculateFallbackCsv(List<Map<String, Object>> expenses) {
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Category,Description,Amount,PaymentMethod,Status\n");
        if (expenses != null) {
            for (Map<String, Object> exp : expenses) {
                if (exp == null) continue;
                String date = exp.get("date") != null ? exp.get("date").toString() : "";
                String category = exp.get("category") != null ? exp.get("category").toString() : "OTHER";
                String desc = exp.get("description") != null ? exp.get("description").toString()
                        : (exp.get("title") != null ? exp.get("title").toString() : "");
                String amountStr = "0.00";
                if (exp.get("amount") != null) {
                    try {
                        amountStr = new BigDecimal(exp.get("amount").toString()).setScale(2, RoundingMode.HALF_UP).toString();
                    } catch (Exception ignored) {}
                }
                String paymentMethod = exp.get("paymentMethod") != null ? exp.get("paymentMethod").toString() : "UPI";
                String status = exp.get("status") != null ? exp.get("status").toString() : "PAID";
                csv.append(date).append(",").append(category).append(",").append(desc.replace(",", " "))
                   .append(",").append(amountStr).append(",").append(paymentMethod).append(",").append(status).append("\n");
            }
        }
        return csv.toString();
    }
}
