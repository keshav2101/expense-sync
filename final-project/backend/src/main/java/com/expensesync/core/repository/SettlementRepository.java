package com.expensesync.core.repository;

import com.expensesync.core.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupIdOrderBySettledAtDesc(Long groupId);
}
