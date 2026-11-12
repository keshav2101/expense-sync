-- =====================================================================
-- ExpenseSync Advanced SQL Queries (21CSE354T Syllabus Requirements)
-- Joins, Aggregations, Subqueries, UNION / INTERSECT / EXCEPT
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. JOINS: Expense Details with Category, Payer, and Group Names
-- ---------------------------------------------------------------------
SELECT 
    e.id AS expense_id,
    e.title,
    e.amount,
    c.name AS category_name,
    u.name AS paid_by_user,
    COALESCE(g.name, 'Personal Expense') AS group_name,
    e.expense_date,
    e.payment_method
FROM expenses e
INNER JOIN categories c ON e.category_id = c.id
INNER JOIN users u ON e.paid_by = u.id
LEFT JOIN groups g ON e.group_id = g.id
ORDER BY e.expense_date DESC;

-- ---------------------------------------------------------------------
-- 2. AGGREGATION & HAVING: Category-wise spending for November 2026
-- ---------------------------------------------------------------------
SELECT 
    c.name AS category,
    COUNT(e.id) AS transaction_count,
    SUM(e.amount) AS total_spent,
    ROUND(AVG(e.amount), 2) AS average_per_bill
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.expense_date >= '2026-11-01' AND e.expense_date <= '2026-11-30'
GROUP BY c.id, c.name
HAVING SUM(e.amount) > 1000.00
ORDER BY total_spent DESC;

-- ---------------------------------------------------------------------
-- 3. SUBQUERY & JOINS: Category Budget vs Actual Spending with Status
-- ---------------------------------------------------------------------
SELECT 
    c.name AS category,
    b.monthly_limit,
    COALESCE(spent_sub.actual_spent, 0.00) AS actual_spent,
    ROUND((COALESCE(spent_sub.actual_spent, 0.00) / b.monthly_limit) * 100, 1) AS percent_used,
    CASE 
        WHEN COALESCE(spent_sub.actual_spent, 0.00) >= b.monthly_limit THEN 'ALERT: OVER BUDGET'
        WHEN COALESCE(spent_sub.actual_spent, 0.00) >= (b.monthly_limit * 0.8) THEN 'WARNING: >= 80% USED'
        ELSE 'NORMAL'
    END AS budget_status
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN (
    SELECT category_id, SUM(amount) AS actual_spent
    FROM expenses
    WHERE paid_by = 1 AND expense_date LIKE '2026-11%'
    GROUP BY category_id
) spent_sub ON b.category_id = spent_sub.category_id
WHERE b.user_id = 1 AND b.month_year = '2026-11';

-- ---------------------------------------------------------------------
-- 4. COMPLEX SUBQUERY: "Who Owes Whom" Net Balance in Group 1
-- Net Balance = (Amount Paid for Group) - (Share of Expenses Owed) + (Settlements Received) - (Settlements Paid)
-- ---------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name AS member_name,
    COALESCE(paid_tbl.total_paid, 0.00) AS total_paid,
    COALESCE(share_tbl.total_share, 0.00) AS total_share_owed,
    COALESCE(settle_in.received, 0.00) AS settlements_received,
    COALESCE(settle_out.paid, 0.00) AS settlements_paid,
    ROUND(
        (COALESCE(paid_tbl.total_paid, 0.00) - COALESCE(share_tbl.total_share, 0.00)) + 
        (COALESCE(settle_in.received, 0.00) - COALESCE(settle_out.paid, 0.00)), 
        2
    ) AS net_balance
FROM group_members gm
JOIN users u ON gm.user_id = u.id
-- Total amount paid by user in group 1
LEFT JOIN (
    SELECT paid_by, SUM(amount) AS total_paid
    FROM expenses
    WHERE group_id = 1
    GROUP BY paid_by
) paid_tbl ON u.id = paid_tbl.paid_by
-- Total share owed by user across expenses in group 1
LEFT JOIN (
    SELECT es.user_id, SUM(es.share_amount) AS total_share
    FROM expense_splits es
    JOIN expenses e ON es.expense_id = e.id
    WHERE e.group_id = 1
    GROUP BY es.user_id
) share_tbl ON u.id = share_tbl.user_id
-- Settlements received
LEFT JOIN (
    SELECT payee_id, SUM(amount) AS received
    FROM settlements
    WHERE group_id = 1
    GROUP BY payee_id
) settle_in ON u.id = settle_in.payee_id
-- Settlements paid out
LEFT JOIN (
    SELECT payer_id, SUM(amount) AS paid
    FROM settlements
    WHERE group_id = 1
    GROUP BY payer_id
) settle_out ON u.id = settle_out.payer_id
WHERE gm.group_id = 1;

-- ---------------------------------------------------------------------
-- 5. SET OPERATIONS (UNION, INTERSECT, EXCEPT)
-- ---------------------------------------------------------------------

-- A. UNION: All users involved in group activities (either as creators or members)
SELECT created_by AS user_id FROM groups
UNION
SELECT user_id FROM group_members;

-- B. INTERSECT: Users who are in both 'Goa Trip 2026' (group 1) AND 'Flatmates B-302' (group 2)
-- (Using standard IN / subquery syntax for universal MySQL 8.0 & H2 compatibility)
SELECT user_id FROM group_members WHERE group_id = 1
INTERSECT
SELECT user_id FROM group_members WHERE group_id = 2;

-- C. EXCEPT: Members in 'Goa Trip 2026' who are NOT in 'Flatmates B-302'
SELECT user_id FROM group_members WHERE group_id = 1
EXCEPT
SELECT user_id FROM group_members WHERE group_id = 2;
