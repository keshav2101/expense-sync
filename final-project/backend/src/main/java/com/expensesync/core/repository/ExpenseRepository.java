package com.expensesync.core.repository;

import com.expensesync.core.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByPaidByIdOrderByExpenseDateDesc(Long userId);

    List<Expense> findByGroupIdOrderByExpenseDateDesc(Long groupId);

    @Query("SELECT e FROM Expense e WHERE (e.paidBy.id = :userId OR e.group.id IN " +
           "(SELECT g.id FROM Group g JOIN g.members m WHERE m.id = :userId)) " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> findAllRelevantExpenses(@Param("userId") Long userId);

    @Query("SELECT e.category.name, SUM(e.amount) FROM Expense e " +
           "WHERE e.paidBy.id = :userId AND e.expenseDate BETWEEN :start AND :end " +
           "GROUP BY e.category.name")
    List<Object[]> getCategorySpendingBetween(@Param("userId") Long userId,
                                             @Param("start") LocalDate start,
                                             @Param("end") LocalDate end);
}

