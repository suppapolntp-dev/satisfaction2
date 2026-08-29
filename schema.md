# 🏛️ PostgreSQL Database Schema Reference (`schema.md`)

> **Enterprise CSAT & Multi-Tier Analytics Platform**
> Target Engine: **PostgreSQL 15+** | Driver/ORM: **C# .NET 10 (Npgsql / Entity Framework Core)**

เอกสารฉบับนี้รวบรวม **SQL DDL Schema**, **Extensions**, **ENUM Types**, **Table Definitions**, **Foreign Keys / Constraints**, **Indexes**, **Triggers**, **Views** และ **Seed Data** ทั้งหมดของระบบ

---

## 📑 สารบัญ (Table of Contents)

1. [Extensions & Custom Types](#1-extensions--custom-types)
2. [1. โครงสร้างองค์กร (Organization Hierarchy)](#1-โครงสร้างองค์กร-organization-hierarchy)
3. [2. ผู้ใช้งาน สิทธิ์ และขอบเขตข้อมูล (Users & RBAC)](#2-ผู้ใช้งาน-สิทธิ์-และขอบเขตข้อมูล-users--rbac)
4. [3. การประเมินความพึงพอใจ (Satisfaction Voting - Kiosk)](#3-การประเมินความพึงพอใจ-satisfaction-voting---kiosk)
5. [4. กิจกรรมและแคมเปญ (Events & Campaigns)](#4-กิจกรรมและแคมเปญ-events--campaigns)
6. [5. การแจ้งเตือน (Notifications)](#5-การแจ้งเตือน-notifications)
7. [6. ตรวจสอบความปลอดภัยและสถานะระบบ (Audit & Health)](#6-ตรวจสอบความปลอดภัยและสถานะระบบ-audit--health)
8. [7. การตั้งค่าระบบ (System Settings)](#7-การตั้งค่าระบบ-system-settings)
9. [8. Triggers & Automation](#8-triggers--automation)
10. [9. Views & Aggregations](#9-views--aggregations)
11. [10. Initial Seed Data](#10-initial-seed-data)

---

## 1. Extensions & Custom Types

```sql
-- เปิดใช้งาน Extensions สำหรับ UUID และ Case-Insensitive Text
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- สำหรับ gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- สำหรับ email ที่ไม่สนตัวพิมพ์เล็ก-ใหญ่

-- Custom Native ENUM Types (ค่าคงที่ที่ผูกกับ Business Logic)
CREATE TYPE status_type       AS ENUM ('Active', 'Inactive');
CREATE TYPE sentiment_type    AS ENUM ('satisfied', 'neutral', 'unsatisfied');
CREATE TYPE kiosk_status_type AS ENUM ('Online', 'Degraded', 'Offline');
CREATE TYPE tier_level_type   AS ENUM (
  'Super Admin',
  'Brand Owner',
  'Regional Manager',
  'Area Manager',
  'Branch Staff',
  'Custom Scope'
);
```

---

## 2. โครงสร้างองค์กร (Organization Hierarchy)

```sql
-- 1.1 Regions (ระดับภาค เช่น ภาคเหนือ, ภาคใต้)
CREATE TABLE regions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Provinces (ระดับจังหวัด ผูกกับ Region)
CREATE TABLE provinces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id  UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (region_id, name)
);
CREATE INDEX idx_provinces_region ON provinces(region_id);

-- 1.3 Brands (แบรนด์ธุรกิจ เช่น KFC, Mister Donut)
CREATE TABLE brands (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_code          TEXT NOT NULL UNIQUE,
  brand_name          TEXT NOT NULL,
  parent_company_name TEXT NOT NULL DEFAULT 'Central Restaurants Group',
  category            TEXT,
  brand_logo_url      TEXT,
  brand_icon_name     TEXT NOT NULL DEFAULT 'restaurant',
  status              status_type NOT NULL DEFAULT 'Active',
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID,
  updated_by          UUID
);

-- 1.4 Branches (สาขา)
CREATE TABLE branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_code TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
  kiosk_count INT NOT NULL DEFAULT 0 CHECK (kiosk_count >= 0),
  status      status_type NOT NULL DEFAULT 'Active',
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID,
  updated_by  UUID
);
CREATE INDEX idx_branches_province ON branches(province_id);
CREATE INDEX idx_branches_status   ON branches(status) WHERE deleted_at IS NULL;

-- 1.5 Branch-Brand Junction (รองรับ Dual-Brand / Co-Location)
CREATE TABLE branch_brands (
  branch_id  UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  brand_id   UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (branch_id, brand_id)
);
CREATE INDEX idx_branch_brands_brand ON branch_brands(brand_id);

-- 1.6 Kiosks (ตู้ประเมินหน้าร้าน)
CREATE TABLE kiosks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_code   TEXT NOT NULL UNIQUE,
  kiosk_name   TEXT NOT NULL DEFAULT '',
  branch_id    UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  status       kiosk_status_type NOT NULL DEFAULT 'Online',
  last_ping_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kiosks_branch ON kiosks(branch_id);
CREATE INDEX idx_kiosks_status ON kiosks(status);
```

---

## 3. ผู้ใช้งาน สิทธิ์ และขอบเขตข้อมูล (Users & RBAC)

```sql
-- 2.1 System Modules (โมดูลระบบ - ตาราง Lookup แทน Enum เพื่อรองรับการเพิ่มโมดูลในอนาคต)
CREATE TABLE system_modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code   TEXT NOT NULL UNIQUE,
  module_label  TEXT NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0
);

-- 2.2 Roles (บทบาทระบบ)
CREATE TABLE roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code         TEXT NOT NULL UNIQUE,
  role_name         TEXT NOT NULL,
  role_description  TEXT,
  role_status       status_type NOT NULL DEFAULT 'Active',
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Role Permissions (เมทริกซ์สิทธิ์แยกตามโมดูล)
CREATE TABLE role_permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_id  UUID NOT NULL REFERENCES system_modules(id) ON DELETE CASCADE,
  can_view   BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_update BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  can_export BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (role_id, module_id)
);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);

-- 2.4 Users (บัญชีผู้ใช้งาน)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code     TEXT UNIQUE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         CITEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  tier_level    tier_level_type NOT NULL DEFAULT 'Branch Staff',
  status        status_type NOT NULL DEFAULT 'Active',
  last_login_at TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role   ON users(role_id);
CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- ผูก FK ย้อนกลับจาก brands / branches ไปหา users
ALTER TABLE brands  ADD CONSTRAINT fk_brands_created_by  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE brands  ADD CONSTRAINT fk_brands_updated_by  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE branches ADD CONSTRAINT fk_branches_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE branches ADD CONSTRAINT fk_branches_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- 2.5 User Dashboard Permissions (สิทธิ์เปิด-ปิด Grid Dashboard 5 ระดับ)
CREATE TABLE user_permissions (
  user_id                         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  can_view_super_admin_overview   BOOLEAN NOT NULL DEFAULT false,
  can_view_brand_regional_grid    BOOLEAN NOT NULL DEFAULT false,
  can_view_regional_province_grid BOOLEAN NOT NULL DEFAULT false,
  can_view_provincial_branch_grid BOOLEAN NOT NULL DEFAULT false,
  can_view_branch_kiosks_grid     BOOLEAN NOT NULL DEFAULT false
);

-- 2.6 User Sessions (JWT Refresh Token Management)
CREATE TABLE user_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  ip_address         TEXT,
  user_agent         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at         TIMESTAMPTZ
);
CREATE INDEX idx_user_sessions_user    ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at) WHERE revoked_at IS NULL;

-- 2.7 Scope Junctions (กำหนดขอบเขตข้อมูลราย User)
CREATE TABLE user_brand_scopes (
  user_id  UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, brand_id)
);

CREATE TABLE user_region_scopes (
  user_id   UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id)  ON DELETE CASCADE,
  PRIMARY KEY (user_id, region_id)
);

CREATE TABLE user_province_scopes (
  user_id     UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  province_id UUID NOT NULL REFERENCES provinces(id)  ON DELETE CASCADE,
  PRIMARY KEY (user_id, province_id)
);

CREATE TABLE user_branch_scopes (
  user_id   UUID NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id)  ON DELETE CASCADE,
  PRIMARY KEY (user_id, branch_id)
);
```

---

## 4. การประเมินความพึงพอใจ (Satisfaction Voting - Kiosk)

```sql
-- 3.1 Satisfaction Votes (ธุรกรรมผลโหวต - High-Throughput & Partition-Ready)
CREATE TABLE satisfaction_votes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  kiosk_id  UUID          REFERENCES kiosks(id)   ON DELETE SET NULL,
  brand_id  UUID NOT NULL REFERENCES brands(id)   ON DELETE CASCADE,
  sentiment sentiment_type NOT NULL,
  voted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_ip INET
);

-- Performance Indexes สำหรับ Dashboard Queries
CREATE INDEX idx_votes_branch_voted ON satisfaction_votes(branch_id, voted_at DESC);
CREATE INDEX idx_votes_brand_voted  ON satisfaction_votes(brand_id, voted_at DESC);
CREATE INDEX idx_votes_voted_at     ON satisfaction_votes USING BRIN (voted_at);

-- 3.2 Satisfaction Config (การตั้งค่าหน้าจอ Kiosk - JSONB Singleton)
CREATE TABLE satisfaction_config (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 5. กิจกรรมและแคมเปญ (Events & Campaigns)

```sql
-- 4.1 Event Categories (หมวดหมู่กิจกรรม - Lookup Table)
CREATE TABLE event_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code  TEXT NOT NULL UNIQUE,
  category_label TEXT NOT NULL,
  display_order  SMALLINT NOT NULL DEFAULT 0
);

-- 4.2 Events (ปฏิทินกิจกรรม)
CREATE TABLE events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code           TEXT NOT NULL UNIQUE,
  event_name           TEXT NOT NULL,
  event_date           DATE NOT NULL,
  start_time           TIME NOT NULL,
  end_time             TIME NOT NULL,
  brand_id             UUID REFERENCES brands(id) ON DELETE SET NULL,
  event_location       TEXT,
  category_id          UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  event_status         TEXT NOT NULL DEFAULT 'Upcoming'
                       CHECK (event_status IN ('Upcoming', 'Active', 'Completed')),
  description          TEXT,
  kiosk_theme_override JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by           UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_events_date   ON events(event_date);
CREATE INDEX idx_events_brand  ON events(brand_id);
CREATE INDEX idx_events_status ON events(event_status);

-- 4.3 Event Target Branches (Junction สำหรับผูกกิจกรรมเฉพาะสาขา)
CREATE TABLE event_target_branches (
  event_id  UUID NOT NULL REFERENCES events(id)   ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, branch_id)
);
```

---

## 6. การแจ้งเตือน (Notifications)

```sql
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'Alert'
                    CHECK (notification_type IN ('Alert', 'Feedback', 'System')),
  description       TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  target_branch_id  UUID REFERENCES branches(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  priority          TEXT NOT NULL DEFAULT 'Medium'
                    CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at           TIMESTAMPTZ
);
CREATE INDEX idx_notifications_unread    ON notifications(is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id) WHERE recipient_user_id IS NOT NULL;
CREATE INDEX idx_notifications_branch    ON notifications(target_branch_id) WHERE target_branch_id IS NOT NULL;
```

---

## 7. ตรวจสอบความปลอดภัยและสถานะระบบ (Audit & Health)

```sql
-- 6.1 Audit Logs (บันทึกประวัติการกระทำ)
CREATE TABLE audit_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name_snapshot TEXT NOT NULL,
  actor_role_snapshot TEXT NOT NULL,
  action_type         TEXT NOT NULL,
  target_entity       TEXT NOT NULL,
  description         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'SUCCESS'
                      CHECK (status IN ('SUCCESS', 'FAILED', 'WARNING')),
  ip_address          INET
);
CREATE INDEX idx_audit_logs_occurred ON audit_logs(occurred_at DESC);
CREATE INDEX idx_audit_logs_actor    ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_action   ON audit_logs(action_type);

-- 6.2 Audit Diff Details (รายละเอียดการเปลี่ยนแปลงแบบ Visual Diff)
CREATE TABLE audit_diff_details (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id UUID NOT NULL REFERENCES audit_logs(id) ON DELETE CASCADE,
  field_name   TEXT NOT NULL,
  before_value TEXT,
  after_value  TEXT
);
CREATE INDEX idx_audit_diff_log ON audit_diff_details(audit_log_id);

-- 6.3 API Service Health (ตรวจสอบ Microservices & Uptime)
CREATE TABLE api_service_health (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code       TEXT NOT NULL UNIQUE,
  service_name       TEXT NOT NULL,
  endpoint           TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'Operational'
                     CHECK (status IN ('Operational', 'Degraded', 'Outage', 'Maintenance')),
  uptime_percent     NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  latency_ms         INT NOT NULL DEFAULT 0,
  error_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  last_checked_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 8. การตั้งค่าระบบ (System Settings)

```sql
-- เก็บค่าตั้งค่าแบบ Key-Value ด้วย JSONB ยืดหยุ่น ไม่ต้อง Migration บ่อย
CREATE TABLE system_settings (
  setting_key   TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 9. Triggers & Automation

```sql
-- Function ปรับปรุง updated_at อัตโนมัติเมื่อเกิดการแก้ไข
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- เชื่อมโยง Trigger ไปยังตารางที่มีคอลัมน์ updated_at
CREATE TRIGGER trg_brands_updated    BEFORE UPDATE ON brands              FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_branches_updated  BEFORE UPDATE ON branches            FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_roles_updated     BEFORE UPDATE ON roles               FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_users_updated     BEFORE UPDATE ON users               FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_events_updated    BEFORE UPDATE ON events              FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_sat_config_upd    BEFORE UPDATE ON satisfaction_config  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_settings_updated  BEFORE UPDATE ON system_settings     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
```

---

## 10. Views & Aggregations

```sql
-- 9.1 Brand Stats View (คำนวณจำนวนสาขา ตู้ Kiosk และ CSAT เฉลี่ยสด)
CREATE VIEW v_brand_stats AS
SELECT
  b.id                AS brand_id,
  b.brand_code,
  b.brand_name,
  b.status,
  COUNT(DISTINCT br.id)  AS total_branches,
  COUNT(DISTINCT k.id)   AS total_kiosks,
  ROUND(
    AVG(CASE
      WHEN v.sentiment = 'satisfied'   THEN 100
      WHEN v.sentiment = 'neutral'     THEN 50
      ELSE 0
    END)
  , 1) AS csat_average
FROM brands b
LEFT JOIN branch_brands bb ON bb.brand_id = b.id
LEFT JOIN branches br      ON br.id = bb.branch_id AND br.deleted_at IS NULL
LEFT JOIN kiosks k         ON k.branch_id = br.id
LEFT JOIN satisfaction_votes v ON v.brand_id = b.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.brand_code, b.brand_name, b.status;

-- 9.2 Branch Detail View (รวมข้อมูลจังหวัดและภาค)
CREATE VIEW v_branch_detail AS
SELECT
  br.id,
  br.branch_code,
  br.name,
  br.kiosk_count,
  br.status,
  p.name  AS province_name,
  r.name  AS region_name,
  r.id    AS region_id,
  p.id    AS province_id,
  COALESCE(
    STRING_AGG(DISTINCT b.brand_name, ' + ' ORDER BY b.brand_name),
    ''
  ) AS brand_display
FROM branches br
JOIN provinces p ON p.id = br.province_id
JOIN regions r   ON r.id = p.region_id
LEFT JOIN branch_brands bb ON bb.branch_id = br.id
LEFT JOIN brands b         ON b.id = bb.brand_id
WHERE br.deleted_at IS NULL
GROUP BY br.id, br.branch_code, br.name, br.kiosk_count, br.status,
         p.name, r.name, r.id, p.id;
```

---

## 11. Initial Seed Data

```sql
-- 10.1 System Modules (9 โมดูลระบบ)
INSERT INTO system_modules (module_code, module_label, display_order) VALUES
  ('dashboard_analytics',   'Dashboard Analytics',    1),
  ('brand_management',      'Brand Management',       2),
  ('branch_management',     'Branch Management',      3),
  ('user_management',       'User Management',        4),
  ('event_calendar',        'Event Calendar',         5),
  ('notification_triage',   'Notification Triage',    6),
  ('data_access_scope',     'Data Access Scope',      7),
  ('audit_log_diff',        'Audit Log & Diff',       8),
  ('system_settings',       'System Settings',        9);

-- 10.2 Default Roles (5-Tier Hierarchy)
INSERT INTO roles (id, role_code, role_name, role_description, is_system_default) VALUES
  ('11111111-1111-1111-1111-111111111111', 'SUPER_ADMIN',      'Super Administrator',      'ผู้ดูแลระบบสูงสุด จัดการได้ทุกแบรนด์และทุกเมนู',           true),
  ('22222222-2222-2222-2222-222222222222', 'BRAND_OWNER',      'Brand Owner',              'เจ้าของแบรนด์ ดูแลภาพรวมและระดับภาคของแบรนด์ตนเอง',       true),
  ('33333333-3333-3333-3333-333333333333', 'REGIONAL_MANAGER', 'Regional Manager (RM)',     'ผู้จัดการระดับภาค ดูแลเปรียบเทียบระดับจังหวัดในภาค',       true),
  ('44444444-4444-4444-4444-444444444444', 'AREA_MANAGER',     'Area Manager (AM)',         'ผู้จัดการระดับเขต/จังหวัด ดูแลเปรียบเทียบระดับสาขา',       true),
  ('55555555-5555-5555-5555-555555555555', 'BRANCH_STAFF',     'Branch Staff',             'เจ้าหน้าที่สาขา ตรวจสอบตู้ Kiosk และดูผลเรียลไทม์',       true);

-- 10.3 Event Categories
INSERT INTO event_categories (category_code, category_label, display_order) VALUES
  ('CAMPAIGN',    'Campaign / Promotion', 1),
  ('MAINTENANCE', 'Maintenance',          2),
  ('FIRMWARE',    'Firmware Update',      3),
  ('CALIBRATION', 'Calibration',          4),
  ('AUDIT',       'Audit / Inspection',   5);

-- 10.4 Regions
INSERT INTO regions (name, display_order) VALUES
  ('ภาคเหนือ',            1),
  ('ภาคตะวันออกเฉียงเหนือ', 2),
  ('ภาคกลาง',             3),
  ('ภาคตะวันออก',          4),
  ('ภาคตะวันตก',           5),
  ('ภาคใต้',              6);

-- 10.5 Sample Brands (CRG Network)
INSERT INTO brands (id, brand_code, brand_name, parent_company_name, category, brand_icon_name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BRD-KFC', 'KFC Thailand',  'Central Restaurants Group', 'Fast Food (QSR)',    'lunch_dining'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BRD-MD',  'Mister Donut',  'Central Restaurants Group', 'Beverage & Bakery',  'donut_large'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'BRD-AA',  'Auntie Anne''s','Central Restaurants Group', 'Beverage & Bakery',  'bakery_dining');

-- 10.6 Default Satisfaction Config
INSERT INTO satisfaction_config (config) VALUES (
  '{
    "questionTitle": "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?",
    "questionFontSize": 36,
    "questionSubtitle": "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง",
    "subtitleFontSize": 18,
    "emojiSize": 160,
    "labelFontSize": 20,
    "gridMaxWidth": 900,
    "duplicateVoteMinutes": 30,
    "autoResetSeconds": 4,
    "modalMaxWidth": 650,
    "thankYouIconSize": 80,
    "thankYouMessageTh": "ขอขอบคุณสำหรับความคิดเห็นอันมีค่าของคุณ เพื่อการพัฒนาบริการให้ดียิ่งขึ้นนะคะ",
    "thankYouFontSizeTh": 28,
    "thankYouMessageEn": "Thank you for your valuable feedback! We appreciate your visit.",
    "thankYouFontSizeEn": 16,
    "eventOverrideEnabled": false
  }'::jsonb
);

-- 10.7 Default System Settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
  ('general',      '{"systemName":"Satisfaction Management","companyName":"Globex International","contactEmail":"admin@satisfaction-management.com","systemLogoUrl":""}'),
  ('dashboard',    '{"refreshInterval":"30s","enableRealtimeSound":false,"benchmarkThreshold":85}'),
  ('reports',      '{"pdfHeaderTitle":"Confidential - Executive CSAT Performance & Sentiment Report","pdfFooterNote":"Generated automatically by Enterprise CSAT Backoffice.","defaultExportFormat":"excel","includeWatermark":true}'),
  ('localization', '{"systemTimezone":"Asia/Bangkok (UTC+07:00)","dateFormatPattern":"DD/MM/YYYY","defaultLanguage":"Thai (ไทย)"}');
```
