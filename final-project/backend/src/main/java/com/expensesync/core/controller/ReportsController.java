package com.expensesync.core.controller;

import com.expensesync.core.dto.DebtSimplificationDTO;
import com.expensesync.core.dto.GroupResponseDTO;
import com.expensesync.core.entity.Budget;
import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.BudgetRepository;
import com.expensesync.core.repository.ExpenseRepository;
import com.expensesync.core.repository.UserRepository;
import com.expensesync.core.service.AnalyticsClientService;
import com.expensesync.core.service.GroupService;
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
    private final GroupService groupService;
    private final UserRepository userRepository;

    public ReportsController(AnalyticsClientService analyticsClientService,
                             ExpenseRepository expenseRepository,
                             BudgetRepository budgetRepository,
                             GroupService groupService,
                             UserRepository userRepository) {
        this.analyticsClientService = analyticsClientService;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.groupService = groupService;
        this.userRepository = userRepository;
    }

    /**
     * Dashboard Summary Endpoint
     * Returns live aggregated data for Dashboard view:
     * - totalMonthlySpent
     * - categoryTotals
     * - youOwe & youAreOwed across all groups
     * - monthly budget limits
     * - recent expenses
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String monthYear) {
        Long targetUser = (user != null) ? user.getId() : (userId != null ? userId : 1L);
        User currentUser = (user != null) ? user : userRepository.findById(targetUser).orElse(null);
        String targetMonth = (monthYear != null && !monthYear.trim().isEmpty())
                ? monthYear.trim()
                : LocalDate.now().toString().substring(0, 7);

        List<Expense> userExpenses = expenseRepository.findByPaidByIdOrderByExpenseDateDesc(targetUser);

        BigDecimal totalMonthlySpent = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryTotals = new LinkedHashMap<>();

        for (Expense exp : userExpenses) {
            if (exp.getExpenseDate() != null) {
                String expMonth = exp.getExpenseDate().toString().substring(0, 7);
                if (!expMonth.equals(targetMonth)) {
                    continue;
                }
            }
            BigDecimal amt = exp.getAmount();
            totalMonthlySpent = totalMonthlySpent.add(amt);
            String cat = exp.getCategory() != null ? exp.getCategory().getName() : "OTHER";
            categoryTotals.put(cat, categoryTotals.getOrDefault(cat, BigDecimal.ZERO).add(amt));
        }

        // Calculate youOwe and youAreOwed from real group simplified debts
        BigDecimal youOwe = BigDecimal.ZERO;
        BigDecimal youAreOwed = BigDecimal.ZERO;
        String oweSubtext = "No active debts";
        String owedSubtext = "All settled up";

        if (currentUser != null) {
            List<GroupResponseDTO> groups = groupService.getGroupsForUser(currentUser);
            for (GroupResponseDTO g : groups) {
                if (g.getSimplifiedDebts() != null) {
                    for (DebtSimplificationDTO debt : g.getSimplifiedDebts()) {
                        if (debt.getFromUserId() != null && debt.getFromUserId().equals(targetUser)) {
                            youOwe = youOwe.add(debt.getAmount());
                            oweSubtext = "To " + (debt.getToUserName() != null ? debt.getToUserName() : "member") + " (" + g.getName() + ")";
                        } else if (debt.getToUserId() != null && debt.getToUserId().equals(targetUser)) {
                            youAreOwed = youAreOwed.add(debt.getAmount());
                            owedSubtext = "From " + (debt.getFromUserName() != null ? debt.getFromUserName() : "member") + " (" + g.getName() + ")";
                        }
                    }
                }
            }
        }

        // Fetch user budgets
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(targetUser, targetMonth);
        Map<String, Double> budgetMap = new LinkedHashMap<>();
        if (budgets.isEmpty()) {
            budgetMap.put("OVERALL", 30000.0);
            budgetMap.put("FOOD", 5000.0);
            budgetMap.put("RENT", 12000.0);
            budgetMap.put("TRAVEL", 4000.0);
            budgetMap.put("SHOPPING", 3000.0);
            budgetMap.put("BILLS", 3000.0);
            budgetMap.put("ENTERTAINMENT", 2000.0);
            budgetMap.put("HEALTH", 2000.0);
            budgetMap.put("OTHER", 2000.0);
        } else {
            BigDecimal sum = BigDecimal.ZERO;
            for (Budget b : budgets) {
                budgetMap.put(b.getCategory().getName(), b.getMonthlyLimit().doubleValue());
                sum = sum.add(b.getMonthlyLimit());
            }
            budgetMap.put("OVERALL", sum.doubleValue());
        }

        // Recent 5 expenses
        List<Map<String, Object>> recentExpenses = new ArrayList<>();
        int count = 0;
        for (Expense exp : userExpenses) {
            if (count++ >= 5) break;
            Map<String, Object> m = new HashMap<>();
            m.put("id", exp.getId());
            m.put("date", exp.getExpenseDate() != null ? exp.getExpenseDate().toString() : "");
            m.put("title", exp.getTitle());
            m.put("category", exp.getCategory() != null ? exp.getCategory().getName() : "OTHER");
            m.put("paymentMethod", exp.getPaymentMethod() != null ? exp.getPaymentMethod() : "UPI");
            m.put("amount", exp.getAmount());
            m.put("groupId", exp.getGroup() != null ? exp.getGroup().getId() : null);
            recentExpenses.add(m);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalMonthlySpent", totalMonthlySpent);
        response.put("categoryTotals", categoryTotals);
        response.put("youOwe", youOwe);
        response.put("youAreOwed", youAreOwed);
        response.put("oweSubtext", oweSubtext);
        response.put("owedSubtext", owedSubtext);
        response.put("budgets", budgetMap);
        response.put("transactionCount", userExpenses.size());
        response.put("recentExpenses", recentExpenses);

        return ResponseEntity.ok(response);
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
