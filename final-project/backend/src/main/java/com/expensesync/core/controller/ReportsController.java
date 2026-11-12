package com.expensesync.core.controller;

import com.expensesync.core.service.AnalyticsClientService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final AnalyticsClientService analyticsClientService;

    public ReportsController(AnalyticsClientService analyticsClientService) {
        this.analyticsClientService = analyticsClientService;
    }

    /**
     * Inter-Service Microservice Call
     * Frontend -> Core Service (8080) -> Analytics Microservice (8082)
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getMonthlyAnalytics(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String monthYear) {
        Long targetUser = userId != null ? userId : 1L;
        String targetMonth = monthYear != null ? monthYear : LocalDate.now().toString().substring(0, 7);

        Map<String, Object> data = analyticsClientService.fetchMonthlyAnalytics(targetUser, targetMonth);
        return ResponseEntity.ok(data);
    }

    @GetMapping(value = "/export-csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String monthYear) {
        Long targetUser = userId != null ? userId : 1L;
        String targetMonth = monthYear != null ? monthYear : LocalDate.now().toString().substring(0, 7);

        String csvData = analyticsClientService.fetchCsvReport(targetUser, targetMonth);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ExpenseSync_Analytics_" + targetMonth + ".csv\"")
                .body(csvData);
    }
}
