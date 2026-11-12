package com.expensesync.jdbc.dao;

import com.expensesync.jdbc.db.DatabaseConnection;

import java.math.BigDecimal;
import java.sql.*;

public class GroupDAO {

    public void listGroups() throws SQLException {
        String sql = "SELECT g.id, g.name, g.type, u.name AS creator_name, COUNT(gm.user_id) AS member_count " +
                     "FROM groups g " +
                     "JOIN users u ON g.created_by = u.id " +
                     "LEFT JOIN group_members gm ON g.id = gm.group_id " +
                     "GROUP BY g.id, g.name, g.type, u.name";

        Connection conn = DatabaseConnection.getConnection();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            System.out.println("\n------------------------------------------------------------------");
            System.out.printf("%-5s | %-20s | %-10s | %-15s | %-10s\n", "ID", "Group Name", "Type", "Created By", "Members");
            System.out.println("------------------------------------------------------------------");
            while (rs.next()) {
                System.out.printf("%-5d | %-20s | %-10s | %-15s | %-10d\n",
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("type"),
                        rs.getString("creator_name"),
                        rs.getInt("member_count"));
            }
            System.out.println("------------------------------------------------------------------");
        }
    }

    /**
     * Calculates net balances in a group using SQL joins and aggregates
     */
    public void printGroupBalances(long groupId) throws SQLException {
        String sql = 
            "SELECT u.id, u.name, " +
            "  COALESCE(p.paid_amt, 0.00) AS total_paid, " +
            "  COALESCE(s.owed_amt, 0.00) AS total_owed, " +
            "  COALESCE(sin.recv_amt, 0.00) AS settled_received, " +
            "  COALESCE(sout.paid_amt, 0.00) AS settled_paid, " +
            "  (COALESCE(p.paid_amt, 0.00) - COALESCE(s.owed_amt, 0.00) + COALESCE(sin.recv_amt, 0.00) - COALESCE(sout.paid_amt, 0.00)) AS net_balance " +
            "FROM group_members gm " +
            "JOIN users u ON gm.user_id = u.id " +
            "LEFT JOIN (SELECT paid_by, SUM(amount) AS paid_amt FROM expenses WHERE group_id = ? GROUP BY paid_by) p ON u.id = p.paid_by " +
            "LEFT JOIN (SELECT es.user_id, SUM(es.share_amount) AS owed_amt FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = ? GROUP BY es.user_id) s ON u.id = s.user_id " +
            "LEFT JOIN (SELECT payee_id, SUM(amount) AS recv_amt FROM settlements WHERE group_id = ? GROUP BY payee_id) sin ON u.id = sin.payee_id " +
            "LEFT JOIN (SELECT payer_id, SUM(amount) AS paid_amt FROM settlements WHERE group_id = ? GROUP BY payer_id) sout ON u.id = sout.payer_id " +
            "WHERE gm.group_id = ?";

        Connection conn = DatabaseConnection.getConnection();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, groupId);
            pstmt.setLong(2, groupId);
            pstmt.setLong(3, groupId);
            pstmt.setLong(4, groupId);
            pstmt.setLong(5, groupId);

            try (ResultSet rs = pstmt.executeQuery()) {
                System.out.println("\n==================================================================");
                System.out.println("Group #" + groupId + " Member Net Balances (Who Owes Whom):");
                System.out.println("==================================================================");
                System.out.printf("%-20s | %-12s | %-12s | %-15s\n", "Member", "Total Paid", "Total Share", "Net Status");
                System.out.println("------------------------------------------------------------------");

                while (rs.next()) {
                    String name = rs.getString("name");
                    BigDecimal paid = rs.getBigDecimal("total_paid");
                    BigDecimal owed = rs.getBigDecimal("total_owed");
                    BigDecimal net = rs.getBigDecimal("net_balance");

                    String statusText;
                    if (net.compareTo(BigDecimal.ZERO) > 0) {
                        statusText = String.format("+ ₹%.2f (Gets back)", net);
                    } else if (net.compareTo(BigDecimal.ZERO) < 0) {
                        statusText = String.format("- ₹%.2f (Owes group)", net.abs());
                    } else {
                        statusText = "₹0.00 (Settled)";
                    }

                    System.out.printf("%-20s | ₹%-11.2f | ₹%-11.2f | %-15s\n", name, paid, owed, statusText);
                }
                System.out.println("==================================================================");
            }
        }
    }
}

