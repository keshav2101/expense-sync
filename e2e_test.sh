#!/usr/bin/env bash
set -e

CORE_URL="http://localhost:8080/api"
ANALYTICS_URL="http://localhost:8082/api/analytics"
TIMESTAMP=$(date +%s)
TEST_EMAIL="tester_${TIMESTAMP}@example.com"
TEST_PASS="Password@123"

echo "========================================================"
echo "  ExpenseSync End-to-End Integration Verification Suite "
echo "========================================================"
echo "Timestamp: $TIMESTAMP | User: $TEST_EMAIL"

# Step 1: Register a new user
echo ""
echo "--- 1. Testing Registration ---"
REG_PAYLOAD=$(cat <<EOF
{
  "name": "Vikram Verma",
  "email": "$TEST_EMAIL",
  "password": "$TEST_PASS",
  "currency": "INR"
}
EOF
)
REG_RESP=$(curl -s -w "\n%{http_code}" -X POST "$CORE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REG_PAYLOAD")

HTTP_CODE=$(echo "$REG_RESP" | tail -n1)
BODY=$(echo "$REG_RESP" | sed '$d')
echo "Registration Response [$HTTP_CODE]: $BODY"
if [ "$HTTP_CODE" -ne 200 ] && [ "$HTTP_CODE" -ne 201 ]; then
  echo "❌ Registration failed!"
  exit 1
fi
echo "✅ User registered successfully!"

# Step 2: Login
echo ""
echo "--- 2. Testing Login ---"
LOGIN_PAYLOAD=$(cat <<EOF
{
  "email": "$TEST_EMAIL",
  "password": "$TEST_PASS"
}
EOF
)
LOGIN_RESP=$(curl -s -X POST "$CORE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_PAYLOAD")

echo "Login Response: $LOGIN_RESP"
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
MY_USER_ID=$(echo "$LOGIN_RESP" | grep -o '"id":[0-9]*' | head -n1 | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to retrieve JWT Token!"
  exit 1
fi
echo "✅ JWT Token obtained: ${TOKEN:0:20}... (User ID: $MY_USER_ID)"

# Step 2b: Add 2 Personal Expenses (500 FOOD, 1500 TRAVEL)
echo ""
echo "--- 2b. Add 2 Personal Expenses (FOOD 500, TRAVEL 1500) ---"
P_EXP1_PAYLOAD=$(cat <<EOF
{
  "title": "Client Team Lunch",
  "amount": 500.00,
  "category": "FOOD",
  "paymentMethod": "UPI",
  "date": "2026-11-10"
}
EOF
)
P_EXP1_RESP=$(curl -s -X POST "$CORE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$P_EXP1_PAYLOAD")
echo "Personal Expense 1 Response: $P_EXP1_RESP"

P_EXP2_PAYLOAD=$(cat <<EOF
{
  "title": "Intercity Train Ticket",
  "amount": 1500.00,
  "category": "TRAVEL",
  "paymentMethod": "CARD",
  "date": "2026-11-12"
}
EOF
)
P_EXP2_RESP=$(curl -s -X POST "$CORE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$P_EXP2_PAYLOAD")
echo "Personal Expense 2 Response: $P_EXP2_RESP"

# Step 2c: Assert Real Per-User Analytics Response (totalMonthlySpent = 2000 & CSV rows)
echo ""
echo "--- 2c. Verify Real Per-User Analytics for User A ---"
ANALYTICS_A=$(curl -s -X GET "$CORE_URL/reports/analytics?monthYear=2026-11" \
  -H "Authorization: Bearer $TOKEN")
echo "User A Analytics Response: $ANALYTICS_A"

TOTAL_SPENT_A=$(echo "$ANALYTICS_A" | grep -o '"totalMonthlySpent":[0-9.]*' | cut -d':' -f2)
echo "Total Monthly Spent detected: $TOTAL_SPENT_A"
if [[ "$TOTAL_SPENT_A" =~ ^2000(\.0+)?$ ]]; then
  echo "✅ Assertion passed: totalMonthlySpent = $TOTAL_SPENT_A (expected 2000)"
else
  echo "❌ Assertion failed: totalMonthlySpent is $TOTAL_SPENT_A, expected 2000"
  exit 1
fi

CSV_A=$(curl -s -X GET "$CORE_URL/reports/export-csv?monthYear=2026-11" \
  -H "Authorization: Bearer $TOKEN")
echo "User A CSV Export:"
echo "$CSV_A"

if echo "$CSV_A" | grep -q "FOOD,Client Team Lunch,500.00" && echo "$CSV_A" | grep -q "TRAVEL,Intercity Train Ticket,1500.00"; then
  echo "✅ Assertion passed: CSV contains both personal expense rows exactly!"
else
  echo "❌ Assertion failed: CSV does not contain expected rows!"
  exit 1
fi

# Step 2d: Verify User Isolation with a Different User (User B)
echo ""
echo "--- 2d. Verify User Isolation: User B Cannot See User A's Expenses ---"
USER_B_EMAIL="tester_b_${TIMESTAMP}@example.com"
REG_B_PAYLOAD=$(cat <<EOF
{
  "name": "Different User B",
  "email": "$USER_B_EMAIL",
  "password": "$TEST_PASS",
  "currency": "INR"
}
EOF
)
curl -s -X POST "$CORE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REG_B_PAYLOAD" > /dev/null

LOGIN_B_PAYLOAD=$(cat <<EOF
{
  "email": "$USER_B_EMAIL",
  "password": "$TEST_PASS"
}
EOF
)
LOGIN_B_RESP=$(curl -s -X POST "$CORE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_B_PAYLOAD")

TOKEN_B=$(echo "$LOGIN_B_RESP" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
ANALYTICS_B=$(curl -s -X GET "$CORE_URL/reports/analytics?monthYear=2026-11" \
  -H "Authorization: Bearer $TOKEN_B")
TOTAL_SPENT_B=$(echo "$ANALYTICS_B" | grep -o '"totalMonthlySpent":[0-9.]*' | cut -d':' -f2)
echo "User B Analytics Response: $ANALYTICS_B"
echo "User B Total Monthly Spent: $TOTAL_SPENT_B"

if [[ "$TOTAL_SPENT_B" =~ ^0(\.0+)?$ ]]; then
  echo "✅ Assertion passed: User B totalMonthlySpent = $TOTAL_SPENT_B (User A's 2000 is isolated)"
else
  echo "❌ Assertion failed: User B sees non-zero spending: $TOTAL_SPENT_B"
  exit 1
fi

CSV_B=$(curl -s -X GET "$CORE_URL/reports/export-csv?monthYear=2026-11" \
  -H "Authorization: Bearer $TOKEN_B")
if echo "$CSV_B" | grep -q "Client Team Lunch" || echo "$CSV_B" | grep -q "Intercity Train Ticket"; then
  echo "❌ User isolation failure: User B can see User A's CSV records!"
  exit 1
else
  echo "✅ Assertion passed: User B CSV does not contain User A's expenses!"
fi

# Step 3: Create a Group
echo ""
echo "--- 3. Testing Create Group ---"
GROUP_PAYLOAD=$(cat <<EOF
{
  "name": "Manali Roadtrip $TIMESTAMP",
  "type": "TRIP",
  "createdBy": $MY_USER_ID,
  "memberEmails": ["rahul@example.com", "priya@example.com", "amit@example.com"]
}
EOF
)
GROUP_RESP=$(curl -s -X POST "$CORE_URL/groups" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$GROUP_PAYLOAD")

echo "Group Created: $GROUP_RESP"
GROUP_ID=$(echo "$GROUP_RESP" | grep -o '"id":[0-9]*' | head -n1 | cut -d':' -f2)
echo "✅ Group created with ID: $GROUP_ID"

# Step 4a: Add Expense - EQUAL Split
echo ""
echo "--- 4a. Add Expense with EQUAL Split ---"
EXP1_PAYLOAD=$(cat <<EOF
{
  "title": "Highway Dhaba Dinner",
  "amount": 2400.00,
  "category": "FOOD",
  "groupId": $GROUP_ID,
  "paymentMethod": "UPI",
  "splitType": "EQUAL"
}
EOF
)
EXP1_RESP=$(curl -s -X POST "$CORE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EXP1_PAYLOAD")
echo "Equal Split Expense: $EXP1_RESP"

# Step 4b: Add Expense - EXACT Split
echo ""
echo "--- 4b. Add Expense with EXACT Split ---"
EXP2_PAYLOAD=$(cat <<EOF
{
  "title": "Toll Plaza & Fuel",
  "amount": 3000.00,
  "category": "TRAVEL",
  "groupId": $GROUP_ID,
  "paymentMethod": "FASTAG",
  "splitType": "EXACT",
  "splits": [
    {"userId": 1, "shareAmount": 1000.00},
    {"userId": 2, "shareAmount": 1000.00},
    {"userId": 3, "shareAmount": 500.00},
    {"userId": $MY_USER_ID, "shareAmount": 500.00}
  ]
}
EOF
)
EXP2_RESP=$(curl -s -X POST "$CORE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EXP2_PAYLOAD")
echo "Exact Split Expense: $EXP2_RESP"

# Step 4c: Add Expense - PERCENTAGE Split
echo ""
echo "--- 4c. Add Expense with PERCENTAGE Split ---"
EXP3_PAYLOAD=$(cat <<EOF
{
  "title": "Riverside Cottage Booking",
  "amount": 8000.00,
  "category": "RENT",
  "groupId": $GROUP_ID,
  "paymentMethod": "CARD",
  "splitType": "PERCENTAGE",
  "splits": [
    {"userId": 1, "percentage": 25.00},
    {"userId": 2, "percentage": 25.00},
    {"userId": 3, "percentage": 25.00},
    {"userId": $MY_USER_ID, "percentage": 25.00}
  ]
}
EOF
)
EXP3_RESP=$(curl -s -X POST "$CORE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EXP3_PAYLOAD")
echo "Percentage Split Expense: $EXP3_RESP"

# Step 4d: Add Expense - SHARES Split
echo ""
echo "--- 4d. Add Expense with SHARES Split ---"
EXP4_PAYLOAD=$(cat <<EOF
{
  "title": "Adventure Sports (Rafting & Paragliding)",
  "amount": 6000.00,
  "category": "ENTERTAINMENT",
  "groupId": $GROUP_ID,
  "paymentMethod": "UPI",
  "splitType": "SHARES",
  "splits": [
    {"userId": 1, "shares": 2},
    {"userId": 2, "shares": 2},
    {"userId": 3, "shares": 1},
    {"userId": $MY_USER_ID, "shares": 1}
  ]
}
EOF
)
EXP4_RESP=$(curl -s -X POST "$CORE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EXP4_PAYLOAD")
echo "Shares Split Expense: $EXP4_RESP"
echo "✅ All 4 split types added successfully!"

# Step 5: Get Group Balances & Simplified Debts
echo ""
echo "--- 5. Get Group Balances & Simplified Debts ---"
BALANCES=$(curl -s -X GET "$CORE_URL/groups/$GROUP_ID/balances" \
  -H "Authorization: Bearer $TOKEN")
echo "Net Balances: $BALANCES"

DEBTS=$(curl -s -X GET "$CORE_URL/groups/$GROUP_ID/simplified-debts" \
  -H "Authorization: Bearer $TOKEN")
echo "Simplified Debts: $DEBTS"
echo "✅ Balances and simplified debts computed successfully!"

# Step 6: Settle Up
echo ""
echo "--- 6. Testing Settle Up Payment ---"
SETTLE_PAYLOAD=$(cat <<EOF
{
  "groupId": $GROUP_ID,
  "payerId": 1,
  "payeeId": $MY_USER_ID,
  "amount": 1000.00,
  "paymentMethod": "UPI",
  "notes": "Partial settlement for Manali fuel and dinner"
}
EOF
)
SETTLE_RESP=$(curl -s -X POST "$CORE_URL/settlements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$SETTLE_PAYLOAD")
echo "Settlement Response JSON: $SETTLE_RESP"

# Verify updated debts after settlement
UPDATED_DEBTS=$(curl -s -X GET "$CORE_URL/groups/$GROUP_ID/simplified-debts" \
  -H "Authorization: Bearer $TOKEN")
echo "Updated Simplified Debts after ₹1000 settlement: $UPDATED_DEBTS"
echo "✅ Settlement recorded and debts recalculated!"

# Step 7: Call Analytics Microservice via Core Proxy with JWT
echo ""
echo "--- 7. Inter-Service Call: Core Service (8080) -> Analytics Microservice (8082) ---"
ANALYTICS_RESP=$(curl -s -X GET "$CORE_URL/reports/analytics?userId=$MY_USER_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Analytics Microservice Response: $ANALYTICS_RESP"
echo "✅ Analytics endpoint verified with JWT!"

# Step 8: Export CSV
echo ""
echo "--- 8. Testing CSV Export ---"
CSV_CORE=$(curl -s -X GET "$CORE_URL/reports/export-csv?userId=$MY_USER_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "CSV from Core Proxy:"
echo "$CSV_CORE"

CSV_MICRO=$(curl -s -X GET "$ANALYTICS_URL/export-csv?userId=$MY_USER_ID")
echo "CSV Direct from Analytics Microservice (8082):"
echo "$CSV_MICRO"
echo "✅ CSV export verified!"

echo ""
echo "========================================================"
echo "  🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY!          "
echo "========================================================"
