#!/bin/bash
# Member flows (requires token from login)

TOKEN=$1
if [ -z "$TOKEN" ]; then
  echo "Usage: ./member_tests.sh <TOKEN>"
  exit 1
fi

echo "List members (admin)"
curl -s -X GET http://localhost:5001/api/members \
 -H "Authorization: Bearer $TOKEN" | jq

echo "Get member with id=5"
curl -s -X GET http://localhost:5001/api/members/5 \
 -H "Authorization: Bearer $TOKEN" | jq
