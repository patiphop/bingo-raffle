#!/bin/bash

# Google Apps Script API Testing Script
# ใช้สำหรับทดสอบ endpoints ต่างๆ และดู error ที่เกิดขึ้น

# ตั้งค่า URL ของ Google Apps Script Web App
# แทนที่ YOUR_SHEET_URL ด้วย URL จริงที่ได้จากการ deploy
SHEET_URL="YOUR_SHEET_URL_HERE"

echo "=== ทดสอบ Google Apps Script API ==="
echo "URL: $SHEET_URL"
echo ""

# 1. ทดสอบ endpoint /api/start
echo "1. ทดสอบ /api/start (สร้างเกมใหม่)"
echo "POST $SHEET_URL/api/start"
curl -X POST "$SHEET_URL/api/start" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "name": "Test Bingo Game",
    "type": "BINGO",
    "gridSize": 5,
    "numberMin": 1,
    "numberMax": 75,
    "freeCenter": true,
    "winPatterns": ["ROW", "COLUMN", "DIAGONAL"],
    "maxWinners": 3,
    "noDuplicateWinners": true,
    "boardRefreshSec": 3
  }' \
  -v
echo ""
echo "----------------------------------------"
echo ""

# 2. ทดสอบ endpoint /api/join (ถ้าได้ gameId จากขั้นตอนที่ 1)
echo "2. ทดสอบ /api/join (เข้าร่วมเกม)"
echo "POST $SHEET_URL/api/join"
curl -X POST "$SHEET_URL/api/join" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "gameId": "G_test123",
    "displayName": "Test Player"
  }' \
  -v
echo ""
echo "----------------------------------------"
echo ""

# 3. ทดสอบ endpoint /api/draw (ถ้าได้ gameId จากขั้นตอนที่ 1)
echo "3. ทดสอบ /api/draw (สุ่มหมายเลข)"
echo "POST $SHEET_URL/api/draw"
curl -X POST "$SHEET_URL/api/draw" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "gameId": "G_test123"
  }' \
  -v
echo ""
echo "----------------------------------------"
echo ""

# 4. ทดสอบ endpoint /api/board (GET request)
echo "4. ทดสอบ /api/board (ดูข้อมูลเกม)"
echo "GET $SHEET_URL/api/board?gameId=G_test123"
curl -X GET "$SHEET_URL/api/board?gameId=G_test123" \
  -v
echo ""
echo "----------------------------------------"
echo ""

# 5. ทดสอบ CORS preflight request
echo "5. ทดสอบ CORS preflight request"
echo "OPTIONS $SHEET_URL/api/start"
curl -X OPTIONS "$SHEET_URL/api/start" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
echo ""
echo "----------------------------------------"
echo ""

echo "=== การทดสอบเสร็จสิ้น ==="
echo ""
echo "หมายเหตุ:"
echo "- แทนที่ YOUR_SHEET_URL_HERE ด้วย URL จริงของ Google Apps Script"
echo "- ตรวจสอบ error messages และ HTTP status codes"
echo "- หากมี CORS error ให้ตรวจสอบการตั้งค่าใน Google Apps Script"
