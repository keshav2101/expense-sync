package com.expensesync.analytics.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class AnalyticsService {

    public Map<String, Object> generateMonthlySummary(Long userId, String monthYear) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("serviceName", "ExpenseSync Analytics Microservice v1.0");
        report.put("userId", userId);
        report.put("monthYear", monthYear);
        report.put("generatedAt", new Date().toString());

        // Sample calculated aggregates returned to the core service
        report.put("totalMonthlySpent", new BigDecimal("19000.00"));
        report.put("budgetLimit", new BigDecimal("25000.00"));
        report.put("budgetUsedPercentage", 76.0);
        report.put("overspendWarning", false);

        Map<String, BigDecimal> categoryBreakdown = new LinkedHashMap<>();
        categoryBreakdown.put("RENT", new BigDecimal("9500.00"));
        categoryBreakdown.put("FOOD", new BigDecimal("4200.00"));
        categoryBreakdown.put("TRAVEL", new BigDecimal("2100.00"));
        categoryBreakdown.put("BILLS", new BigDecimal("1800.00"));
        categoryBreakdown.put("ENTERTAINMENT", new BigDecimal("1400.00"));
        report.put("categoryBreakdown", categoryBreakdown);

        List<String> insights = Arrays.asList(
                "Food spending is nearing the 80% category limit (₹4,200 / ₹5,000).",
                "Rent remains your largest fixed expense (50.0% of monthly spending).",
                "You saved ₹6,000 compared to last month's budget ceiling."
        );
        report.put("insights", insights);

        return report;
    }

    public String generateCSVReport(Long userId, String monthYear) {
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Category,Description,Amount,PaymentMethod,Status\n");
        csv.append("2026-11-01,RENT,Monthly Flat Rent,9500.00,BANK,PAID\n");
        csv.append("2026-11-03,FOOD,Swiggy Team Lunch,1450.00,UPI,PAID\n");
        csv.append("2026-11-04,TRAVEL,Uber Airport Cab,850.00,CARD,PAID\n");
        csv.append("2026-11-05,BILLS,Airtel Fiber Broadband,999.00,UPI,PAID\n");
        csv.append("2026-11-06,FOOD,Blinkit Grocery Restock,1280.00,UPI,PAID\n");
        return csv.toString();
    }
}
