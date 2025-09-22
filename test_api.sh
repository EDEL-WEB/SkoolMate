#!/bin/bash
BASE_URL="http://127.0.0.1:5000"

echo "🔑 Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed, cannot continue"
  exit 1
fi

echo "✅ Logged in, token acquired!"
echo "Token: $TOKEN"
echo

AUTH_HEADER="Authorization: Bearer $TOKEN"

########################################
# USERS
########################################
echo "👤 USERS"
curl -s -X GET $BASE_URL/users -H "$AUTH_HEADER" | jq
echo

########################################
# COURSES
########################################
echo "📘 COURSES"
curl -s -X GET $BASE_URL/courses -H "$AUTH_HEADER" | jq
echo

########################################
# ENROLLMENTS
########################################
echo "📝 ENROLLMENTS"
curl -s -X GET $BASE_URL/enrollments -H "$AUTH_HEADER" | jq
echo

########################################
# DEPARTMENTS
########################################
echo "🏫 DEPARTMENTS"
curl -s -X GET $BASE_URL/departments -H "$AUTH_HEADER" | jq
echo

########################################
# ASSIGNMENTS
########################################
echo "📂 ASSIGNMENTS"
curl -s -X GET $BASE_URL/assignments -H "$AUTH_HEADER" | jq
echo

########################################
# GRADES
########################################
echo "📊 GRADES"
curl -s -X GET $BASE_URL/grades -H "$AUTH_HEADER" | jq
echo

########################################
# PAYMENTS
########################################
echo "💳 PAYMENTS"
curl -s -X GET $BASE_URL/payments -H "$AUTH_HEADER" | jq
echo

echo "🎉 All routes tested!"
