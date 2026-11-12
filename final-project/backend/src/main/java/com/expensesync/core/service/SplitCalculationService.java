package com.expensesync.core.service;

import com.expensesync.core.dto.SplitDetailDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class SplitCalculationService {

    /**
     * Calculates shares according to the split type, ensuring that the sum
     * of shares matches the total amount exactly by having the last member
     * absorb any fractional rounding difference.
     */
    public List<SplitDetailDTO> calculateSplits(BigDecimal totalAmount, String splitType, List<SplitDetailDTO> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("Cannot calculate splits for empty member list");
        }

        int n = inputs.size();
        List<SplitDetailDTO> results = new ArrayList<>();

        if ("EQUAL".equalsIgnoreCase(splitType)) {
            BigDecimal baseShare = totalAmount.divide(BigDecimal.valueOf(n), 2, RoundingMode.FLOOR);
            BigDecimal distributed = BigDecimal.ZERO;

            for (int i = 0; i < n; i++) {
                SplitDetailDTO item = new SplitDetailDTO();
                item.setUserId(inputs.get(i).getUserId());
                item.setUserName(inputs.get(i).getUserName());
                item.setSplitType("EQUAL");

                if (i == n - 1) {
                    item.setShareAmount(totalAmount.subtract(distributed));
                } else {
                    item.setShareAmount(baseShare);
                    distributed = distributed.add(baseShare);
                }
                results.add(item);
            }

        } else if ("EXACT".equalsIgnoreCase(splitType)) {
            BigDecimal sum = BigDecimal.ZERO;
            for (SplitDetailDTO in : inputs) {
                if (in.getShareAmount() == null || in.getShareAmount().compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("Exact share amount cannot be null or negative");
                }
                sum = sum.add(in.getShareAmount());
                SplitDetailDTO item = new SplitDetailDTO(in.getUserId(), in.getUserName(), "EXACT", in.getShareAmount());
                results.add(item);
            }

            if (sum.compareTo(totalAmount) != 0) {
                throw new IllegalArgumentException(String.format("Exact split sum (₹%.2f) does not match total bill amount (₹%.2f)", sum, totalAmount));
            }

        } else if ("PERCENTAGE".equalsIgnoreCase(splitType)) {
            BigDecimal totalPercent = BigDecimal.ZERO;
            for (SplitDetailDTO in : inputs) {
                if (in.getPercentage() == null || in.getPercentage().compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("Percentage share cannot be null or negative");
                }
                totalPercent = totalPercent.add(in.getPercentage());
            }

            if (totalPercent.compareTo(new BigDecimal("100.00")) != 0 && totalPercent.compareTo(new BigDecimal("100")) != 0) {
                throw new IllegalArgumentException(String.format("Split percentages sum to %.2f%%, must equal exactly 100%%", totalPercent));
            }

            BigDecimal distributed = BigDecimal.ZERO;
            for (int i = 0; i < n; i++) {
                SplitDetailDTO in = inputs.get(i);
                SplitDetailDTO item = new SplitDetailDTO();
                item.setUserId(in.getUserId());
                item.setUserName(in.getUserName());
                item.setSplitType("PERCENTAGE");
                item.setPercentage(in.getPercentage());

                if (i == n - 1) {
                    item.setShareAmount(totalAmount.subtract(distributed));
                } else {
                    BigDecimal share = totalAmount.multiply(in.getPercentage())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.FLOOR);
                    item.setShareAmount(share);
                    distributed = distributed.add(share);
                }
                results.add(item);
            }

        } else if ("SHARES".equalsIgnoreCase(splitType)) {
            int totalShares = 0;
            for (SplitDetailDTO in : inputs) {
                if (in.getShares() == null || in.getShares() <= 0) {
                    throw new IllegalArgumentException("Shares must be a positive integer");
                }
                totalShares += in.getShares();
            }

            BigDecimal distributed = BigDecimal.ZERO;
            for (int i = 0; i < n; i++) {
                SplitDetailDTO in = inputs.get(i);
                SplitDetailDTO item = new SplitDetailDTO();
                item.setUserId(in.getUserId());
                item.setUserName(in.getUserName());
                item.setSplitType("SHARES");
                item.setShares(in.getShares());

                if (i == n - 1) {
                    item.setShareAmount(totalAmount.subtract(distributed));
                } else {
                    BigDecimal share = totalAmount.multiply(BigDecimal.valueOf(in.getShares()))
                            .divide(BigDecimal.valueOf(totalShares), 2, RoundingMode.FLOOR);
                    item.setShareAmount(share);
                    distributed = distributed.add(share);
                }
                results.add(item);
            }
        } else {
            throw new IllegalArgumentException("Unsupported split type: " + splitType);
        }

        return results;
    }
}
