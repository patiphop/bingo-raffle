#!/bin/bash

# ทดสอบ endpoint /api/board (GET)
# แทนที่ YOUR_SHEET_URL และ GAME_ID ด้วยค่าจริง

SHEET_URL="YOUR_SHEET_URL_HERE"
GAME_ID="G_test123"

echo "ทดสอบ GET /api/board"
echo "URL: $SHEET_URL/api/board?gameId=$GAME_ID"
echo "Game ID: $GAME_ID"
echo ""

curl -X GET "$SHEET_URL/api/board?gameId=$GAME_ID" \
  -v
