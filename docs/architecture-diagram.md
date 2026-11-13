# ExpenseSync: System Architecture Diagram

This document illustrates the three-tier microservices architecture of ExpenseSync.

```mermaid
flowchart TD
    subgraph Frontend Tier [Client Tier - React + Vite (Port 5173)]
        UI[Single Page App<br>React Router, Axios, ThemeContext, AuthContext]
        DOM[DOM / Canvas 2D Charts]
    end

    subgraph Gateway / Ingress
        CORS[CORS Filter & Preflight Handler]
    end

    subgraph Core Service [Core Service (Spring Boot - Port 8080)]
        direction TB
        SEC[Spring Security & JwtAuthenticationFilter]
        CTRL[REST Controllers<br>ExpenseController, GroupController, AuthController, SettleController]
        SERV[Service Layer<br>SplitCalculationService, DebtSimplificationService, ExpenseService]
        REPO[Spring Data JPA Repositories]
    end

    subgraph Analytics Microservice [Analytics Microservice (Spring Boot - Port 8082)]
        ACTRL[AnalyticsController]
        ASERV[AnalyticsService<br>Monthly Reports & CSV Streaming]
    end

    subgraph Data Tier [Persistence Tier]
        MYSQL[("MySQL 8.0 / H2 Database<br>Relational Schema with 8 Tables")]
    end

    UI -->|HTTP Requests + Bearer JWT| CORS
    CORS --> SEC
    SEC --> CTRL
    CTRL --> SERV
    SERV --> REPO
    REPO -->|JDBC / Hibernate| MYSQL
    SERV -->|"Inter-Service REST Call<br>(RestTemplate /api/analytics)"| ACTRL
    ACTRL --> ASERV
```
