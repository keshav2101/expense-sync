package com.expensesync.core.dto;

import java.math.BigDecimal;

public class SettlementRequestDTO {
    private Long groupId;
    private Long payerId;
    private Long payeeId;
    private BigDecimal amount;
    private String paymentMethod = "UPI";
    private String notes;

    public SettlementRequestDTO() {}

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public Long getPayerId() { return payerId; }
    public void setPayerId(Long payerId) { this.payerId = payerId; }

    public Long getPayeeId() { return payeeId; }
    public void setPayeeId(Long payeeId) { this.payeeId = payeeId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

