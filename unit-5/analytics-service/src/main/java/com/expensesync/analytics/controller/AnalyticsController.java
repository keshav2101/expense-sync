package com.expensesync.analytics.controller;

import com.expensesync.analytics.service.AnalyticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
}

