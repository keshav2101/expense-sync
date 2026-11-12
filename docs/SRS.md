# Software Requirements Specification (SRS)
## Project: ExpenseSync — Expense Management System with Splitwise-Style Bill Splitting
### Academic Course: 21CSE354T Full Stack Web Development | SRMIST

---

## 1. Introduction
### 1.1 Purpose
ExpenseSync is a dual-capability financial web platform designed for university students and young professionals. It bridges the gap between individual personal financial management (budgeting, category-level spending limits, overspend alerts) and multi-member shared expense splitting (Splitwise-style groups, 4 distinct split models, and greedy debt simplification).

### 1.2 Scope
* Multi-user authentication with stateless JSON Web Tokens (JWT).
* Personal expense logging with recurring transaction tracking and category categorization.
* Monthly budget monitoring with active caution warnings at 80% and over-budget alerts at 100%.
* Group expense management supporting Equal, Exact, Percentage, and Proportional Share splits with mathematical paise/cent rounding absorption.
* Greedy minimum-cash-flow algorithm reducing complex cyclic group debts into minimal direct payments.
* Microservices architecture separating the core CRUD engine from an analytical reporting engine.

---

## 2. Functional Requirements

### 2.1 User & Authentication (FR-01)
* **FR-01.1**: The system shall register users with name, valid email, and minimum 8-character password.
* **FR-01.2**: Passwords shall be cryptographically hashed using BCrypt.
* **FR-01.3**: Authenticated sessions shall issue signed JWT tokens with 24-hour expiration.

### 2.2 Personal Expense Management (FR-02)
* **FR-02.1**: Users can create, read, update, and delete (CRUD) expense records with title, amount, category, date, and payment method (UPI, Card, Cash, Bank).
* **FR-02.2**: The system shall support recurring expense flagging for periodic expenses.
* **FR-02.3**: Users can search transactions by keyword, filter by category/payment method, and sort by date or amount with pagination.
* **FR-02.4**: Expenses can be exported directly to standard CSV format.

### 2.3 Category Budgets & Warnings (FR-03)
* **FR-03.1**: Users can specify monthly spending limits per category and an overall monthly limit.
* **FR-03.2**: When category spending reaches $\ge 80\%$, the UI shall surface an amber warning indicator.
* **FR-03.3**: When category spending reaches $\ge 100\%$, the UI shall trigger an over-budget alert banner.

### 2.4 Groups & Bill Splitting (FR-04)
* **FR-04.1**: Users can create groups (Trip, Home, Couple, Other) and invite members via email.
* **FR-04.2**: The system shall provide 4 split modes:
  1. Equal split ($1/N$ each).
  2. Exact amount split (must sum to total).
  3. Percentage split (must sum to 100%).
  4. Shares split (ratio based, e.g. 2:1:1).
* **FR-04.3**: Rounding differences (unallocated paise/cents) shall be absorbed automatically by the last member to ensure zero balance drift.

### 2.5 Debt Simplification & Settle-Up (FR-05)
* **FR-05.1**: The backend shall implement the greedy minimum-cash-flow algorithm to reduce $N$ cyclic debts to at most $N-1$ direct settlement payments.
* **FR-05.2**: Users can record settlement payments (full or partial), immediately clearing balances and updating group activity logs.

### 2.6 Analytics Microservice (FR-06)
* **FR-06.1**: A dedicated microservice on port 8082 shall compute monthly category summaries, spending velocity, and stream CSV exports.

---

## 3. Non-Functional Requirements
* **Performance**: Sub-100ms response time for API balance calculations.
* **Security**: OWASP compliance, SQL injection protection via JPA/PreparedStatements, CSRF disabled for stateless JWT, CORS restricted to trusted origins.
* **Maintainability**: Clean three-tier layered architecture (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository`).
* **Portability**: Packaged with Docker Compose and dual-profile database configurations (MySQL + In-Memory H2 fallback).

