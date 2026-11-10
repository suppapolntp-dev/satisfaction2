# 📋 CSAT Platform: รายละเอียดอัลกอริทึมและฟังก์ชันทุกหน้าจอ (System Page & Algorithm Audit Guide)

> **Customer Satisfaction & Multi-Tier Analytics Platform (Central Restaurants Group - CRG)**  
> เอกสารรวบรวมรายการหน้าจอทั้งหมด **15 หน้าหลัก (+1 Root Redirect)** พร้อมข้อกำหนดอัลกอริทึม (Algorithms), ตรรกะทางธุรกิจ (Business Logic), โครงสร้างสิทธิ์ (5-Tier Data Isolation), และ Checkpoints สำหรับตรวจเช็กความถูกต้อง

---

## 📊 สรุปภาพรวมและสารบัญหน้าจอ (Page & Route Inventory Matrix)

| # | Route URL | ชื่อหน้าจอ (Screen Name) | Component Path | ระดับสิทธิ์ (Tier / Role) | สถานะความพร้อม | ตรวจสอบ |
|---|---|---|---|---|---|:---:|
| **1** | `/login` | Authentication & 2FA OTP | `Screens/Authentication/Login` | Public (ทุกคน) | ✅ Ready | [ ] |
| **2** | `/satisfaction` | Customer CSAT Touchscreen Kiosk | `Screens/User/Satifaction` | Public (ลูกค้าหน้าร้าน) | ✅ Ready | [ ] |
| **3** | `/dashboard` | Analytics Dashboard | `Screens/Admin/Dashboard` | Tier 1–5 (ทุกระดับ) | ✅ Ready | [ ] |
| **4** | `/brand` | Brand & Branch Operations | `Screens/Admin/BrandManagement` | Tier 1–2 (SuperAdmin, Brand) | ✅ Ready | [ ] |
| **5** | `/branch` | Branch Management | `Screens/Admin/BranchManagement` | Tier 1–4 (SuperAdmin, Brand, RM, AM) | ✅ Ready | [ ] |
| **6** | `/event` | Event & Campaigns Calendar | `Screens/Admin/EventManagement` | Tier 1–4 (SuperAdmin, Brand, RM, AM) | ✅ Ready | [ ] |
| **7** | `/usermanagement` | User Management & Identity | `Screens/Admin/Usermanagement` | Tier 1 (Super Admin เท่านั้น) | ✅ Ready | [ ] |
| **8** | `/roles` | Roles & Permission Matrix | `Screens/Admin/RoleManagement` | Tier 1 (Super Admin เท่านั้น) | ✅ Ready | [ ] |
| **9** | `/dataaccess` | Data Access Scope Engine | `Screens/Admin/DataAccessManagement` | Tier 1 (Super Admin เท่านั้น) | ✅ Ready | [ ] |
| **10** | `/audit` | Audit Trail & Service Health | `Screens/Admin/AuditTriage` | Tier 1 (Super Admin เท่านั้น) | ✅ Ready | [ ] |
| **11** | `/notifications` | Notification & Alert Triage | `Screens/Admin/NotificationTriage` | Tier 1–5 (ตาม Scope) | ✅ Ready | [ ] |
| **12** | `/settings` | System Settings & Kiosk Config | `Screens/Admin/SystemSettings` | Tier 1 (Super Admin เท่านั้น) | ✅ Ready | [ ] |
| **13** | `/docs` | API Docs & Integration Guide | `Screens/Admin/Documentation` | Tier 1–5 (ทุกระดับ) | ✅ Ready | [ ] |
| **14** | `/unauthorized` | 403 Access Denied Interceptor | `app/(admin)/unauthorized` | Error Fallback (ทุกคน) | ✅ Ready | [ ] |
| **15** | `/test` | Developer Test Playground | `app/test` | Developer / QA | ✅ Ready | [ ] |
| *16* | `/` | Root Redirect Handler | `app/page.tsx` | Auto Redirect (`/dashboard` or `/login`) | ✅ Ready | [ ] |

---

## 🔬 เจาะลึกอัลกอริทึมรายหน้าสำหรับการตรวจรับงาน (Detailed Page Algorithms)

---

### 1. หน้าเข้าสู่ระบบ (Authentication & MFA Login)
* **Route:** `/login`
* **ไฟล์หลัก:** [`frontend/src/Screens/Authentication/Login/LoginScreen.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Authentication/Login/LoginScreen.tsx)
* **Backend:** [`Backend/Services/AuthService.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Services/AuthService.cs), [`Backend/Controllers/AuthController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/AuthController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Credentials Validation:** ตรวจสอบความครบถ้วนของ Email / Corporate ID และ Password
2. **BCrypt Hash Matching:** ฝั่ง Backend ถอดรหัสเปรียบเทียบกับ `user.PasswordHash`
3. **Tiered 2-Step MFA Logic:**
   * **Tier 1–4 (Super Admin, Brand Manager, Regional Manager, Area Manager):** บังคับตรวจ 2FA SMS OTP เสมอ $\rightarrow$ ระบบสุ่มรหัส OTP 6 หลัก + Reference Code 4 หลัก มีอายุ 3 นาที (180 วินาที) ตอบกลับ `requiresMfa: true`
   * **Tier 5 (Branch Staff):** ข้ามขั้นตอน 2FA เพื่อความสะดวกรวดเร็วในการทำงานหน้าเครื่อง POS/หน้าร้าน ตอบกลับ `requiresMfa: false` และออก Session ทันที
4. **Token Issuance & Rotation:**
   * ออก **Access Token** (JWT มีอายุ 1 วัน) เก็บใน Cookie `satisfaction_access_token`
   * ออก **Refresh Token** (เข้ารหัส SHA256 เก็บลงตาราง `user_sessions`) และทำ **Token Rotation** ทุกครั้งที่มีการ Refresh เพื่อป้องกัน Replay Attack

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] เมื่อล็อกอินด้วยบัญชี Staff (`staff.futurepark@satisfaction.local`) ต้องเข้า Dashboard ได้ทันทีโดยไม่ถาม OTP
- [ ] เมื่อล็อกอินด้วยบัญชี Admin/Manager (`admin@satisfaction.local`) ต้องแสดง Modal OTP 6 หลักพร้อมเลขนับถอยหลัง
- [ ] กรอก OTP ผิดหรือปล่อยให้หมดเวลา ต้องแสดง Error ชัดเจนและไม่ยอมให้ออก Access Token

---

### 2. หน้าตู้คีออสประเมินความพึงพอใจ (Touchscreen CSAT Kiosk)
* **Route:** `/satisfaction`
* **ไฟล์หลัก:** [`frontend/src/Screens/User/Satifaction/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/User/Satifaction/page.tsx)
* **Backend:** [`Backend/Controllers/SatisfactionController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/SatisfactionController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Touch-First Guard Algorithm:**
   * ดักจับคลิกขวา `onContextMenu={(e) => e.preventDefault()}`
   * ปิด Text Selection (`select-none`, `user-select: none`)
   * ป้องกันการแตะซ้ำขณะบันทึกโหวต (`pointer-events: none` ในระหว่างที่ `isProcessingVote === true`)
2. **Sentiment Numeric Mapping:**
   * ปุ่มเขียว (Happy/ดี) $\rightarrow$ `1` (Positive)
   * ปุ่มเหลือง (Neutral/ปานกลาง) $\rightarrow$ `2` (Neutral)
   * ปุ่มแดง (Sad/แย่) $\rightarrow$ `3` (Negative)
3. **Precision Auto-Reset Timer (Thank You Modal):**
   * นับถอยหลังด้วยความแม่นยำสูง (Delta-time calculation):
     $$\text{elapsedMs} = \text{Date.now()} - \text{startTime}$$
     $$\text{remainingMs} = \max(0, \text{totalDurationMs} - \text{elapsedMs})$$
     $$\text{progressPercent} = \max\left(0, \frac{\text{remainingMs}}{\text{totalDurationMs}} \times 100\right)$$
   * เมื่อ `remainingMs <= 0` หน้าต่างจะปิดตัวเองลงและรีเซ็ตหน้าจอพร้อมรับลูกค้ารายใหม่ทันที
4. **Reactive UI Sync:**
   * รับฟัง Window Event `csat_satisfaction_settings_updated` เพื่อปรับขนาดปุ่ม ฟอนต์ และข้อความทันทีเมื่อ Admin บันทึกการตั้งค่าในระบบ
5. **Backend Kiosk Heartbeat & Resolver:**
   * ถ้าระบุ `KioskCode` หรือ `BranchCode` มาแทน Id ระบบจะ Map หา BranchId/BrandId ให้อัตโนมัติ
   * อัปเดต `kiosk.LastPingAt = DateTime.UtcNow` และตั้ง `kiosk.Status = KioskStatus.Online`

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] แตะปุ่มความพึงพอใจแล้วส่งข้อมูลไปยัง `POST /api/satisfaction/vote` พร้อม sentiment 1, 2 หรือ 3
- [ ] หน้าต่าง Thank You Modal นับถอยหลังลื่นไหลตามเวลาที่ตั้งไว้ใน Settings (เช่น 4 หรือ 5 วินาที) แล้วรีเซ็ตหน้าจอ
- [ ] หน้าตู้ Kiosk ไม่สามารถคลิกขวา ลากคลุมตัวหนังสือ หรือกด Double Tap รัวๆ ให้คะแนนเบิ้ลได้

---

### 3. หน้าแดชบอร์ดและการวิเคราะห์ (Analytics Dashboard)
* **Route:** `/dashboard`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/Dashboard/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/Dashboard/page.tsx)
* **Backend:** [`Backend/Services/DashboardService.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Services/DashboardService.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **CSAT Metric Score Formula:**
   $$\text{CSAT Score (\%)} = \text{Math.Round}\left(\frac{\text{Positive Count}}{\text{Total Votes}} \times 100, 1\right)$$
2. **Adaptive Timeline Bucketing Algorithm:**
   * ตรวจสอบความกว้างของช่วงเวลา `(endDate - startDate).TotalDays`
   * ถ้า $\le 2$ วัน หรือเลือก interval "hourly" $\rightarrow$ จัดกลุ่มตามชั่วโมง `v.VotedAt.ToString("HH:00")`
   * ถ้า $> 2$ วัน $\rightarrow$ จัดกลุ่มตามวัน `v.VotedAt.ToString("yyyy-MM-dd")`
3. **5-Tier Hierarchy Drill-Down (Analyses Tab):**
   * เชื่อมโยงกับ `OrgHierarchyTreeSidebar` เพื่อเลือกดูข้อมูลเจาะลึกเฉพาะ Brand, Region, Province หรือ Branch
4. **Scope Isolation Enforcement:**
   * ทุกเมทริกซ์และผลโหวตวิ่งผ่าน `_scopeFilter.FilterVotes(query, user)` ทำให้ผู้ใช้ระดับสาขาไม่มีทางเห็นข้อมูลสาขาอื่น

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] เมื่อกดเลือกช่วงเวลาแบบ 1 วัน กราฟแนวโน้มต้องแสดงเป็นรายชั่วโมง (`09:00`, `10:00`, ...)
- [ ] สลับแท็บ Overview / Analyses แล้วข้อมูลอัปเดตสอดคล้องกับ Scope ที่เลือกใน Org Tree
- [ ] สูตร CSAT คำนวณถูกต้องตามสัดส่วนคะแนน Positive ต่อนับรวมทั้งหมด

---

### 4. หน้าจัดการแบรนด์ (Brand Management)
* **Route:** `/brand`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/BrandManagement/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/BrandManagement/page.tsx)
* **Backend:** [`Backend/Controllers/BrandsController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/BrandsController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Parallel Data Loading:** ดึงทั้งข้อมูลแบรนด์และสาขาพร้อมกันด้วย `Promise.all([brandService.getBrands(), branchService.getBranches()])`
2. **Brand KPI Computation:**
   * คำนวณจำนวนสาขารวมของทุกแบรนด์ (`totalBranchesCount`)
   * คำนวณค่าเฉลี่ย CSAT รวมของแบรนด์ทั้งหมด
3. **Co-Location Dual-Brand Detection:**
   * ตรวจสอบว่าสาขาใดเป็นร้านร่วมหลายแบรนด์ (`(item.brands && item.brands.length > 1) || item.brand.includes('+')`)
4. **Optimistic Mutation:** เมื่อแก้ไขข้อมูลแบรนด์ จะปรับปรุง State ใน React ทันทีโดยไม่ต้องโหลดหน้าเว็บใหม่

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] การแก้ไขข้อมูลแบรนด์ (ชื่อ, หมวดหมู่, สีธีม) บันทึกและสะท้อนผลทันที
- [ ] ตัวเลขจำนวนสาขาและตู้ Kiosk คำนวณตรงกับจำนวนสาขาจริงที่มีอยู่ในระบบ
- [ ] แท็บ Branches แสดงรายการสาขาที่สังกัดแบรนด์นั้นๆ ได้อย่างถูกต้อง

---

### 5. หน้าจัดการสาขา (Branch Management)
* **Route:** `/branch`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/BranchManagement/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/BranchManagement/page.tsx)
* **Backend:** [`Backend/Controllers/BranchesController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/BranchesController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Multi-Field Substring Search (`searchBranches`):**
   * ค้นหาพร้อมกันใน 7 ฟิลด์: `code`, `name`, `brand`, `brands[]`, `region`, `province`, `id`
2. **Compound Filtering:**
   * กรอง 3 มิติ: แบรนด์ (Brand) $\rightarrow$ ภูมิภาค (Region) $\rightarrow$ สถานะ (Status: Active/Inactive)
3. **Many-to-Many Co-Location Storage:**
   * สาขาสามารถผูกหลายแบรนด์ผ่านตารางสะพาน `branch_brands`
4. **Confirmation Modal & Soft Delete:**
   * ก่อนลบจะแสดง Warning Modal ยืนยัน และดำเนินการแบบ Soft Delete ป้องกันข้อมูลผลโหวตในอดีตสูญหาย

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] พิมพ์ค้นหาด้วยชื่อจังหวัด เช่น "เชียงใหม่" หรือรหัสสาขา "BKK001" ต้องแสดงผลทันทีแบบ Real-time
- [ ] เมื่อสร้างสาขาใหม่แบบ Dual-Brand (เช่น KFC + Mister Donut) ป้ายแสดงแบรนด์ต้องขึ้นครบทั้ง 2 แบรนด์
- [ ] การกดลบสาขาจะมี Popup ยืนยัน และเปลี่ยนสถานะโดยไม่ทำให้ระบบ Crash

---

### 6. หน้าจัดการกิจกรรมและแคมเปญ (Event & Campaigns)
* **Route:** `/event`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/EventManagement/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/EventManagement/page.tsx)
* **Backend:** [`Backend/Controllers/EventsController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/EventsController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Interactive Calendar Grid:**
   * คำนวณวันเริ่มต้น วันสิ้นสุด และ Render แคมเปญลงในตารางปฏิทินตาม `EventDate`
2. **Event Target Branch Linkage:**
   * กำหนดกลุ่มสาขาเป้าหมายที่เข้าร่วมแคมเปญผ่าน `event_target_branches`
3. **Date Filtering Query:**
   * คัดกรองอีเวนต์ตามช่วงวันที่ `EventDate >= parsedStart && EventDate <= parsedEnd` และตามหมวดหมู่ (`Audit`, `Marketing`, `Training`)

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] การคลิกที่ช่องวันที่ในปฏิทินสามารถเปิด Modal สร้างกิจกรรมสำหรับวันนั้นได้ทันที
- [ ] สลับระหว่าง Calendar View และ Table View แล้วข้อมูลสอดคล้องกัน

---

### 7. หน้าจัดการบัญชีผู้ใช้งาน (User Management)
* **Route:** `/usermanagement`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/Usermanagement/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/Usermanagement/page.tsx)
* **Backend:** [`Backend/Controllers/UsersController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/UsersController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Query-Driven Tab Navigation:**
   * ตรวจสอบ Query `?tab=dataaccess` หากตรงจะสลับไปแสดงหน้า Data Access Scope ทันที
2. **BCrypt Secure Password Storage:**
   * ผู้ใช้ที่ถูกสร้างใหม่จะถูกเข้ารหัสผ่านด้วย `BCrypt.Net.BCrypt.HashPassword`
3. **Scope Association on User Create:**
   * เมื่อกำหนด Brand หรือ Branch ให้ผู้ใช้ ระบบจะบันทึกลงตารางเชื่อมโยง `user_brand_scopes`, `user_branch_scopes`
4. **Immediate Status Switch:**
   * การกด Toggle สวิตช์สถานะจะส่งคำขอ Patch ไปอัปเดตสถานะ Active/Inactive ในทันที

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] สร้างผู้ใช้ใหม่พร้อมกำหนดสิทธิ์ Tier ต่างๆ ข้อมูลบันทึกถูกต้องและรหัสผ่านเข้ารหัส
- [ ] ไม่อนุญาตให้ลบหรือระงับบัญชี Super Admin สูงสุดของระบบ

---

### 8. หน้าจัดการบทบาทและสิทธิ์ (Roles & Permissions)
* **Route:** `/roles`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/RoleManagement/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/RoleManagement/page.tsx)
* **Backend:** [`Backend/Controllers/RolesController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/RolesController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **5-Key Permission Matrix Grid:**
   * จัดเก็บสิทธิ์แต่ละโมดูลเป็นบูลีน `{ view: bool, create: bool, update: bool, delete: bool, export: bool }`
2. **Matrix State Immutability:**
   * การคลิก Checkbox สลับค่าแบบไม่ทำลาย State เดิม (`setPermissionMatrix`)
3. **Batch Operations:**
   * ฟังก์ชัน `handleToggleAllPermissions(enableAll)` ปรับสิทธิ์ทุกช่องของ Role นั้นพร้อมกันในคลิกเดียว
4. **Transactional Database Sync:**
   * บันทึกสิทธิ์ลงตาราง `role_permissions` ใน Database แบบ Transaction

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] ติ๊กเปิด/ปิดสิทธิ์ในตารางเมทริกซ์ แล้วกดบันทึก ข้อมูลต้องคงอยู่เมื่อ Refresh หรือเปลี่ยนไปเลือก Role อื่น
- [ ] ปุ่ม "Select All" / "Unselect All" ปรับค่าทุก Checkbox ในตารางได้อย่างถูกต้อง

---

### 9. หน้าจัดการขอบเขตข้อมูล (Data Access Scope Management)
* **Route:** `/dataaccess`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/DataAccessManagement/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/DataAccessManagement/page.tsx)
* **Backend:** [`Backend/Services/ScopeFilterService.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Services/ScopeFilterService.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **4-Level Nested Hierarchy Tree Builder:**
   * อัลกอริทึมสร้าง Tree ในฝั่ง Client จาก Flat Array:
     ```
     Brands[] ──> Group by Region ──> Group by Province ──> Map to Branches[]
     ```
2. **Tier-Based Auto Permission Computation:**
   * เรียกใช้ `computePermissionsByTier(tier)` เพื่อคำนวณและตั้งค่าเริ่มต้น เช่น Tier 1 เปิดดูได้ 5 ตาราง, Tier 5 ดูได้เฉพาะตารางตู้ Kiosk ของสาขาตนเอง
3. **Custom Scope Generator:**
   * สามารถตั้งชื่อกลุ่มสโคปเฉพาะ (เช่น "Central World Combo") เพื่อรวมสาขาของ KFC + Mister Donut ในห้างเดียวกันได้
4. **Backend SQL Scope Filtering (`ScopeFilterService`):**
   * ใช้ LINQ Query กรองข้อมูลในระดับ Database เพื่อให้ผลลัพธ์ที่ส่งกลับมาปลอดภัย 100%

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] ผังโครงสร้างต้นไม้ด้านซ้ายแสดงการจัดกลุ่ม แบรนด์ $\rightarrow$ ภาค $\rightarrow$ จังหวัด $\rightarrow$ สาขา ถูกต้อง
- [ ] เมื่อเลือกสาขาหรือแบรนด์ใด สิทธิ์และตารางสรุปจะแสดงเฉพาะข้อมูลในขอบเขตนั้น

---

### 10. หน้าประวัติการทำงานและสถานะระบบ (Audit Logs & Service Health)
* **Route:** `/audit`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/AuditTriage/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/AuditTriage/page.tsx)
* **Backend:** [`Backend/Controllers/AuditController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/AuditController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Deep Diff Inspection Algorithm:**
   * เก็บประวัติการเปลี่ยนแปลงพร้อมรายละเอียดในตาราง `audit_log_diff_details`
   * แสดงผลเปรียบเทียบ `Old Value` vs `New Value`
2. **Actor Snapshot Tracking:**
   * Snapshot ชื่อและบทบาทของผู้ทำรายการ (`ActorNameSnapshot`, `ActorRoleSnapshot`, `ClientIp`) ป้องกันประวัติเปลี่ยนเมื่อผู้ใช้เปลี่ยนชื่อในอนาคต
3. **Service Health & Ping Check:**
   * ดึงสถานะ Uptime %, Latency และ Memory ของ Database และ Background Workers

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] เมื่อมีการสร้างหรือแก้ไขสาขา/แบรนด์ จะมี Log รายการใหม่ปรากฏใน Audit Logs
- [ ] หน้าแท็บ Service Health แสดงสถานะปกติและสามารถกดปุ่ม Ping ทดสอบ Latency ได้

---

### 11. หน้าศูนย์แจ้งเตือน (Notification & Alert Triage)
* **Route:** `/notifications`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/NotificationTriage/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/NotificationTriage/page.tsx)
* **Backend:** [`Backend/Services/CsatAlertWatcherBackgroundService.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Services/CsatAlertWatcherBackgroundService.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **CSAT Rolling Anomaly Worker:**
   * ทำงานอัตโนมัติใน Background ทุก 30 นาที
   * ตรวจสอบสาขาที่มีคะแนนโหวต $\ge 5$ โหวตในรอบ 24 ชั่วโมง
   * หากคำนวณแล้ว $\text{CSAT} < 80\%$ จะสร้าง High Priority Notification แจ้งเตือนผู้จัดการเขตทันที
2. **Kiosk Disconnect Heartbeat Worker:**
   * ตรวจสอบตู้ Kiosk ที่ไม่มี Ping เกิน 15 นาที และแจ้งเตือนสถานะ Offline
3. **Batch Mark as Read:**
   * อัปเดตสถานะการแจ้งเตือนทั้งหมดให้เป็น Read และลดตัวเลข Unread Badge ทันที

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] เมื่อกดปุ่ม "Mark All as Read" ตัวเลขสีแดง Unread จะหายไปและเปลี่ยนสถานะเป็นอ่านแล้ว
- [ ] การกรองตามความสำคัญ (High, Medium, Low) แสดงรายการที่ถูกต้อง

---

### 12. หน้าตั้งค่าระบบ (System Settings)
* **Route:** `/settings`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/SystemSettings/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/SystemSettings/page.tsx)
* **Backend:** [`Backend/Controllers/SystemSettingsController.cs`](file:///d:/DevProject/Project/Satifaction2/Backend/Controllers/SystemSettingsController.cs)

#### ⚙️ อัลกอริทึมและตรรกะการทำงาน (Algorithm Flow):
1. **Partitioned Settings State:**
   * จัดเก็บค่าตั้งค่า 5 หมวด: General, Dashboard, Satisfaction, Reports, Localization
2. **Cross-Window Custom Event Broadcast:**
   * เมื่อกดบันทึกการตั้งค่าตู้ Kiosk จะยิง Event:
     ```javascript
     window.dispatchEvent(new Event("csat_satisfaction_settings_updated"));
     ```
     ทำให้หน้าจอ `/satisfaction` ปรับขนาดไอคอน ฟอนต์ และเวลานับถอยหลังทันที
3. **Zero-Downtime Dynamic Security Settings:**
   * บันทึกค่าลงตาราง `system_settings` ใน Database เช่น เวลาหมดอายุของ OTP หรือ Anti-Duplicate Window โดยไม่ต้อง Restart Backend API

#### 📝 Checkpoints สำหรับการตรวจ:
- [ ] เมื่อแก้ไขเวลานับถอยหลังของ Kiosk (เช่น เปลี่ยนจาก 4 วิ เป็น 2 วิ) หน้า `/satisfaction` ต้องนับถอยหลัง 2 วินาทีตามที่ตั้งทันที
- [ ] ค่าการตั้งค่าต่างๆ ถูกบันทึกและคงอยู่เมื่อ Refresh หน้าเว็บ

---

### 13. หน้าเอกสาร API (API Documentation & Integration)
* **Route:** `/docs`
* **ไฟล์หลัก:** [`frontend/src/Screens/Admin/Documentation/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/Screens/Admin/Documentation/page.tsx)
* **Core Algorithm:** สารบัญ On-This-Page Scrollspy Anchor นำทางอัตโนมัติ, ฟังก์ชัน Copy cURL Snippet พร้อมป้ายบอกสถานะ Copied 2 วินาที, และตาราง Error Code Reference (200, 400, 401, 403, 429, 500)

---

### 14. หน้าแจ้งเตือนการปฏิเสธการเข้าถึง (403 Access Denied)
* **Route:** `/unauthorized`
* **ไฟล์หลัก:** [`frontend/src/app/(admin)/unauthorized/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/app/(admin)/unauthorized/page.tsx)
* **Core Algorithm:** Edge Middleware และ Angular-style Route Matcher จะส่งผู้ใช้มายังหน้านี้เมื่อสิทธิ์ Tier หรือ Role ไม่เพียงพอ พร้อมปุ่ม Action นำทางกลับ Dashboard ที่มีสิทธิ์ หรือเปลี่ยนบัญชีล็อกอิน

---

### 15. หน้าทดสอบระบบ (Developer Test Playground)
* **Route:** `/test`
* **ไฟล์หลัก:** [`frontend/src/app/test/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/app/test/page.tsx)
* **Core Algorithm:**
  * **Screen Sandbox Switcher:** สลับเรนเดอร์หน้าจอต่างๆ แบบ Live Component Isolation
  * **React Error Boundary Simulator:** ปุ่มทดสอบ Throw Runtime Crash เพื่อพิสูจน์ว่า Error Boundary ของ Next.js ดักจับได้สมบูรณ์
  * **Real-time Telemetry Console:** บันทึกและแสดงผล Logs (INFO, SUCCESS, WARN, ERROR) สดบนหน้าจอ

---

### 16. หน้า Root Redirect
* **Route:** `/`
* **ไฟล์หลัก:** [`frontend/src/app/page.tsx`](file:///d:/DevProject/Project/Satifaction2/frontend/src/app/page.tsx)
* **Core Algorithm:** ตรวจสอบ Session Cookie `satisfaction_access_token` $\rightarrow$ ถ้ามี Session จะ Redirect ไปยัง `/dashboard` ถ้าไม่มีจะ Redirect ไปยัง `/login`

---

## 🛡️ กฎเหล็กด้านสถาปัตยกรรม (Core Architectural Principles)

1. **Strict 5-Tier Data Isolation:**
   * ทุกคำสั่ง Query ใน Backend ต้องใช้ `IScopeFilterService` กรองข้อมูลในระดับ SQL เสมอเพื่อป้องกัน Data Leakage ข้ามระดับชั้น
2. **2-Step Tiered Authentication:**
   * Tier 1–4 บังคับผ่าน 2FA SMS OTP ส่วน Tier 5 เข้าใช้งานได้ทันที
3. **Kiosk Touchscreen Usability:**
   * ปุ่มกดต้องมีขนาดสัมผัสไม่ต่ำกว่า 64px และมีระบบ Auto-Reset Countdown เสมอ
4. **Consistency Single Source of Truth:**
   * ฐานข้อมูล EF Core Entity, DTO, และ TypeScript Interface หน้าบ้านต้องตรงกันทุกฟิลด์
