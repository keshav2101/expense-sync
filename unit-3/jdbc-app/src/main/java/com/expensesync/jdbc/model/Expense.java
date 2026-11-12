package com.expensesync.jdbc.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Expense {
    private Long id;
    private String title;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private Long paidBy;
    private String paidByName;
    private Long groupId;
    private String groupName;
    private LocalDate expenseDate;
    private String paymentMethod;
    private String notes;
    private boolean recurring;

    public Expense() {}

    public Expense(String title, BigDecimal amount, Long categoryId, Long paidBy, Long groupId,
                   LocalDate expenseDate, String paymentMethod, String notes, boolean recurring) {
        this.title = title;
        this.amount = amount;
        this.categoryId = categoryId;
        this.paidBy = paidBy;
        this.groupId = groupId;
        this.expenseDate = expenseDate;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
        this.recurring = recurring;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getPaidBy() { return paidBy; }
    public void setPaidBy(Long paidBy) { this.paidBy = paidBy; }

    public String getPaidByName() { return paidByName; }
    public void setPaidByName(String paidByName) { this.paidByName = paidByName; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isRecurring() { return recurring; }
    public void setRecurring(boolean recurring) { this.recurring = recurring; }

    @Override
    public String toString() {
        return String.format("[ID: %d] %s | ₹%.2f | Cat: %s | Payer: %s | Group: %s | Date: %s | Mode: %s",
                id, title, amount, 
                categoryName != null ? categoryName : ("Cat #" + categoryId),
                paidByName != null ? paidByName : ("User #" + paidBy),
                groupName != null ? groupName : (groupId != null ? ("Group #" + groupId) : "Personal"),
                expenseDate, paymentMethod);
    }
}

