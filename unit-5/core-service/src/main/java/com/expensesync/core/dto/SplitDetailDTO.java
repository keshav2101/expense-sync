package com.expensesync.core.dto;

import java.math.BigDecimal;

public class SplitDetailDTO {
    private Long userId;
    private String userName;
    private String splitType; // EQUAL, EXACT, PERCENTAGE, SHARES
    private BigDecimal shareAmount;
    private BigDecimal percentage;
    private Integer shares;

    public SplitDetailDTO() {}

    public SplitDetailDTO(Long userId, String userName, String splitType, BigDecimal shareAmount) {
        this.userId = userId;
        this.userName = userName;
        this.splitType = splitType;
        this.shareAmount = shareAmount;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getSplitType() { return splitType; }
    public void setSplitType(String splitType) { this.splitType = splitType; }

    public BigDecimal getShareAmount() { return shareAmount; }
    public void setShareAmount(BigDecimal shareAmount) { this.shareAmount = shareAmount; }

    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }

    public Integer getShares() { return shares; }
    public void setShares(Integer shares) { this.shares = shares; }
}

