# Unit 4: Spring Boot Framework Part 1 — Layered REST API & Debt Simplification

## 1. Aim
To construct an enterprise-grade, three-tier layered REST API for **ExpenseSync** using **Spring Boot 3.x** (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository`), implementing Data Transfer Objects (DTOs), Jakarta Bean Validation, centralized Global Exception Handling (`@RestControllerAdvice`), the greedy minimum-cash-flow debt simplification algorithm, and unit testing via **JUnit 5**.

---

## 2. Syllabus Concepts Covered (21CSE354T)
* **Spring Framework vs. Spring Boot**:
  * Inversion of Control (IoC) & Dependency Injection (`@Service`, `@Repository`, `@RestController`).
  * Spring Boot Auto-Configuration (`@SpringBootApplication`) and embedded Tomcat server.
* **Three-Tier / Layered Architecture**:
  * **Presentation Layer (`controller/`)**: Exposes RESTful HTTP endpoints (`@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`), handles `@Valid` request bodies and path variables.
  * **Business Logic Layer (`service/`)**: Implements mathematical bill splitting logic (`SplitCalculationService`) and the greedy min-cash-flow algorithm (`DebtSimplificationService`).
  * **Data Access Layer (`repository/`)**: Thread-safe in-memory repositories (`ConcurrentHashMap`) isolating data storage from presentation logic.
* **Jakarta Bean Validation**:
  * Declarative validation constraints (`@NotBlank`, `@NotNull`, `@Positive`, `@Size`, `@NotEmpty`) triggering automatic 400 Bad Request responses on violations.
* **Global Exception Handling**:
  * `@RestControllerAdvice` and `@ExceptionHandler` producing consistent JSON error schemas (`ErrorResponse.java`).
* **Unit Testing with JUnit 5**:
  * Comprehensive test suite validating edge cases in the debt simplification algorithm.

---

## 3. What Was Built
```text
unit-4/
├── pom.xml                                    # Spring Boot 3.2.5, Web, Validation, Test
├── application.properties.example             # Configuration template
├── src/main/java/com/expensesync/api/
│   ├── ExpenseSyncApplication.java            # Spring Boot entry point
│   ├── controller/
│   │   ├── ExpenseController.java             # REST CRUD for personal & group expenses
│   │   ├── GroupController.java               # Group management & simplified debts endpoint
│   │   ├── SettleController.java              # Settle-up payment recording
│   │   └── BudgetController.java              # Category monthly budgets & limits
│   ├── service/
│   │   ├── ExpenseService.java                # Business logic for expense operations
│   │   ├── GroupService.java                  # Group aggregation & balance updates
│   │   ├── SplitCalculationService.java       # 4 split types with rounding correction
│   │   └── DebtSimplificationService.java     # Greedy Min-Cash-Flow Algorithm
│   ├── repository/
│   │   ├── InMemoryExpenseRepository.java     # Thread-safe expense storage
│   │   └── InMemoryGroupRepository.java       # Thread-safe group & balance storage
│   ├── model/dto/
│   │   ├── ExpenseRequestDTO.java             # Validated incoming payload
│   │   ├── ExpenseResponseDTO.java            # Enriched response payload
│   │   ├── GroupRequestDTO.java               # Group creation payload
│   │   ├── GroupResponseDTO.java              # Group details with member balances
│   │   ├── SettlementRequestDTO.java          # Settle-up payload
│   │   ├── DebtSimplificationDTO.java         # From -> To transfer DTO
│   │   └── SplitDetailDTO.java                # Individual split item
│   └── exception/
│       ├── ResourceNotFoundException.java     # 404 handler
│       ├── InvalidSplitException.java          # 400 handler for split mismatches
│       ├── ErrorResponse.java                 # Standardized JSON error response
│       └── GlobalExceptionHandler.java        # Centralized REST advice
├── src/main/resources/
│   └── application.properties                 # Server port 8080 & log levels
├── src/test/java/com/expensesync/api/service/
│   └── DebtSimplificationServiceTest.java     # JUnit 5 test suite (6 test cases)
├── postman/
│   └── ExpenseSync-Unit4-Postman.json         # Postman collection (13 API endpoints)
└── screenshots/
    └── .gitkeep
```

---

## 4. How to Run

### Step 1: Run the Spring Boot REST API
```bash
# Navigate to unit-4 directory
cd unit-4

# Run with Spring Boot Maven Plugin
mvn spring-boot:run
```
The server will start on `http://localhost:8080`.

### Step 2: Run the JUnit 5 Test Suite
```bash
mvn clean test
```

### Step 3: Test with Postman or cURL
Import `postman/ExpenseSync-Unit4-Postman.json` into Postman, or execute sample cURL commands:

#### Get all expenses:
```bash
curl -X GET http://localhost:8080/api/expenses
```

#### Get simplified debts for Goa Trip 2026:
```bash
curl -X GET http://localhost:8080/api/groups/1/simplified-debts
```

#### Create a new group expense with Equal Split:
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goa Beach Parasailing",
    "amount": 2400.00,
    "category": "ENTERTAINMENT",
    "paidBy": 1,
    "groupId": 1,
    "date": "2026-11-12",
    "paymentMethod": "UPI",
    "splitType": "EQUAL",
    "splits": [
      { "userId": 1, "userName": "Rahul" },
      { "userId": 2, "userName": "Priya" },
      { "userId": 3, "userName": "Amit" },
      { "userId": 4, "userName": "Sneha" }
    ]
  }'
```

---

## 5. Sample Output & Test Results

### JUnit 5 Execution Log
```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.expensesync.api.service.DebtSimplificationServiceTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.038 s
[INFO] 
[INFO] Results:
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### Simplified Debts Endpoint Response (`GET /api/groups/1/simplified-debts`)
```json
[
  {
    "fromUserId": 3,
    "fromUserName": "Amit Patel",
    "toUserId": 2,
    "toUserName": "Priya Nair",
    "amount": 2150.00
  },
  {
    "fromUserId": 1,
    "fromUserName": "Rahul Sharma (You)",
    "toUserId": 2,
    "toUserName": "Priya Nair",
    "amount": 1250.00
  }
]
```

---

## 6. Assumptions
* **Open Endpoints**: REST endpoints in Unit 4 are intentionally unauthenticated (no JWT enforcement) to focus purely on three-tier architecture, Bean Validation, and service algorithms; JWT security is applied in Unit 5.
* **Algorithm Heuristic**: The greedy minimum-cash-flow algorithm assumes that all participants in a group belong to a single connected balance graph and simplifies debts to at most $N-1$ settlement transfers.
* **Precision**: Monetary figures use `java.math.BigDecimal` with 2 decimal places (`RoundingMode.HALF_UP` / `RoundingMode.FLOOR`) to eliminate IEEE-754 binary floating-point drift.

---

## 7. Viva Q&A (5 Key Questions)

### Q1: What is the Three-Tier Architecture in Spring Boot, and what does each layer do?
**Answer:**
1. **Controller Layer (`@RestController`)**: Handles incoming HTTP requests, maps URLs, parses path variables/query parameters, validates incoming DTOs, and returns HTTP responses with appropriate status codes (`200 OK`, `201 Created`, `400 Bad Request`).
2. **Service Layer (`@Service`)**: Encapsulates core business logic, validation rules, algorithms (such as the greedy min-cash-flow algorithm), and orchestrates domain actions.
3. **Repository Layer (`@Repository`)**: Handles data persistence, abstraction, and CRUD communication with the database or storage engine.

### Q2: How does the Greedy Minimum-Cash-Flow Algorithm work?
**Answer:** 
1. Compute the **net balance** for each participant: $\text{amount paid} - \text{amount owed}$.
2. In each iteration, identify the **Maximum Debtor** (person who owes the most) and the **Maximum Creditor** (person who is owed the most).
3. The debtor pays $\min(|\text{maxDebt}|, \text{maxCredit})$ directly to the creditor.
4. Update both balances and repeat until all net balances are zero. This reduces arbitrary cyclic debts to at most $N - 1$ payments.

### Q3: Why are DTOs (Data Transfer Objects) preferred over exposing raw entities in REST APIs?
**Answer:**
* **Security**: Prevents over-posting attacks where malicious users send unintended fields (such as role escalation or internal IDs).
* **Decoupling**: Decouples external API contracts from internal database table designs.
* **Performance**: Avoids serializing unnecessary relations or recursive object graphs (infinite JSON loops).

### Q4: How does `@RestControllerAdvice` work in Spring Boot?
**Answer:** `@RestControllerAdvice` is an interceptor around all `@RestController` classes. When an unhandled exception is thrown during request execution, Spring matches the exception type to an `@ExceptionHandler` method inside the advice class, allowing consistent error formatting (`ErrorResponse`) and standardized HTTP status codes across the entire application.

### Q5: What is Spring Boot Auto-Configuration?
**Answer:** Spring Boot analyzes JAR dependencies present on the classpath (e.g. `spring-boot-starter-web`) and automatically configures essential beans (such as the DispatcherServlet, Jackson ObjectMapper, and an embedded Apache Tomcat server) with sensible defaults, removing hundreds of lines of legacy XML/Java boilerplate configuration.

