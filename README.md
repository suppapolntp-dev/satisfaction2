# 📊 Customer Satisfaction (CSAT) & Multi-Tier Analytics Platform

> ระบบรับ Feedback และประเมินความพึงพอใจลูกค้าผ่านตู้ Kiosk หน้าร้าน พร้อมระบบ Multi-Tier Analytics Dashboard สำหรับวิเคราะห์และเปรียบเทียบข้อมูลระดับองค์กร (กลุ่มธุรกิจร้านอาหารในเครือ Central Restaurants Group - CRG)

---

## 🛠️ Tech Stack & Architecture

| ส่วนงาน | เทคโนโลยีที่ใช้ | รายละเอียด |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons | Dashboard, Data Grids, Multi-brand Scope, Modal Standard |
| **Backend API** | ASP.NET Core 9.0 Web API, Entity Framework Core | REST API, JWT Authentication, RBAC 5 Tiers, Scope Filters |
| **Database** | PostgreSQL 16 | Relational DB พร้อม Data Initializer (Seed Data อัตโนมัติ) |
| **DevOps / Containers** | Docker & Docker Compose | PostgreSQL + pgAdmin พร้อมใช้งาน |

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์บนเครื่องใหม่ (Quickstart Guide)

### 1. ความต้องการของระบบ (Prerequisites)
ก่อนเริ่มใช้งาน ให้ตรวจสอบว่าในเครื่องติดตั้งโปรแกรมเหล่านี้แล้ว:
- **Git**
- **Docker Desktop** (สำหรับรันฐานข้อมูล PostgreSQL)
- **.NET SDK 9.0 หรือใหม่กว่า** (`dotnet --version`)
- **Node.js 18.x หรือ 20.x ขึ้นไป** (`node -v`)

---

### 2. ขั้นตอนการเปิดใช้งานระบบ (Step-by-Step)

#### ขั้นตอนที่ 1: เปิดฐานข้อมูล PostgreSQL ผ่าน Docker
เปิด Terminal ที่โฟลเดอร์หลักของโปรเจกต์ (`Satifaction2/`):
```bash
# สั่งรัน PostgreSQL 16 และ pgAdmin ใน Background
docker compose up -d
```
*ฐานข้อมูลจะรันที่พอร์ต `5432` และ pgAdmin ที่พอร์ต `http://localhost:5050`*

---

#### ขั้นตอนที่ 2: รัน Backend API (.NET 9)
เปิด Terminal ใหม่ เข้าไปที่โฟลเดอร์ `Backend`:
```bash
cd Backend

# รัน Backend (ระบบจะสร้าง Database Table และ Seed ข้อมูลทดสอบให้อัตโนมัติ)
dotnet run --urls "http://localhost:5005"
```
* Backend API จะทำงานที่: **[http://localhost:5005](http://localhost:5005)**
* Swagger / OpenAPI Docs สำหรับทดสอบ Endpoint: **[http://localhost:5005/swagger](http://localhost:5005/swagger)**

---

#### ขั้นตอนที่ 3: รัน Frontend (Next.js)
เปิด Terminal ใหม่ เข้าไปที่โฟลเดอร์ `Frontend`:
```bash
cd Frontend

# ติดตั้ง Dependencies
npm install

# รัน Development Server
npm run dev
```
* เข้าใช้งานหน้าเว็บผ่านเบราว์เซอร์ที่: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 บัญชีผู้ใช้สำหรับเข้าสู่ระบบ (Default Test Accounts)

ทุกบัญชีใช้รหัสผ่านเดียวกัน: **`Admin@123456`**

| บทบาท (Role) | ระดับสิทธิ์ (Tier Level) | อีเมล (Email) | ขอบเขตข้อมูลที่มองเห็น |
|---|---|---|---|
| **Super Admin** | Tier 1: องค์กร | `admin@satisfaction.local` | มองเห็นทุกแบรนด์, ทุกภูมิภาค, ทุกจังหวัด, ทุกสาขา |
| **Brand Manager** | Tier 2: แบรนด์ | `bm.kfc@satisfaction.local` | เฉพาะแบรนด์ KFC ทุกภูมิภาค |
| **Brand Manager** | Tier 2: แบรนด์ | `bm.mdo@satisfaction.local` | เฉพาะแบรนด์ Mister Donut ทุกภูมิภาค |
| **Regional Manager** | Tier 3: ภาค | `rm.central@satisfaction.local` | ภาคกลาง (กรุงเทพฯ, นนทบุรี, ปทุมธานี ฯลฯ) |
| **Area Manager** | Tier 4: จังหวัด/เขต | `am.bangkok@satisfaction.local` | เฉพาะจังหวัดกรุงเทพมหานคร |
| **Branch Staff** | Tier 5: สาขา | `staff.futurepark@satisfaction.local` | สาขา Future Park Rangsit (Co-Location) |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Satifaction2/
├── Backend/                           # ASP.NET Core 9.0 Web API
│   ├── Controllers/                   # 14 API Controllers (Auth, Branches, Brands, Dashboard, Events, etc.)
│   ├── DTOs/                          # Request & Response Contracts
│   ├── Entities/                      # Database Entity Models (EF Core)
│   ├── Services/                      # Business Logic & Scope Filtering Service
│   ├── Data/
│   │   ├── AppDbContext.cs            # EF Core PostgreSQL DbContext
│   │   └── Seeds/DbInitializer.cs     # Seed Data จำลองสาขา, แบรนด์, ตู้ Kiosk, และผลโหวตย้อนหลัง
│   └── appsettings.json               # Backend Configuration
├── Frontend/                          # Next.js 16 App Router
│   ├── src/
│   │   ├── app/                       # Routing (Dashboard, Branch, Brand, Event, Audit, Satisfaction)
│   │   ├── Components/                # UI Components, Modals, Tables, Forms
│   │   ├── Services/                  # Frontend API Services
│   │   ├── Types/                     # TypeScript Interfaces
│   │   └── Lib/                       # Central API Client & Cookie Helpers
│   └── .env.example                   # ตัวอย่าง Environment Configuration
├── docker-compose.yml                 # Docker Setup สำหรับ PostgreSQL & pgAdmin
├── README.md                          # เอกสารแนะนำการติดตั้ง
└── .gitignore                         # Git Ignore Rules
```

---

## ⌨️ คีย์ลัดในระบบ (Shortcuts)
* **<kbd>Ctrl</kbd> + <kbd>K</kbd>** (หรือ **<kbd>Cmd</kbd> + <kbd>K</kbd>** บน Mac): ค้นหาเมนู, สาขา และการตั้งค่าด่วน (Global Command Search)
