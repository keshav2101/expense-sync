package com.expensesync.core.controller;

import com.expensesync.core.entity.Budget;
import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.BudgetRepository;
import com.expensesync.core.repository.ExpenseRepository;
import com.expensesync.core.service.AnalyticsClientService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final AnalyticsClientService analyticsClientService;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public ReportsController(AnalyticsClientService analyticsClientService,
                             ExpenseRepository expenseRepository,
                             BudgetRepository budgetRepository) {
        this.analyticsClientService = analyticsClientService;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    /**
     * Inter-Service Microservice Call
     * Frontend -> Core Service (8080) -> Analytics Microservice (8082)
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getMonthlyAnalytics(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String monthYear,
            @RequestParam(required = false, defaultValue = "false") Boolean includeGroup) {
        Long targetUser = (user != null) ? user.getId() : (userId != null ? userId : 1L);
        String targetMonth = (monthYear != null && !monthYear.trim().isEmpty())
                ? monthYear.trim()
                : LocalDate.now().toString().substring(0, 7);

        List<Map<String, Object>> expenses = getExpensesPayload(targetUser, targetMonth, includeGroup);
        BigDecimal budgetLimit = calculateBudgetLimit(targetUser, targetMonth);

        Map<String, Object> data = analyticsClientService.fetchMonthlyAnalytics(targetUser, targetMonth, budgetLimit, expenses);
        return ResponseEntity.ok(data);
    }

    @GetMapping(value = "/export-csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String monthYear,
            @RequestParam(required = false, defaultValue = "false") Boolean includeGroup) {
        Long targetUser = (user != null) ? user.getId() : (userId != null ? userId : 1L);
        String targetMonth = (monthYear != null && !monthYear.trim().isEmpty())
                ? monthYear.trim()
                : LocalDate.now().toString().substring(0, 7);

        List<Map<String, Object>> expenses = getExpensesPayload(targetUser, targetMonth, includeGroup);
        String csvData = analyticsClientService.fetchCsvReport(targetUser, targetMonth, expenses);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ExpenseSync_Analytics_" + targetMonth + ".csv\"")
                .body(csvData);
    }

    private List<Map<String, Object>> getExpensesPayload(Long userId, String targetMonth, Boolean includeGroup) {
        List<Expense> userExpenses = expenseRepository.findByPaidByIdOrderByExpenseDateDesc(userId);
        List<Map<String, Object>> payload = new ArrayList<>();

        for (Expense exp : userExpenses) {
            if (!Boolean.TRUE.equals(includeGroup) && exp.getGroup() != null) {
                continue; // Personal expenses only
            }
            if (exp.getExpenseDate() != null && !targetMonth.equalsIgnoreCase("all")) {
                String expMonth = exp.getExpenseDate().toString().substring(0, 7);
                if (!expMonth.equals(targetMonth)) {
                    continue; // Skip expenses outside target month
                }
            }

            Map<String, Object> m = new HashMap<>();
            m.put("id", exp.getId());
            m.put("date", exp.getExpenseDate() != null ? exp.getExpenseDate().toString() : "");
            m.put("category", exp.getCategory() != null ? exp.getCategory().getName() : "OTHER");
            m.put("description", exp.getTitle());
            m.put("title", exp.getTitle());
            m.put("amount", exp.getAmount());
            m.put("paymentMethod", exp.getPaymentMethod() != null ? exp.getPaymentMethod() : "UPI");
            m.put("status", "PAID");
            payload.add(m);
        }
        return payload;
    }

    private BigDecimal calculateBudgetLimit(Long userId, String targetMonth) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(userId, targetMonth);
        BigDecimal total = BigDecimal.ZERO;
        for (Budget b : budgets) {
            if (b.getMonthlyLimit() != null) {
                total = total.add(b.getMonthlyLimit());
            }
        }
        return total.compareTo(BigDecimal.ZERO) > 0 ? total : new BigDecimal("25000.00");
    }
}
