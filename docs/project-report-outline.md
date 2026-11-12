# College Project Report Outline
## Project: ExpenseSync — Expense Management System with Splitwise-Style Bill Splitting
### SRM Institute of Science and Technology | Department of Computer Science & Engineering
### Course: 21CSE354T Full Stack Web Development

---

### Table of Contents

#### 1. Abstract
* Summary of the project, problem statement, key engineering innovations, dual personal and group capability, tech stack (React + Spring Boot + Microservices + MySQL), and primary deliverables.

#### 2. Introduction & Background
* 2.1 Motivation behind Expense Tracking & Splitwise-style Algorithms
* 2.2 Shortcomings of Existing Fragmented Solutions
* 2.3 Proposed Solution: ExpenseSync
* 2.4 Curriculum Mapping: 21CSE354T Full Stack Web Development

#### 3. Objectives & Project Scope
* 3.1 Primary Objectives
* 3.2 Functional Scope (Personal Tracker, Group Splits, Min-Cash-Flow, Budgets, Analytics)
* 3.3 Non-Functional Scope (Security, Modularity, Performance, Responsiveness)

#### 4. System Requirements & SRS
* 4.1 Hardware & Environment Prerequisites (Java 17+, Maven, Node.js, MySQL)
* 4.2 Software Requirements Specification (Use cases, User Personas, Functional Requirements)

#### 5. System Design & Architecture
* 5.1 High-Level Architecture (Three-Tier Monolith to Microservices Transition)
* 5.2 Microservice Decomposition (`core-service` vs `analytics-service`)
* 5.3 Relational Database Design & Entity-Relationship (ER) Diagram (8 normalized tables)
* 5.4 Mathematical Algorithm: Greedy Minimum-Cash-Flow
  * Formal problem statement (Graph balance reduction)
  * Pseudo-code and time complexity ($O(N \log N)$ or $O(N^2)$)
  * Edge cases (Zero balances, circular debts, uneven splits)
* 5.5 Fractional Rounding & Money Conservation Model

#### 6. Implementation (Unit-Wise Breakdown)
* 6.1 **Unit 1: HTML5 & CSS3 Responsive Foundation**
  * Semantic HTML5 elements, box-sizing, Flexbox/Grid, Canvas 2D Donut charting, dark/light CSS variables.
* 6.2 **Unit 2: JavaScript & React.js Single Page Application**
  * Part A: Vanilla JS DOM manipulation, 4 split algorithms, Canvas Confetti.
  * Part B: Vite + React SPA, React Router v6, custom hooks (`useExpenses`, `useDebounce`) with `useDebugValue`, Context API.
* 6.3 **Unit 3: SQL & JDBC Data Persistence**
  * Schema DDL, seed DML, complex joins, subqueries ("Who Owes Whom"), `UNION/INTERSECT/EXCEPT`.
  * Standalone Java 17+ JDBC CLI application with `PreparedStatement` CRUD and connection management.
* 6.4 **Unit 4: Spring Boot Layered REST API**
  * Controller $\rightarrow$ Service $\rightarrow$ Repository architecture, DTOs, Jakarta Bean Validation, `@RestControllerAdvice`.
* 6.5 **Unit 5: Spring Data JPA, Microservices & JWT Security**
  * Hibernate ORM entities, MySQL/H2 dual profile, stateless Spring Security with HMAC-SHA256 JWT, dedicated Analytics microservice, and full stack client integration.

#### 7. Verification & Testing
* 7.1 Automated Unit Testing with JUnit 5 & Mockito (`DebtSimplificationServiceTest`)
* 7.2 API Functional Verification via Postman Collection
* 7.3 Frontend User Flow & Cross-Browser Validation
* 7.4 Test Results & Pass-Fail Matrix

#### 8. Conclusion & Future Enhancements
* 8.1 Summary of Completed Deliverables
* 8.2 Lessons Learned & Engineering Insights
* 8.3 Future Scope:
  * Optical Character Recognition (OCR) for physical receipt parsing
  * Real-time WebSocket notifications for settlement alerts
  * UPI Deep-Linking (`upi://pay`) for one-tap native mobile payments

#### 9. References & Appendices
* 9.1 Academic & Technical References
* 9.2 API Reference Matrix
* 9.3 Viva Voce Frequently Asked Questions (25 Questions & Answers)

