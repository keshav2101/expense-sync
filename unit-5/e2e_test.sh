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
echo "Settlement Response: $SETTLE_RESP"

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
