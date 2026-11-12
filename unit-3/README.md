# Unit 3: SQL Relational Design & JDBC Data Access — ExpenseSync

## 1. Aim
To architect an entity-relational database schema for **ExpenseSync**, execute complex SQL queries (multi-table joins, aggregations, subqueries, and set operations), and develop a Java 17+ console application using the **Java Database Connectivity (JDBC)** API with `DriverManager`, `Connection`, `Statement`, `PreparedStatement`, and `ResultSet`.

---

## 2. Syllabus Concepts Covered (21CSE354T)
* **Relational Schema Design & DDL**:
  * Tables with primary keys (`AUTO_INCREMENT`), unique constraints (`UNIQUE`), check constraints (`CHECK (amount > 0)`), and foreign key integrity with cascading options (`ON DELETE CASCADE` / `RESTRICT`).
  * Indexing strategies (`CREATE INDEX`) on date, user, and group columns.
* **SQL Queries & Set Operations (DML & DQL)**:
  * Multi-table `INNER JOIN` and `LEFT JOIN` for transaction enrichment.
  * `GROUP BY` and `HAVING` aggregations for category totals and spend thresholds.
  * Complex nested subqueries computing dynamic net member balances:
    $$\text{Net Balance} = (\text{Total Paid}) - (\text{Owed Share}) + (\text{Settled Received}) - (\text{Settled Paid})$$
  * Set operations: `UNION`, `INTERSECT`, and `EXCEPT`.
* **Java Database Connectivity (JDBC)**:
  * Connection management via `DriverManager.getConnection()`.
  * SQL Injection prevention via parameterized `PreparedStatement`.
  * Auto-generated primary key retrieval (`Statement.RETURN_GENERATED_KEYS`).
  * Dynamic `ResultSet` iteration and conversion into Java domain Model objects (`Expense.java`).
  * Seamless zero-setup fallback using embedded In-Memory H2 (MySQL Mode) with automatic DDL/DML script execution.

---

## 3. What Was Built
```text
unit-3/
├── sql/
│   ├── schema.sql           # DDL: 8 tables (users, groups, group_members, categories,
│   │                        # expenses, expense_splits, settlements, budgets) + indexes
│   ├── seed.sql             # DML: 4 users, 2 groups, standard categories, 10 expenses, splits & budgets
│   └── queries.sql          # Advanced queries (Joins, Aggregates, Who-Owes-Whom, UNION/INTERSECT/EXCEPT)
├── jdbc-app/
│   ├── pom.xml              # Maven config (Java 17+, MySQL Connector/J 8.3.0, H2 2.2.224)
│   ├── .env.example         # Database connection settings (DB_TYPE=h2 or mysql)
│   └── src/main/java/com/expensesync/jdbc/
│       ├── Main.java        # Interactive 7-option CLI application
│       ├── db/DatabaseConnection.java   # Connection manager with automated DDL/DML runner
│       ├── model/Expense.java           # Plain Old Java Object (POJO)
│       ├── dao/ExpenseDAO.java          # CRUD & Category Summary via JDBC
│       └── dao/GroupDAO.java            # Group listing & Who-Owes-Whom net balance calculator
└── screenshots/
    └── .gitkeep
```

---

## 4. How to Run

### Option A: Run JDBC Application (Self-Contained In-Memory / MySQL Mode)
```bash
# Navigate to jdbc-app
cd unit-3/jdbc-app

# Compile and run via Maven
mvn clean compile exec:java
```
*Note: By default, the application runs on embedded H2 (MySQL Mode) and auto-seeds all sample records, ensuring instant, zero-setup execution during evaluations.*

### Option B: Run Against a Local MySQL Server
```bash
# 1. Start MySQL and create database:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS expensesync_db;"

# 2. Execute schema and seed scripts:
mysql -u root -p expensesync_db < ../sql/schema.sql
mysql -u root -p expensesync_db < ../sql/seed.sql

# 3. Run JDBC application with MySQL flags:
mvn clean compile exec:java -Ddb.type=mysql -Ddb.url="jdbc:mysql://localhost:3306/expensesync_db?useSSL=false&allowPublicKeyRetrieval=true" -Ddb.user=root -Ddb.password=root
```

---

## 5. Sample Output

### 1. List All Expenses (Menu Option 1)
```text
-----------------------------------------------------------------------------------------------------------------
ID   | Title                          | Amount (₹) | Category           | Paid By         | Date         | Mode    
-----------------------------------------------------------------------------------------------------------------
10   | Apollo Pharmacy Medicines      | ₹650.00    | Health & Pharmacy  | Rahul Sharma    | 2026-11-10   | UPI     
9    | D-Mart Shared Cleaning Re...   | ₹1200.00   | Shopping           | Amit Patel      | 2026-11-09   | CARD    
8    | Apartment Maintenance & W...   | ₹1800.00   | Bills & Utilities  | Rahul Sharma    | 2026-11-08   | UPI     
7    | Water Sports & Scuba Pack      | ₹6000.00   | Entertainment      | Amit Patel      | 2026-11-07   | CASH    
6    | Fisherman Wharf Seafood F...   | ₹4500.00   | Food & Dining      | Priya Nair      | 2026-11-06   | UPI     
5    | Goa Beach Villa (2 Nights)     | ₹16000.00  | Rent & Housing     | Priya Nair      | 2026-11-05   | CARD    
4    | Uber Airport Drop              | ₹850.00    | Travel & Commute   | Rahul Sharma    | 2026-11-04   | CARD    
3    | Airtel Broadband Bill          | ₹999.00    | Bills & Utilities  | Rahul Sharma    | 2026-11-03   | UPI     
2    | Swiggy Dinner Order            | ₹1450.00   | Food & Dining      | Rahul Sharma    | 2026-11-02   | UPI     
1    | Monthly Flat Rent              | ₹9500.00   | Rent & Housing     | Rahul Sharma    | 2026-11-01   | BANK    
-----------------------------------------------------------------------------------------------------------------
Total records listed: 10
```

### 2. Group Net Balances ("Who Owes Whom" — Menu Option 6)
```text
==================================================================
Group #1 Member Net Balances (Who Owes Whom):
==================================================================
Member               | Total Paid   | Total Share  | Net Status     
------------------------------------------------------------------
Rahul Sharma         | ₹850.00      | ₹5462.50     | - ₹3412.50 (Owes group)
Priya Nair           | ₹20500.00    | ₹5212.50     | + ₹15287.50 (Gets back)
Amit Patel           | ₹6000.00     | ₹5462.50     | - ₹662.50 (Owes group)
Sneha Rao            | ₹0.00        | ₹5212.50     | - ₹5212.50 (Owes group)
==================================================================
```

---

## 6. Viva Q&A (5 Key Questions)

### Q1: What is the difference between `Statement` and `PreparedStatement` in JDBC?
**Answer:**
* **`Statement`**: Compiles and executes static SQL strings without parameter substitution. Used for simple queries without user inputs (e.g. `SELECT * FROM expenses`).
* **`PreparedStatement`**: Pre-compiles SQL templates on the database server. Parameters are bound using placeholder tokens (`?`) via type-safe setters (`setString`, `setBigDecimal`). This provides database caching benefits and completely protects against **SQL Injection attacks**.

### Q2: How are auto-generated primary keys retrieved in JDBC after an INSERT?
**Answer:** By passing `Statement.RETURN_GENERATED_KEYS` to `connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)`. Following `executeUpdate()`, invoking `pstmt.getGeneratedKeys()` returns a `ResultSet` pointing to the newly generated sequence or auto-increment ID.

### Q3: What is the difference between `UNION`, `INTERSECT`, and `EXCEPT` in SQL?
**Answer:**
* `UNION`: Combines rows from two queries and eliminates duplicate records.
* `INTERSECT`: Returns only the distinct rows common to both query results.
* `EXCEPT` (or `MINUS` in Oracle): Returns distinct rows from the first query that do not exist in the second query.

### Q4: How is a many-to-many (M:N) relationship represented in a relational schema?
**Answer:** An M:N relationship (such as Users and Groups) is decomposed into two one-to-many (1:N) relationships via a **junction / association table** (`group_members`). The junction table has a composite primary key consisting of `(group_id, user_id)` referencing the respective parent tables with foreign keys.

### Q5: Why is closing database connections (`connection.close()`) critical in enterprise Java?
**Answer:** Database connections represent expensive operating system network sockets and database memory buffers. Leaving connections open causes **connection leaks**, eventually exhausting the database connection pool limit and crashing the application. In JDBC, connections and statements should be managed within Java `try-with-resources` blocks or explicitly closed in `finally` blocks.
