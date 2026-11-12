package com.expensesync.analytics.controller;

import com.expensesync.analytics.service.AnalyticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "2026-11") String monthYear) {
        return ResponseEntity.ok(analyticsService.generateMonthlySummary(userId, monthYear));
    }

    @PostMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummaryPost(@RequestBody Map<String, Object> payload) {
        Long userId = payload.get("userId") != null ? Long.parseLong(payload.get("userId").toString()) : 1L;
        String monthYear = payload.get("monthYear") != null ? payload.get("monthYear").toString() : "2026-11";
        BigDecimal budgetLimit = payload.get("budgetLimit") != null
                ? new BigDecimal(payload.get("budgetLimit").toString())
                : new BigDecimal("25000.00");
        List<Map<String, Object>> expenses = extractExpenses(payload.get("expenses"));
        return ResponseEntity.ok(analyticsService.generateMonthlySummary(userId, monthYear, budgetLimit, expenses));
    }

    @GetMapping(value = "/export-csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "2026-11") String monthYear) {
        String csvContent = analyticsService.generateCSVReport(userId, monthYear);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ExpenseSync_Analytics_" + monthYear + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }

    @PostMapping(value = "/export-csv", produces = "text/csv")
    public ResponseEntity<String> exportCsvPost(@RequestBody Map<String, Object> payload) {
        Long userId = payload.get("userId") != null ? Long.parseLong(payload.get("userId").toString()) : 1L;
        String monthYear = payload.get("monthYear") != null ? payload.get("monthYear").toString() : "2026-11";
        List<Map<String, Object>> expenses = extractExpenses(payload.get("expenses"));
        String csvContent = analyticsService.generateCSVReport(userId, monthYear, expenses);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ExpenseSync_Analytics_" + monthYear + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractExpenses(Object obj) {
        if (obj instanceof List<?> list) {
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    result.add((Map<String, Object>) m);
                }
            }
            return result;
        }
        return Collections.emptyList();
    }
}
