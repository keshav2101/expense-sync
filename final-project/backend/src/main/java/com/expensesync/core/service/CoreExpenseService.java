package com.expensesync.core.service;

import com.expensesync.core.dto.SplitDetailDTO;
import com.expensesync.core.entity.*;
import com.expensesync.core.repository.*;
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
    private final UserRepository userRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SplitCalculationService splitCalculationService;

    public CoreExpenseService(ExpenseRepository expenseRepository,
                              CategoryRepository categoryRepository,
                              GroupRepository groupRepository,
                              UserRepository userRepository,
                              ExpenseSplitRepository expenseSplitRepository,
                              SplitCalculationService splitCalculationService) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.splitCalculationService = splitCalculationService;
    }

    public List<Expense> getExpensesForUser(User user) {
        return expenseRepository.findAllRelevantExpenses(user.getId());
    }

    public Expense createExpense(String title, BigDecimal amount, String categoryName,
                                 User paidBy, Long groupId, LocalDate date,
                                 String paymentMethod, String notes, boolean isRecurring) {
        return createExpenseWithSplits(title, amount, categoryName, paidBy, groupId, date, paymentMethod, notes, isRecurring, null, null);
    }

    public Expense createExpenseWithSplits(String title, BigDecimal amount, String categoryName,
                                           User paidBy, Long groupId, LocalDate date,
                                           String paymentMethod, String notes, boolean isRecurring,
                                           String splitType, List<SplitDetailDTO> splits) {
        Category category = categoryRepository.findByName(categoryName.toUpperCase())
                .orElseGet(() -> categoryRepository.save(new Category(categoryName.toUpperCase(), "📁", false)));

        Expense exp = new Expense();
        exp.setTitle(title);
        exp.setAmount(amount);
        exp.setCategory(category);
        exp.setPaidBy(paidBy);

        Group group = null;
        if (groupId != null) {
            group = groupRepository.findById(groupId).orElse(null);
            exp.setGroup(group);
        }

        exp.setExpenseDate(date != null ? date : LocalDate.now());
        exp.setPaymentMethod(paymentMethod != null ? paymentMethod : "UPI");
        exp.setNotes(notes);
        exp.setIsRecurring(isRecurring);

        Expense saved = expenseRepository.save(exp);

        if (group != null) {
            List<SplitDetailDTO> calculatedSplits = new ArrayList<>();
            String type = splitType != null ? splitType.toUpperCase() : "EQUAL";

            if (splits != null && !splits.isEmpty()) {
                calculatedSplits = splitCalculationService.calculateSplits(amount, type, splits);
            } else {
                List<SplitDetailDTO> inputs = new ArrayList<>();
                for (User m : group.getMembers()) {
                    SplitDetailDTO s = new SplitDetailDTO();
                    s.setUserId(m.getId());
                    s.setUserName(m.getName());
                    inputs.add(s);
                }
                if (!inputs.isEmpty()) {
                    calculatedSplits = splitCalculationService.calculateSplits(amount, "EQUAL", inputs);
                }
            }

            for (SplitDetailDTO splitDto : calculatedSplits) {
                User member = userRepository.findById(splitDto.getUserId()).orElse(null);
                if (member != null) {
                    ExpenseSplit splitEntity = new ExpenseSplit();
                    splitEntity.setExpense(saved);
                    splitEntity.setUser(member);
                    splitEntity.setSplitType(type);
                    splitEntity.setShareAmount(splitDto.getShareAmount());
                    splitEntity.setPercentage(splitDto.getPercentage());
                    splitEntity.setShares(splitDto.getShares());
                    expenseSplitRepository.save(splitEntity);
                    saved.getSplits().add(splitEntity);
                }
            }
        }

        return saved;
    }

    public void deleteExpense(Long id, User currentUser) {
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        expenseRepository.delete(exp);
    }
}
