# 📊 Enterprise CSAT Platform — Database Design (PostgreSQL)

ออกแบบจากโครงสร้าง `Types/*.ts` และ `Services/*.ts` ในโปรเจกต์ Frontend (Next.js) ทั้งหมด
เป้าหมาย: รองรับ 5-Tier Hierarchy (Super Admin → Brand Owner → Regional Manager → Area Manager → Branch Staff),
ขยายต่อได้โดยไม่ต้องรื้อโครงสร้างเดิม (เพิ่ม module/role/category ใหม่ได้โดยไม่ ALTER TABLE)

> **ไฟล์ที่เกี่ยวข้อง:**
> - **[schema.sql](schema.sql)** — DDL พร้อมรันจริงบน PostgreSQL 15+ (ต้องการ extension `pgcrypto`, `citext`)
> - **README.md** — ภาพรวมโปรเจกต์, Tech Stack, Getting Started

---

## 📑 สารบัญ

1. [หลักการออกแบบ (Design Principles)](#1-หลักการออกแบบ-design-principles)
2. [ER Diagram (ภาพรวมความสัมพันธ์)](#2-er-diagram-ภาพรวมความสัมพันธ์)
3. [รายละเอียดตารางแยกตาม Domain](#3-รายละเอียดตารางแยกตาม-domain)
4. [Enum / Lookup ที่ตัดสินใจแล้ว](#4-enum--lookup-ที่ตัดสินใจแล้ว)
5. [Views & Materialized Views สำหรับ Dashboard](#5-views--materialized-views-สำหรับ-dashboard)
6. [ตาราง Mapping: Frontend Type → DB Table](#6-ตาราง-mapping-frontend-type--db-table)
7. [แนวทางขยายในอนาคต (Future-proofing)](#7-แนวทางขยายในอนาคต-future-proofing)

---

## 1. หลักการออกแบบ (Design Principles)

| หลักการ | เหตุผล |
|---|---|
| **UUID เป็น Primary Key** (`gen_random_uuid()`) | รองรับ distributed insert (หลาย Kiosk ยิงโหวตพร้อมกัน), ไม่ชนกันข้าม service, ซ่อน sequence จริงจาก client |
| **Business code แยกจาก PK** (`brand_code`, `branch_code`, `event_code` ฯลฯ) | หน้าจอเดิมอ้างอิงด้วยรหัสที่มนุษย์อ่านได้ (เช่น `KFC-CNX-01`) — เก็บเป็น `UNIQUE` column ต่างหากจาก UUID |
| **Normalize region/province เป็นตาราง lookup** | ข้อมูลเดิมใน Frontend เป็น free-text (`region: string`) เสี่ยงพิมพ์ผิด/สะกดต่างกัน — แยกตารางป้องกันข้อมูลเพี้ยน และ join เพื่อ rollup สถิติได้แม่นยำ |
| **Junction table สำหรับ many-to-many** | Branch หนึ่งมีได้หลายแบรนด์ (Dual-Brand), User หนึ่งดูแลได้หลายแบรนด์/ภาค/จังหวัด/สาขา, Event หนึ่งผูกได้หลายสาขา |
| **Lookup table แทน hardcoded ENUM ในจุดที่จะโตในอนาคต** | เช่น `event_categories`, `system_modules` (สอดคล้องกับ `SYSTEM_MODULES` array ใน `roleService.ts`) — ถ้า fix เป็น Postgres ENUM การเพิ่มค่าใหม่ต้อง `ALTER TYPE` ซึ่งเสี่ยง lock ตารางใหญ่ |
| **Native ENUM เฉพาะค่าที่นิ่งจริง ๆ** | เช่น `status_type (Active/Inactive)`, `sentiment_type (satisfied/neutral/unsatisfied)` — ค่าพวกนี้ผูกกับ business logic โดยตรง ไม่เพิ่มบ่อย |
| **JSONB สำหรับ config ที่เปลี่ยนบ่อย** | `system_settings`, `satisfaction_config`, `event kiosk_theme_override` — กันไม่ให้ทุกครั้งที่เพิ่มฟิลด์ตั้งค่าใหม่ต้อง migration |
| **Audit columns ทุกตารางหลัก** | `created_at, updated_at, created_by, updated_by` — ใช้ประกอบกับตาราง `audit_logs` ที่มีอยู่แล้ว (หน้า Audit Triage) |
| **Soft delete (`deleted_at`)** | ข้อมูล Brand/Branch/User ที่ถูกลบยังต้องโผล่ใน Audit log และ Historical report ได้ — ไม่ hard-delete |
| **Time-series table แยก partition ได้ในอนาคต** | `satisfaction_votes` และ `audit_logs` โตเร็วมาก — ออกแบบให้ partition by `RANGE (voted_at)` ได้ทันทีโดยไม่ต้องเปลี่ยน schema |
| **Materialized View สำหรับ Dashboard rollup** | หน้า Dashboard ต้องการตัวเลข 5 ระดับพร้อมกัน — คิวรีสดจาก `satisfaction_votes` ทุกครั้งจะช้าเมื่อข้อมูลเป็นล้านแถว จึงเตรียม matview ไว้ refresh เป็น cron/job |

---

## 2. ER Diagram (ภาพรวมความสัมพันธ์)

### 2.1 Text-based Overview

```
regions ──< provinces ──< branches >──< branch_brands >── brands
                                │                              │
                                ├──< kiosks                    │
                                │                              │
                                ├──< satisfaction_votes >──────┘
                                │        (branch_id, kiosk_id, brand_id)
                                │
                                ├──< notifications (target_branch_id)
                                │
                                └──< event_target_branches >── events ──N:1── brands (nullable)
                                                                         │
                                                                         └──N:1── event_categories

users ──< user_brand_scopes >── brands
      ├──< user_region_scopes >── regions
      ├──< user_province_scopes >── provinces
      ├──< user_branch_scopes >── branches
      ├──1:1─ user_permissions
      ├──< user_sessions (JWT refresh tokens)
      └──N:1─ roles ──< role_permissions >── system_modules

audit_logs ──< audit_diff_details
audit_logs ──N:1── users (actor, nullable — กันเคส actor ถูกลบไปแล้ว)

api_service_health   (standalone — เฝ้าดู microservice)
system_settings      (singleton key-value — ไม่ผูกตารางอื่น)
satisfaction_config   (singleton/per-brand JSONB config)
```

### 2.2 Mermaid ER Diagram

```mermaid
erDiagram
    regions ||--o{ provinces : contains
    provinces ||--o{ branches : located_in
    branches }o--o{ brands : "branch_brands"
    branches ||--o{ kiosks : equips

    branches ||--o{ satisfaction_votes : records
    kiosks ||--o{ satisfaction_votes : receives
    brands ||--o{ satisfaction_votes : categorizes

    roles ||--o{ role_permissions : grants
    system_modules ||--o{ role_permissions : applies_to
    roles ||--o{ users : assigned_to
    users ||--|| user_permissions : has
    users ||--o{ user_sessions : authenticates
    users ||--o{ user_brand_scopes : accesses
    users ||--o{ user_region_scopes : accesses
    users ||--o{ user_province_scopes : accesses
    users ||--o{ user_branch_scopes : accesses
    brands ||--o{ user_brand_scopes : scoped
    regions ||--o{ user_region_scopes : scoped
    provinces ||--o{ user_province_scopes : scoped
    branches ||--o{ user_branch_scopes : scoped

    event_categories ||--o{ events : classifies
    brands ||--o{ events : targets
    events ||--o{ event_target_branches : "scoped_to"
    branches ||--o{ event_target_branches : "targeted_by"

    branches ||--o{ notifications : alerts
    users ||--o{ notifications : receives

    users ||--o{ audit_logs : performs
    audit_logs ||--o{ audit_diff_details : details

    regions {
        uuid id PK
        text name UK
        smallint display_order
    }
    provinces {
        uuid id PK
        uuid region_id FK
        text name
    }
    brands {
        uuid id PK
        text brand_code UK
        text brand_name
        text parent_company_name
        text category
        text brand_logo_url
        text brand_icon_name
        status_type status
    }
    branches {
        uuid id PK
        text branch_code UK
        text name
        uuid province_id FK
        int kiosk_count
        status_type status
    }
    branch_brands {
        uuid branch_id PK_FK
        uuid brand_id PK_FK
    }
    kiosks {
        uuid id PK
        text kiosk_code UK
        uuid branch_id FK
        kiosk_status_type status
        timestamptz last_ping_at
    }
    roles {
        uuid id PK
        text role_code UK
        text role_name
        text role_description
        status_type role_status
        boolean is_system_default
    }
    system_modules {
        uuid id PK
        text module_code UK
        text module_label
        smallint display_order
    }
    role_permissions {
        uuid id PK
        uuid role_id FK
        uuid module_id FK
        boolean can_view
        boolean can_create
        boolean can_update
        boolean can_delete
        boolean can_export
    }
    users {
        uuid id PK
        text user_code UK
        text first_name
        text last_name
        citext email UK
        text phone
        text password_hash
        uuid role_id FK
        tier_level_type tier_level
        status_type status
        timestamptz last_login_at
    }
    user_permissions {
        uuid user_id PK_FK
        boolean can_view_super_admin_overview
        boolean can_view_brand_regional_grid
        boolean can_view_regional_province_grid
        boolean can_view_provincial_branch_grid
        boolean can_view_branch_kiosks_grid
    }
    user_sessions {
        uuid id PK
        uuid user_id FK
        text refresh_token_hash
        timestamptz expires_at
        text ip_address
        text user_agent
    }
    user_brand_scopes {
        uuid user_id PK_FK
        uuid brand_id PK_FK
    }
    user_region_scopes {
        uuid user_id PK_FK
        uuid region_id PK_FK
    }
    user_province_scopes {
        uuid user_id PK_FK
        uuid province_id PK_FK
    }
    user_branch_scopes {
        uuid user_id PK_FK
        uuid branch_id PK_FK
    }
    satisfaction_votes {
        uuid id PK
        uuid branch_id FK
        uuid kiosk_id FK
        uuid brand_id FK
        sentiment_type sentiment
        timestamptz voted_at
        inet client_ip
    }
    satisfaction_config {
        uuid id PK
        jsonb config
        timestamptz updated_at
        uuid updated_by FK
    }
    event_categories {
        uuid id PK
        text category_code UK
        text category_label
    }
    events {
        uuid id PK
        text event_code UK
        text event_name
        date event_date
        time start_time
        time end_time
        uuid brand_id FK
        varchar event_location
        uuid category_id FK
        text event_status
        text description
        jsonb kiosk_theme_override
    }
    event_target_branches {
        uuid event_id PK_FK
        uuid branch_id PK_FK
    }
    notifications {
        uuid id PK
        text title
        text notification_type
        text description
        boolean is_read
        uuid target_branch_id FK
        uuid recipient_user_id FK
        text priority
        timestamptz created_at
        timestamptz read_at
    }
    audit_logs {
        uuid id PK
        timestamptz occurred_at
        uuid actor_user_id FK
        text actor_name_snapshot
        text actor_role_snapshot
        text action_type
        text target_entity
        text description
        text status
        inet ip_address
    }
    audit_diff_details {
        uuid id PK
        uuid audit_log_id FK
        text field_name
        text before_value
        text after_value
    }
    system_settings {
        text setting_key PK
        jsonb setting_value
        timestamptz updated_at
        uuid updated_by FK
    }
    api_service_health {
        uuid id PK
        text service_code UK
        text service_name
        text endpoint
        text status
        numeric uptime_percent
        int latency_ms
        numeric error_rate_percent
        timestamptz last_checked_at
    }
```

---

## 3. รายละเอียดตารางแยกตาม Domain

### 3.1 Organization Hierarchy (5 ตาราง)

#### ตาราง `regions`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK DEFAULT gen_random_uuid() | |
| `name` | `TEXT` | UNIQUE NOT NULL | เช่น "ภาคเหนือ" |
| `display_order` | `SMALLINT` | DEFAULT 0 | เรียงลำดับในดรอปดาวน์ |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

#### ตาราง `provinces`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `region_id` | `UUID` | FK → regions(id), NOT NULL | |
| `name` | `TEXT` | NOT NULL | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| | | UNIQUE(region_id, name) | กันชื่อซ้ำในภาคเดียวกัน |

#### ตาราง `brands` ← จาก `BrandModel`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `brand_code` | `TEXT` | UNIQUE NOT NULL | `brandId` เดิม เช่น `CRG-BRD-001` |
| `brand_name` | `TEXT` | NOT NULL | |
| `parent_company_name` | `TEXT` | DEFAULT 'Central Restaurants Group' | |
| `category` | `TEXT` | | อิสระ — Frontend ให้พิมพ์เองได้ |
| `brand_logo_url` | `TEXT` | | |
| `brand_icon_name` | `TEXT` | DEFAULT 'restaurant' | Material icon name |
| `status` | `status_type` | DEFAULT 'Active' | |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `created_by` | `UUID` | FK → users(id) NULLABLE | |
| `updated_by` | `UUID` | FK → users(id) NULLABLE | |

> `totalBranchesCount`, `totalKiosksCount`, `csatAverage` ที่เห็นใน `BrandModel` **ไม่เก็บเป็นคอลัมน์จริง** — คำนวณสดผ่าน view `v_brand_stats` (ดูข้อ 5) เพื่อไม่ให้ตัวเลขเพี้ยนจากข้อมูลจริง

#### ตาราง `branches` ← จาก `BranchModel`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `branch_code` | `TEXT` | UNIQUE NOT NULL | |
| `name` | `TEXT` | NOT NULL | |
| `province_id` | `UUID` | FK → provinces(id), NOT NULL | region ดึงผ่าน province → region join |
| `kiosk_count` | `INT` | DEFAULT 0, CHECK >= 0 | จำนวนตู้ที่ "ตั้งใจ" ติดตั้ง (จำนวนจริงมาจาก `kiosks` table) |
| `status` | `status_type` | DEFAULT 'Active' | |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `created_by` | `UUID` | FK → users(id) NULLABLE | |
| `updated_by` | `UUID` | FK → users(id) NULLABLE | |

#### ตาราง `branch_brands` (junction — Dual-Brand Co-Location)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `branch_id` | `UUID` | FK → branches(id) ON DELETE CASCADE | |
| `brand_id` | `UUID` | FK → brands(id) ON DELETE CASCADE | |
| | | PRIMARY KEY(branch_id, brand_id) | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

> เหตุผลที่ใช้ junction แทน `brand_id` column เดียวบน branches: Frontend มี `brands?: string[]` array อยู่แล้ว และ BranchManagement แสดง "Dual-Brand Co-Locations" count

#### ตาราง `kiosks`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `kiosk_code` | `TEXT` | UNIQUE NOT NULL | เช่น `KSK-01-A` |
| `kiosk_name` | `TEXT` | DEFAULT '' | ชื่อตู้ (ถ้าต้องการ) |
| `branch_id` | `UUID` | FK → branches(id), NOT NULL | |
| `status` | `kiosk_status_type` | DEFAULT 'Online' | Online / Degraded / Offline |
| `last_ping_at` | `TIMESTAMPTZ` | NULLABLE | ใช้ตรวจ heartbeat |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

### 3.2 Users, Roles, Data-Access Scope (10 ตาราง)

#### ตาราง `system_modules` (แทน hardcoded `SYSTEM_MODULES` array ใน `roleService.ts`)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `module_code` | `TEXT` | UNIQUE NOT NULL | เช่น `dashboard_analytics` |
| `module_label` | `TEXT` | NOT NULL | ชื่อแสดงผล "Dashboard Analytics" |
| `display_order` | `SMALLINT` | DEFAULT 0 | เรียงลำดับในหน้า Role Permissions |

> ค่าเริ่มต้น 9 โมดูล (seed): Dashboard Analytics, Brand Management, Branch Management, User Management, Event Calendar, Notification Triage, Data Access Scope, Audit Log & Diff, System Settings

#### ตาราง `roles` ← จาก `SystemRoleItem`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `role_code` | `TEXT` | UNIQUE NOT NULL | |
| `role_name` | `TEXT` | NOT NULL | |
| `role_description` | `TEXT` | | |
| `role_status` | `status_type` | DEFAULT 'Active' | |
| `is_system_default` | `BOOLEAN` | DEFAULT FALSE | ป้องกันการลบ role หลัก 5 ตัว |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

#### ตาราง `role_permissions` ← จาก `PermissionRow`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `role_id` | `UUID` | FK → roles(id) ON DELETE CASCADE | |
| `module_id` | `UUID` | FK → system_modules(id) ON DELETE CASCADE | |
| `can_view` | `BOOLEAN` | DEFAULT FALSE | |
| `can_create` | `BOOLEAN` | DEFAULT FALSE | |
| `can_update` | `BOOLEAN` | DEFAULT FALSE | |
| `can_delete` | `BOOLEAN` | DEFAULT FALSE | |
| `can_export` | `BOOLEAN` | DEFAULT FALSE | |
| | | UNIQUE(role_id, module_id) | |

#### ตาราง `users` ← จาก `UserModel`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `user_code` | `TEXT` | UNIQUE | `EMP-xxx` สำหรับอ้างอิง |
| `first_name` | `TEXT` | NOT NULL | |
| `last_name` | `TEXT` | NOT NULL | |
| `email` | `CITEXT` | UNIQUE NOT NULL | ใช้ `citext` extension กัน case-sensitivity ตอน login |
| `phone` | `TEXT` | NULLABLE | |
| `password_hash` | `TEXT` | NOT NULL | BCrypt hash สำหรับหน้า Login |
| `role_id` | `UUID` | FK → roles(id), NOT NULL | |
| `tier_level` | `tier_level_type` | NOT NULL | Super Admin / Brand Owner / RM / AM / Branch Staff / Custom Scope |
| `status` | `status_type` | DEFAULT 'Active' | |
| `last_login_at` | `TIMESTAMPTZ` | NULLABLE | |
| `deleted_at` | `TIMESTAMPTZ` | NULLABLE | Soft delete |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

#### ตาราง `user_permissions` ← จาก `DashboardTierPermissions` (1:1 กับ users)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `user_id` | `UUID` | PK, FK → users(id) ON DELETE CASCADE | |
| `can_view_super_admin_overview` | `BOOLEAN` | DEFAULT FALSE | Tier 1 grid |
| `can_view_brand_regional_grid` | `BOOLEAN` | DEFAULT FALSE | Tier 2 grid |
| `can_view_regional_province_grid` | `BOOLEAN` | DEFAULT FALSE | Tier 3 grid |
| `can_view_provincial_branch_grid` | `BOOLEAN` | DEFAULT FALSE | Tier 4 grid |
| `can_view_branch_kiosks_grid` | `BOOLEAN` | DEFAULT FALSE | Tier 5 grid |

> ค่า generate อัตโนมัติจาก `tier_level` ผ่าน trigger หรือ application logic — เก็บเป็นคอลัมน์จริงเผื่อ "Custom Scope" ที่ override เฉพาะราย

#### ตาราง `user_sessions` (JWT Refresh Token — ใหม่)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → users(id) ON DELETE CASCADE | |
| `refresh_token_hash` | `TEXT` | NOT NULL | hash ของ refresh token (ไม่เก็บ plaintext) |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | |
| `ip_address` | `TEXT` | | |
| `user_agent` | `TEXT` | | browser/device info |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `revoked_at` | `TIMESTAMPTZ` | NULLABLE | NULL = ยังใช้ได้, มีค่า = ถูกเพิกถอน |

#### ตารางขอบเขตสิทธิ์ (User Scope Junctions — 4 ตาราง)

**`user_brand_scopes`** / **`user_region_scopes`** / **`user_province_scopes`** / **`user_branch_scopes`**

| Column | Type | Constraint |
|---|---|---|
| `user_id` | `UUID` | FK → users(id) ON DELETE CASCADE |
| `{brand_id\|region_id\|province_id\|branch_id}` | `UUID` | FK → ตารางที่เกี่ยวข้อง ON DELETE CASCADE |
| | | PRIMARY KEY(user_id, ref_id) |

> **เหตุผลที่แยก 4 ตาราง** แทนรวมเป็น `user_scopes(scope_type, scope_id)` เดียว: Postgres ไม่รองรับ polymorphic FK — แยกตารางทำให้ FK constraint ตรวจสอบความถูกต้องจริง ลดโอกาส orphan reference

---

### 3.3 Satisfaction Voting — Kiosk (2 ตาราง)

#### ตาราง `satisfaction_votes` ← จาก `SatisfactionVotePayload`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `branch_id` | `UUID` | FK → branches(id), NOT NULL | |
| `kiosk_id` | `UUID` | FK → kiosks(id), NULLABLE | null = โหวตจากช่องทางอื่นที่ไม่ผ่านตู้ |
| `brand_id` | `UUID` | FK → brands(id), NOT NULL | |
| `sentiment` | `sentiment_type` | NOT NULL | satisfied / neutral / unsatisfied |
| `voted_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | |
| `client_ip` | `INET` | NULLABLE | ใช้ป้องกันโหวตซ้ำ (`duplicateVoteMinutes`) |

> **Partition strategy:** `PARTITION BY RANGE (voted_at)` แบ่งรายเดือน — ตั้งไว้ตั้งแต่วันแรก ย้ายทีหลังยากกว่าตั้งก่อน
>
> **Indexes:** `(branch_id, voted_at DESC)`, `(brand_id, voted_at DESC)`, BRIN index on `(voted_at)` (คุ้มสำหรับ time-series ขนาดใหญ่)

#### ตาราง `satisfaction_config` ← จาก `SatisfactionConfig` (Kiosk UI Settings)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | singleton row (หรือแยกตาม brand/event ในอนาคต) |
| `config` | `JSONB` | NOT NULL | เก็บทั้งก้อนตาม interface `SatisfactionConfig` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_by` | `UUID` | FK → users(id) NULLABLE | |

> ใช้ JSONB เพราะฟิลด์ config หน้า Kiosk มีเกือบ 15+ ค่า (ดูจาก `SatisfactionSettingsSection.tsx`) — ถ้าแยกคอลัมน์ทั้งหมดจะต้อง migrate ทุกครั้งที่เพิ่ม setting ใหม่
>
> **ตัวอย่าง JSONB content:**
> ```json
> {
>   "questionTitle": "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?",
>   "questionFontSize": 36,
>   "questionSubtitle": "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง",
>   "subtitleFontSize": 18,
>   "emojiSize": 160,
>   "labelFontSize": 20,
>   "gridMaxWidth": 900,
>   "duplicateVoteMinutes": 30,
>   "autoResetSeconds": 4,
>   "thankYouMessageTh": "ขอขอบคุณสำหรับความคิดเห็น...",
>   "thankYouMessageEn": "Thank you for your valuable feedback!"
> }
> ```

---

### 3.4 Events / Campaigns (3 ตาราง)

#### ตาราง `event_categories` (Lookup)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `category_code` | `TEXT` | UNIQUE NOT NULL | CAMPAIGN / MAINTENANCE / FIRMWARE / CALIBRATION / AUDIT |
| `category_label` | `TEXT` | NOT NULL | ชื่อแสดงผล |
| `display_order` | `SMALLINT` | DEFAULT 0 | |

#### ตาราง `events` ← จาก `EventItem`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `event_code` | `TEXT` | UNIQUE NOT NULL | เช่น `EVT-2026-0001` |
| `event_name` | `TEXT` | NOT NULL | |
| `event_date` | `DATE` | NOT NULL | |
| `start_time` | `TIME` | NOT NULL | |
| `end_time` | `TIME` | NOT NULL | |
| `brand_id` | `UUID` | FK → brands(id), NULLABLE | NULL = "ทุกแบรนด์" |
| `event_location` | `TEXT` | | |
| `category_id` | `UUID` | FK → event_categories(id) | |
| `event_status` | `TEXT` | CHECK (Upcoming/Active/Completed) | |
| `description` | `TEXT` | | |
| `kiosk_theme_override` | `JSONB` | | เก็บ `customThemeName/customGreeting/customThankYou` เป็นก้อน |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `created_by` | `UUID` | FK → users(id) NULLABLE | |

#### ตาราง `event_target_branches` (junction — ใหม่)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `event_id` | `UUID` | FK → events(id) ON DELETE CASCADE | |
| `branch_id` | `UUID` | FK → branches(id) ON DELETE CASCADE | |
| | | PRIMARY KEY(event_id, branch_id) | |

> ทำให้ Event ผูกกับสาขาเฉพาะได้ ไม่ใช่แค่ brand-wide — ตรงกับ requirement ใน README ที่ว่า "กำหนดขอบเขตกิจกรรมตามแบรนด์ (ทั้งแบรนด์), เฉพาะภาค หรือเฉพาะสาขาที่ต้องการ"

---

### 3.5 Notifications (1 ตาราง)

#### ตาราง `notifications` ← จาก `SystemNotificationItem`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `title` | `TEXT` | NOT NULL | |
| `notification_type` | `TEXT` | CHECK (Alert/Feedback/System) | |
| `description` | `TEXT` | NOT NULL | |
| `is_read` | `BOOLEAN` | DEFAULT FALSE | |
| `target_branch_id` | `UUID` | FK → branches(id), NULLABLE | สาขาที่เกิดเหตุการณ์ (null = ระดับระบบ) |
| `recipient_user_id` | `UUID` | FK → users(id), NULLABLE | ผู้รับ (null = broadcast ทุกคน) |
| `priority` | `TEXT` | CHECK (High/Medium/Low), DEFAULT 'Medium' | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `read_at` | `TIMESTAMPTZ` | NULLABLE | เวลาที่เปิดอ่าน |

---

### 3.6 Audit & Service Health (3 ตาราง)

#### ตาราง `audit_logs` ← จาก `AuditLogItem`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `occurred_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `actor_user_id` | `UUID` | FK → users(id) ON DELETE SET NULL | |
| `actor_name_snapshot` | `TEXT` | NOT NULL | snapshot ชื่อ — กันกรณี user ถูกลบแล้ว |
| `actor_role_snapshot` | `TEXT` | NOT NULL | |
| `action_type` | `TEXT` | NOT NULL | CREATE/UPDATE/DELETE/SECURITY/EXPORT/CONFIG_CHANGE |
| `target_entity` | `TEXT` | NOT NULL | เช่น "Brand: KFC" |
| `description` | `TEXT` | NOT NULL | |
| `status` | `TEXT` | CHECK (SUCCESS/FAILED/WARNING), DEFAULT 'SUCCESS' | |
| `ip_address` | `INET` | | |

> **Partition:** เหมือน `satisfaction_votes` — `PARTITION BY RANGE (occurred_at)` รายเดือนได้
> **Retention policy:** แนะนำ archive หลัง 12 เดือน

#### ตาราง `audit_diff_details` ← จาก `AuditDiffDetail`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `audit_log_id` | `UUID` | FK → audit_logs(id) ON DELETE CASCADE | |
| `field_name` | `TEXT` | NOT NULL | |
| `before_value` | `TEXT` | NULLABLE | |
| `after_value` | `TEXT` | NULLABLE | |

#### ตาราง `api_service_health` ← จาก `ApiServiceHealth`
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `service_code` | `TEXT` | UNIQUE NOT NULL | |
| `service_name` | `TEXT` | NOT NULL | |
| `endpoint` | `TEXT` | NOT NULL | |
| `status` | `TEXT` | CHECK (Operational/Degraded/Outage/Maintenance), DEFAULT 'Operational' | |
| `uptime_percent` | `NUMERIC(5,2)` | DEFAULT 100.00 | |
| `latency_ms` | `INT` | DEFAULT 0 | |
| `error_rate_percent` | `NUMERIC(5,2)` | DEFAULT 0.00 | |
| `last_checked_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

### 3.7 System Settings (1 ตาราง)

#### ตาราง `system_settings` (key-value, JSONB per section)
| Column | Type | Constraint | หมายเหตุ |
|---|---|---|---|
| `setting_key` | `TEXT` | PK | `general`, `dashboard`, `reports`, `localization` |
| `setting_value` | `JSONB` | NOT NULL | ตรงกับ `GeneralSettingsState`, `DashboardSettingsState` ฯลฯ ทั้งก้อน |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_by` | `UUID` | FK → users(id) NULLABLE | |

> **ตัวอย่าง:**
> ```sql
> INSERT INTO system_settings VALUES ('general', '{"systemName":"Satisfaction Management","companyName":"Globex International","contactEmail":"admin@satisfaction-management.com"}');
> INSERT INTO system_settings VALUES ('dashboard', '{"refreshInterval":"30s","enableRealtimeSound":false,"benchmarkThreshold":85}');
> ```

---

## 4. Enum / Lookup ที่ตัดสินใจแล้ว

| ชื่อ | ชนิด | ค่า | เหตุผล |
|---|---|---|---|
| `status_type` | Native ENUM | `Active`, `Inactive` | ค่านิ่ง ใช้ทั่วระบบ |
| `sentiment_type` | Native ENUM | `satisfied`, `neutral`, `unsatisfied` | ค่านิ่ง ผูก business logic โดยตรง |
| `kiosk_status_type` | Native ENUM | `Online`, `Degraded`, `Offline` | ค่านิ่ง |
| `tier_level_type` | Native ENUM | `Super Admin`, `Brand Owner`, `Regional Manager`, `Area Manager`, `Branch Staff`, `Custom Scope` | 6 ค่าตาม 5-tier + Custom |
| `event_categories` | **Lookup table** | CAMPAIGN, MAINTENANCE, FIRMWARE, CALIBRATION, AUDIT (seed) | เพิ่มหมวดใหม่ได้โดยไม่ ALTER TYPE |
| `system_modules` | **Lookup table** | 9 โมดูลเริ่มต้น (seed) | เพิ่มเมนูใหม่ได้โดยไม่กระทบ role ที่มี |

---

## 5. Views & Materialized Views สำหรับ Dashboard

### 5.1 View: `v_brand_stats` (คำนวณ `totalBranchesCount`, `totalKiosksCount`, `csatAverage` สด)

```sql
CREATE VIEW v_brand_stats AS
SELECT b.id AS brand_id, b.brand_code, b.brand_name,
       COUNT(DISTINCT br.id) AS total_branches,
       COUNT(DISTINCT k.id)  AS total_kiosks,
       ROUND(
         AVG(CASE WHEN v.sentiment = 'satisfied' THEN 100
                  WHEN v.sentiment = 'neutral'   THEN 50
                  ELSE 0 END)
       , 1) AS csat_average
FROM brands b
LEFT JOIN branch_brands bb ON bb.brand_id = b.id
LEFT JOIN branches br ON br.id = bb.branch_id AND br.deleted_at IS NULL
LEFT JOIN kiosks k ON k.branch_id = br.id
LEFT JOIN satisfaction_votes v ON v.brand_id = b.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.brand_code, b.brand_name;
```

### 5.2 Materialized View: Dashboard 5-Tier Rollup

สำหรับ `superAdminBrands`, `brandRegions`, `regionalProvinces`, `provincialBranches`, `branchKiosks` —
`REFRESH MATERIALIZED VIEW CONCURRENTLY` ทุก 30 วิ–1 นาที ตรงกับ `refreshInterval` ใน Dashboard Settings

---

## 6. ตาราง Mapping: Frontend Type → DB Table

| Frontend (`Types/*.ts`) | DB Table(s) | หมายเหตุ |
|---|---|---|
| `BrandModel` | `brands` + view `v_brand_stats` | computed fields ไม่เก็บจริง |
| `BranchModel` | `branches` + `branch_brands` | `brands[]` → junction |
| `UserModel` | `users` + `user_*_scopes` + `user_permissions` | scope assignments + dashboard perms |
| `UserAccessRecord` / `DashboardTierPermissions` | `user_permissions`, scope junctions | |
| `SystemRoleItem` / `PermissionRow` | `roles` + `role_permissions` + `system_modules` | modules เป็น lookup table |
| `EventItem` | `events` + `event_categories` + `event_target_branches` | category เป็น FK ไม่ใช่ string |
| `SystemNotificationItem` | `notifications` | เพิ่ม `recipient_user_id`, `read_at` |
| `AuditLogItem` / `AuditDiffDetail` | `audit_logs` + `audit_diff_details` | snapshot actor name/role |
| `ApiServiceHealth` | `api_service_health` | |
| `SatisfactionVotePayload` | `satisfaction_votes` | partition-ready |
| `SatisfactionConfig` | `satisfaction_config` (JSONB) | |
| `GeneralSettingsState` ฯลฯ | `system_settings` (key-value JSONB) | 1 row ต่อ section |
| `PerformanceTableRow` (Dashboard) | Materialized View | ไม่ใช่ตารางจริง |

---

## 7. แนวทางขยายในอนาคต (Future-proofing)

| # | แนวทาง | วิธีดำเนินการ |
|---|---|---|
| 1 | **Multi-tenant** (หลายบริษัทในระบบเดียว) | เติม `tenant_id uuid` บนตารางหลักทุกตัว + Row-Level Security (`CREATE POLICY`) |
| 2 | **Multi-language content** | แยกเป็น `*_translations(entity_id, locale, field, value)` |
| 3 | **Kiosk offline sync** | เติม `client_generated_id uuid UNIQUE` บน `satisfaction_votes` กันโหวตซ้ำตอน retry |
| 4 | **Historical org structure** | เปลี่ยน `branch_brands` / `branches.province_id` เป็น temporal table (`valid_from`, `valid_to`) |
| 5 | **Notification multi-channel** (email/SMS/push) | เติมตาราง `notification_deliveries(notification_id, channel, status, sent_at)` |
| 6 | **Free-text feedback** (Comment จากลูกค้า) | เติมคอลัมน์ `comment TEXT` บน `satisfaction_votes` หรือแยกตาราง `vote_comments` |
| 7 | **Vote daily aggregation** | สร้าง `vote_daily_summary(date, brand_id, branch_id, sat/neu/unsat counts)` สำหรับ report ย้อนหลังเร็วขึ้น |

---

## 8. สรุปจำนวนตาราง

| กลุ่ม | ตาราง | จำนวน |
|---|---|---|
| Organization | regions, provinces, brands, branches, branch_brands, kiosks | 6 |
| Auth & RBAC | system_modules, roles, role_permissions, users, user_permissions, user_sessions, user_brand_scopes, user_region_scopes, user_province_scopes, user_branch_scopes | 10 |
| CSAT | satisfaction_votes, satisfaction_config | 2 |
| Events | event_categories, events, event_target_branches | 3 |
| Notifications | notifications | 1 |
| Audit & Health | audit_logs, audit_diff_details, api_service_health | 3 |
| Settings | system_settings | 1 |
| **รวม** | | **26 ตาราง** |
