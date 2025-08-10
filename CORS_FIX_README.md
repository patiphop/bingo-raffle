# การแก้ไขปัญหา CORS

## ปัญหาที่พบ
```
Access to fetch at 'https://script.google.com/macros/s/.../exec/api/join' from origin 'https://patiphop.github.io' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## สาเหตุ
Google Apps Script ไม่ได้ส่ง CORS headers กลับมาใน response ทำให้ browser ปฏิเสธ request

## วิธีแก้ไข

### 1. อัปเดต Google Apps Script Code

1. เปิด Google Apps Script ที่ https://script.google.com
2. แทนที่โค้ดทั้งหมดด้วยเนื้อหาจากไฟล์ `backend/Code_Updated.gs`
3. หรืออัปเดตฟังก์ชันต่อไปนี้:

#### อัปเดตฟังก์ชัน `jsonOutput`:
```javascript
function jsonOutput(obj){ 
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

#### เพิ่มฟังก์ชัน `doOptions`:
```javascript
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

#### อัปเดตฟังก์ชัน `doGet` และ `doPost`:
เพิ่ม CORS headers ในทุก response ที่ไม่ใช่ JSON

### 2. Deploy ใหม่

1. ไปที่ Deploy > Manage deployments
2. เลือก Web app ที่มีอยู่
3. กด "New version"
4. ตรวจสอบการตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กด "Deploy"

### 3. ทดสอบ

1. เปิดเว็บไซต์ https://patiphop.github.io/bingo-raffle
2. เปิด Developer Tools (F12)
3. ไปที่ Network tab
4. ลองทำการเข้าร่วมเกม
5. ตรวจสอบว่าไม่มี CORS error

## CORS Headers ที่เพิ่ม

- `Access-Control-Allow-Origin: *` - อนุญาตทุก origin
- `Access-Control-Allow-Methods: GET, POST, OPTIONS` - อนุญาต HTTP methods
- `Access-Control-Allow-Headers: Content-Type` - อนุญาต headers

## หมายเหตุ

- หลังจากอัปเดต Google Apps Script แล้ว อาจต้องรอ 1-2 นาทีให้การเปลี่ยนแปลงมีผล
- หากยังมีปัญหา ให้ clear browser cache หรือใช้ incognito mode
- ตรวจสอบว่า URL ใน .env ถูกต้องและเป็น URL ล่าสุดจากการ deploy

## การทดสอบด้วย curl

ใช้ไฟล์ `test_start.sh` ที่อัปเดตแล้วเพื่อทดสอบ:

```bash
./test_start.sh
```

ควรเห็น CORS headers ใน response:
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, OPTIONS
< access-control-allow-headers: Content-Type
```
