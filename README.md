# 📊 Customer Satisfaction (CSAT) & Multi-Tier Analytics Platform

> ระบบรับ Feedback และประเมินความพึงพอใจลูกค้าผ่านตู้ Kiosk หน้าร้าน พร้อมระบบ Multi-Tier Analytics Dashboard สำหรับวิเคราะห์และเปรียบเทียบข้อมูลระดับองค์กร

---

## 🎯 ผู้ใช้งานและฟังก์ชันหลัก (Key User Groups)

ระบบแบ่งการใช้งานออกเป็น 3 กลุ่มหลักอย่างชัดเจน:

1. **👥 ลูกค้าหน้าร้าน (Customer Kiosk):**
   * ประเมินความพึงพอใจได้สะดวกรวดเร็วผ่านหน้าจอ Touchscreen (`/satisfaction`)
   * รองรับการตั้งค่าธีม, คำถาม, และขนาด UI แบบ Real-time จากหลังบ้าน
2. **🏪 สาขาและหน้าร้าน (Branch & Store):**
   * ตรวจสอบสถานะการเชื่อมต่อของตู้ Kiosk และดูผลคะแนนแบบ Real-time รายชั่วโมง
3. **📈 ผู้บริหารระดับต่าง ๆ (Multi-Tier Management):**
   * เข้าถึงข้อมูลและวิเคราะห์สถิติเปรียบเทียบตามโครงสร้างสิทธิ์การเข้าถึงข้อมูล (Data Access Scope):
     * `Super Admin (บริษัทแม่)` ➔ ภาพรวมทุกแบรนด์ทั้งองค์กร
     * `Brand Owner (เจ้าของแบรนด์)` ➔ เปรียบเทียบผลงานระหว่างภาค
     * `Regional Manager (RM - ระดับภาค)` ➔ เปรียบเทียบผลงานระหว่างจังหวัด
     * `Area Manager (AM - ระดับเขต/จังหวัด)` ➔ เปรียบเทียบผลงานระหว่างสาขา

---

## 📸 ภาพตัวอย่างระบบ (Preview)

| 📱 หน้าจอ Kiosk ประเมินหน้าร้าน | 📊 หน้าจอ Dashboard วิเคราะห์ข้อมูล |
|:---:|:---:|
| *(ใส่ลิงก์รูป Screenshot หน้า Kiosk)* | *(ใส่ลิงก์รูป Screenshot หน้า Dashboard)* |

---

## 🛠️ Tech Stack & Architecture

| ส่วนงาน | เทคโนโลยีที่ใช้ | สถานะ |
|---|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS | 🟢 พร้อมใช้งาน (Mock Data) |
| **Backend** | C# .NET Web API | 🟡 กำลังพัฒนา (Roadmap) |
| **Database** | PostgreSQL | 🟡 กำลังพัฒนา (Roadmap) |
| **DevOps / Environment** | Docker & Docker Compose | 🟡 กำลังพัฒนา (Roadmap) |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Satifaction2/
├── Frontend/                          # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/               # ระบบหลังบ้านและ Dashboard
│   │   │   │   ├── dashboard/         # วิเคราะห์สถิติและเปรียบเทียบข้อมูล
│   │   │   │   ├── brand/             # จัดการข้อมูลแบรนด์
│   │   │   │   ├── branch/            # จัดการข้อมูลสาขาและตู้ Kiosk
│   │   │   │   ├── usermanagement/    # จัดการผู้ใช้งานและ Bulk Import/Export
│   │   │   │   ├── dataaccess/        # กำหนดขอบเขตสิทธิ์การเข้าถึงข้อมูล (AM/RM)
│   │   │   │   ├── audit/             # ตรวจสอบประวัติการทำงานและสถานะ Service
│   │   │   │   └── settings/          # ตั้งค่าข้อความและขนาดปุ่มบนตู้ Kiosk
│   │   │   └── (user)/
│   │   │       └── satisfaction/      # หน้าจอ Kiosk Touchscreen สำหรับลูกค้า
│   │   ├── Components/                # Reusable UI Components (Modals, Grids, Navbar)
│   │   └── Lib/                       # Utilities & Local State Sync
└── Backend/                           # C# .NET Web API (Upcoming)
```

---

## ⚡ วิธีการติดตั้งและเริ่มใช้งาน (Getting Started)

### ความต้องการของระบบ (Prerequisites)
* Node.js 18.x ขึ้นไป
* npm หรือ yarn / pnpm

### ขั้นตอนการรัน Frontend (Development Mode)

```bash
# 1. เข้าสู่โฟลเดอร์ Frontend
cd Frontend

# 2. ติดตั้ง Dependencies
npm install

# 3. รัน Development Server
npm run dev
```

เปิดบราวเซอร์ไปที่: **[http://localhost:3000](http://localhost:3000)**

---

## ⌨️ คีย์ลัดในระบบ (Shortcuts)
* **<kbd>Ctrl</kbd> + <kbd>K</kbd>** (หรือ **<kbd>Cmd</kbd> + <kbd>K</kbd>** บน Mac): ค้นหาเมนู, สาขา และการตั้งค่าด่วน (Global Command Search)

---

## 📌 แผนการพัฒนาต่อไป (Roadmap)
- [x] ออกแบบ Frontend UI & State Sync (Kiosk + Admin Dashboard)
- [ ] พัฒนา Backend API ด้วย C# .NET
- [ ] ออกแบบฐานข้อมูล PostgreSQL และ Migration Script
- [ ] เชื่อมต่อระบบ Authentication (JWT) และ Role-Based Data Access จริง
- [ ] จัดทำ Docker Container สำหรับจำลองสภาพแวดล้อม Production
