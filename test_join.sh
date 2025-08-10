#!/bin/bash

# ทดสอบ endpoint /api/join
# แทนที่ YOUR_SHEET_URL และ GAME_ID ด้วยค่าจริง

SHEET_URL="YOUR_SHEET_URL_HERE"
GAME_ID="G_test123"

echo "ทดสอบ POST /api/join"
echo "URL: $SHEET_URL/api/join"
echo "Game ID: $GAME_ID"
echo ""

curl -X POST "$SHEET_URL/api/join" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d "{
    \"gameId\": \"$GAME_ID\",
    \"displayName\": \"Test Player\"
  }" \
  -v
