#!/bin/bash
# Verification Script for Customers RLS Security Fix
# This script tests whether the vulnerability has been fixed

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_PUBLISHABLE_KEYS_RAW="${SUPABASE_PUBLISHABLE_KEYS}"
SUPABASE_ANON_KEY=""
if [ -n "$SUPABASE_PUBLISHABLE_KEYS_RAW" ]; then
  SUPABASE_ANON_KEY=$(echo "$SUPABASE_PUBLISHABLE_KEYS_RAW" | grep -o '"default"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"default"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}ERROR: Missing Supabase environment variables${NC}"
  echo "Please ensure VITE_SUPABASE_URL and SUPABASE_PUBLISHABLE_KEYS are set in .env"
  exit 1
fi

echo "=========================================="
echo "Customers Table RLS Security Verification"
echo "=========================================="
echo ""

# Test 1: Direct SELECT on customers table
echo "Test 1: Testing direct SELECT access to customers table..."
echo "Command: curl -s -H 'apikey: <ANON-KEY>' '\$SUPABASE_URL/rest/v1/customers?select=*&limit=1'"
echo ""

RESPONSE=$(curl -s -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  "${SUPABASE_URL}/rest/v1/customers?select=*&limit=1")

echo "Response: $RESPONSE"
echo ""

# Check if response contains customer data (indicates vulnerability)
if echo "$RESPONSE" | grep -q '"id"' && echo "$RESPONSE" | grep -q '"email"'; then
  echo -e "${RED}❌ VULNERABLE: Customer data is exposed via direct SELECT${NC}"
  echo "   Response contains customer records that should not be accessible"
  exit 1
elif echo "$RESPONSE" | grep -q '"code"' && (echo "$RESPONSE" | grep -q "permission denied" || echo "$RESPONSE" | grep -q "permission"); then
  echo -e "${GREEN}✅ SECURE: RLS policy correctly denies access${NC}"
elif echo "$RESPONSE" | grep -q '^\[\]'; then
  echo -e "${GREEN}✅ SECURE: Empty result set - no unauthorized access${NC}"
else
  echo -e "${YELLOW}⚠️  UNCERTAIN: Unexpected response. Check manually.${NC}"
  echo "   Response: $RESPONSE"
fi

echo ""
echo "=========================================="
echo "Test 2: Testing customer registration (INSERT)"
echo "=========================================="
echo ""

# Test inserting a customer
TEST_EMAIL="test-$(date +%s)@test.com"
echo "Attempting to register a new customer: $TEST_EMAIL"

INSERT_RESPONSE=$(curl -s -X POST \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"first_name\":\"Test\",\"last_name\":\"User\",\"phone\":\"+91-9999999999\"}" \
  "${SUPABASE_URL}/rest/v1/customers")

echo "Response: $INSERT_RESPONSE"
echo ""

if echo "$INSERT_RESPONSE" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Registration allowed (expected behavior)${NC}"
elif echo "$INSERT_RESPONSE" | grep -q "permission denied"; then
  echo -e "${YELLOW}⚠️  Registration blocked - may need to allow INSERT policy${NC}"
else
  echo -e "${YELLOW}⚠️  Unexpected response. Check manually.${NC}"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "✅ If Test 1 shows 'SECURE' status, the vulnerability has been fixed"
echo "✅ If Test 2 shows 'Registration allowed', customers can still register"
echo ""
echo "If you see different results, review the RLS policies:"
echo "  SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'customers';"
echo ""
