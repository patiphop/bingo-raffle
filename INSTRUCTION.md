# ระบบบิงโก/สุ่มรางวัล (งานอีเวนต์) — Product Requirements (PO Draft)

## 1) บทสรุป

เว็บแอปสำหรับจัดกิจกรรมบิงโก/สุ่มรางวัลที่รันบน **GitHub Pages (Frontend)** และใช้ **Google Apps Script + Google Sheets (Backend-light)**
รองรับทั้งโหมด “บิงโก” (การ์ด 5×5 มีฟรีเซ็นเตอร์) และ “สุ่มรางวัล/สุ่มชื่อ” (ไม่มีการ์ด) พร้อมหน้าถ่ายทอดสดผลแบบเรียลไทม์พอใช้ (polling)

## 2) เป้าหมาย/ตัวชี้วัด (Outcomes & KPIs)

* โฮสต์สร้าง/เริ่มเกมได้ใน ≤ 2 นาที (ตั้งค่ากติกา + แชร์ลิงก์ห้อง)
* ผู้เล่นเข้าร่วมได้ใน ≤ 30 วินาที (สแกน QR/กดลิงก์ → ใส่ชื่อ → ได้การ์ด)
* เรียกหมายเลข/สุ่มคนถัดไปได้ใน ≤ 1 คลิก
* ผู้ชนะได้รับการยืนยันอัตโนมัติภายใน ≤ 3 วินาทีหลัง “เคลม”
* รองรับผู้เล่นพร้อมกันไม่น้อยกว่า 300 คน ต่อเกม (poll ทุก 2–5 วิ)

## 3) กลุ่มผู้ใช้และบทบาท

* **Host (โฮสต์/ผู้จัดงาน)**: สร้างเกม, ตั้งกติกา/รางวัล, เรียกหมายเลข/สุ่มผู้ชนะ, ปิดเกม
* **Player (ผู้เล่น)**: เข้าร่วมเกม, รับการ์ด, ติ๊กช่อง/ติดตามหมายเลข, กด “เคลมบิงโก”
* **Viewer (ผู้ชม/จอโปรเจ็กเตอร์)**: เปิดหน้าถ่ายทอดสด (board) ดูผลแบบเรียลไทม์
* **Staff (เสริมในอนาคต)**: ช่วยตรวจบิงโก/จ่ายรางวัล

## 4) ขอบเขตเวอร์ชันแรก (MVP Scope)

* โหมด **Bingo 5×5** (เลข 1–75, ฟรีเซ็นเตอร์) และโหมด **Random Draw (Raffle)** เลือกได้ตอนสร้างเกม
* ตั้งค่า: ชื่อเกม, ชนิดเกม, กติกาชนะ (แถว/คอลัมน์/ทแยง/สี่มุม), จำนวนผู้ชนะสูงสุด, ปิดโอกาสชนะซ้ำคนเดิม (toggle)
* ลิงก์/QR สำหรับเข้าร่วม (เข้าจากมือถือ) และลิงก์ “จอถ่ายทอดสด”
* การ์ดผู้เล่นถูก “ล็อกสุ่ม” ด้วย seed ของเกม + playerId (กันโกง/รีเฟรชแล้วเปลี่ยนการ์ด)
* ปุ่ม **Draw** (สุ่มถัดไป) + แสดงรายการที่เรียกแล้ว, ปุ่ม **Undo** 1–3 ครั้งล่าสุด
* ผู้เล่นกด **Claim** → ระบบตรวจอัตโนมัติ (เทียบการ์ดกับหมายเลขที่ถูกเรียก) → ถ้าชนะ บันทึกลง Winners และประกาศบนจอถ่ายทอดสด
* แจ้งเตือนผู้ชนะผ่าน LINE Notify (ถ้าคอนฟิกคีย์ไว้) หรือแสดงคิวอาร์รับของรางวัลบนหน้าจอผู้เล่น
* บอร์ดสด: รายการที่ถูกเรียก, ผู้ชนะ, สถิติ (จำนวนที่เรียกแล้ว/เหลือ, เวลาอัปเดตล่าสุด)
* ปิดเกม/รีเซ็ตเกม

> **นอกขอบเขต MVP**: ระบบจ่ายเงิน, บัญชีผู้ใช้เต็มรูป, WebSocket แท้ (ใช้ polling), Analytics เชิงลึก

## 5) กติกา/การตั้งค่าเกม (Config)

* **Game Type**: `BINGO` หรือ `RAFFLE`
* **Bingo**

  * `gridSize` = 5 (อนาคตค่อยเปิด 3/4/5)
  * `numberRange` = 1–75 (ค่าเริ่มต้น)
  * `freeCenter` = true (ตำแหน่ง \[2,2])
  * **Win Patterns** (เลือกได้หลายอย่าง): `ROW`, `COLUMN`, `DIAGONAL`, `FOUR_CORNERS`
  * `maxWinners` (เช่น 3 คนแรก)
  * `noDuplicateWinners` (ผู้ชนะ1ครั้งห้ามชนะซ้ำ)
* **Raffle**

  * แหล่งข้อมูลรายชื่อ: จาก `Participants` หรืออัปโหลดลิสต์
  * `maxWinners`, `noDuplicateWinners`
* **Common**

  * `hostToken` (ใช้เรียก endpoint ฝั่งโฮสต์)
  * `enableLineNotify` + `lineToken`
  * `boardRefreshSec` (2–5 วินาที)
  * `joinCode` หรือ QR (ซ่อน/แสดงในบอร์ด)

## 6) โฟลว์หลัก

1. **Host Start**

   * โฮสต์เปิดหน้าตั้งค่า → กด “เริ่มเกม” → ได้ `gameId`, QR join, ลิงก์ board
2. **Player Join**

   * ผู้เล่นเปิดลิงก์ → กรอกชื่อ → กดเข้าร่วม
   * โหมด Bingo: ระบบสร้างการ์ดจาก seed + playerId → แสดงการ์ด
   * โหมด Raffle: แสดงสถานะรอสุ่ม/หมายเลขที่ประกาศ
3. **Live Draw**

   * โฮสต์กด **Draw next** → ระบบสุ่ม (เลข/ชื่อ) โดยไม่ซ้ำ → บันทึกลง `Draws` → กระจายผล
4. **Claim & Verify (Bingo)**

   * ผู้เล่นกด **Claim** (เมื่อคิดว่าบิงโก)
   * ระบบตรวจตาม Win Patterns + รายการที่ถูกเรียก → ถ้าผ่าน → บันทึก Winners (ตามลำดับเวลา)
   * แจ้งประกาศบนจอ + (ถ้าตั้ง) ส่ง LINE Notify
5. **End/Reset**

   * โฮสต์กด **End** → ล็อกผล → บันทึกสรุป
   * โฮสต์สามารถ **Reset** (ล้าง Draws/Winners/Participants ยกเว้น Config) เพื่อเล่นใหม่

## 7) UX หลัก (Frontend GH Pages)

* **Host Console**

  * ตั้งค่าเกม → ปุ่ม Start/End/Reset
  * ปุ่ม Draw / Undo / ข้าม (skip)
  * รายการที่เรียกแล้ว (sortable ใหม่→เก่า)
  * ปุ่ม “เปิด Board” (เปิดอีกแท็บ full-screen)
* **Player View**

  * ฟอร์มเข้าร่วม → การ์ด 5×5 (ติ๊กอัตโนมัติเมื่อหมายเลขถูกเรียก, player ยังติ๊กเองได้แต่ไม่ใช่ตัวตรวจชนะ)
  * ปุ่ม **Claim** (แสดงได้เมื่อมีลุ้นตาม patterns)
  * ถ้าชนะ: แสดง “Winner Badge” + หมายเลขรับของรางวัล/QR (ถ้าตั้ง)
* **Board (จอถ่ายทอดสด)**

  * ชื่อเกม, หมายเลข/ชื่อที่เพิ่งเรียก (ใหญ่)
  * กริดหมายเลขทั้งหมด (โชว์ช่องที่ “ถูกเรียกแล้ว”)
  * แถบผู้ชนะเรียงตามเวลา
  * เวลาอัปเดตล่าสุด, สัญญาณเน็ต/รีเฟรชออโต้
* **Accessibility**

  * ปุ่มใหญ่/Contrast ดี, รองรับแสดงผลแนวตั้ง/แนวนอน

## 8) ความปลอดภัย/การเข้าถึง

* **Host endpoints** ต้องใส่ `Authorization: Bearer <hostToken>`
* **CORS** จำกัด Origin ให้โดเมน GitHub Pages ที่กำหนด
* **Rate limit**: จำกัดถี่การ Draw, Claim ต่อ player
* **Anti-cheat**

  * การ์ดผู้เล่นสร้างจาก **seed + playerId** → คงที่
  * ตรวจชนะจากฝั่งเซิร์ฟเวอร์เท่านั้น (ไม่เชื่อฝั่ง client)
  * เก็บ `claimAt` timestamp ใช้ตัดสินคนได้ก่อนกรณีชนกัน

## 9) โครงสร้างข้อมูล Google Sheets

**Sheets:**

* `Games`

  * `gameId` (PK), `name`, `type`, `gridSize`, `numberMin`, `numberMax`, `freeCenter` (bool), `winPatterns` (CSV), `maxWinners`, `noDuplicateWinners` (bool), `status` (DRAFT|LIVE|ENDED), `hostTokenHash`, `lineTokenHash`, `boardRefreshSec`, `seed`, `createdAt`, `endedAt`
* `Participants`

  * `participantId` (PK), `gameId`, `displayName`, `lineUserId` (opt), `joinedAt`, `banned` (bool)
* `Cards` (Bingo เท่านั้น)

  * `cardId` (PK), `gameId`, `participantId`, `gridSize`, `cellsJSON` (เช่น `[[1,16,31,46,61],...]`), `freeCenter` (bool), `cardHash`, `createdAt`
* `Draws`

  * `drawId` (PK), `gameId`, `value` (เลขหรือชื่อ/participantId), `sequence` (1,2,3…), `drawnAt`, `undone` (bool)
* `Winners`

  * `winnerId` (PK), `gameId`, `participantId`, `pattern` (ROW/COLUMN/DIAGONAL/FOUR\_CORNERS/RAFFLE), `rank` (1=ที่1), `claimedAt`, `verifiedAt`, `prize` (opt), `status` (PENDING|VERIFIED|REJECTED)
* `Config`

  * `key`, `value` (เช่น allowOrigins, maintenanceMessage ฯลฯ)
* `BoardCache` (ทางเลือก)

  * `gameId`, `lastUpdatedAt`, `boardJSON` (แคชเพื่อลด read หลายชีต)

> หมายเหตุ: เก็บเวลารูปแบบ ISO8601 (UTC), ใช้ `gameId` เป็นสตริงสุ่มเช่น `G_abc123`

## 10) สถานะเกม (State Machine)

* `DRAFT` → (POST /api/start) → `LIVE`
* `LIVE` → (POST /api/end) → `ENDED`
* `ENDED` → (POST /api/reset) → `DRAFT` (ล้างข้อมูลย่อยตามนโยบาย)

## 11) สเปก API (Apps Script Web App)

**Auth**

* Host-only: Header `Authorization: Bearer <hostToken>`
* Public: ไม่ต้องใส่ (เฉพาะ GET board/card/join)

### 11.1 POST `/api/start` (Host)

เริ่มเกมใหม่

```json
// request (Host)
{
  "name": "Company Party Bingo",
  "type": "BINGO",
  "gridSize": 5,
  "numberMin": 1,
  "numberMax": 75,
  "freeCenter": true,
  "winPatterns": ["ROW","COLUMN","DIAGONAL"],
  "maxWinners": 3,
  "noDuplicateWinners": true,
  "boardRefreshSec": 3
}
// response
{
  "gameId": "G_abc123",
  "joinUrl": "https://user.github.io/app/join?gameId=G_abc123",
  "boardUrl": "https://user.github.io/app/board?gameId=G_abc123"
}
```

### 11.2 POST `/api/join`

ผู้เล่นเข้าร่วมเกม

```json
// request
{ "gameId": "G_abc123", "displayName": "Pat" }
// response (BINGO)
{
  "participantId": "P_xxx",
  "cardId": "C_xxx",
  "gridSize": 5,
  "cells": [[5,18,33,50,68],...],
  "freeCenter": true
}
// response (RAFFLE)
{
  "participantId": "P_xxx",
  "message": "Joined raffle"
}
```

### 11.3 GET `/api/card?gameId=G_abc123&participantId=P_xxx`

ดึงการ์ดของผู้เล่น (กันกรณีรีเฟรช)

### 11.4 POST `/api/draw` (Host)

สุ่มรายการถัดไป (ไม่ซ้ำ)

```json
// request
{ "gameId": "G_abc123" }
// response
{
  "sequence": 12,
  "value": 42,
  "drawnAt": "2025-08-10T09:00:00Z",
  "called": [12,31,42,...]
}
```

### 11.5 POST `/api/undo` (Host)

ย้อนการสุ่มครั้งล่าสุด

```json
{ "gameId": "G_abc123" }
```

### 11.6 POST `/api/claim`

ผู้เล่นเคลมบิงโก

```json
// request
{ "gameId": "G_abc123", "participantId": "P_xxx" }
// response
{
  "valid": true,
  "pattern": "ROW",
  "rank": 1
}
```

### 11.7 GET `/api/board?gameId=G_abc123`

สถานะล่าสุดสำหรับจอถ่ายทอดสด/ผู้เล่น (ใช้สำหรับ polling)

```json
{
  "game": { "name":"Company Party Bingo", "status":"LIVE" },
  "called": [12,31,42,...],
  "lastValue": 42,
  "winners": [
    {"rank":1,"displayName":"Pat","pattern":"ROW","time":"2025-08-10T09:01:02Z"}
  ],
  "lastUpdatedAt":"2025-08-10T09:01:02Z"
}
```

### 11.8 POST `/api/end` (Host)

ปิดเกม + ล็อกผล

### 11.9 POST `/api/reset` (Host)

รีเซ็ตข้อมูลย่อย (Draws/Winners/Participants/Cards) ให้กลับไป DRAFT

> **หมายเหตุ**: ตามที่สรุปไว้เดิมมี `/api/start`, `/api/draw`, `/api/board` เท่านั้น
> เอกสารนี้เสนอ **เพิ่ม** `/api/join`, `/api/card`, `/api/claim`, `/api/undo`, `/api/end`, `/api/reset` เพื่อให้ครบวงจรจริง

## 12) กติกาการตรวจบิงโก (Validation)

* สร้าง **mask** จากรายการที่ถูกเรียก (`called`) เทียบกับ `cells` ของการ์ด
* เติม `true` ที่ center ถ้า `freeCenter=true`
* ชนะเมื่อ

  * **ROW**: มีแถวใดแถวหนึ่งที่ mask เป็น `true` ทั้งแถว
  * **COLUMN**: มีคอลัมน์ใดคอลัมน์หนึ่งที่ `true` ทั้งคอลัมน์
  * **DIAGONAL**: หลัก/รอง เป็น `true` ทั้งแนว
  * **FOUR\_CORNERS**: มุมทั้ง 4 เป็น `true`
* กรณีเคลมพร้อมกัน: จัดอันดับจาก `claimAt` (เวลาเซิร์ฟเวอร์)
* ถ้า `noDuplicateWinners=true` และผู้เล่นเดียวกันเคลมซ้ำ ให้ `valid=false`

## 13) เรียลไทม์ (Polling Design)

* ผู้เล่น/บอร์ดเรียก `GET /api/board` ทุก `boardRefreshSec` วินาที
* ใช้ `If-None-Match` แบบง่าย: ส่ง `lastUpdatedAt` ไปด้วย ถ้าไม่เปลี่ยนให้ส่ง 304 หรือ payload ว่างเพื่อลดโควตา
* แคช `boardJSON` ลงชีต `BoardCache` หลัง Draw/Claim ทุกครั้ง

## 14) LINE / อีเมล (ตัวเลือก)

* LINE Notify (ง่าย): ส่งข้อความเมื่อมีผู้ชนะ/ปิดเกม
* LINE Messaging API (ขั้นกว่า): push แจ้งผู้ชนะเฉพาะคน (ต้องเก็บ `lineUserId`)
* อีเมล: ใช้ `MailApp` แจ้งสรุปผลหลังเกมจบ

## 15) ข้อจำกัด/โควตา (เชิงแนวทาง)

* Apps Script/Sheets มีโควตาการอ่าน/เขียนและเวลา runtime:

  * รวมคำสั่งอ่าน/เขียน **แบบ batch** เท่าที่ทำได้
  * ใช้แคช (BoardCache) เพื่อลดอ่านหลายชีตพร้อมกัน
  * จำกัด polling ที่ 2–5 วินาที ต่อ client

## 16) การบันทึก/ตรวจสอบ (Logging & Admin)

* บันทึกทุก Draw/Undo/Claim ลง `Draws`/`Winners` พร้อมเวลา
* หน้ารายงาน (ภายหลัง): export CSV ผู้เล่น/ผู้ชนะ

## 17) ความเสถียร/การกู้คืน (Edge cases)

* โฮสต์เผลอกด Draw ซ้ำ: ปุ่ม Undo (ได้ 1–3 ครั้ง)
* ผู้เล่นเปลี่ยนเครื่อง/รีเฟรช: ดึงการ์ดเดิมผ่าน `/api/card`
* เน็ตหลุดชั่วคราว: UI แสดง “กำลังเชื่อมต่อใหม่” แต่ยังแสดงผลล่าสุดจากแคช

## 18) การทดสอบยอมรับ (Acceptance Criteria) — MVP

* [ ] เริ่มเกม `BINGO` ตั้งค่าได้ครบ (grid 5×5, patterns, maxWinners)
* [ ] ผู้เล่น > 100 คนเข้าร่วมพร้อมกันได้ ไม่มีการ์ดซ้ำ (seed+participantId)
* [ ] โฮสต์กด Draw แล้วรายการไม่ซ้ำ, Undo ทำงานได้
* [ ] ผู้เล่นกด Claim แล้วระบบตรวจอัตโนมัติถูกต้องทุก pattern
* [ ] ผู้ชนะหลายคนชนกัน → จัด rank ถูกต้องตามเวลา
* [ ] `/api/board` อัปเดตภายใน ≤ 3 วินาทีหลัง Draw/Claim
* [ ] ปิดเกมแล้วไม่สามารถ Draw/Join/Claim ได้
* [ ] (ถ้าตั้ง) ส่ง LINE Notify เมื่อมีผู้ชนะและตอนปิดเกม
* [ ] Reset เกมแล้วข้อมูลย่อยถูกล้าง แต่ Config เกมยังอยู่

## 19) Definition of Done (DoD)

* สคริปต์ Apps Script + โครงหน้าเว็บ React/HTML พร้อมใช้งานบน GitHub Pages
* ไฟล์ตัวอย่าง Google Sheets template พร้อมชื่อชีตและคอลัมน์ตามสเปก
* เอกสารวิธี Deploy (ติดตั้งสคริปต์, เผยแพร่ Web App, ใส่คีย์/Token)
* ชุดทดสอบมือ (Manual test checklist) + ข้อจำกัดโควตา/แนวทางแก้
* README ระบุ Known issues (เช่น ใช้ polling แทน WebSocket)

---

ถ้าพร้อมเริ่ม ผมสปิน **boilerplate** ให้เลยได้:

* โฟลเดอร์ Frontend (หน้า Host/Player/Board)
* สคริปต์ Apps Script (Endpoints ตามสเปก)
* Google Sheets Template (หัวตารางครบ)

บอกผมเลยว่าอยากได้ **BINGO เท่านั้น** หรือรวม **RAFFLE** ไปด้วยในชุดแรก 👌
