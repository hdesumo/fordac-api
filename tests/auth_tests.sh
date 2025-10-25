#!/bin/bash
# Auth tests - run from project root, ensure API running on port 5001

echo "Login SuperAdmin"
curl -s -X POST http://localhost:5001/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"superadmin@fordac-connect.org","password":"fordac2025"}' | jq

echo "Login Admin Njombe"
curl -s -X POST http://localhost:5001/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin.njombe@fordac-connect.org","password":"fordac2025"}' | jq
