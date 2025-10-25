#!/bin/bash
# Message tests: send and list
TOKEN=$1
if [ -z "$TOKEN" ]; then
  echo "Usage: ./message_tests.sh <TOKEN>"
  exit 1
fi

# send message to member (example recipient_id = 6)
curl -s -X POST http://localhost:5001/api/messages/send \
 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
 -d '{"recipient_id":6,"subject":"Test","body":"Message de test depuis admin/superadmin."}' | jq

# inbox
curl -s -X GET http://localhost:5001/api/messages/inbox -H "Authorization: Bearer $TOKEN" | jq
