-- =====================================================================
-- ExpenseSync Initial Seed Data (DML)
-- Unit 3: SQL & JDBC Data Persistence
-- =====================================================================

-- 1. Insert 4 Sample Users (BCrypt hashes for password 'Password@123')
INSERT INTO users (id, name, email, password_hash, default_currency) VALUES
(1, 'Rahul Sharma', 'rahul@example.com', '$2a$12$7k8m/Vl0RzHq0aJ7GjGvne6C3Wv6V1Ww8vLgQ5h8fF6.zYkK7gDGi', 'INR'),
(2, 'Priya Nair', 'priya@example.com', '$2a$12$7k8m/Vl0RzHq0aJ7GjGvne6C3Wv6V1Ww8vLgQ5h8fF6.zYkK7gDGi', 'INR'),
(3, 'Amit Patel', 'amit@example.com', '$2a$12$7k8m/Vl0RzHq0aJ7GjGvne6C3Wv6V1Ww8vLgQ5h8fF6.zYkK7gDGi', 'INR'),
(4, 'Sneha Rao', 'sneha@example.com', '$2a$12$7k8m/Vl0RzHq0aJ7GjGvne6C3Wv6V1Ww8vLgQ5h8fF6.zYkK7gDGi', 'INR');

-- 2. Insert Standard Categories
INSERT INTO categories (id, name, icon, is_default) VALUES
(1, 'Food & Dining', '🍔', TRUE),
(2, 'Travel & Commute', '✈️', TRUE),
(3, 'Rent & Housing', '🏠', TRUE),
(4, 'Shopping', '🛍️', TRUE),
(5, 'Bills & Utilities', '💡', TRUE),
(6, 'Entertainment', '🎬', TRUE),
(7, 'Health & Pharmacy', '💊', TRUE),
(8, 'Other / Custom', '📁', TRUE);

-- 3. Insert Groups
INSERT INTO groups (id, name, type, created_by) VALUES
(1, 'Goa Trip 2026', 'TRIP', 1),
(2, 'Flatmates B-302', 'HOME', 1);

-- 4. Group Members
-- Goa Trip 2026 has all 4 members
INSERT INTO group_members (group_id, user_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
-- Flatmates B-302 has Rahul, Amit, Sneha
(2, 1), (2, 3), (2, 4);

-- 5. Insert Personal & Group Expenses
INSERT INTO expenses (id, title, amount, category_id, paid_by, group_id, expense_date, payment_method, notes, is_recurring) VALUES
(1, 'Monthly Flat Rent', 9500.00, 3, 1, NULL, '2026-11-01', 'BANK', 'Personal rent transfer to owner', TRUE),
(2, 'Swiggy Dinner Order', 1450.00, 1, 1, NULL, '2026-11-02', 'UPI', 'Weekend dinner with flatmates', FALSE),
(3, 'Airtel Broadband Bill', 999.00, 5, 1, NULL, '2026-11-03', 'UPI', 'Monthly WiFi bill', TRUE),
(4, 'Uber Airport Drop', 850.00, 2, 1, 1, '2026-11-04', 'CARD', 'Cab to Mumbai airport for Goa trip', FALSE),
(5, 'Goa Beach Villa (2 Nights)', 16000.00, 3, 2, 1, '2026-11-05', 'CARD', 'Airbnb booking by Priya', FALSE),
(6, 'Fisherman Wharf Seafood Feast', 4500.00, 1, 2, 1, '2026-11-06', 'UPI', 'Dinner in South Goa', FALSE),
(7, 'Water Sports & Scuba Pack', 6000.00, 6, 3, 1, '2026-11-07', 'CASH', 'Scuba diving & parasailing pack', FALSE),
(8, 'Apartment Maintenance & Water', 1800.00, 5, 1, 2, '2026-11-08', 'UPI', 'Flat maintenance for Nov', TRUE),
(9, 'D-Mart Shared Cleaning Restock', 1200.00, 4, 3, 2, '2026-11-09', 'CARD', 'Detergent, mop, trash bags', FALSE),
(10, 'Apollo Pharmacy Medicines', 650.00, 7, 1, NULL, '2026-11-10', 'UPI', 'Personal health medicines', FALSE);

-- 6. Insert Expense Splits (Splitwise model)
-- Expense 4: Uber Cab (₹850 split equally 4 ways: 212.50 each)
INSERT INTO expense_splits (expense_id, user_id, split_type, share_amount) VALUES
(4, 1, 'EQUAL', 212.50),
(4, 2, 'EQUAL', 212.50),
(4, 3, 'EQUAL', 212.50),
(4, 4, 'EQUAL', 212.50);

-- Expense 5: Villa ₹16,000 paid by Priya (₹4,000 each)
INSERT INTO expense_splits (expense_id, user_id, split_type, share_amount) VALUES
(5, 1, 'EQUAL', 4000.00),
(5, 2, 'EQUAL', 4000.00),
(5, 3, 'EQUAL', 4000.00),
(5, 4, 'EQUAL', 4000.00);

-- Expense 6: Seafood ₹4,500 paid by Priya (Exact Split)
INSERT INTO expense_splits (expense_id, user_id, split_type, share_amount) VALUES
(6, 1, 'EXACT', 1250.00),
(6, 2, 'EXACT', 1000.00),
(6, 3, 'EXACT', 1250.00),
(6, 4, 'EXACT', 1000.00);

-- 7. Insert Historical Settlements
INSERT INTO settlements (id, group_id, payer_id, payee_id, amount, payment_method, notes) VALUES
(1, 1, 3, 1, 1200.00, 'UPI', 'Partial settlement for flights & cab'),
(2, 2, 4, 2, 800.00, 'CASH', 'Cash handed over for grocery share');

-- 8. Monthly Budgets for Rahul (User 1) for Nov 2026
INSERT INTO budgets (user_id, category_id, monthly_limit, month_year) VALUES
(1, 1, 5000.00, '2026-11'),
(1, 2, 4000.00, '2026-11'),
(1, 3, 12000.00, '2026-11'),
(1, 5, 3000.00, '2026-11');

