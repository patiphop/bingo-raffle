#!/bin/bash

# ทดสอบ CORS preflight request
# แทนที่ YOUR_SHEET_URL ด้วย URL จริง

SHEET_URL="YOUR_SHEET_URL_HERE"

echo "ทดสอบ CORS preflight request"
echo "URL: $SHEET_URL/api/start"
echo ""

curl -X OPTIONS "$SHEET_URL/api/start" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
