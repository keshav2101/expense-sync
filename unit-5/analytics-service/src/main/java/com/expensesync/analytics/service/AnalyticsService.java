package com.expensesync.analytics.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AnalyticsService {

    private final Map<Long, List<Map<String, Object>>> userExpensesCache = new ConcurrentHashMap<>();
    private final Map<Long, BigDecimal> userBudgetCache = new ConcurrentHashMap<>();

    public Map<String, Object> generateMonthlySummary(Long userId, String monthYear) {
        List<Map<String, Object>> expenses = userExpensesCache.getOrDefault(userId, Collections.emptyList());
        BigDecimal budgetLimit = userBudgetCache.getOrDefault(userId, new BigDecimal("25000.00"));
        return generateMonthlySummary(userId, monthYear, budgetLimit, expenses);
    }

    public Map<String, Object> generateMonthlySummary(Long userId, String monthYear, BigDecimal budgetLimit, List<Map<String, Object>> expenses) {
        if (userId != null && expenses != null) {
            userExpensesCache.put(userId, expenses);
            if (budgetLimit != null) {
                userBudgetCache.put(userId, budgetLimit);
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("serviceName", "ExpenseSync Analytics Microservice v1.0");
        report.put("userId", userId);
        report.put("monthYear", monthYear);
        report.put("generatedAt", new Date().toString());

        BigDecimal totalMonthlySpent = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryBreakdown = new LinkedHashMap<>();

        if (expenses != null) {
            for (Map<String, Object> exp : expenses) {
                if (exp == null) continue;
                BigDecimal amount = BigDecimal.ZERO;
                Object amtObj = exp.get("amount");
                if (amtObj != null) {
                    try {
                        amount = new BigDecimal(amtObj.toString());
                    } catch (NumberFormatException ignored) {}
                }
                totalMonthlySpent = totalMonthlySpent.add(amount);

                String category = "OTHER";
                if (exp.get("category") != null) {
                    category = exp.get("category").toString().toUpperCase();
                }
                categoryBreakdown.put(category, categoryBreakdown.getOrDefault(category, BigDecimal.ZERO).add(amount));
            }
        }

        totalMonthlySpent = totalMonthlySpent.setScale(2, RoundingMode.HALF_UP);
        report.put("totalMonthlySpent", totalMonthlySpent);

        BigDecimal effectiveBudget = (budgetLimit != null && budgetLimit.compareTo(BigDecimal.ZERO) > 0)
                ? budgetLimit : new BigDecimal("25000.00");
        report.put("budgetLimit", effectiveBudget);

        double budgetUsedPercentage = 0.0;
        if (effectiveBudget.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsedPercentage = totalMonthlySpent
                    .divide(effectiveBudget, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        report.put("budgetUsedPercentage", budgetUsedPercentage);

        boolean overspendWarning = budgetUsedPercentage >= 100.0;
        report.put("overspendWarning", overspendWarning);
        report.put("categoryBreakdown", categoryBreakdown);

        List<String> insights = new ArrayList<>();
        if (expenses == null || expenses.isEmpty()) {
            insights.add("No expenses recorded for " + monthYear + ".");
        } else {
            insights.add("Total spending for " + monthYear + " is ₹" + totalMonthlySpent + ".");

            String topCategory = null;
            BigDecimal topAmount = BigDecimal.ZERO;
            for (Map.Entry<String, BigDecimal> entry : categoryBreakdown.entrySet()) {
                if (entry.getValue().compareTo(topAmount) > 0) {
                    topAmount = entry.getValue();
                    topCategory = entry.getKey();
                }
            }
            if (topCategory != null) {
                double topPercent = totalMonthlySpent.compareTo(BigDecimal.ZERO) > 0
                        ? topAmount.divide(totalMonthlySpent, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(1, RoundingMode.HALF_UP)
                                .doubleValue()
                        : 0.0;
                insights.add(topCategory + " is your largest expense category (₹" + topAmount.setScale(2, RoundingMode.HALF_UP) + ", " + topPercent + "% of spending).");
            }

            if (overspendWarning) {
                insights.add("ALERT: Monthly budget exceeded! (" + budgetUsedPercentage + "% of budget limit ₹" + effectiveBudget + " used).");
            } else if (budgetUsedPercentage >= 80.0) {
                insights.add("Warning: You have utilized " + budgetUsedPercentage + "% of your monthly budget limit (₹" + effectiveBudget + ").");
            } else {
                insights.add("You are well within your monthly budget (" + budgetUsedPercentage + "% used).");
            }
        }
        report.put("insights", insights);

        return report;
    }

    public String generateCSVReport(Long userId, String monthYear) {
        List<Map<String, Object>> expenses = userExpensesCache.getOrDefault(userId, Collections.emptyList());
        return generateCSVReport(userId, monthYear, expenses);
    }

    public String generateCSVReport(Long userId, String monthYear, List<Map<String, Object>> expenses) {
        if (userId != null && expenses != null) {
            userExpensesCache.put(userId, expenses);
        }

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
                        BigDecimal amt = new BigDecimal(exp.get("amount").toString()).setScale(2, RoundingMode.HALF_UP);
                        amountStr = amt.toString();
                    } catch (Exception ignored) {}
                }
                String paymentMethod = exp.get("paymentMethod") != null ? exp.get("paymentMethod").toString() : "UPI";
                String status = exp.get("status") != null ? exp.get("status").toString() : "PAID";

                csv.append(date).append(",")
                   .append(category).append(",")
                   .append(desc.replace(",", " ")).append(",")
                   .append(amountStr).append(",")
                   .append(paymentMethod).append(",")
                   .append(status).append("\n");
            }
        }
        return csv.toString();
    }
}
