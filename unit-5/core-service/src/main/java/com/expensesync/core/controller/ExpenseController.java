package com.expensesync.core.controller;

import com.expensesync.core.dto.SplitDetailDTO;
import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.ExpenseSplit;
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

            List<Map<String, Object>> splitsList = new ArrayList<>();
            if (exp.getSplits() != null) {
                for (ExpenseSplit sp : exp.getSplits()) {
                    Map<String, Object> spMap = new HashMap<>();
                    spMap.put("userId", sp.getUser().getId());
                    spMap.put("userName", sp.getUser().getName());
                    spMap.put("shareAmount", sp.getShareAmount());
                    spMap.put("splitType", sp.getSplitType());
                    spMap.put("percentage", sp.getPercentage());
                    spMap.put("shares", sp.getShares());
                    splitsList.add(spMap);
                }
            }
            map.put("splits", splitsList);

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
        String splitType = (String) payload.get("splitType");

        List<SplitDetailDTO> splitDTOs = new ArrayList<>();
        if (payload.get("splits") instanceof List<?> list) {
            for (Object obj : list) {
                if (obj instanceof Map<?, ?> sm) {
                    SplitDetailDTO s = new SplitDetailDTO();
                    if (sm.get("userId") != null) s.setUserId(Long.parseLong(sm.get("userId").toString()));
                    if (sm.get("userName") != null) s.setUserName(sm.get("userName").toString());
                    if (sm.get("shareAmount") != null) s.setShareAmount(new BigDecimal(sm.get("shareAmount").toString()));
                    if (sm.get("percentage") != null) s.setPercentage(new BigDecimal(sm.get("percentage").toString()));
                    if (sm.get("shares") != null) s.setShares(Integer.parseInt(sm.get("shares").toString()));
                    splitDTOs.add(s);
                }
            }
        }

        Expense saved = expenseService.createExpenseWithSplits(
                title, amount, category, user, groupId, date, method, notes, recurring, splitType, splitDTOs
        );

        Map<String, Object> map = new HashMap<>();
        map.put("id", saved.getId());
        map.put("title", saved.getTitle());
        map.put("amount", saved.getAmount());
        map.put("category", saved.getCategory().getName());
        map.put("groupId", saved.getGroup() != null ? saved.getGroup().getId() : null);
        map.put("splitCount", saved.getSplits() != null ? saved.getSplits().size() : 0);
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload) {
        String title = (String) payload.get("title");
        BigDecimal amount = payload.get("amount") != null ? new BigDecimal(payload.get("amount").toString()) : null;
        String category = (String) payload.get("category");
        LocalDate date = payload.get("date") != null ? LocalDate.parse(payload.get("date").toString()) : null;
        String method = (String) payload.get("paymentMethod");
        String notes = (String) payload.get("notes");
        boolean recurring = payload.get("isRecurring") != null && Boolean.parseBoolean(payload.get("isRecurring").toString());

        Expense updated = expenseService.updateExpense(id, title, amount, category, date, method, notes, recurring, user);

        Map<String, Object> map = new HashMap<>();
        map.put("id", updated.getId());
        map.put("title", updated.getTitle());
        map.put("amount", updated.getAmount());
        map.put("category", updated.getCategory().getName());
        map.put("date", updated.getExpenseDate());
        map.put("paymentMethod", updated.getPaymentMethod());
        map.put("notes", updated.getNotes());
        map.put("isRecurring", updated.getIsRecurring());
        return ResponseEntity.ok(map);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, @AuthenticationPrincipal User user) {
        expenseService.deleteExpense(id, user);
        return ResponseEntity.noContent().build();
    }
}
