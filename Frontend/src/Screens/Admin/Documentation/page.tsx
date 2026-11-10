"use client";

import React, { useState } from "react";
import Link from "next/link";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างสารบัญเอกสาร API และรายการหน้าจอ)
// ==========================================================================
interface DocumentTopicItem {
  anchorId: string;
  topicTitle: string;
}

const DOCUMENT_TOPICS: DocumentTopicItem[] = [
  { anchorId: "overview", topicTitle: "API Overview" },
  { anchorId: "prerequisites", topicTitle: "Prerequisites & Tokens" },
  { anchorId: "generating-token", topicTitle: "Generating Access Token" },
  { anchorId: "handling-response", topicTitle: "Handling Response & Errors" },
  { anchorId: "feedback-payload", topicTitle: "Kiosk Sentiment Payload" },
];

export interface PageAlgorithmItem {
  id: number;
  route: string;
  screenName: string;
  componentPath: string;
  tierAccess: string;
  tierBadgeColor: string;
  category: "core" | "support";
  summaryAlgorithm: string;
  detailedLogic: string[];
  checkpoints: string[];
  backendFiles: string[];
}

const SYSTEM_PAGES: PageAlgorithmItem[] = [
  {
    id: 1,
    route: "/login",
    screenName: "Authentication & 2FA OTP",
    componentPath: "Screens/Authentication/Login",
    tierAccess: "Public (ทุกคน)",
    tierBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    category: "core",
    summaryAlgorithm: "ตรวจสอบ Password ผ่าน BCrypt และบังคับ 2FA SMS OTP สำหรับ Tier 1–4 ส่วน Tier 5 เข้าได้ทันที พร้อม Token Rotation",
    detailedLogic: [
      "BCrypt Password Verification เทียบกับ user.PasswordHash ในตาราง users",
      "Tier-Aware 2FA: หากเป็น Tier 1–4 จะส่งรหัสสุ่ม OTP 6 หลัก + Ref Code 4 ตัว (TTL 180 วินาที) ทาง SMS",
      "Tier 5 (Branch Staff) ข้ามขั้นตอน 2FA เข้าสู่ระบบและออก Session Token ได้ทันที",
      "ออก Access Token (JWT 1 วัน) และ Refresh Token (SHA256 hash ลงตาราง user_sessions พร้อม Token Rotation)",
    ],
    checkpoints: [
      "บัญชี staff.futurepark@satisfaction.local ล็อกอินตรงได้ทันทีโดยไม่ต้องผ่าน OTP",
      "บัญชี admin@satisfaction.local ต้องแสดงหน้าต่างใส่ OTP 6 หลักพร้อมเลขนับถอยหลัง",
      "กรอก OTP ผิดหรือเกิน 3 นาที ต้องถูกปฏิเสธและไม่ออก Access Token",
    ],
    backendFiles: ["Backend/Services/AuthService.cs", "Backend/Controllers/AuthController.cs"],
  },
  {
    id: 2,
    route: "/satisfaction",
    screenName: "Customer CSAT Touchscreen Kiosk",
    componentPath: "Screens/User/Satifaction",
    tierAccess: "Public (ลูกค้าหน้าร้าน)",
    tierBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "core",
    summaryAlgorithm: "Touch-First CSAT Voting, Anti-Spam double tap, Precision Delta-time Auto Reset และ Kiosk Heartbeat",
    detailedLogic: [
      "Touch-First Guard: ปิดคลิกขวา onContextMenu ปิดลากคลุม select-none ล็อก pointer-events ขณะประมวลผล",
      "Sentiment Mapping: เขียว (ดี) = 1 (Positive), เหลือง (ปานกลาง) = 2 (Neutral), แดง (แย่) = 3 (Negative)",
      "Precision Delta-Time Auto-Reset: คำนวณเวลานับถอยหลังจริง elapsedMs = Date.now() - startTime ป้องกันเวลากระตุก",
      "Reactive Dynamic Sync: รับฟัง Event csat_satisfaction_settings_updated เพื่อปรับขนาดปุ่ม/ข้อความทันที",
      "Device Heartbeat Resolver: ยิงโหวตแล้วอัปเดต kiosk.LastPingAt = Now และตั้งสถานะ Online อัตโนมัติ",
    ],
    checkpoints: [
      "แตะเลือกอิโมจิแล้วยิง POST /api/satisfaction/vote ค่า sentiment ตรงตามปุ่ม (1, 2, 3)",
      "หน้าต่างขอบคุณ (Thank You Modal) นับถอยหลังตามที่ตั้งใน Settings แล้วรีเซ็ตหน้าจอพร้อมรับลูกค้ารายใหม่",
      "ไม่สามารถคลิกขวา ลากคลุม หรือกดรัวๆ (Double Tap) เบิ้ลคะแนนได้",
    ],
    backendFiles: ["Backend/Controllers/SatisfactionController.cs"],
  },
  {
    id: 3,
    route: "/dashboard",
    screenName: "Analytics Dashboard",
    componentPath: "Screens/Admin/Dashboard",
    tierAccess: "Tier 1–5 (ทุกระดับ)",
    tierBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    category: "core",
    summaryAlgorithm: "สูตรคะแนน CSAT รวม, Adaptive Timeline Bucketing (รายชั่วโมง/รายวัน) และ 5-Tier SQL Data Isolation",
    detailedLogic: [
      "CSAT Formula: (Positive Votes / Total Votes) * 100 ปัดทศนิยม 1 ตำแหน่ง",
      "Adaptive Bucketing: ถ้าเลือกช่วงเวลา <= 2 วัน จะรวมผลรายชั่วโมง (HH:00) ถ้า > 2 วัน จะรวมผลรายวัน (yyyy-MM-dd)",
      "5-Tier Hierarchy Drill-Down: เชื่อมโยงกับ Org Hierarchy Tree เพื่อกรองระดับ Brand, Region, Province, Branch",
      "Strict Scope Filter: ข้อมูลผลโหวตและตัวเลข KPI ทั้งหมดถูกคัดกรองผ่าน ScopeFilterService ป้องกันข้อมูลรั่วไหล",
    ],
    checkpoints: [
      "เลือกช่วงเวลา 1 วัน กราฟแนวโน้มแสดงข้อมูลแยกตามชั่วโมง (เช่น 09:00, 10:00)",
      "สลับแท็บ Overview / Analyses แล้วข้อมูลอัปเดตสัมพันธ์กับกิ่งไม้ที่เลือกใน Org Tree",
      "พนักงานระดับสาขา (Tier 5) เปิดดูแดชบอร์ดแล้วเห็นเฉพาะข้อมูลสาขาตนเองเท่านั้น",
    ],
    backendFiles: ["Backend/Services/DashboardService.cs", "Backend/Controllers/DashboardController.cs"],
  },
  {
    id: 4,
    route: "/brand",
    screenName: "Brand Management",
    componentPath: "Screens/Admin/BrandManagement",
    tierAccess: "Tier 1–2 (SuperAdmin, Brand)",
    tierBadgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    category: "core",
    summaryAlgorithm: "ดึงข้อมูล Parallel Fetching, คำนวณ CSAT เฉลี่ยรายแบรนด์ และตรวจจับร้าน Dual-Brand Co-Location",
    detailedLogic: [
      "Parallel Hydration: เรียก Promise.all([brandService.getBrands(), branchService.getBranches()]) พร้อมกัน",
      "KPI Aggregation: สรุปจำนวนแบรนด์ที่เปิดบริการ จำนวนสาขารวม และคะแนนเฉลี่ย CSAT รายแบรนด์",
      "Dual-Brand Store Detection: ค้นหาสาขาที่มีแบรนด์ร่วม (brands.length > 1 หรือชื่อแบรนด์มีเครื่องหมาย +)",
      "Optimistic UI Mutation: แก้ไขแบรนด์แล้วอัปเดต State หน้าบ้านทันทีโดยไม่ต้องโหลดหน้าใหม่",
    ],
    checkpoints: [
      "แก้ไขข้อมูลแบรนด์ (ชื่อ, หมวดหมู่, สี) แล้วบันทึกสะท้อนผลทันที",
      "จำนวนสาขาและตู้ Kiosk คำนวณตรงกับฐานข้อมูลจริง",
      "แท็บ Branches กรองเฉพาะสาขาที่สังกัดแบรนด์ที่กำลังเลือกได้ถูกต้อง",
    ],
    backendFiles: ["Backend/Controllers/BrandsController.cs"],
  },
  {
    id: 5,
    route: "/branch",
    screenName: "Branch Management",
    componentPath: "Screens/Admin/BranchManagement",
    tierAccess: "Tier 1–4 (SuperAdmin, Brand, RM, AM)",
    tierBadgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    category: "core",
    summaryAlgorithm: "Multi-field Substring Search (7 ฟิลด์), Compound Filter 3 มิติ และ Co-Location Many-to-Many",
    detailedLogic: [
      "Multi-Field Search (searchBranches): ค้นหาพร้อมกันทั้ง code, name, brand, brands[], region, province, id",
      "Compound Filtering: กรองซ้อน 3 ชั้น (Brand -> Region -> Status: Active/Inactive)",
      "Many-to-Many Co-Location: สาขาสามารถผูกหลายแบรนด์ผ่านตารางสะพาน branch_brands",
      "Safe Soft Delete: ลบสาขาแบบ Soft Delete (DeletedAt != null) พร้อม Modal แจ้งเตือนยืนยัน",
    ],
    checkpoints: [
      "พิมพ์ค้นหาด้วยรหัสสาขา 'BKK001' หรือชื่อจังหวัด 'เชียงใหม่' กรองผลทันที",
      "สาขาแบบ Dual-Brand (KFC + Mister Donut) แสดงป้ายกำกับครบทั้งสองแบรนด์",
      "ปุ่มลบสาขามี Popup ยืนยันความปลอดภัยก่อนดำเนินการ",
    ],
    backendFiles: ["Backend/Controllers/BranchesController.cs"],
  },
  {
    id: 6,
    route: "/event",
    screenName: "Event & Campaigns Calendar",
    componentPath: "Screens/Admin/EventManagement",
    tierAccess: "Tier 1–4 (SuperAdmin, Brand, RM, AM)",
    tierBadgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    category: "core",
    summaryAlgorithm: "Interactive Calendar Matrix, Event Target Branch Linkage และ Date Range Conflict Check",
    detailedLogic: [
      "Dual-View Architecture: สลับการแสดงผลระหว่าง Monthly/Daily Calendar Grid กับ Table View",
      "Target Branch Binding: บันทึกกลุ่มสาขาเป้าหมายที่เข้าร่วมแคมเปญผ่าน event_target_branches",
      "Date Filtering Query: กรองกิจกรรมตามช่วงวันที่ (EventDate >= startDate && EventDate <= endDate) และหมวดหมู่",
    ],
    checkpoints: [
      "คลิกที่ช่องวันที่ในปฏิทินเพื่อเปิดฟอร์มสร้างกิจกรรมสำหรับวันนั้นได้ทันที",
      "สลับระหว่าง Calendar View และ Table View แล้วข้อมูลรายการตรงกัน",
    ],
    backendFiles: ["Backend/Controllers/EventsController.cs"],
  },
  {
    id: 7,
    route: "/usermanagement",
    screenName: "User Management & Identity",
    componentPath: "Screens/Admin/Usermanagement",
    tierAccess: "Tier 1 (Super Admin เท่านั้น)",
    tierBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    category: "core",
    summaryAlgorithm: "URL-driven Tab Synchronizer (?tab=dataaccess), BCrypt Password Hash และ Scope Binding",
    detailedLogic: [
      "Query-Driven Tabs: จำแท็บผ่าน ?tab=dataaccess รีเฟรชหน้าแล้วไม่หลุดกลับหน้าแรก",
      "BCrypt Hashing: สร้างผู้ใช้ใหม่พร้อมเข้ารหัสผ่านด้วย BCrypt.Net",
      "Multi-Scope Binding: ผูกผู้ใช้เข้ากับ UserBrandScopes, UserRegionScopes, UserProvinceScopes, UserBranchScopes",
      "Instant Status Switch: กดสวิตช์ Active/Inactive อัปเดตไปยัง Backend ทันที",
    ],
    checkpoints: [
      "สร้างผู้ใช้ใหม่พร้อมกำหนดสิทธิ์ Tier ข้อมูลบันทึกสำเร็จและรหัสผ่านถูกเข้ารหัส",
      "ระบบป้องกันไม่ให้ลบหรือระงับบัญชี Super Admin สูงสุด",
    ],
    backendFiles: ["Backend/Controllers/UsersController.cs"],
  },
  {
    id: 8,
    route: "/roles",
    screenName: "Roles & Permission Matrix",
    componentPath: "Screens/Admin/RoleManagement",
    tierAccess: "Tier 1 (Super Admin เท่านั้น)",
    tierBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    category: "core",
    summaryAlgorithm: "Interactive 5-Dimension Permission Matrix (View, Create, Update, Delete, Export) และ Batch Toggling",
    detailedLogic: [
      "5-Key Permission Matrix: จัดเก็บสิทธิ์แต่ละโมดูลเป็นบูลีน { view, create, update, delete, export }",
      "Batch Toggle: ฟังก์ชัน Select All / Unselect All ปรับสิทธิ์ทุกช่องของ Role นั้นในคลิกเดียว",
      "Transactional Upsert: บันทึกการเปลี่ยนแปลงสิทธิ์ลงตาราง role_permissions ใน Database แบบ Transaction",
    ],
    checkpoints: [
      "ติ๊กเปลี่ยนสิทธิ์ในตารางเมทริกซ์ กดบันทึกแล้วค่าคงอยู่เมื่อเปลี่ยนไปเลือก Role อื่น",
      "ปุ่ม 'Select All' / 'Unselect All' สามารถเปิด/ปิดสิทธิ์ทั้งหมดได้อย่างถูกต้อง",
    ],
    backendFiles: ["Backend/Controllers/RolesController.cs"],
  },
  {
    id: 9,
    route: "/dataaccess",
    screenName: "Data Access Scope Engine",
    componentPath: "Screens/Admin/DataAccessManagement",
    tierAccess: "Tier 1 (Super Admin เท่านั้น)",
    tierBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    category: "core",
    summaryAlgorithm: "Dynamic 4-Level Nested Hierarchy Tree Builder, Custom Co-Location Scopes และ Tier Auto-Inference",
    detailedLogic: [
      "Tree Builder: แปลง Flat Arrays (Brands + Branches) ให้เป็นโครงสร้างต้นไม้ 4 ชั้น: Brand -> Region -> Province -> Branch",
      "Tier Auto-Inference: เรียก computePermissionsByTier(tier) คำนวณสิทธิ์เริ่มต้นของระดับชั้นนั้นๆ โดยอัตโนมัติ",
      "Custom Scope Generator: สร้างกลุ่มสโคปเฉพาะ (เช่น ร้านหลายแบรนด์ในห้างเดียวกัน) สำหรับผู้จัดการแบบ Co-Location",
      "SQL Query Level Scoping: ส่งคำขอไปยัง ScopeFilterService ใน Backend เพื่อกรองระดับ Where clause ใน Database",
    ],
    checkpoints: [
      "ผังต้นไม้ด้านซ้ายแสดง แบรนด์ -> ภาค -> จังหวัด -> สาขา ได้ครบถ้วน",
      "เลือกสาขาหรือแบรนด์ใด สิทธิ์และข้อมูลสรุปจะแสดงเฉพาะในขอบเขตนั้น",
    ],
    backendFiles: ["Backend/Services/ScopeFilterService.cs", "Backend/Controllers/DataAccessController.cs"],
  },
  {
    id: 10,
    route: "/audit",
    screenName: "Audit Trail & Service Health",
    componentPath: "Screens/Admin/AuditTriage",
    tierAccess: "Tier 1 (Super Admin เท่านั้น)",
    tierBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    category: "core",
    summaryAlgorithm: "Deep Diff Inspection (Old vs New value), Actor Snapshot Tracking และ Real-time API Ping Health",
    detailedLogic: [
      "Deep Diff Inspector: บันทึกรายละเอียดการเปลี่ยนแปลงลงตาราง audit_log_diff_details เปรียบเทียบ Old vs New",
      "Actor Snapshot: บันทึก Snapshot ชื่อและบทบาทของผู้ทำรายการ (ป้องกันชื่อเปลี่ยนในอนาคต) พร้อม Client IP",
      "Service Health Telemetry: ตรวจวัด Uptime %, Database Latency และ Background Workers พร้อมปุ่ม Ping สด",
    ],
    checkpoints: [
      "เมื่อมีการสร้างหรือแก้ไขข้อมูลในระบบ จะมี Log บันทึกรายการใหม่ใน Audit Logs",
      "หน้าแท็บ Service Health แสดงสถานะเขียวปกติและกดปุ่ม Ping ทดสอบ Latency ได้",
    ],
    backendFiles: ["Backend/Controllers/AuditController.cs"],
  },
  {
    id: 11,
    route: "/notifications",
    screenName: "Notification & Alert Triage",
    componentPath: "Screens/Admin/NotificationTriage",
    tierAccess: "Tier 1–5 (ตาม Scope)",
    tierBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    category: "core",
    summaryAlgorithm: "Background Worker CSAT Anomaly Watcher (< 80%), Kiosk Disconnect Monitor และ Batch Mark Read",
    detailedLogic: [
      "CSAT Alert Watcher: Background Worker ทำงานทุก 30 นาที ตรวจสอบคะแนน 24 ชม. ของสาขา ถ้าโหวต >= 5 และ CSAT < 80% จะยิง Alert อัตโนมัติ",
      "Kiosk Heartbeat Watcher: ตรวจสอบตู้ที่ไม่มีการส่ง Heartbeat เกิน 15 นาที และเปลี่ยนเป็นสถานะ Offline พร้อมแจ้งเตือน",
      "Batch Read Action: อัปเดตสถานะการแจ้งเตือนทั้งหมดเป็น Read และเคลียร์ตัวเลข Unread Badge ทันที",
    ],
    checkpoints: [
      "กดปุ่ม 'Mark All as Read' แล้ว Badge สีแดงลดลงและรายการเปลี่ยนเป็นอ่านแล้ว",
      "กรองตาม Priority (High, Medium, Low) แสดงรายการแจ้งเตือนตรงตามเงื่อนไข",
    ],
    backendFiles: ["Backend/Services/CsatAlertWatcherBackgroundService.cs", "Backend/Controllers/NotificationsController.cs"],
  },
  {
    id: 12,
    route: "/settings",
    screenName: "System Settings & Kiosk Config",
    componentPath: "Screens/Admin/SystemSettings",
    tierAccess: "Tier 1 (Super Admin เท่านั้น)",
    tierBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    category: "core",
    summaryAlgorithm: "Cross-Window Reactive Event Broadcast, 5-Partitioned States และ Zero-Downtime Dynamic Settings",
    detailedLogic: [
      "5-Partitioned State: แยกการตั้งค่า 5 หมวด (General, Dashboard, Satisfaction, Reports, Localization)",
      "Cross-Window Event: เมื่อบันทึกค่า Kiosk จะยิง Event csat_satisfaction_settings_updated ไปยังหน้า /satisfaction ทันที",
      "Zero-Downtime Settings: บันทึกค่าลงตาราง system_settings เช่น OTP Expiry หรือ Anti-Duplicate Window โดยไม่ต้อง Restart API",
    ],
    checkpoints: [
      "เปลี่ยนเวลานับถอยหลังของ Kiosk (เช่น 5 วิ -> 2 วิ) หน้า /satisfaction ต้องนับ 2 วิทันที",
      "ค่าการตั้งค่าทุกฟิลด์ถูกบันทึกและยังคงอยู่เมื่อเปิดหน้าเว็บใหม่",
    ],
    backendFiles: ["Backend/Controllers/SystemSettingsController.cs"],
  },
  {
    id: 13,
    route: "/docs",
    screenName: "API Docs & Integration Guide",
    componentPath: "Screens/Admin/Documentation",
    tierAccess: "Tier 1–5 (ทุกระดับ)",
    tierBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    category: "support",
    summaryAlgorithm: "On-This-Page Scrollspy Anchor Navigation, Clipboard cURL Snippet Utility และ HTTP Status Matrix",
    detailedLogic: [
      "Scrollspy Anchor: นำทางไปยังแต่ละส่วนของเอกสารแบบ Smooth Scrolling",
      "Clipboard Copy: คัดลอก cURL Request สำหรับยิง API OAuth 2.0 พร้อมแสดงสถานะ Copied 2 วินาที",
      "Response Code Matrix: แสดงสเปกข้อผิดพลาด (200, 400, 401, 403, 429, 500) และคำแนะนำในการแก้ปัญหา",
    ],
    checkpoints: [
      "กดปุ่ม Copy Code แล้วคัดลอก cURL ไปยัง Clipboard สำเร็จ",
      "สลับดูแท็บรายการหน้าจอ 15 หน้าและสเปก Algorithm ได้อย่างชัดเจน",
    ],
    backendFiles: [],
  },
  {
    id: 14,
    route: "/unauthorized",
    screenName: "403 Access Denied Interceptor",
    componentPath: "app/(admin)/unauthorized",
    tierAccess: "Error Fallback (ทุกคน)",
    tierBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    category: "support",
    summaryAlgorithm: "Edge Middleware / Route Guard Redirection ป้องกันการเข้าถึงหน้าจอที่เกินสิทธิ์ Tier/Role",
    detailedLogic: [
      "Guard Interceptor: ดักจับคำขอที่สิทธิ์ Role หรือ Tier ไม่ผ่าน แล้ว Redirect ส่งมาที่หน้านี้",
      "Recovery Actions: มีปุ่มนำทางกลับ Dashboard ที่มีสิทธิ์ หรือสลับไปหน้า Login",
    ],
    checkpoints: [
      "เมื่อพนักงาน Tier 5 พยายามพิมพ์ URL เข้า /settings จะถูกส่งมาหน้านี้ทันที",
    ],
    backendFiles: [],
  },
  {
    id: 15,
    route: "/test",
    screenName: "Developer Test Playground",
    componentPath: "app/test",
    tierAccess: "Developer / QA",
    tierBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    category: "support",
    summaryAlgorithm: "Screen Sandbox Switcher, React Error Boundary Simulator และ Real-time Telemetry Console",
    detailedLogic: [
      "Sandbox Switcher: สลับดูหน้าจอต่างๆ (Dashboard, Kiosk, Brand, Event, 403, 404, 500) ได้ในหน้าเดียว",
      "Error Boundary Simulator: จำลอง Throw Exception เพื่อทดสอบระบบกู้คืนของ Next.js App Router",
      "Live Telemetry Console: แสดงผล Logs (INFO, SUCCESS, WARN, ERROR) สดบนหน้าจอ",
    ],
    checkpoints: [
      "กดปุ่ม Throw Exception แล้ว Error Boundary ดักจับได้และระบบไม่พัง",
    ],
    backendFiles: [],
  },
  {
    id: 16,
    route: "/",
    screenName: "Root Redirect Handler",
    componentPath: "app/page.tsx",
    tierAccess: "Auto Redirect",
    tierBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    category: "support",
    summaryAlgorithm: "ตรวจสอบ Session Cookie satisfaction_access_token แล้ว Redirect ไป /dashboard หรือ /login",
    detailedLogic: [
      "ถ้ามี Token ที่ถูกต้องจะ Redirect ไปยัง /dashboard",
      "ถ้าไม่มี Token จะ Redirect ไปยัง /login",
    ],
    checkpoints: [
      "เข้า URL หน้าแรก '/' แล้วระบบเปลี่ยนเส้นทางไปหน้า Dashboard หรือ Login อัตโนมัติ",
    ],
    backendFiles: [],
  },
];

// ==========================================================================
// ─── 2. MAIN DOCUMENTATION SCREEN COMPONENT
// ==========================================================================
export default function DocumentationScreen() {
  const [activeTab, setActiveTab] = useState<"api_guide" | "pages_algorithm">("pages_algorithm");
  const [activeAnchorId, setActiveAnchorId] = useState<string>("generating-token");
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "core" | "support">("all");
  const [expandedPageId, setExpandedPageId] = useState<number | null>(null);

  // ฟังก์ชันคัดลอก cURL Request
  const handleCopyClipboardClick = () => {
    const curlCode = `curl -X POST https://api.csat-enterprise.com/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"`;

    navigator.clipboard.writeText(curlCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredPages = SYSTEM_PAGES.filter((page) => {
    const matchesSearch =
      page.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.screenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.summaryAlgorithm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || page.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION WITH TAB SWITCHER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 text-3xl">menu_book</span>
            Documentation & System Verification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            คู่มือเชื่อมต่อ API, บันทึกสถาปัตยกรรมระบบ และตารางตรวจรับอัลกอริทึมทั้ง 15 หน้าจอหลัก
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("pages_algorithm")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pages_algorithm"
                ? "bg-white text-blue-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">checklist</span>
            System Pages & Algorithms (15 หน้า)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("api_guide")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "api_guide"
                ? "bg-white text-blue-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">api</span>
            API Integration Guide
          </button>
        </div>
      </div>

      {/* ─── TAB 1: SYSTEM PAGES & ALGORITHM AUDIT MATRIX (15 หน้า) ─── */}
      {activeTab === "pages_algorithm" && (
        <div className="space-y-6">
          
          {/* Controls: Search and Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาตาม Route, ชื่อหน้า, หรือ Algorithm..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-blue-600 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "all"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด ({SYSTEM_PAGES.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("core")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "core"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                หน้าธุรกิจหลัก (12)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("support")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "support"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ระบบสนับสนุน (4)
              </button>
            </div>
          </div>

          {/* Cards Grid for 15 Pages */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPages.map((page) => {
              const isExpanded = expandedPageId === page.id;

              return (
                <div
                  key={page.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedPageId(isExpanded ? null : page.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-blue-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {page.id}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {page.screenName}
                          </h3>
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {page.route}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${page.tierBadgeColor}`}>
                            {page.tierAccess}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {page.summaryAlgorithm}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                      <span className="badge-live text-[11px]">Ready for Audit</span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 transition-transform"
                      >
                        <span
                          className={`material-symbols-outlined transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Algorithm & Checkpoint Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-white space-y-4 text-xs animate-fadeIn">
                      <div>
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-700 text-sm">settings_suggest</span>
                          ตรรกะและอัลกอริทึมการทำงาน (Algorithm Logic)
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed">
                          {page.detailedLogic.map((logic, idx) => (
                            <li key={idx}>{logic}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
                          Checkpoints สำหรับการตรวจเช็กความถูกต้อง
                        </h4>
                        <div className="space-y-1.5">
                          {page.checkpoints.map((cp, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-slate-700">
                              <input
                                type="checkbox"
                                id={`cp_${page.id}_${idx}`}
                                className="mt-0.5 rounded text-blue-600 cursor-pointer"
                              />
                              <label htmlFor={`cp_${page.id}_${idx}`} className="cursor-pointer">
                                {cp}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-600">Component:</span>{" "}
                          <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            frontend/src/{page.componentPath}
                          </code>
                        </div>
                        {page.backendFiles.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-600">Backend:</span>{" "}
                            {page.backendFiles.map((bf, bIdx) => (
                              <code
                                key={bIdx}
                                className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 ml-1"
                              >
                                {bf.split("/").pop()}
                              </code>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ─── TAB 2: ORIGINAL API INTEGRATION GUIDE ─── */}
      {activeTab === "api_guide" && (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* Main Article Content Container */}
          <article className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
            
            {/* Section: Overview */}
            <section id="overview" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                API Overview & Architecture
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The CSAT Enterprise Admin API provides high-throughput, low-latency REST endpoints for 
                receiving sentiment votes from touchscreen Kiosks, managing multi-tenant branch scopes, 
                and retrieving real-time analytics data. All server-to-server communications require OAuth 2.0 with JWT tokens.
              </p>
            </section>

            {/* Section: Prerequisites */}
            <section id="prerequisites" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                Prerequisites & Client Credentials
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>
                  An active <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">client_id</code> and <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">client_secret</code> provisioned from the Admin Console.
                </li>
                <li>
                  Appropriate role permissions granted in the <span className="font-semibold text-slate-800">Role Management</span> section.
                </li>
                <li>
                  TLS 1.3 encryption enabled for all HTTP requests.
                </li>
              </ul>

              {/* Note Callout Box */}
              <div className="bg-blue-50/80 border-l-4 border-blue-900 p-4 rounded-r-xl flex items-start gap-3 mt-4">
                <span className="material-symbols-outlined text-blue-900 text-[20px] shrink-0 mt-0.5">info</span>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-blue-950 font-bold">Security Note:</strong> Access tokens expire after 60 minutes. Clients should implement automated token refresh logic using the refresh endpoint to maintain uninterrupted polling.
                </div>
              </div>
            </section>

            {/* Section: Generating Access Token */}
            <section id="generating-token" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                Generating an Access Token
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send an authenticated POST request to the token authorization gateway encoded as <code className="bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">application/x-www-form-urlencoded</code>:
              </p>

              {/* cURL Code Block Container */}
              <div className="rounded-xl border border-slate-800 overflow-hidden shadow-xs">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400 font-bold">cURL Request Payload</span>
                  <button
                    type="button"
                    onClick={handleCopyClipboardClick}
                    className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors outline-none cursor-pointer text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isCopied ? "check" : "content_copy"}
                    </span>
                    <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 bg-slate-900 m-0 leading-6">
{`curl -X POST https://api.csat-enterprise.com/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"`}
                </pre>
              </div>
            </section>

            {/* Section: Handling Response */}
            <section id="handling-response" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                Handling Token Response
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                A successful response returns a JSON payload with an access token, token type, and expiration in seconds:
              </p>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <pre className="p-4 text-xs font-mono text-slate-800 m-0 leading-5">
{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "csat:read csat:write"
}`}
                </pre>
              </div>
            </section>

            {/* Section: Kiosk Sentiment Payload */}
            <section id="feedback-payload" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                Kiosk Sentiment Ingestion Payload
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send real-time vote feedback from touchscreen terminals to <code className="bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">POST /api/satisfaction/vote</code>:
              </p>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <pre className="p-4 text-xs font-mono text-slate-800 m-0 leading-5">
{`{
  "branchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "brandId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
  "sentiment": 1,
  "timestamp": "2026-11-08T10:00:00Z"
}`}
                </pre>
              </div>
            </section>

          </article>

          {/* Right Sticky Table of Contents (On this page) */}
          <aside className="w-full xl:w-64 shrink-0 hidden xl:block sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                On this page
              </h4>
              <nav className="space-y-1 text-xs">
                {DOCUMENT_TOPICS.map((topicItem) => {
                  const isTopicActive = topicItem.anchorId === activeAnchorId;

                  return (
                    <a
                      key={topicItem.anchorId}
                      href={`#${topicItem.anchorId}`}
                      onClick={() => setActiveAnchorId(topicItem.anchorId)}
                      className={`block py-1.5 px-2.5 rounded-lg transition-colors font-medium ${
                        isTopicActive
                          ? "bg-blue-50 text-blue-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {topicItem.topicTitle}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

        </div>
      )}

    </div>
  );
}
