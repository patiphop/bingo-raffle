# การทดสอบ Google Apps Script API

ไฟล์เหล่านี้ใช้สำหรับทดสอบ Google Apps Script API ที่ใช้เป็น backend สำหรับระบบบิงโก/สุ่มรางวัล

## ไฟล์ที่สร้างขึ้น

1. **`test_api.sh`** - ทดสอบทุก endpoints พร้อมกัน
2. **`test_start.sh`** - ทดสอบ endpoint `/api/start` (สร้างเกมใหม่)
3. **`test_join.sh`** - ทดสอบ endpoint `/api/join` (เข้าร่วมเกม)
4. **`test_draw.sh`** - ทดสอบ endpoint `/api/draw` (สุ่มหมายเลข)
5. **`test_board.sh`** - ทดสอบ endpoint `/api/board` (ดูข้อมูลเกม)
6. **`test_cors.sh`** - ทดสอบ CORS preflight request

## วิธีการใช้งาน

### 1. แก้ไข URL ในไฟล์
แทนที่ `YOUR_SHEET_URL_HERE` ในทุกไฟล์ด้วย URL จริงของ Google Apps Script Web App

### 2. ให้สิทธิ์การรันไฟล์
```bash
chmod +x test_*.sh
```

### 3. รันการทดสอบ
```bash
# ทดสอบทั้งหมด
./test_api.sh

# หรือทดสอบทีละ endpoint
./test_start.sh
./test_join.sh
./test_draw.sh
./test_board.sh
./test_cors.sh
```

## การวิเคราะห์ผลลัพธ์

### HTTP Status Codes ที่คาดหวัง
- **200 OK** - สำเร็จ
- **400 Bad Request** - ข้อมูลไม่ถูกต้อง
- **401 Unauthorized** - ไม่มีสิทธิ์ (ตรวจสอบการตั้งค่า Google Apps Script)
- **404 Not Found** - endpoint ไม่ถูกต้อง
- **500 Internal Server Error** - ข้อผิดพลาดใน Google Apps Script

### CORS Issues
หากพบ CORS error ให้ตรวจสอบ:
1. การตั้งค่า Google Apps Script Web App
2. Execute as: **Me**
3. Who has access: **Anyone**
4. ใช้ URL ที่ได้จาก "Web app URL" เท่านั้น

### Error Messages ที่พบบ่อย
- **"Please set SHEET_URL"** - ยังไม่ได้ตั้งค่า URL
- **"Unauthorized"** - ปัญหาการตั้งค่า Google Apps Script
- **"Game not found"** - gameId ไม่ถูกต้อง
- **"Game not live"** - เกมยังไม่ได้เริ่ม

## การแก้ไขปัญหา CORS

### ใน Google Apps Script
1. เปิด Google Apps Script
2. ไปที่ Deploy > Manage deployments
3. เลือก Web app
4. ตรวจสอบ:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Version: **New version**

### ใน Frontend Code
ตรวจสอบ `frontend/src/lib/api.js` ว่าตั้งค่า Content-Type ถูกต้อง:
```javascript
headers: { 'Content-Type': 'text/plain;charset=utf-8' }
```

## หมายเหตุ
- การทดสอบนี้ใช้ `-v` flag เพื่อดู verbose output
- หากต้องการดูเฉพาะ response body ให้ลบ `-v` ออก
- ตรวจสอบ console ของ browser เพื่อดู CORS errors
