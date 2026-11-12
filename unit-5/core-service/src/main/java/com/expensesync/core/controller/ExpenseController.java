package com.expensesync.core.controller;

import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.User;
import com.expensesync.core.service.CoreExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final CoreExpenseService expenseService;

    public ExpenseController(CoreExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getExpenses(@AuthenticationPrincipal User user) {
        List<Expense> expenses = expenseService.getExpensesForUser(user);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Expense exp : expenses) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", exp.getId());
            map.put("title", exp.getTitle());
            map.put("amount", exp.getAmount());
            map.put("category", exp.getCategory().getName());
            map.put("paidBy", exp.getPaidBy().getId());
            map.put("paidByName", exp.getPaidBy().getName());
            map.put("groupId", exp.getGroup() != null ? exp.getGroup().getId() : null);
            map.put("groupName", exp.getGroup() != null ? exp.getGroup().getName() : null);
            map.put("date", exp.getExpenseDate());
            map.put("paymentMethod", exp.getPaymentMethod());
            map.put("notes", exp.getNotes());
            map.put("isRecurring", exp.getIsRecurring());
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createExpense(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload) {
        String title = (String) payload.get("title");
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String category = (String) payload.getOrDefault("category", "OTHER");
        Long groupId = payload.get("groupId") != null && !payload.get("groupId").toString().isEmpty()
                ? Long.parseLong(payload.get("groupId").toString()) : null;
        LocalDate date = payload.get("date") != null
                ? LocalDate.parse(payload.get("date").toString()) : LocalDate.now();
        String method = (String) payload.getOrDefault("paymentMethod", "UPI");
        String notes = (String) payload.get("notes");
        boolean recurring = payload.get("isRecurring") != null && Boolean.parseBoolean(payload.get("isRecurring").toString());

        Expense saved = expenseService.createExpense(title, amount, category, user, groupId, date, method, notes, recurring);

        Map<String, Object> map = new HashMap<>();
        map.put("id", saved.getId());
        map.put("title", saved.getTitle());
        map.put("amount", saved.getAmount());
        map.put("category", saved.getCategory().getName());
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, @AuthenticationPrincipal User user) {
        expenseService.deleteExpense(id, user);
        return ResponseEntity.noContent().build();
    }
}

