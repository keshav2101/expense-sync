-- =====================================================================
-- ExpenseSync Database Schema Definition (DDL)
-- Unit 3: SQL & JDBC Data Persistence
-- Compatible with MySQL 8.0+ and H2 Database
-- =====================================================================

DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS expense_splits;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    default_currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Groups Table
CREATE TABLE groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) DEFAULT 'TRIP', -- TRIP, HOME, COUPLE, OTHER
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- 3. Group Members (Junction Table for M:N Relationship)
CREATE TABLE group_members (
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Categories Table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    icon VARCHAR(30) DEFAULT '📁',
    is_default BOOLEAN DEFAULT TRUE
);

-- 5. Expenses Table
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    category_id BIGINT NOT NULL,
    paid_by BIGINT NOT NULL,
    group_id BIGINT NULL, -- NULL indicates personal expense
    expense_date DATE NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'UPI', -- UPI, CARD, CASH, BANK
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exp_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_exp_payer FOREIGN KEY (paid_by) REFERENCES users(id),
    CONSTRAINT fk_exp_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- 6. Expense Splits Table (Splitwise-style breakdown)
CREATE TABLE expense_splits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expense_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    split_type VARCHAR(20) NOT NULL, -- EQUAL, EXACT, PERCENTAGE, SHARES
    share_amount DECIMAL(12, 2) NOT NULL CHECK (share_amount >= 0),
    percentage DECIMAL(5, 2) NULL,
    shares INT NULL,
    CONSTRAINT fk_split_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_split_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Settlements Table (Debt settlement transfers)
CREATE TABLE settlements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    payer_id BIGINT NOT NULL,
    payee_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) DEFAULT 'UPI',
    notes VARCHAR(255),
    settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settle_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_settle_payer FOREIGN KEY (payer_id) REFERENCES users(id),
    CONSTRAINT fk_settle_payee FOREIGN KEY (payee_id) REFERENCES users(id)
);

-- 8. Budgets Table (Monthly spending limits per category)
CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    monthly_limit DECIMAL(12, 2) NOT NULL CHECK (monthly_limit > 0),
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g. '2026-11')
    CONSTRAINT uq_user_cat_month UNIQUE (user_id, category_id, month_year),
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_cat FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes for Query Performance
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_user ON expenses(paid_by);
CREATE INDEX idx_expenses_group ON expenses(group_id);
CREATE INDEX idx_splits_user ON expense_splits(user_id);
