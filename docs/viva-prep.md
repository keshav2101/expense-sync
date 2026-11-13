# ExpenseSync — Comprehensive Viva & Project Defense Guide
**Course**: 21CSE354T Full Stack Web Development | **Institution**: SRMIST  
**Target Audience**: Students defending ExpenseSync during laboratory viva, project review, or examiner evaluation.

---

## 1. 2-Minute "Explain My Project" Script

> *"Good morning, Examiner. My project is **ExpenseSync**, an end-to-end full-stack web application that solves two interrelated financial problems: **Personal Expense Management** and **Collaborative Group Bill Splitting**.*
>
> *I built ExpenseSync following our 5-unit syllabus:*
> * *In **Unit 1**, I built a responsive HTML5/CSS3 prototype featuring semantic markup, CSS Variables for dark/light themes, Flexbox/Grid layouts, and custom Canvas 2D charts.*
> * *In **Unit 2**, I developed a Vanilla JavaScript split calculator and migrated the client to **React 18** with custom hooks (`useExpenses`, `useDebounce`), Context API for global state (`AuthContext`, `ThemeContext`), and React Router.*
> * *In **Unit 3**, I designed a normalized 8-table relational database in MySQL/H2 and built a Java 17 JDBC CLI using connection pooling, `PreparedStatement`, and analytical SQL queries.*
> * *In **Unit 4**, I developed a layered Spring Boot REST API (`Controller -> Service -> Repository`) with Jakarta Bean Validation, `@RestControllerAdvice`, JUnit 5 tests, and the **Greedy Minimum-Cash-Flow Debt Simplification Algorithm**.*
> * *Finally, in **Unit 5**, I scaled ExpenseSync to a **Distributed Microservices Architecture**. The main **Core Service** runs on Port 8080 managing JPA entities, relational database transactions, and stateless Spring Security JWT authentication. A separate **Analytics Microservice** runs on Port 8082 computing monthly spending aggregates, category breakdowns, and dynamic CSV streaming over synchronous REST calls via `RestTemplate`.*
>
> *All client state communicates directly with live REST endpoints over HTTP with Bearer tokens; `localStorage` is strictly restricted to the JWT token and UI theme. Thank you, I am ready for your questions."*

---

## 2. 25 Curated Viva Questions & Answers (Grouped by Unit)

### Unit 1: HTML5 & CSS3
#### Q1.1: Why are semantic HTML5 tags preferred over generic `<div>` tags?
**Answer**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) give structural meaning to web content. They drastically improve accessibility (screen readers announce landmarks), boost search engine optimization (SEO), and make CSS selectors cleaner and easier to maintain.

#### Q1.2: What is the CSS Box Model, and what is the difference between `content-box` and `border-box`?
**Answer**: The CSS Box Model represents every element as a rectangular box consisting of `content`, `padding`, `border`, and `margin`. With `box-sizing: content-box` (default), width only applies to the content, meaning padding and border increase the total size. With `box-sizing: border-box`, width includes padding and border, preventing layout breakage.

#### Q1.3: When should you choose CSS Flexbox over CSS Grid?
**Answer**: **Flexbox** is one-dimensional (content-first along a single row or column), ideal for navbars, toolbars, and card content. **CSS Grid** is two-dimensional (layout-first across simultaneous rows and columns), ideal for overall page scaffolding, dashboard card matrices, and complex multi-column grids.

#### Q1.4: How does ExpenseSync implement dark/light mode switching without duplicating CSS rules?
**Answer**: In `css/style.css`, design tokens are declared as CSS Variables under `:root` (e.g. `--bg-primary: #ffffff;`). Under `[data-theme="dark"]`, those exact variables are overridden (`--bg-primary: #0f172a;`). Toggling the attribute on `document.documentElement` transitions all colors smoothly.

#### Q1.5: How does the HTML5 Canvas 2D API work in `canvas-chart.js`?
**Answer**: `<canvas>` provides a resolution-dependent bitmap canvas. In `canvas-chart.js`, JavaScript gets the 2D rendering context (`canvas.getContext('2d')`) and uses mathematical functions like `ctx.arc(x, y, radius, startAngle, endAngle)` to draw interactive category donut slices and legends programmatically.

---

### Unit 2: JavaScript & React JS
#### Q2.1: What is the difference between synchronous DOM manipulation and the Virtual DOM in React?
**Answer**: Direct DOM manipulation updates the real browser DOM tree immediately, which is computationally expensive because it causes browser recalculations, reflows, and repaints. React maintains an in-memory lightweight representation (Virtual DOM), batches state updates, diffs the changes via reconciliation, and updates only the modified nodes in the real DOM.

#### Q2.2: Explain `map()`, `filter()`, and `reduce()` in JavaScript with examples from ExpenseSync.
**Answer**:
* `filter()`: Returns elements matching a condition (e.g., `expenses.filter(e => e.category === selectedCategory)`).
* `map()`: Transforms every item into a new element (e.g., `expenses.map(e => <ExpenseRow key={e.id} expense={e} />)`).
* `reduce()`: Accumulates values into a single result (e.g., `expenses.reduce((sum, e) => sum + Number(e.amount), 0)` to calculate total monthly expenditure).

#### Q2.3: What is the difference between `props` and `state` in React?
**Answer**: `props` (properties) are read-only inputs passed from parent to child components to configure them. `state` is internal, mutable data managed within the component using `useState` that causes the component to re-render whenever it changes.

#### Q2.4: Explain the purpose of `useState`, `useEffect`, `useContext`, and `useMemo`.
**Answer**:
* `useState`: Declares reactive component state variables.
* `useEffect`: Handles side effects (API calls, timers, event listeners) and cleans them up.
* `useContext`: Subscribes to global context (`AuthContext`, `ThemeContext`) without prop drilling.
* `useMemo`: Caches expensive computation results (e.g. category spending aggregates) between re-renders unless dependencies change.

#### Q2.5: What are custom React hooks, and why did you create `useExpenses` and `useDebounce`?
**Answer**: Custom hooks are reusable JavaScript functions starting with `use` that encapsulate stateful logic. In `useExpenses.js`, all CRUD actions, sorting, and API calls for expenses are encapsulated away from UI components. In `useDebounce.js`, input updates are delayed (e.g., 300ms) to prevent excessive filtering operations on every keystroke.

---

### Unit 3: SQL & JDBC
#### Q3.1: What is database normalization, and what forms are used in ExpenseSync?
**Answer**: Normalization organizes tables to minimize data redundancy and dependency anomalies. ExpenseSync is in **3rd Normal Form (3NF)**:
* **1NF**: All columns hold atomic scalar values (no multi-valued lists).
* **2NF**: In 1NF and all non-key columns fully depend on the primary key (no partial key dependencies).
* **3NF**: In 2NF and no transitive dependencies (category details are split into a dedicated `categories` table linked via foreign key `category_id`).

#### Q3.2: What is the difference between `UNION`, `INTERSECT`, and `EXCEPT` in SQL?
**Answer**:
* `UNION`: Combines result sets of two queries and eliminates duplicate rows.
* `INTERSECT`: Returns only rows present in both query results.
* `EXCEPT` (or `MINUS`): Returns rows from the first query that do not exist in the second query.

#### Q3.3: What are the sequential steps required to execute a query using JDBC?
**Answer**:
1. Load JDBC driver (`Class.forName("com.mysql.cj.jdbc.Driver")` or DriverManager auto-detection).
2. Establish connection (`DriverManager.getConnection(url, user, pass)`).
3. Create `PreparedStatement` with parameterized SQL (`con.prepareStatement(sql)`).
4. Bind parameters (`stmt.setLong(1, id)`).
5. Execute query (`stmt.executeQuery()` or `stmt.executeUpdate()`).
6. Process results via `ResultSet` (`while (rs.next())`).
7. Close resources in a `try-with-resources` block.

#### Q3.4: Why should you always use `PreparedStatement` instead of `Statement`?
**Answer**:
1. **Security**: PreparedStatement pre-compiles the SQL structure and treats input parameters strictly as literal values, completely neutralizing **SQL Injection attacks**.
2. **Performance**: Pre-compiled execution plans are cached in the database server, improving performance when executing parameterized queries repeatedly.

#### Q3.5: What is connection pooling, and why is HikariCP used?
**Answer**: Creating and destroying TCP socket connections to a database is expensive. A connection pool keeps a pool of ready-to-use active database connections. HikariCP is the default lightweight, high-performance connection pool in Spring Boot that eliminates connection creation latency.

---

### Unit 4: Spring Boot Part 1 & Layered Architecture
#### Q4.1: What is the difference between Spring Framework and Spring Boot?
**Answer**: Spring Framework requires extensive boilerplate XML/Java configuration, manual dependency management, and external application server deployment (like Apache Tomcat). **Spring Boot** introduces opinionated auto-configuration (`@EnableAutoConfiguration`), starter POM dependencies (`spring-boot-starter-web`), and an embedded Tomcat server for turnkey standalone execution.

#### Q4.2: Explain the Three-Layer Architecture implemented in `unit-4`.
**Answer**:
* **Controller Layer** (`@RestController`): Handles incoming HTTP requests, extracts parameters, validates input payloads, and returns HTTP response codes.
* **Service Layer** (`@Service`): Contains business logic, debt simplification algorithms, and transactional coordination.
* **Repository / DAO Layer** (`@Repository`): Interacts directly with database persistence storage to fetch and save entities.

#### Q4.3: What are DTOs (Data Transfer Objects), and why not expose entities directly?
**Answer**: DTOs decouple internal database schemas from external API contracts. Exposing entities directly risks security vulnerabilities (mass-assignment over-posting), circular reference serialization loops with JPA relationships, and over-fetching unnecessary data over the network.

#### Q4.4: How does centralized exception handling work using `@RestControllerAdvice`?
**Answer**: In `GlobalExceptionHandler.java`, `@RestControllerAdvice` intercepts exceptions thrown anywhere across the controller hierarchy. Methods annotated with `@ExceptionHandler` capture specific exceptions (e.g. `MethodArgumentNotValidException`, `ResourceNotFoundException`) and serialize them into standard RFC-7807 JSON error objects with appropriate HTTP status codes (400, 404, 500).

#### Q4.5: What did you test in your JUnit 5 test suite (`DebtSimplificationServiceTest`)?
**Answer**: I tested 6 edge cases of the Greedy Minimum-Cash-Flow Algorithm:
1. Empty group (zero transactions).
2. Two-person balanced transaction.
3. Three-person circular debt (A owes B, B owes C, C owes A) simplified from 3 transactions to 0.
4. Uneven splits with decimal amounts.
5. Large multi-member group with multiple positive and negative balances.
6. Rounding precision conservation where fractional remainder is fully accounted for.

---

### Unit 5: Spring Boot Part 2 & Microservices Architecture
#### Q5.1: What is Spring Data JPA, and how does it differ from raw JDBC?
**Answer**: Spring Data JPA is an abstraction over the Hibernate Object-Relational Mapping (ORM) framework. Instead of writing raw SQL strings and manual row mapping loops, developers declare repository interfaces extending `JpaRepository<Entity, ID>`. Spring automatically generates queries from method names (e.g. `findByPaidByIdOrderByExpenseDateDesc`).

#### Q5.2: How does stateless JWT authentication work in ExpenseSync?
**Answer**:
1. User submits credentials to `POST /api/auth/login`.
2. `AuthService` verifies BCrypt hash and generates an HMAC-SHA256 signed JSON Web Token containing subject (`email`) and expiration timestamp.
3. Client attaches this token in HTTP requests via `Authorization: Bearer <token>`.
4. `JwtAuthenticationFilter` validates the cryptographic signature, extracts user claims, and sets authentication in Spring's `SecurityContextHolder`.

#### Q5.3: Why is password hashing with BCrypt superior to plain MD5 or SHA-256?
**Answer**: MD5 and SHA-256 are fast cryptographic hashing algorithms vulnerable to high-speed brute-force attacks via GPU rigs and rainbow tables. **BCrypt** is an adaptive one-way hashing function that includes automatic random per-user salt generation and a configurable work factor (iteration count) that can be increased over time to resist hardware advancements.

#### Q5.4: Why was Analytics split into a dedicated Microservice (`analytics-service`) on Port 8082?
**Answer**:
1. **Independent Scalability**: Heavy analytical calculations, historical trend projections, and streaming file exports consume significant CPU and RAM. Separating them ensures transaction-heavy Core Service (expense logging, payments) is never starved of resources.
2. **Fault Isolation**: If report generation encounters an out-of-memory error or crashes, Core Service continues logging expenses and settlements uninterrupted.

#### Q5.5: How does Core Service communicate with Analytics Service, and what happens if Analytics is down?
**Answer**: Communication is synchronous HTTP REST via Spring's **`RestTemplate`** with configured connect and read timeouts (2s / 3s). In `AnalyticsClientService.java`, a circuit-breaker fallback (`calculateFallbackSummary`) catches connection exceptions and computes local in-memory aggregations, ensuring zero downtime for the user.

---

## 3. Walk Through the Code: Algorithms & Split Logic

### A. Greedy Debt Simplification Algorithm
* **File**: `unit-4/.../service/DebtSimplificationService.java` & `unit-5/core-service/.../service/DebtSimplificationService.java`
* **Method**: `simplifyDebts(Map<Long, BigDecimal> netBalances, Map<Long, String> userNames)`

#### How it works:
1. Compute the **net balance** for each group member:
   $$\text{Net Balance} = \sum \text{Paid} - \sum \text{Owed}$$
2. Separate members into two priority heaps:
   - **Debtors** (members with net balance $< 0$, who owe money).
   - **Creditors** (members with net balance $> 0$, who are owed money).
3. In each greedy iteration, pick the largest debtor (max debt) and largest creditor (max credit).
4. Settle the minimum of the two amounts:
   $$\text{Settlement Amount} = \min(|\text{Max Debt}|, \text{Max Credit})$$
5. Update their balances. Remove settled participants ($0.00$) and re-insert partial balances into the heap. Repeat until all balances are zero.

#### Concrete Worked Example:
* Three roommates in Goa Trip 2026:
  - Total Villa expense: ₹16,000 paid by Priya (Member 2).
  - Four members split equally: ₹4,000 each.
* Net Balances:
  - Priya: $+₹16,000 - ₹4,000 = \mathbf{+₹12,000}$ (Creditor)
  - Rahul: $0 - ₹4,000 = \mathbf{-₹4,000}$ (Debtor)
  - Amit: $0 - ₹4,000 = \mathbf{-₹4,000}$ (Debtor)
  - Sneha: $0 - ₹4,000 = \mathbf{-₹4,000}$ (Debtor)
* **Algorithm Output**:
  1. Rahul pays Priya ₹4,000.
  2. Amit pays Priya ₹4,000.
  3. Sneha pays Priya ₹4,000.
* Reduced from circular multi-step transfers down to exactly **3 direct payments**. Total transactions across $N$ members is at most $N-1$.

---

### B. The 4 Split Types & Fractional Rounding Conservation
* **File**: `unit-4/.../service/SplitCalculationService.java` & `unit-5/core-service/.../service/SplitCalculationService.java`
* **Method**: `calculateSplits(Expense expense, List<SplitDetailDTO> splits)`

1. **EQUAL Split**:
   - Divides total bill evenly: $\text{share} = \lfloor \frac{\text{total}}{N} \times 100 \rfloor / 100$.
   - **Rounding Absorption**: Floating point division often leaves fractional cents (e.g. ₹100 split 3 ways yields $3 \times ₹33.33 = ₹99.99$, leaving ₹0.01 unassigned). ExpenseSync absorbs this remainder into the final participant ($₹33.34$), guaranteeing $\sum \text{shares} \equiv \text{total}$ to the exact paisa.
2. **EXACT Split**:
   - Each participant is assigned an explicit currency amount. The service verifies $\sum \text{exactAmounts} == \text{totalAmount}$, throwing `InvalidSplitException` if they do not balance.
3. **PERCENTAGE Split**:
   - Each member has a percentage. The service asserts $\sum \text{percentages} == 100.0\%$, computing each share as $\frac{\text{percent}}{100} \times \text{total}$.
4. **SHARES (Ratio) Split**:
   - Uses integer weighting (e.g. 2:2:1:1 for 4 members = 6 total shares).
   - $\text{Share}_i = \frac{\text{units}_i}{\sum \text{units}} \times \text{total}$.
   - Remainder paise are absorbed into the last participant.

---

## 4. Known Technical Limitations (Honest Disclosures)

Examiners appreciate honesty about engineering trade-offs:
1. **Service Discovery**: The microservices use configured host/port URIs (`localhost:8082`). An enterprise Netflix Eureka discovery server or Spring Cloud Consul was intentionally omitted to prevent excessive memory overhead during laboratory evaluation on developer laptops.
2. **Simulated Payment Gateway**: The "Settle Up" feature updates ledger balances via peer-to-peer records (UPI, Bank, Cash) but does not trigger live banking APIs (like Razorpay or Stripe) since this is an educational capstone project.
3. **Unit 2 Client State**: Unit 2 (`part-b-react`) intentionally uses mock JSON and `localStorage` to showcase React state management before database and Spring Boot integration are introduced in Units 3–5. In Unit 5 and `final-project`, all data is stored exclusively in the relational database.
4. **Receipt Image Storage**: Expense attachments are stored as database metadata. Object storage in cloud buckets (AWS S3 / Google Cloud Storage) is planned for future production deployment.

---

## 5. Live Examiner Demo Checklist

Follow this exact sequence during the viva demonstration:

1. **Start Services in 3 Terminals**:
   ```bash
   # Terminal 1: Analytics Microservice
   cd unit-5/analytics-service && mvn spring-boot:run

   # Terminal 2: Core Service (H2 profile)
   cd unit-5/core-service && mvn spring-boot:run -Dspring-boot.run.profiles=h2

   # Terminal 3: React Client
   cd unit-5/client && npm run dev
   ```
2. **Open Browser**: `http://localhost:5173`
3. **Log In**: Click **"Autofill Demo Account"** (`rahul@example.com` / `Password@123`).
4. **Show Dashboard**:
   - Point out personal expenditure total (₹12,799.00 across 4 personal transactions).
   - Show category budgets and amber/red warnings.
   - Click the 🌙/☀️ toggle to demonstrate real-time CSS variable theme transition.
5. **Show Splitwise Groups**:
   - Open **"Goa Trip 2026"**.
   - Show the green banner: *"Greedy Min-Cash-Flow Simplification Active"*.
   - Point out the 3 simplified debts (Rahul owes Priya ₹2,275.00; Amit owes Priya ₹4,575.00; Sneha owes Priya ₹4,575.00).
6. **Add an Expense with Live Preview**:
   - Click **➕ Add Group Expense** -> Enter ₹2,400.
   - Click through **EQUAL**, **EXACT**, **PERCENT**, and **SHARES** tabs to demonstrate dynamic split calculation preview.
7. **Demonstrate Settle-Up**:
   - Click **🤝 Settle Up** -> Record Rahul paying Priya ₹1,000 via UPI.
   - Confirm Rahul's debt decreases immediately from ₹2,275.00 to ₹1,275.00.
8. **Demonstrate Microservices & CSV Export**:
   - Click **"Analytics & Reports"** in navbar.
   - Point out that category breakdowns and dynamic insights are fetched live from port 8082 through port 8080.
   - Click **"Download CSV"** to demonstrate real-time report streaming.
9. **Show Passing Automated Tests**:
   - In terminal: `./e2e_test.sh` -> All 8 end-to-end assertions pass.
   - In terminal: `mvn -f unit-4/pom.xml test` -> 6/6 JUnit 5 tests pass.
