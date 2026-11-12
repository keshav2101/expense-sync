package com.expensesync.jdbc.dao;

import com.expensesync.jdbc.db.DatabaseConnection;
import com.expensesync.jdbc.model.Expense;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ExpenseDAO {

    /**
     * CREATE: Inserts a new expense using PreparedStatement
     */
    public Long createExpense(Expense expense) throws SQLException {
        String sql = "INSERT INTO expenses (title, amount, category_id, paid_by, group_id, expense_date, payment_method, notes, is_recurring) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = DatabaseConnection.getConnection();
        try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, expense.getTitle());
            pstmt.setBigDecimal(2, expense.getAmount());
            pstmt.setLong(3, expense.getCategoryId());
            pstmt.setLong(4, expense.getPaidBy());
            if (expense.getGroupId() != null) {
                pstmt.setLong(5, expense.getGroupId());
            } else {
                pstmt.setNull(5, Types.BIGINT);
            }
            pstmt.setDate(6, Date.valueOf(expense.getExpenseDate()));
            pstmt.setString(7, expense.getPaymentMethod());
            pstmt.setString(8, expense.getNotes());
            pstmt.setBoolean(9, expense.isRecurring());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating expense failed, no rows affected.");
            }

            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    Long generatedId = generatedKeys.getLong(1);
                    expense.setId(generatedId);
                    return generatedId;
                } else {
                    throw new SQLException("Creating expense failed, no ID obtained.");
                }
            }
        }
    }

    /**
     * READ: Retrieves all expenses with Category, Payer, and Group names using JOIN
     */
    public List<Expense> getAllExpenses() throws SQLException {
        List<Expense> expenses = new ArrayList<>();
        String sql = "SELECT e.id, e.title, e.amount, e.category_id, c.name AS category_name, " +
                     "e.paid_by, u.name AS paid_by_name, e.group_id, g.name AS group_name, " +
                     "e.expense_date, e.payment_method, e.notes, e.is_recurring " +
                     "FROM expenses e " +
                     "JOIN categories c ON e.category_id = c.id " +
                     "JOIN users u ON e.paid_by = u.id " +
                     "LEFT JOIN groups g ON e.group_id = g.id " +
                     "ORDER BY e.expense_date DESC";

        Connection conn = DatabaseConnection.getConnection();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Expense exp = new Expense();
                exp.setId(rs.getLong("id"));
                exp.setTitle(rs.getString("title"));
                exp.setAmount(rs.getBigDecimal("amount"));
                exp.setCategoryId(rs.getLong("category_id"));
                exp.setCategoryName(rs.getString("category_name"));
                exp.setPaidBy(rs.getLong("paid_by"));
                exp.setPaidByName(rs.getString("paid_by_name"));
                
                long gid = rs.getLong("group_id");
                if (!rs.wasNull()) {
                    exp.setGroupId(gid);
                    exp.setGroupName(rs.getString("group_name"));
                }
                
                exp.setExpenseDate(rs.getDate("expense_date").toLocalDate());
                exp.setPaymentMethod(rs.getString("payment_method"));
                exp.setNotes(rs.getString("notes"));
                exp.setRecurring(rs.getBoolean("is_recurring"));

                expenses.add(exp);
            }
        }
        return expenses;
    }

    /**
     * READ by ID: Retrieves a single expense using PreparedStatement
     */
    public Expense getExpenseById(Long id) throws SQLException {
        String sql = "SELECT e.id, e.title, e.amount, e.category_id, c.name AS category_name, " +
                     "e.paid_by, u.name AS paid_by_name, e.group_id, g.name AS group_name, " +
                     "e.expense_date, e.payment_method, e.notes, e.is_recurring " +
                     "FROM expenses e " +
                     "JOIN categories c ON e.category_id = c.id " +
                     "JOIN users u ON e.paid_by = u.id " +
                     "LEFT JOIN groups g ON e.group_id = g.id " +
                     "WHERE e.id = ?";

        Connection conn = DatabaseConnection.getConnection();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Expense exp = new Expense();
                    exp.setId(rs.getLong("id"));
                    exp.setTitle(rs.getString("title"));
                    exp.setAmount(rs.getBigDecimal("amount"));
                    exp.setCategoryId(rs.getLong("category_id"));
                    exp.setCategoryName(rs.getString("category_name"));
                    exp.setPaidBy(rs.getLong("paid_by"));
                    exp.setPaidByName(rs.getString("paid_by_name"));
                    long gid = rs.getLong("group_id");
                    if (!rs.wasNull()) {
                        exp.setGroupId(gid);
                        exp.setGroupName(rs.getString("group_name"));
                    }
                    exp.setExpenseDate(rs.getDate("expense_date").toLocalDate());
                    exp.setPaymentMethod(rs.getString("payment_method"));
                    exp.setNotes(rs.getString("notes"));
                    exp.setRecurring(rs.getBoolean("is_recurring"));
                    return exp;
                }
            }
        }
        return null;
    }

    /**
     * UPDATE: Modifies title, amount, and notes for an existing expense
     */
    public boolean updateExpense(Long id, String title, java.math.BigDecimal amount, String notes) throws SQLException {
        String sql = "UPDATE expenses SET title = ?, amount = ?, notes = ? WHERE id = ?";
        Connection conn = DatabaseConnection.getConnection();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, title);
            pstmt.setBigDecimal(2, amount);
            pstmt.setString(3, notes);
            pstmt.setLong(4, id);
            return pstmt.executeUpdate() > 0;
        }
    }

    /**
     * DELETE: Deletes an expense by ID
     */
    public boolean deleteExpense(Long id) throws SQLException {
        String sql = "DELETE FROM expenses WHERE id = ?";
        Connection conn = DatabaseConnection.getConnection();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            return pstmt.executeUpdate() > 0;
        }
    }

    /**
     * AGGREGATION: Summary of spending by Category
     */
    public void printCategorySpendingSummary() throws SQLException {
        String sql = "SELECT c.name AS category, COUNT(e.id) AS total_bills, SUM(e.amount) AS total_amount " +
                     "FROM expenses e " +
                     "JOIN categories c ON e.category_id = c.id " +
                     "GROUP BY c.name " +
                     "ORDER BY SUM(e.amount) DESC";

        Connection conn = DatabaseConnection.getConnection();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            System.out.println("\n------------------------------------------------------------------");
            System.out.printf("%-25s | %-12s | %-15s\n", "Category", "Bill Count", "Total Spent (₹)");
            System.out.println("------------------------------------------------------------------");
            while (rs.next()) {
                System.out.printf("%-25s | %-12d | ₹%-14.2f\n",
                        rs.getString("category"),
                        rs.getInt("total_bills"),
                        rs.getBigDecimal("total_amount"));
            }
            System.out.println("------------------------------------------------------------------");
        }
    }
}
