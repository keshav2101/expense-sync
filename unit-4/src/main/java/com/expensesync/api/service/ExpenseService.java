package com.expensesync.api.service;

import com.expensesync.api.exception.ResourceNotFoundException;
import com.expensesync.api.model.dto.ExpenseRequestDTO;
import com.expensesync.api.model.dto.ExpenseResponseDTO;
import com.expensesync.api.model.dto.SplitDetailDTO;
import com.expensesync.api.repository.InMemoryExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final InMemoryExpenseRepository expenseRepository;
    private final SplitCalculationService splitCalculationService;

    public ExpenseService(InMemoryExpenseRepository expenseRepository,
                          SplitCalculationService splitCalculationService) {
        this.expenseRepository = expenseRepository;
        this.splitCalculationService = splitCalculationService;
    }

    public List<ExpenseResponseDTO> getAllExpenses(String category, String paymentMethod, String search) {
        return expenseRepository.findAll().stream()
                .filter(e -> category == null || category.equalsIgnoreCase("ALL") || e.getCategory().equalsIgnoreCase(category))
                .filter(e -> paymentMethod == null || paymentMethod.equalsIgnoreCase("ALL") || e.getPaymentMethod().equalsIgnoreCase(paymentMethod))
                .filter(e -> search == null || search.trim().isEmpty() ||
                             e.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                             (e.getNotes() != null && e.getNotes().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
    }

    public ExpenseResponseDTO getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense with ID " + id + " not found"));
    }

    public ExpenseResponseDTO createExpense(ExpenseRequestDTO request) {
        ExpenseResponseDTO exp = new ExpenseResponseDTO();
        exp.setTitle(request.getTitle());
        exp.setAmount(request.getAmount());
        exp.setCategory(request.getCategory());
        exp.setPaidBy(request.getPaidBy());
        exp.setPaidByName("User #" + request.getPaidBy());
        exp.setGroupId(request.getGroupId());
        if (request.getGroupId() != null) {
            exp.setGroupName("Group #" + request.getGroupId());
        }
        exp.setDate(request.getDate());
        exp.setPaymentMethod(request.getPaymentMethod());
        exp.setNotes(request.getNotes());
        exp.setRecurring(request.isRecurring());
        exp.setCreatedAt(LocalDateTime.now());

        // Process splits if present
        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            List<SplitDetailDTO> computedSplits = splitCalculationService.calculateSplits(
                    request.getAmount(),
                    request.getSplitType(),
                    request.getSplits()
            );
            exp.setSplits(computedSplits);
        }

        return expenseRepository.save(exp);
    }

    public ExpenseResponseDTO updateExpense(Long id, ExpenseRequestDTO request) {
        ExpenseResponseDTO existing = getExpenseById(id);
        existing.setTitle(request.getTitle());
        existing.setAmount(request.getAmount());
        existing.setCategory(request.getCategory());
        existing.setDate(request.getDate());
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setNotes(request.getNotes());
        existing.setRecurring(request.isRecurring());

        return expenseRepository.save(existing);
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.deleteById(id)) {
            throw new ResourceNotFoundException("Expense with ID " + id + " not found");
        }
    }
}

