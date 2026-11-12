package com.expensesync.api.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class SettlementRequestDTO {
    @NotNull(message = "Group ID is required")
    private Long groupId;

    @NotNull(message = "Payer user ID is required")
    private Long payerId;

    @NotNull(message = "Payee user ID is required")
    private Long payeeId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Settlement amount must be positive")
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

