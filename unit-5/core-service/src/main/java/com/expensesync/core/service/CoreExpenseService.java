package com.expensesync.core.service;

import com.expensesync.core.entity.Category;
import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.Group;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.CategoryRepository;
import com.expensesync.core.repository.ExpenseRepository;
import com.expensesync.core.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class CoreExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final GroupRepository groupRepository;

    public CoreExpenseService(ExpenseRepository expenseRepository,
                              CategoryRepository categoryRepository,
                              GroupRepository groupRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.groupRepository = groupRepository;
    }

    public List<Expense> getExpensesForUser(User user) {
        return expenseRepository.findAllRelevantExpenses(user.getId());
    }

    public Expense createExpense(String title, BigDecimal amount, String categoryName,
                                 User paidBy, Long groupId, LocalDate date,
                                 String paymentMethod, String notes, boolean isRecurring) {
        Category category = categoryRepository.findByName(categoryName.toUpperCase())
                .orElseGet(() -> categoryRepository.save(new Category(categoryName.toUpperCase(), "📁", false)));

        Expense exp = new Expense();
        exp.setTitle(title);
        exp.setAmount(amount);
        exp.setCategory(category);
        exp.setPaidBy(paidBy);

        if (groupId != null) {
            Group group = groupRepository.findById(groupId).orElse(null);
            exp.setGroup(group);
        }

        exp.setExpenseDate(date != null ? date : LocalDate.now());
        exp.setPaymentMethod(paymentMethod != null ? paymentMethod : "UPI");
        exp.setNotes(notes);
        exp.setIsRecurring(isRecurring);

        return expenseRepository.save(exp);
    }

    public void deleteExpense(Long id, User currentUser) {
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        expenseRepository.delete(exp);
    }
}
