package com.expensesync.jdbc;

import com.expensesync.jdbc.dao.ExpenseDAO;
import com.expensesync.jdbc.dao.GroupDAO;
import com.expensesync.jdbc.db.DatabaseConnection;
import com.expensesync.jdbc.model.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("   ExpenseSync - JDBC Data Persistence Application (Unit 3)");
        System.out.println("   Course: 21CSE354T Full Stack Web Development | SRMIST");
        System.out.println("==================================================================");

        ExpenseDAO expenseDAO = new ExpenseDAO();
        GroupDAO groupDAO = new GroupDAO();
        Scanner scanner = new Scanner(System.in);

        try {
            // Trigger connection test and auto-seeding
            DatabaseConnection.getConnection();

            boolean running = true;
            while (running) {
                System.out.println("\n--- MAIN MENU ---");
                System.out.println("1. List All Expenses (SELECT & JOIN)");
                System.out.println("2. Add New Expense (INSERT with PreparedStatement)");
                System.out.println("3. Update Expense Details (UPDATE with PreparedStatement)");
                System.out.println("4. Delete Expense Record (DELETE with PreparedStatement)");
                System.out.println("5. View Category Spending Aggregates (GROUP BY & SUM)");
                System.out.println("6. List Groups & Calculate Balances (Who Owes Whom)");
                System.out.println("7. Exit Application");
                System.out.print("Enter choice (1-7): ");

                String input = scanner.nextLine().trim();
                switch (input) {
                    case "1":
                        handleListExpenses(expenseDAO);
                        break;
                    case "2":
                        handleAddExpense(expenseDAO, scanner);
                        break;
                    case "3":
                        handleUpdateExpense(expenseDAO, scanner);
                        break;
                    case "4":
                        handleDeleteExpense(expenseDAO, scanner);
                        break;
                    case "5":
                        expenseDAO.printCategorySpendingSummary();
                        break;
                    case "6":
                        handleGroupBalances(groupDAO, scanner);
                        break;
                    case "7":
                        System.out.println("Exiting ExpenseSync JDBC CLI. Goodbye!");
                        running = false;
                        break;
                    default:
                        System.out.println("⚠️ Invalid choice. Please select 1 through 7.");
                }
            }
        } catch (Exception e) {
            System.err.println("Database Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DatabaseConnection.closeConnection();
        }
    }

    private static void handleListExpenses(ExpenseDAO dao) {
        try {
            List<Expense> expenses = dao.getAllExpenses();
            System.out.println("\n-----------------------------------------------------------------------------------------------------------------");
            System.out.printf("%-4s | %-30s | %-10s | %-18s | %-15s | %-12s | %-8s\n",
                    "ID", "Title", "Amount (₹)", "Category", "Paid By", "Date", "Mode");
            System.out.println("-----------------------------------------------------------------------------------------------------------------");
            for (Expense exp : expenses) {
                System.out.printf("%-4d | %-30s | ₹%-9.2f | %-18s | %-15s | %-12s | %-8s\n",
                        exp.getId(),
                        truncate(exp.getTitle(), 28),
                        exp.getAmount(),
                        exp.getCategoryName(),
                        exp.getPaidByName(),
                        exp.getExpenseDate(),
                        exp.getPaymentMethod());
            }
            System.out.println("-----------------------------------------------------------------------------------------------------------------");
            System.out.println("Total records listed: " + expenses.size());
        } catch (Exception e) {
            System.err.println("Failed to fetch expenses: " + e.getMessage());
        }
    }

    private static void handleAddExpense(ExpenseDAO dao, Scanner scanner) {
        try {
            System.out.println("\n--- Add New Expense ---");
            System.out.print("Enter Title / Description: ");
            String title = scanner.nextLine().trim();

            System.out.print("Enter Amount (₹): ");
            BigDecimal amount = new BigDecimal(scanner.nextLine().trim());

            System.out.println("Available Categories: 1: Food, 2: Travel, 3: Rent, 4: Shopping, 5: Bills, 6: Entertainment, 7: Health, 8: Other");
            System.out.print("Enter Category ID (1-8): ");
            Long catId = Long.parseLong(scanner.nextLine().trim());

            System.out.print("Enter Payer User ID (1: Rahul, 2: Priya, 3: Amit, 4: Sneha): ");
            Long paidBy = Long.parseLong(scanner.nextLine().trim());

            System.out.print("Is this a Group Expense? (Enter Group ID 1 or 2, or press Enter for Personal): ");
            String gInput = scanner.nextLine().trim();
            Long groupId = gInput.isEmpty() ? null : Long.parseLong(gInput);

            System.out.print("Enter Payment Method (UPI / CARD / CASH / BANK) [default: UPI]: ");
            String method = scanner.nextLine().trim();
            if (method.isEmpty()) method = "UPI";

            Expense exp = new Expense(title, amount, catId, paidBy, groupId, LocalDate.now(), method, "Added via JDBC CLI", false);
            Long newId = dao.createExpense(exp);
            System.out.println("✓ Success! Expense created with ID: " + newId);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to add expense: " + e.getMessage());
        }
    }

    private static void handleUpdateExpense(ExpenseDAO dao, Scanner scanner) {
        try {
            System.out.print("\nEnter Expense ID to update: ");
            Long id = Long.parseLong(scanner.nextLine().trim());

            Expense existing = dao.getExpenseById(id);
            if (existing == null) {
                System.out.println("⚠️ Expense with ID " + id + " not found.");
                return;
            }

            System.out.println("Current details: " + existing);
            System.out.print("Enter new Title (or press Enter to keep '" + existing.getTitle() + "'): ");
            String title = scanner.nextLine().trim();
            if (title.isEmpty()) title = existing.getTitle();

            System.out.print("Enter new Amount (or press Enter to keep ₹" + existing.getAmount() + "): ");
            String amtStr = scanner.nextLine().trim();
            BigDecimal amount = amtStr.isEmpty() ? existing.getAmount() : new BigDecimal(amtStr);

            System.out.print("Enter updated Notes: ");
            String notes = scanner.nextLine().trim();
            if (notes.isEmpty()) notes = existing.getNotes();

            boolean updated = dao.updateExpense(id, title, amount, notes);
            if (updated) {
                System.out.println("✓ Expense #" + id + " successfully updated!");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to update expense: " + e.getMessage());
        }
    }

    private static void handleDeleteExpense(ExpenseDAO dao, Scanner scanner) {
        try {
            System.out.print("\nEnter Expense ID to delete: ");
            Long id = Long.parseLong(scanner.nextLine().trim());

            System.out.print("Are you sure you want to permanently delete expense #" + id + "? (y/n): ");
            String confirm = scanner.nextLine().trim();
            if ("y".equalsIgnoreCase(confirm)) {
                boolean deleted = dao.deleteExpense(id);
                if (deleted) {
                    System.out.println("✓ Expense #" + id + " deleted successfully.");
                } else {
                    System.out.println("⚠️ Expense ID not found.");
                }
            } else {
                System.out.println("Deletion cancelled.");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Deletion failed: " + e.getMessage());
        }
    }

    private static void handleGroupBalances(GroupDAO dao, Scanner scanner) {
        try {
            dao.listGroups();
            System.out.print("Enter Group ID to inspect net balances (e.g. 1 for Goa Trip): ");
            Long gid = Long.parseLong(scanner.nextLine().trim());
            dao.printGroupBalances(gid);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to compute group balances: " + e.getMessage());
        }
    }

    private static String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max - 3) + "...";
    }
}

