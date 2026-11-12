package com.expensesync.core.service;

import com.expensesync.core.dto.DebtSimplificationDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class DebtSimplificationService {

    private static final BigDecimal EPSILON = new BigDecimal("0.01");

    /**
     * Greedy Min-Cash-Flow Debt Simplification Algorithm
     * Reduces N cross-debts among group members to the minimum number of
     * direct settlement transactions (at most N - 1 transactions).
     *
     * @param netBalances Map of userId -> netBalance (positive = gets back, negative = owes)
     * @param userNames Map of userId -> userName
     * @return List of simplified transactions (From User -> To User : Amount)
     */
    public List<DebtSimplificationDTO> simplifyDebts(Map<Long, BigDecimal> netBalances, Map<Long, String> userNames) {
        List<DebtSimplificationDTO> settlements = new ArrayList<>();
        if (netBalances == null || netBalances.isEmpty()) {
            return settlements;
        }

        Map<Long, BigDecimal> balances = new HashMap<>();
        for (Map.Entry<Long, BigDecimal> entry : netBalances.entrySet()) {
            balances.put(entry.getKey(), entry.getValue().setScale(2, RoundingMode.HALF_UP));
        }

        while (true) {
            Long maxCreditorId = null;
            BigDecimal maxCredit = BigDecimal.ZERO;

            Long maxDebtorId = null;
            BigDecimal maxDebit = BigDecimal.ZERO;

            for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
                BigDecimal bal = entry.getValue();
                if (bal.compareTo(maxCredit) > 0) {
                    maxCredit = bal;
                    maxCreditorId = entry.getKey();
                }
                if (bal.compareTo(maxDebit) < 0) {
                    maxDebit = bal;
                    maxDebtorId = entry.getKey();
                }
            }

            if (maxCredit.compareTo(EPSILON) <= 0 || maxDebit.abs().compareTo(EPSILON) <= 0) {
                break;
            }

            if (maxCreditorId == null || maxDebtorId == null || maxCreditorId.equals(maxDebtorId)) {
                break;
            }

            BigDecimal debtorOwes = maxDebit.abs();
            BigDecimal transferAmount = debtorOwes.min(maxCredit);

            String fromName = userNames != null ? userNames.getOrDefault(maxDebtorId, "User #" + maxDebtorId) : "User #" + maxDebtorId;
            String toName = userNames != null ? userNames.getOrDefault(maxCreditorId, "User #" + maxCreditorId) : "User #" + maxCreditorId;

            settlements.add(new DebtSimplificationDTO(
                    maxDebtorId, fromName,
                    maxCreditorId, toName,
                    transferAmount.setScale(2, RoundingMode.HALF_UP)
            ));

            balances.put(maxCreditorId, maxCredit.subtract(transferAmount));
            balances.put(maxDebtorId, maxDebit.add(transferAmount));
        }

        return settlements;
    }
}
