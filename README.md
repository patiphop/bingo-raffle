# Bingo / Raffle — GitHub Pages + Google Apps Script

เว็บแอปกิจกรรมงานอีเวนต์ รองรับทั้ง **Bingo (5×5, 1–75, ฟรีเซ็นเตอร์)** และ **Raffle (สุ่มชื่อ)**
Frontend รันบน **Vite Dev Server** และ Build เป็นไฟล์ Static เพื่อโฮสต์บน **GitHub Pages**
Backend เป็น **Google Apps Script** ที่ใช้ **Google Sheets** เป็นฐานข้อมูล

## โครงสร้างโปรเจกต์
```
frontend/           # หน้าเว็บ Host / Player / Board
backend/            # โค้ด Apps Script + โครงร่างชีต
docs/               # เอกสาร deploy / ทดสอบ / known issues
vite.config.js      # การตั้งค่า Vite
package.json        # สคริปต์และ dependency
```

## ความต้องการเบื้องต้น (Prerequisites)
- Node.js 18+
- Google Account เพื่อสร้าง Google Sheet และโฮสต์ Apps Script

## Installation
```bash
npm install
```

## Development (Vite Dev Server)
```bash
npm run dev
```
แล้วเปิด [http://localhost:5173](http://localhost:5173)

## Build (สำหรับ Deploy)
```bash
npm run build
```
ไฟล์ build จะอยู่ในโฟลเดอร์ `dist/` สามารถนำไปโฮสต์บน GitHub Pages ได้ทันที

## Preview Build
```bash
npm run preview
```

## Deploy
ทำตามเอกสาร `docs/DEPLOY.md`:
- สร้าง Google Sheet ตาม `backend/GoogleSheetsTemplate.json`
- วางโค้ด `backend/Code.gs` ใน Apps Script และ Deploy เป็น **Web app** (ผู้เข้าถึง: Anyone with the link)
- โฮสต์โฟลเดอร์ `dist/` บน GitHub Pages
- เปิดหน้า `index.html` แล้วกรอก API Base URL (ลิงก์ `/exec`) และกด Save
# bingo-raffle
