# 📊 Enterprise CSAT Customer Satisfaction & Multi-Tier Analytics Platform

ระบบประเมินความพึงพอใจลูกค้าแบบ Kiosk Touchscreen และศูนย์บริหารจัดการข้อมูลองค์กรระดับ Enterprise สำหรับเครือข่ายธุรกิจร้านอาหารและสนามบิน (เช่น **CRG - Central Restaurants Group**)

---

## 🏢 สถาปัตยกรรมลำดับชั้นองค์กร (5-Tier Organizational Hierarchy)

ระบบถูกออกแบบมาเพื่อรองรับองค์กรที่มีหลายแบรนด์, หลายภาค และหลายร้อยสาขาทั่วประเทศ โดยแบ่งการเข้าถึงข้อมูลและการวิเคราะห์ออกเป็น **5 ระดับ**:

```
👑 1. Super Admin (ผู้ดูแลระบบสูงสุด)
    └── เห็นข้อมูลและสถิติ CSAT ของทุกแบรนด์ทั้งองค์กร
 └── 🍗 2. Brand Owner (เจ้าของแบรนด์ เช่น KFC, Mister Donut, Auntie Anne's)
      └── ดูภาพรวมของแบรนด์ และเปรียบเทียบผลงานระดับ "ภาค" (เช่น ภาคเหนือ vs ภาคใต้)
      └── 📍 3. Regional Manager (RM - ผู้จัดการระดับภาค)
           └── เปรียบเทียบผลคะแนน CSAT ระดับ "จังหวัด" ในภาคของตนเอง (เช่น เชียงใหม่ vs พิษณุโลก)
           └── 🏙️ 4. Area Manager (AM - ผู้จัดการระดับเขต/จังหวัด)
                └── เปรียบเทียบผลคะแนน CSAT ระดับ "สาขา" ในจังหวัดที่รับผิดชอบ
                └── 🏪 5. Branch Staff / Kiosk Inspector (เจ้าหน้าที่สาขา)
                     └── ดูสถานะตู้ Kiosk และผลคะแนนประเมินรายชั่วโมงของสาขาตนเอง
```

---

## 🚀 ฟีเจอร์หลักของระบบ (Key Features)

### 1. 🖥️ หน้าจอประเมินความพึงพอใจลูกค้า (User Kiosk Screen)
- **URL**: `/satisfaction`
- **Minimalist Outlined Icons**: ไอคอนสไตล์ลายเส้นมินิมอล 3 ระดับ (*ดี, ปานกลาง, แย่*) พร้อมสีและความสว่างที่สบายตา
- **Real-time System Settings Sync**: กำหนดขนาดตัวอักษร, ขนาดไอคอนอิโมจิ (px), ความกว้างของปุ่ม, ข้อความคำถาม และข้อความขอบคุณได้จากหน้า Admin และแสดงผลทันทีแบบ Real-time โดยไม่ต้องรีเฟรชหน้าเว็บ
- **Smooth Precision Countdown**: หน้าต่าง Modal ขอบคุณพร้อมตัวนับเวลาระดับมิลลิวินาที และแถบ Progress Bar ที่หดจาก 100% ถึง 0% อย่างนุ่มนวล

### 2. 📊 Multi-Tier Dashboard (`/dashboard`)
- **Hierarchy Scope Switcher**: สลับมุมมองตามบทบาทผู้ใช้งานได้ทันที:
  - **Super Admin View**: เปรียบเทียบผลงานระหว่างแบรนด์ในเครือ
  - **Brand Owner View**: เปรียบเทียบผลงานระหว่างแต่ละภาค
  - **RM View**: เปรียบเทียบผลงานระหว่างแต่ละจังหวัด
  - **AM View**: เปรียบเทียบผลงานระหว่างแต่ละสาขา
  - **Branch Staff View**: ดูคะแนนและสถานะตู้ Kiosk ภายในร้าน
- **Live Stream Engine**: จำลองคะแนนประเมินจากลูกค้าแบบ Real-time ทุก 4.5 วินาที
- **Direct CSV Export**: ส่งออกไฟล์ `.csv` สำหรับวิเคราะห์ต่อใน Excel

### 3. 🏷️ จัดการแบรนด์และสาขา (Brand & Branch Management)
- **Brand Management (`/brand`)**: สร้างและแก้ไขแบรนด์ธุรกิจ พร้อมระบบใส่รูปภาพและโลโก้แบรนด์
- **Branch Management (`/branch`)**: จัดการข้อมูลสาขาตามโครงสร้าง `แบรนด์ ➔ ภาค ➔ จังหวัด ➔ สาขา` พร้อมระบุจำนวนตู้ Kiosk

### 4. 👥 จัดการผู้ใช้และนำเข้า/ส่งออกไฟล์ (User Management & Bulk Import/Export)
- **User Management (`/usermanagement`)**: จัดการบัญชีผู้ใช้และผูกระดับสิทธิ์ตาม 5-Tier Data Access
- **Bulk Import/Export Modal**:
  - รองรับไฟล์ **Excel/CSV (`.csv`, `.xlsx`)**, **JSON (`.json`)**, และ **XML (`.xml`)**
  - มีปุ่มดาวน์โหลดไฟล์ตัวอย่าง Template
  - รองรับการ Import ผู้ใช้จำนวนมาก (500 - 2,000+ IDs) พร้อมระบบตารางพรีวิวก่อนกดยืนยัน

### 5. 🛡️ กำหนดขอบเขตข้อมูล (Data Access Management)
- **URL**: `/dataaccess`
- กำหนดสิทธิ์ให้ **AM (Area Manager)** และ **RM (Regional Manager)** เข้าดูเฉพาะหน้า Dashboard การประเมินของแบรนด์และภาคที่ตนเองรับผิดชอบ โดยไม่อนุญาตให้แก้ไขระบบอื่น (Role: User / Scope: `Dashboard CSAT Viewer`)

### 6. 📅 ปฏิทินและกิจกรรมการตลาด (Event Management)
- **URL**: `/event`
- ระบบปฏิทินจริง (Month, Week, Day Views)
- กำหนดขอบเขตกิจกรรมตามแบรนด์ (ทั้งแบรนด์), เฉพาะภาค หรือเฉพาะสาขาที่ต้องการ

### 7. 🔍 ตรวจสอบความปลอดภัยและสถานะ API (Audit & System Health)
- **URL**: `/audit`
- **Action Audit Logs**: บันทึกประวัติว่าใคร (Super Admin, Brand Owner, Admin) สร้าง/แก้ไข/ลบ Brand, Branch, User หรือเปลี่ยนการตั้งค่าระบบ พร้อม Visual Diff เปรียบเทียบค่าเดิมและค่าใหม่
- **API & Service Health Monitor**: ตรวจสอบสถานะการทำงาน Uptime, ค่าความหน่วง Latency (ms) และ Error Rate ของ Microservices แบบ Real-time

### 8. 🔔 ศูนย์รับแจ้งเตือน (Notification Triage)
- **URL**: `/notifications`
- แจ้งเตือนเหตุการณ์สำคัญ เช่น คะแนน CSAT ตกฮวบผิดปกติ, ตู้ Kiosk ขาดการเชื่อมต่อ หรือการแจ้งเตือนจาก Audit Logs

---

## 🛠️ โครงสร้างโฟลเดอร์โปรเจกต์ (Junior-Friendly Directory Structure)

```
Frontend/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (admin)/                 # กลุ่มหน้าสำหรับผู้ดูแลระบบ (Admin Layout)
│   │   │   ├── dashboard/page.tsx   # Dashboard Analytics
│   │   │   ├── brand/page.tsx       # Brand Management
│   │   │   ├── branch/page.tsx      # Branch Management
│   │   │   ├── usermanagement/page.tsx # User Management
│   │   │   ├── dataaccess/page.tsx  # Data Access Scope
│   │   │   ├── event/page.tsx       # Event Calendar
│   │   │   ├── roles/page.tsx       # Role & Permissions
│   │   │   ├── audit/page.tsx       # Audit & API Health
│   │   │   ├── notifications/page.tsx # Notification Triage
│   │   │   └── settings/page.tsx    # System Settings
│   │   └── (user)/
│   │       └── satisfaction/page.tsx # Kiosk Touchscreen Survey Screen
│   ├── Components/                  # Component ย่อยที่นำกลับมาใช้ซ้ำได้
│   │   ├── Buttons/                 # ปุ่มกดและปุ่มประเมิน SatifactionButton
│   │   ├── Modals/                  # Modals (ThankModal, CreateUser, EditUser, ImportExport)
│   │   ├── Grids/                   # การ์ดสรุป KPI (StatsGrid)
│   │   ├── Navigations/             # Navbar (TopNavBar with Global Search Ctrl+K)
│   │   └── Sidebars/                # Sidebar เมนูระบบ
│   └── Lib/                         # ฟังก์ชัน Utility และ LocalStorage Settings Sync
```

---

## ⚡ วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
cd Frontend
npm install
```

### 2. รันโหมด Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

### 3. ตรวจสอบการ Build สำหรับ Production
```bash
npm run build
```

---

## ⌨️ คีย์ลัดในระบบ (Global Keyboard Shortcuts)
- **<kbd>Ctrl</kbd> + <kbd>K</kbd>** (หรือ **<kbd>⌘</kbd> + <kbd>K</kbd>** บน Mac): โฟกัสช่อง **Global Search** บน Navbar จากหน้าใดก็ได้ เพื่อค้นหาหน้าจอ, สาขา หรือการตั้งค่าทันที
