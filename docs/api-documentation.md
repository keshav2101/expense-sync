# ExpenseSync REST API Documentation

Base URLs:
* **Core Service**: `http://localhost:8080/api`
* **Analytics Microservice**: `http://localhost:8082/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "name": "Karan Malhotra",
  "email": "karan@example.com",
  "password": "Password@123",
  "defaultCurrency": "INR"
}
```
* **Success Response (`201 Created`)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 5,
  "name": "Karan Malhotra",
  "email": "karan@example.com",
  "currency": "INR"
}
```

### 1.2 Login User
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "rahul@example.com",
  "password": "Password@123"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "currency": "INR"
}
```

---

## 2. Expense Endpoints (`/api/expenses`)

### 2.1 Get All User Expenses
* **Method**: `GET`
* **Endpoint**: `/api/expenses`
* **Query Parameters**: `category` (optional), `paymentMethod` (optional), `search` (optional)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "title": "Monthly Apartment Rent",
    "amount": 9500.00,
    "category": "RENT",
    "paidBy": 1,
    "paidByName": "Rahul Sharma",
    "groupId": null,
    "date": "2026-11-01",
    "paymentMethod": "BANK",
    "notes": "Rent transfer",
    "isRecurring": true
  }
]
```

### 2.2 Create Expense (Personal or Group with Split)
* **Method**: `POST`
* **Endpoint**: `/api/expenses`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "title": "Goa Beach Villa (2 Nights)",
  "amount": 16000.00,
  "category": "RENT",
  "paidBy": 2,
  "groupId": 1,
  "date": "2026-11-05",
  "paymentMethod": "CARD",
  "splitType": "EQUAL",
  "splits": [
    { "userId": 1, "userName": "Rahul" },
    { "userId": 2, "userName": "Priya" },
    { "userId": 3, "userName": "Amit" },
    { "userId": 4, "userName": "Sneha" }
  ]
}
```
* **Success Response (`201 Created`)**

### 2.3 Delete Expense
* **Method**: `DELETE`
* **Endpoint**: `/api/expenses/{id}`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (`204 No Content`)**

---

## 3. Group Endpoints (`/api/groups`)

### 3.1 Get All Groups
* **Method**: `GET`
* **Endpoint**: `/api/groups`
* **Headers**: `Authorization: Bearer <token>`

### 3.2 Get Simplified Debts (Greedy Min-Cash-Flow)
* **Method**: `GET`
* **Endpoint**: `/api/groups/{id}/simplified-debts`
* **Headers**: `Authorization: Bearer <token>`
* **Response (`200 OK`)**:
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
    "fromUserName": "Rahul Sharma",
    "toUserId": 2,
    "toUserName": "Priya Nair",
    "amount": 1250.00
  }
]
```

---

## 4. Settlement Endpoints (`/api/settlements`)

### 4.1 Record Settle-Up Payment
* **Method**: `POST`
* **Endpoint**: `/api/settlements`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "groupId": 1,
  "payerId": 1,
  "payeeId": 2,
  "amount": 1250.00,
  "paymentMethod": "UPI",
  "notes": "Settled Goa Trip Villa Debt"
}
```

---

## 5. Analytics Microservice Endpoints (`/api/analytics` - Port 8082)

### 5.1 Monthly Analytics Summary
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/analytics/summary?userId=1&monthYear=2026-11`
* **Response (`200 OK`)**:
```json
{
  "serviceName": "ExpenseSync Analytics Microservice v1.0",
  "userId": 1,
  "monthYear": "2026-11",
  "totalMonthlySpent": 19000.00,
  "budgetLimit": 25000.00,
  "budgetUsedPercentage": 76.0,
  "overspendWarning": false,
  "categoryBreakdown": {
    "RENT": 9500.00,
    "FOOD": 4200.00,
    "TRAVEL": 2100.00,
    "BILLS": 1800.00,
    "ENTERTAINMENT": 1400.00
  }
}
```

### 5.2 Stream CSV Export
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/analytics/export-csv?userId=1&monthYear=2026-11`
* **Content-Type**: `text/csv`

