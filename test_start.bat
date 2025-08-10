@echo off
REM ทดสอบ endpoint /api/start สำหรับ Windows
REM แทนที่ YOUR_SHEET_URL ด้วย URL จริง

set SHEET_URL=YOUR_SHEET_URL_HERE

echo ทดสอบ POST /api/start
echo URL: %SHEET_URL%/api/start
echo.

curl -X POST "%SHEET_URL%/api/start" ^
  -H "Content-Type: text/plain;charset=utf-8" ^
  -d "{\"name\": \"Test Bingo Game\", \"type\": \"BINGO\", \"gridSize\": 5, \"numberMin\": 1, \"numberMax\": 75, \"freeCenter\": true, \"winPatterns\": [\"ROW\", \"COLUMN\", \"DIAGONAL\"], \"maxWinners\": 3, \"noDuplicateWinners\": true, \"boardRefreshSec\": 3}" ^
  -v

pause
