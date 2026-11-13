package com.expensesync.core.controller;

import com.expensesync.core.entity.Budget;
import com.expensesync.core.entity.Category;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.BudgetRepository;
import com.expensesync.core.repository.CategoryRepository;
import com.expensesync.core.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public BudgetController(BudgetRepository budgetRepository,
                            CategoryRepository categoryRepository,
                            UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBudgets(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String monthYear) {
        Long userId = (user != null) ? user.getId() : 1L;
        String targetMonth = (monthYear != null && !monthYear.trim().isEmpty())
                ? monthYear.trim()
                : LocalDate.now().toString().substring(0, 7);

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(userId, targetMonth);
        Map<String, Object> result = new LinkedHashMap<>();

        if (budgets.isEmpty()) {
            result.put("OVERALL", 30000.0);
            result.put("FOOD", 5000.0);
            result.put("RENT", 12000.0);
            result.put("TRAVEL", 4000.0);
            result.put("SHOPPING", 3000.0);
            result.put("BILLS", 3000.0);
            result.put("ENTERTAINMENT", 2000.0);
            result.put("HEALTH", 2000.0);
            result.put("OTHER", 2000.0);
            return ResponseEntity.ok(result);
        }

        BigDecimal sum = BigDecimal.ZERO;
        for (Budget b : budgets) {
            String cat = b.getCategory().getName();
            BigDecimal limit = b.getMonthlyLimit();
            result.put(cat, limit.doubleValue());
            sum = sum.add(limit);
        }
        result.put("OVERALL", sum.doubleValue());

        return ResponseEntity.ok(result);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateBudgets(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload,
            @RequestParam(required = false) String monthYear) {
        Long userId = (user != null) ? user.getId() : 1L;
        User currentUser = (user != null) ? user : userRepository.findById(userId).orElse(null);
        String targetMonth = (monthYear != null && !monthYear.trim().isEmpty())
                ? monthYear.trim()
                : LocalDate.now().toString().substring(0, 7);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            String catName = entry.getKey().toUpperCase();
            if ("OVERALL".equalsIgnoreCase(catName)) continue;

            try {
                BigDecimal limit = new BigDecimal(entry.getValue().toString());
                Category cat = categoryRepository.findByName(catName)
                        .orElseGet(() -> categoryRepository.save(new Category(catName, "📁", false)));

                Optional<Budget> existingOpt = budgetRepository.findByUserIdAndCategoryIdAndMonthYear(userId, cat.getId(), targetMonth);
                Budget budget = existingOpt.orElse(new Budget());
                budget.setUser(currentUser);
                budget.setCategory(cat);
                budget.setMonthlyLimit(limit);
                budget.setMonthYear(targetMonth);
                budgetRepository.save(budget);
            } catch (Exception e) {
                // ignore invalid entry
            }
        }

        return getBudgets(user, targetMonth);
    }
}
