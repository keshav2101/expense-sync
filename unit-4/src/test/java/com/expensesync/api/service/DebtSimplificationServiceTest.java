package com.expensesync.api.service;

import com.expensesync.api.model.dto.DebtSimplificationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Greedy Min-Cash-Flow Debt Simplification Algorithm Unit Tests")
public class DebtSimplificationServiceTest {

    private DebtSimplificationService debtSimplificationService;
    private Map<Long, String> userNames;

    @BeforeEach
    void setUp() {
        debtSimplificationService = new DebtSimplificationService();
        userNames = new HashMap<>();
        userNames.put(1L, "Rahul");
        userNames.put(2L, "Priya");
        userNames.put(3L, "Amit");
        userNames.put(4L, "Sneha");
    }

    @Test
    @DisplayName("Test 1: Simple Chain Debt (A -> B 100, B -> C 100 becomes A -> C 100)")
    void testSimpleChainDebt() {
        // Rahul owes 100 (-100), Priya is net 0, Amit gets back 100 (+100)
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        netBalances.put(1L, new BigDecimal("-100.00"));
        netBalances.put(2L, BigDecimal.ZERO);
        netBalances.put(3L, new BigDecimal("100.00"));

        List<DebtSimplificationDTO> result = debtSimplificationService.simplifyDebts(netBalances, userNames);

        assertEquals(1, result.size(), "Should reduce chain to exactly 1 transaction");
        DebtSimplificationDTO tx = result.get(0);
        assertEquals(1L, tx.getFromUserId());
        assertEquals("Rahul", tx.getFromUserName());
        assertEquals(3L, tx.getToUserId());
        assertEquals("Amit", tx.getToUserName());
        assertEquals(new BigDecimal("100.00"), tx.getAmount());
    }

    @Test
    @DisplayName("Test 2: Circular Debts (A owes B, B owes C, C owes A - all net zero)")
    void testCircularDebtsAllZero() {
        // In circular debt where everyone paid equal amounts in a cycle, net balances are all zero
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        netBalances.put(1L, BigDecimal.ZERO);
        netBalances.put(2L, BigDecimal.ZERO);
        netBalances.put(3L, BigDecimal.ZERO);

        List<DebtSimplificationDTO> result = debtSimplificationService.simplifyDebts(netBalances, userNames);

        assertTrue(result.isEmpty(), "Zero net balances should produce zero settlement transactions");
    }

    @Test
    @DisplayName("Test 3: Uneven Splits & Multiple Creditors/Debtors")
    void testUnevenSplits() {
        // Rahul owes 300, Amit owes 200, Priya gets 400, Sneha gets 100
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        netBalances.put(1L, new BigDecimal("-300.00"));
        netBalances.put(3L, new BigDecimal("-200.00"));
        netBalances.put(2L, new BigDecimal("400.00"));
        netBalances.put(4L, new BigDecimal("100.00"));

        List<DebtSimplificationDTO> result = debtSimplificationService.simplifyDebts(netBalances, userNames);

        // Sum of all settled amounts must equal total debts (500)
        BigDecimal totalSettled = result.stream()
                .map(DebtSimplificationDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(new BigDecimal("500.00"), totalSettled);
        assertTrue(result.size() <= 3, "Max transactions should be at most N - 1 (3)");
    }

    @Test
    @DisplayName("Test 4: Fractional Rounding (Paise/Cents Precision)")
    void testFractionalRoundingPrecision() {
        // Rahul owes 33.33, Amit owes 33.33, Priya gets 66.66
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        netBalances.put(1L, new BigDecimal("-33.33"));
        netBalances.put(3L, new BigDecimal("-33.33"));
        netBalances.put(2L, new BigDecimal("66.66"));

        List<DebtSimplificationDTO> result = debtSimplificationService.simplifyDebts(netBalances, userNames);

        assertEquals(2, result.size());
        BigDecimal totalSettled = result.stream()
                .map(DebtSimplificationDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("66.66"), totalSettled);
    }

    @Test
    @DisplayName("Test 5: Zero Balances Edge Case")
    void testZeroBalances() {
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        netBalances.put(1L, new BigDecimal("0.00"));
        netBalances.put(2L, new BigDecimal("0.000"));

        List<DebtSimplificationDTO> result = debtSimplificationService.simplifyDebts(netBalances, userNames);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("Test 6: Member who left the group with 0 balance")
    void testMemberWhoLeftGroupWithZeroBalance() {
        // Sneha left group and has 0 balance, Rahul owes 500, Priya gets 500
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        netBalances.put(1L, new BigDecimal("-500.00"));
        netBalances.put(2L, new BigDecimal("500.00"));
        netBalances.put(4L, BigDecimal.ZERO); // Left group

        List<DebtSimplificationDTO> result = debtSimplificationService.simplifyDebts(netBalances, userNames);

        assertEquals(1, result.size());
        assertEquals("Rahul", result.get(0).getFromUserName());
        assertEquals("Priya", result.get(0).getToUserName());
        assertEquals(new BigDecimal("500.00"), result.get(0).getAmount());
    }
}

