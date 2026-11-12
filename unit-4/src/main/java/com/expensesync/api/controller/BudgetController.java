package com.expensesync.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    private final Map<String, BigDecimal> categoryBudgets = new HashMap<>();

    public BudgetController() {
        categoryBudgets.put("OVERALL", new BigDecimal("30000.00"));
        categoryBudgets.put("FOOD", new BigDecimal("5000.00"));
        categoryBudgets.put("RENT", new BigDecimal("12000.00"));
        categoryBudgets.put("TRAVEL", new BigDecimal("4000.00"));
        categoryBudgets.put("SHOPPING", new BigDecimal("3000.00"));
        categoryBudgets.put("BILLS", new BigDecimal("3000.00"));
        categoryBudgets.put("ENTERTAINMENT", new BigDecimal("2000.00"));
        categoryBudgets.put("HEALTH", new BigDecimal("2000.00"));
        categoryBudgets.put("OTHER", new BigDecimal("2000.00"));
    }

    @GetMapping
    public ResponseEntity<Map<String, BigDecimal>> getBudgets() {
        return ResponseEntity.ok(categoryBudgets);
    }

    @PutMapping("/{category}")
    public ResponseEntity<Map<String, BigDecimal>> updateBudget(
            @PathVariable String category,
            @RequestParam BigDecimal limit) {
        categoryBudgets.put(category.toUpperCase(), limit);
        return ResponseEntity.ok(categoryBudgets);
    }
}

