package com.expensesync.api.repository;

import com.expensesync.api.model.dto.ExpenseResponseDTO;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class InMemoryExpenseRepository {

    private final Map<Long, ExpenseResponseDTO> storage = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(100);

    public InMemoryExpenseRepository() {
        seedInitialData();
    }

    private void seedInitialData() {
        save(createMock(1L, "Monthly Apartment Rent", new BigDecimal("9500.00"), "RENT", 1L, "Rahul Sharma", null, null, LocalDate.now().minusDays(10), "BANK", true));
        save(createMock(2L, "Swiggy Dinner Order", new BigDecimal("1450.00"), "FOOD", 1L, "Rahul Sharma", null, null, LocalDate.now().minusDays(8), "UPI", false));
        save(createMock(3L, "Uber Airport Drop", new BigDecimal("850.00"), "TRAVEL", 1L, "Rahul Sharma", 1L, "Goa Trip 2026", LocalDate.now().minusDays(6), "CARD", false));
        save(createMock(4L, "Goa Beach Villa (2 Nights)", new BigDecimal("16000.00"), "RENT", 2L, "Priya Nair", 1L, "Goa Trip 2026", LocalDate.now().minusDays(5), "CARD", false));
        save(createMock(5L, "Fisherman Wharf Seafood", new BigDecimal("4500.00"), "FOOD", 2L, "Priya Nair", 1L, "Goa Trip 2026", LocalDate.now().minusDays(4), "UPI", false));
        save(createMock(6L, "Water Sports & Scuba Pack", new BigDecimal("6000.00"), "ENTERTAINMENT", 3L, "Amit Patel", 1L, "Goa Trip 2026", LocalDate.now().minusDays(3), "CASH", false));
        save(createMock(7L, "Airtel Fiber Broadband", new BigDecimal("999.00"), "BILLS", 1L, "Rahul Sharma", null, null, LocalDate.now().minusDays(2), "UPI", true));
        save(createMock(8L, "D-Mart Cleaning Supplies", new BigDecimal("1200.00"), "SHOPPING", 3L, "Amit Patel", 2L, "Flatmates B-302", LocalDate.now().minusDays(1), "CARD", false));
    }

    private ExpenseResponseDTO createMock(Long id, String title, BigDecimal amount, String category,
                                          Long paidBy, String paidByName, Long groupId, String groupName,
                                          LocalDate date, String paymentMethod, boolean isRecurring) {
        ExpenseResponseDTO exp = new ExpenseResponseDTO();
        exp.setId(id);
        exp.setTitle(title);
        exp.setAmount(amount);
        exp.setCategory(category);
        exp.setPaidBy(paidBy);
        exp.setPaidByName(paidByName);
        exp.setGroupId(groupId);
        exp.setGroupName(groupName);
        exp.setDate(date);
        exp.setPaymentMethod(paymentMethod);
        exp.setRecurring(isRecurring);
        exp.setCreatedAt(LocalDateTime.now().minusDays(1));
        return exp;
    }

    public List<ExpenseResponseDTO> findAll() {
        return new ArrayList<>(storage.values()).stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }

    public Optional<ExpenseResponseDTO> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    public ExpenseResponseDTO save(ExpenseResponseDTO expense) {
        if (expense.getId() == null) {
            expense.setId(idGenerator.incrementAndGet());
            expense.setCreatedAt(LocalDateTime.now());
        }
        storage.put(expense.getId(), expense);
        return expense;
    }

    public boolean deleteById(Long id) {
        return storage.remove(id) != null;
    }

    public List<ExpenseResponseDTO> findByGroupId(Long groupId) {
        return storage.values().stream()
                .filter(e -> groupId.equals(e.getGroupId()))
                .collect(Collectors.toList());
    }
}
