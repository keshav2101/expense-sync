package com.expensesync.core.repository;

import com.expensesync.core.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndMonthYear(Long userId, String monthYear);
    Optional<Budget> findByUserIdAndCategoryIdAndMonthYear(Long userId, Long categoryId, String monthYear);
}
