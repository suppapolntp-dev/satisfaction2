"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AuthManualIllustration,
  KioskManualIllustration,
  DashboardManualIllustration,
  BrandBranchManualIllustration,
  EventCampaignManualIllustration,
  UserScopeManualIllustration,
  RoleMatrixManualIllustration,
  AlertNotificationIllustration,
  SettingsConfigIllustration,
  AuditTrailIllustration,
} from "./ManualIllustrations";

// ==========================================================================
// ─── 1. INTERFACES & DATA MODELS (ชนิดข้อมูลคู่มือและอัลกอริทึม)
// ==========================================================================

export interface UserManualStep {
  stepNumber: number;
  title: string;
  description: string;
  detailPoints?: string[];
  note?: string;
  warningNote?: string;
}

export interface UserManualGuideItem {
  id: string;
  title: string;
  moduleCode: string;
  targetTiers: string[];
  badgeColor: string;
  icon: string;
  route: string;
  summary: string;
  steps: UserManualStep[];
  proTip?: string;
  warningNote?: string;
}

export interface FaqItem {
  id: string;
  category: "kiosk" | "auth" | "dashboard" | "system";
  question: string;
  answer: string;
  actionRoute?: string;
  actionText?: string;
}

export interface DocumentTopicItem {
  anchorId: string;
  topicTitle: string;
}

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

// ==========================================================================
// ─── 2. USER MANUAL GUIDES DATA (คู่มือการใช้งานระบบ 10 หมวดหมู่หลัก)
// ==========================================================================

const USER_MANUAL_GUIDES: UserManualGuideItem[] = [
  {
    id: "manual-auth",
    title: "การเข้าสู่ระบบและการยืนยันตัวตน 2FA (SMS OTP)",
    moduleCode: "AUTH-01",
    targetTiers: ["Tier 1: Super Admin", "Tier 2: Brand Owner", "Tier 3: Regional Manager", "Tier 4: Area Manager", "Tier 5: Branch Staff"],
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "lock",
    route: "/login",
    summary: "ขั้นตอนการล็อกอินแบบ 2 จังหวะตามระดับสิทธิ์ (Tier-Aware Multi-Factor Authentication) และการรักษาความปลอดภัยของเซสชัน",
    steps: [
      {
        stepNumber: 1,
        title: "กรอกข้อมูลบัญชีผู้ใช้งาน",
        description: "เข้าสู่หน้าจอ /login กรอก Email และ Password ที่ได้รับจากผู้ดูแลระบบ จากนั้นกดปุ่ม 'เข้าสู่ระบบ'",
        detailPoints: [
          "ระบบตรวจสอบความถูกต้องของรหัสผ่านผ่าน BCrypt Cryptographic Hash",
          "หากรหัสผ่านผิดเกินจำนวนครั้งที่กำหนด ระบบจะหน่วงเวลาชั่วคราวเพื่อป้องกัน Brute Force",
        ],
      },
      {
        stepNumber: 2,
        title: "การยืนยันรหัส SMS OTP (สำหรับ Tier 1–4)",
        description: "หากเป็นผู้ใช้ระดับบริหาร (Tier 1–4) ระบบจะส่งรหัส OTP 6 หลักไปยังเบอร์มือถือที่ลงทะเบียนไว้ พร้อมแสดงเลขอ้างอิง (Ref Code 4 หลัก)",
        detailPoints: [
          "รหัส OTP มีอายุ 180 วินาที (3 นาที) และสามารถกดยื่นขอรหัสใหม่ได้เมื่อหมดเวลา",
          "ตรวจสอบเลขอ้างอิงบนหน้าจอให้ตรงกับ SMS ที่ได้รับในมือถือ",
        ],
        warningNote: "ห้ามบอกรหัส OTP แก่ผู้อื่นโดยเด็ดขาด เจ้าหน้าที่ระบบจะไม่มีการขอรหัส OTP จากท่าน",
      },
      {
        stepNumber: 3,
        title: "การเข้าสู่ระบบด่วนสำหรับพนักงานสาขา (Tier 5)",
        description: "บัญชีพนักงานสาขา (Branch Staff) จะได้รับสิทธิ์เข้าสู่ระบบโดยตรงทันทีหลังยืนยันรหัสผ่านถูกต้อง เพื่อความคล่องตัวในการปฏิบัติงานหน้าร้าน",
      },
      {
        stepNumber: 4,
        title: "การออกจากระบบและคุ้มครองเซสชัน",
        description: "เมื่อเสร็จสิ้นการใช้งาน ให้คลิกที่รูปโปรไฟล์ที่มุมขวาบนของ Sidebar แล้วเลือก 'ออกจากระบบ' ระบบจะทำลาย Refresh Token และยกเลิก Session ทันที",
      },
    ],
    proTip: "สามารถกด Enter ในช่องกรอกรหัสผ่านหรือช่อง OTP เพื่อส่งข้อมูลได้ทันทีโดยไม่ต้องคลิกเมาส์",
  },
  {
    id: "manual-kiosk",
    title: "การใช้งานและควบคุมตู้ Kiosk โหวตความพึงพอใจหน้าร้าน",
    moduleCode: "KIOSK-02",
    targetTiers: ["Tier 5: Branch Staff", "Tier 1: Super Admin"],
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "touch_app",
    route: "/satisfaction",
    summary: "คู่มือการเปิดหน้าจอ Kiosk สำหรับลูกค้าร่วมประเมินความพึงพอใจ ระบบกันกดซ้ำ และกลไกนับถอยหลังรีเซ็ตอัตโนมัติ",
    steps: [
      {
        stepNumber: 1,
        title: "การตั้งค่าเปิดหน้าจอ Kiosk หน้าร้าน",
        description: "เปิดเว็บเบราว์เซอร์บนแท็บเล็ตหรือหน้าจอสัมผัสหน้าร้าน ไปที่ URL: /satisfaction แล้วกด F11 (Fullscreen Mode) เพื่อให้แสดงผลเต็มจอ",
        detailPoints: [
          "ระบบถูกออกแบบให้ป้องกันการคลิกขวา (Disable Context Menu) และป้องกันการลากคลุมข้อความ (Select-none)",
          "ปุ่มสัมผัสมีขนาดใหญ่กว่า 64x64px ตามมาตรฐาน Touch-First Ergonomics",
        ],
      },
      {
        stepNumber: 2,
        title: "การรับคะแนนความพึงพอใจของลูกค้า",
        description: "ลูกค้าแตะเลือกใบหน้าแสดงความรู้สึก 3 ระดับ: พอใจมาก (สีเขียว), ปานกลาง (สีเหลือง), หรือต้องปรับปรุง (สีแดง)",
        detailPoints: [
          "เมื่อแตะเลือก ระบบจะบันทึกคะแนน sentiment (1, 2, 3) พร้อมเวลาและส่งเข้าระบบทันที",
          "ระบบมีระบบ Anti-Spam ล็อกปุ่มชั่วคราว ป้องกันการแตะรัวเบิ้ลคะแนนผิดธรรมชาติ",
        ],
      },
      {
        stepNumber: 3,
        title: "การนับถอยหลังและรีเซ็ตหน้าจอรับลูกค้ารายถัดไป",
        description: "หน้าต่าง 'ขอบคุณที่ใช้บริการ' จะแสดงขึ้นพร้อมนับถอยหลัง (ค่าเริ่มต้น 2-5 วินาที) แล้วรีเซ็ตกลับสู่หน้าแรกอัตโนมัติ",
        detailPoints: [
          "ระบบใช้ Precision Delta-Time Calculator ป้องกันเวลากระตุกแม้เครื่องประมวลผลช้า",
          "หากลูกค้าคนใหม่แตะที่หน้าต่างขอบคุณ ระบบจะรีเซ็ตทันทีโดยไม่ต้องรอจบนับถอยหลัง",
        ],
      },
      {
        stepNumber: 4,
        title: "ระบบส่งสัญญาณชีพตู้ Kiosk (Heartbeat Ping)",
        description: "ทุกครั้งที่มีการโหวต ตู้ Kiosk จะอัปเดตเวลา LastPingAt ไปยังฐานข้อมูล เพื่อให้ผู้จัดการทราบว่าตู้ยังออนไลน์และทำงานปกติ",
      },
    ],
    warningNote: "หากหน้าจอตู้ Kiosk แสดงแถบเตือนสีแดงหรือสัญญาณอินเทอร์เน็ตขาดหาย ให้ตรวจเช็กสัญญาณ Wi-Fi ของสาขาทันที",
    proTip: "เวลาในการนับถอยหลังและขนาดปุ่มสามารถปรับเปลี่ยนสดได้จากหน้า /settings โดยผู้ดูแลระบบ",
  },
  {
    id: "manual-dashboard",
    title: "การใช้งานแดชบอร์ดและการวิเคราะห์คะแนน CSAT",
    moduleCode: "DASH-03",
    targetTiers: ["Tier 1: Super Admin", "Tier 2: Brand Owner", "Tier 3: Regional Manager", "Tier 4: Area Manager", "Tier 5: Branch Staff"],
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "monitoring",
    route: "/dashboard",
    summary: "วิธีอ่านสถิติคะแนนความพึงพอใจ กราฟแนวโน้มรายชั่วโมง/รายวัน การวิเคราะห์เปรียบเทียบแบรนด์ และการกรองตามผังองค์กร",
    steps: [
      {
        stepNumber: 1,
        title: "ทำความเข้าใจสูตรคะแนน CSAT รวม",
        description: "คะแนน CSAT คำนวณจากสูตรมาตรฐาน: (จำนวนโหวตเชิงบวก / จำนวนโหวตทั้งหมด) × 100 แสดงเป็นเปอร์เซ็นต์ทศนิยม 1 ตำแหน่ง",
        detailPoints: [
          "ระดับคะแนน >= 85%: ระดับดีเยี่ยม (สถานะสีเขียว)",
          "ระดับคะแนน 75% - 84.9%: ระดับมาตรฐานปกติ (สถานะสีฟ้า/เหลือง)",
          "ระดับคะแนน < 75%: ระดับที่ต้องปรับปรุงเร่งด่วน (สถานะสีแดง Alert)",
        ],
      },
      {
        stepNumber: 2,
        title: "การเลือกช่วงเวลาวิเคราะห์ข้อมูล (Time Horizon Filter)",
        description: "เลือกช่วงวันที่ที่ต้องการดูข้อมูล เช่น 'วันนี้', '7 วันที่ผ่านมา', '30 วัน', หรือระบุช่วงวันที่กำหนดเอง (Custom Date Range)",
        detailPoints: [
          "หากเลือกช่วงเวลาไม่เกิน 2 วัน: ระบบจะรวมผลเป็น กราฟเส้นแนวโน้มรายชั่วโมง (Hourly Buckets)",
          "หากเลือกช่วงเวลาเกิน 2 วัน: ระบบจะรวมผลเป็น กราฟแท่งแนวโน้มรายวัน (Daily Buckets) โดยอัตโนมัติ",
        ],
      },
      {
        stepNumber: 3,
        title: "การกรองข้อมูลด้วยผังสาขาองค์กร (Hierarchy Tree Drill-Down)",
        description: "ใช้เมนูต้นไม้ด้านซ้ายเลือกเจาะจงระดับ แบรนด์ -> ภาค (Region) -> จังหวัด (Province) -> สาขา (Branch)",
        detailPoints: [
          "ผู้ใช้งานจะมองเห็นเฉพาะกิ่งไม้สาขาที่ตนเองได้รับสิทธิ์ตาม 5-Tier Scope เท่านั้น",
          "คลิกเลือกสาขาเพื่อดูข้อมูลเฉพาะจุด หรือคลิกเลือกทั้งแบรนด์เพื่อดูผลรวมเปรียบเทียบ",
        ],
      },
      {
        stepNumber: 4,
        title: "การส่งออกรายงานสรุป (Export Data)",
        description: "คลิกปุ่ม 'ส่งออกข้อมูล' ที่มุมขวาบนของแดชบอร์ด เพื่อดาวน์โหลดไฟล์ Excel หรือ CSV สรุปสถิติคะแนน",
      },
    ],
    proTip: "สามารถสลับระหว่างแท็บ 'Overview' (ภาพรวมคะแนน) และ 'Analyses' (วิเคราะห์สัดส่วนความรู้สึกแบบลึก) ได้ที่ส่วนบนของแดชบอร์ด",
  },
  {
    id: "manual-brand-branch",
    title: "การบริหารจัดการแบรนด์และสาขา (Brand & Branch Setup)",
    moduleCode: "ORG-04",
    targetTiers: ["Tier 1: Super Admin", "Tier 2: Brand Owner", "Tier 3: Regional Manager", "Tier 4: Area Manager"],
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "store",
    route: "/brand",
    summary: "การเพิ่ม/แก้ไขข้อมูลแบรนด์ในเครือ การจัดหมวดหมู่อาหาร การผูกสาขาแบบ Co-Location (ร้านร่วม 2 แบรนด์) และการจัดการที่ตั้งสาขา",
    steps: [
      {
        stepNumber: 1,
        title: "การตรวจสอบรายชื่อแบรนด์และตัวชี้วัด",
        description: "เข้าหน้า /brand เพื่อดูการ์ดสรุปของแต่ละแบรนด์ (เช่น KFC, Mister Donut) พร้อมจำนวนสาขารวมและคะแนนเฉลี่ย CSAT",
      },
      {
        stepNumber: 2,
        title: "การสร้างหรือแก้ไขข้อมูลแบรนด์",
        description: "คลิกปุ่ม 'เพิ่มแบรนด์ใหม่' หรือคลิกไอคอนดินสอบนการ์ดแบรนด์ กรอกรหัสแบรนด์, ชื่อแบรนด์ภาษาไทยและอังกฤษ, สีประจำแบรนด์ และโลโก้",
      },
      {
        stepNumber: 3,
        title: "การจัดการข้อมูลสาขาในหน้า /branch",
        description: "ค้นหาสาขาด้วยช่องค้นหาแบบ Multi-Field (ค้นหาได้ทั้งรหัสสาขา, ชื่อสาขา, จังหวัด หรือแบรนด์)",
        detailPoints: [
          "คลิก 'เพิ่มสาขา' กรอกข้อมูลรหัสสาขา (เช่น BKK001), ภาค, จังหวัด, เบอร์โทร และที่อยู่",
          "กำหนดสถานะการเปิดบริการ (เปิดบริการ Active / ปิดชั่วคราว Inactive)",
        ],
      },
      {
        stepNumber: 4,
        title: "การตั้งค่าสาขาแบบ Co-Location (หลายแบรนด์ในร้านเดียว)",
        description: "ในกรณีที่สาขามีการเปิดร้านร่วมกัน (เช่น KFC สาขาที่มีมุม Mister Donut อยู่ด้วย) ให้เลือกติ๊กทุกแบรนด์ที่เปิดร่วมในสาขานั้น",
        detailPoints: [
          "ระบบจะสร้างความสัมพันธ์ Many-to-Many ผ่านตาราง branch_brands",
          "ลูกค้าที่หน้าร้านจะสามารถเลือกประเมินแยกแบรนด์ได้ในตู้เดียวกัน",
        ],
      },
    ],
  },
  {
    id: "manual-events",
    title: "การสร้างและบริหารแคมเปญส่งเสริมการขายและปฏิทินกิจกรรม",
    moduleCode: "EVENT-05",
    targetTiers: ["Tier 1: Super Admin", "Tier 2: Brand Owner", "Tier 3: Regional Manager", "Tier 4: Area Manager"],
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "calendar_month",
    route: "/event",
    summary: "วิธีสร้างอีเวนต์แคมเปญ กำหนดช่วงเวลา ติดตามผลกระทบต่อคะแนน CSAT และการเลือกกลุ่มสาขาเป้าหมาย",
    steps: [
      {
        stepNumber: 1,
        title: "การเข้าดูปฏิทินกิจกรรมแคมเปญ",
        description: "เข้าหน้า /event ระบบจะแสดงปฏิทินกิจกรรมประจำเดือน พร้อมแถบสีของแคมเปญแต่ละประเภท (โปรโมชั่น, เมนูใหม่, เทศกาล)",
      },
      {
        stepNumber: 2,
        title: "การสร้างแคมเปญใหม่",
        description: "คลิกที่ช่องวันที่ในปฏิทิน หรือกดปุ่ม '+ สร้างกิจกรรมใหม่' กรอกชื่อแคมเปญ, ประเภทกิจกรรม, วันที่เริ่มต้น และวันที่สิ้นสุด",
      },
      {
        stepNumber: 3,
        title: "การเลือกกลุ่มสาขาเป้าหมาย (Target Branches)",
        description: "เลือกว่าแคมเปญนี้มีผลครอบคลุมทุกสาขา หรือเฉพาะสาขาในบางภูมิภาค/จังหวัดที่กำหนด",
        detailPoints: [
          "ข้อมูลจะถูกเชื่อมโยงลงในตาราง event_target_branches",
          "ผู้จัดการสาขาที่เกี่ยวข้องจะเห็นป้ายแคมเปญปรากฏในปฏิทินของตนเอง",
        ],
      },
      {
        stepNumber: 4,
        title: "การสลับมุมมองปฏิทินและตาราง (Calendar vs Table View)",
        description: "กดปุ่มสลับมุมมองที่มุมขวาบนเพื่อดูแบบตารางสรุป สำหรับการส่งออกข้อมูลหรือตรวจสอบสถานะหลายรายการพร้อมกัน",
      },
    ],
  },
  {
    id: "manual-users-scopes",
    title: "การบริหารผู้ใช้งานและการกำหนดขอบเขตข้อมูล (User & Scope Engine)",
    moduleCode: "USER-06",
    targetTiers: ["Tier 1: Super Admin"],
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "manage_accounts",
    route: "/usermanagement",
    summary: "คู่มือผู้ดูแลระบบสูงสุดในการสร้างบัญชีผู้ใช้ กำหนดบทบาท Tier 1–5 และผูกสิทธิ์ Scope ข้อมูลแบรนด์/ภูมิภาค/สาขา",
    steps: [
      {
        stepNumber: 1,
        title: "การสร้างบัญชีผู้ใช้งานใหม่",
        description: "เข้าสู่หน้า /usermanagement คลิกปุ่ม '+ เพิ่มผู้ใช้งานใหม่' กรอกชื่อ-นามสกุล, อีเมลองค์กร, เบอร์โทรสำหรับรับ OTP และรหัสผ่านเริ่มต้น",
      },
      {
        stepNumber: 2,
        title: "การเลือกบทบาทและระดับสิทธิ์ (Role & Tier Assignment)",
        description: "เลือกระดับบทบาทที่ต้องการมอบหมาย: Super Admin, Brand Owner, Regional Manager, Area Manager, หรือ Branch Staff",
        detailPoints: [
          "ระบบจะตรวจจับระดับ Tier โดยอัตโนมัติ และแสดงฟิลด์ขอบเขตข้อมูลที่จำเป็นต้องระบุ",
          "ห้ามสร้างบัญชี Super Admin ลอยๆ โดยไม่ได้รับอนุมัติจากผู้บริหารฝ่ายไอที",
        ],
      },
      {
        stepNumber: 3,
        title: "การกำหนดสโคปข้อมูล 4 ระดับ (Data Access Scopes)",
        description: "ในแท็บกำหนดสโคป ให้เลือกขอบเขตที่ผู้ใช้ผู้นี้มีสิทธิ์มองเห็นข้อมูล:",
        detailPoints: [
          "Brand Scopes: เลือกแบรนด์ที่ดูแล เช่น ดูแลเฉพาะ KFC หรือทั้ง KFC และ Mister Donut",
          "Region Scopes: กำหนดภูมิภาค (ภาคกลาง, ภาคเหนือ, ภาคอีสาน, ภาคใต้)",
          "Province & Branch Scopes: กำหนดเจาะจงรายจังหวัดหรือรายสาขา",
        ],
      },
      {
        stepNumber: 4,
        title: "การระงับหรือเปิดใช้งานบัญชี (Instant Status Switch)",
        description: "สามารถกดสวิตช์เปิด/ปิดสถานะ Active/Inactive ของผู้ใช้ได้ทันที โดยจะมีผลตัดการเข้าสู่ระบบแบบเรียลไทม์",
      },
    ],
    warningNote: "ระบบมีกลไกป้องกันไม่ให้ลบหรือระงับบัญชี Super Admin หลักของระบบ เพื่อป้องกันการล็อกเอาต์ตนเองถาวร",
  },
  {
    id: "manual-roles-matrix",
    title: "การจัดการบทบาทและสิทธิ์การทำงาน 5 มิติ (Permission Matrix)",
    moduleCode: "ROLE-07",
    targetTiers: ["Tier 1: Super Admin"],
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "security",
    route: "/roles",
    summary: "วิธีปรับแต่งสิทธิ์ในระบบ 5 ด้าน (View, Create, Update, Delete, Export) แยกรายโมดูล และการบันทึกแบบ Transactional Upsert",
    steps: [
      {
        stepNumber: 1,
        title: "การเลือกบทบาทเพื่อแก้ไขสิทธิ์",
        description: "เข้าหน้า /roles เลือกรายชื่อบทบาทจากแถบด้านซ้าย เช่น 'Brand Owner' หรือ 'Area Manager'",
      },
      {
        stepNumber: 2,
        title: "การปรับสิทธิ์ในตารางเมทริกซ์ 5 มิติ",
        description: "แต่ละโมดูลของระบบ (Dashboard, Brands, Branches, Events, Users ฯลฯ) มีช่องติ๊ก 5 ช่อง:",
        detailPoints: [
          "View (ดูข้อมูล): สิทธิ์ในการเปิดดูหน้านั้นๆ",
          "Create (สร้าง): สิทธิ์ในการเพิ่มข้อมูลใหม่",
          "Update (แก้ไข): สิทธิ์ในการปรับปรุงข้อมูลเดิม",
          "Delete (ลบ): สิทธิ์ในการลบหรือยกเลิกข้อมูล",
          "Export (ส่งออก): สิทธิ์ในการดาวน์โหลดรายงาน Excel/CSV",
        ],
      },
      {
        stepNumber: 3,
        title: "การใช้เครื่องมือเปิด/ปิดทั้งหมด (Batch Toggle)",
        description: "คลิกปุ่ม 'Select All' เพื่อเปิดสิทธิ์ทุกช่องในแถวนั้น หรือคลิก 'Unselect All' เพื่อยกเลิกสิทธิ์ทั้งหมดอย่างรวดเร็ว",
      },
      {
        stepNumber: 4,
        title: "การบันทึกการเปลี่ยนแปลง",
        description: "คลิกปุ่ม 'บันทึกการเปลี่ยนแปลง' ระบบจะทำการบันทึกข้อมูลลงตาราง role_permissions แบบ Database Transaction ปลอดภัยไร้ข้อผิดพลาด",
      },
    ],
  },
  {
    id: "manual-notifications",
    title: "การเฝ้าระวังและจัดการแจ้งเตือนวิกฤต (Alert Triage & Heartbeat)",
    moduleCode: "ALERT-08",
    targetTiers: ["Tier 1: Super Admin", "Tier 2: Brand Owner", "Tier 3: Regional Manager", "Tier 4: Area Manager", "Tier 5: Branch Staff"],
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "notifications_active",
    route: "/notifications",
    summary: "การตรวจจับคะแนนวิกฤต CSAT ตกต่ำกว่า 80% การแจ้งเตือนตู้ Kiosk ขาดการเชื่อมต่อ และขั้นตอนการจัดการปัญหาตาม SLA",
    steps: [
      {
        stepNumber: 1,
        title: "กลไกการตรวจจับความผิดปกติของระบบหลังบ้าน (Background Watcher)",
        description: "ระบบมี Background Service ทำงานอัตโนมัติทุก 30 นาที เพื่อประเมินคะแนนย้อนหลัง 24 ชั่วโมงของทุกสาขา",
        detailPoints: [
          "CSAT Anomaly Alert: หากสาขามีการโหวต >= 5 ครั้ง และคะแนนเฉลี่ย < 80% ระบบจะสร้าง Alert สีแดงแจ้งเตือนผู้จัดการทันที",
          "Kiosk Disconnect Alert: หากตู้ Kiosk ไม่มีการส่ง Heartbeat หรือไม่มีการโหวตนานเกิน 15 นาที ระบบจะแจ้งเตือน 'Kiosk Offline'",
        ],
      },
      {
        stepNumber: 2,
        title: "การดูและคัดกรองการแจ้งเตือนในหน้า /notifications",
        description: "สามารถกรองดูรายการตามระดับความเร่งด่วน: วิกฤต (High Priority สีแดง), ปานกลาง (Medium สีส้ม), ข้อมูลทั่วไป (Low สีฟ้า)",
      },
      {
        stepNumber: 3,
        title: "การตอบรับและการเคลียร์แจ้งเตือน (Mark as Read / Resolved)",
        description: "เมื่อผู้จัดการหรือเจ้าหน้าที่สาขาเข้าไปตรวจสอบและแก้ปัญหาเรียบร้อยแล้ว ให้กด 'ทำเครื่องหมายว่าอ่านแล้ว' เพื่อเคลียร์ Badge แจ้งเตือน",
      },
    ],
  },
  {
    id: "manual-settings",
    title: "การตั้งค่าระบบและการปรับแต่ง Kiosk แบบเรียลไทม์ (Zero-Downtime Config)",
    moduleCode: "CONF-09",
    targetTiers: ["Tier 1: Super Admin"],
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "tune",
    route: "/settings",
    summary: "การปรับเวลานับถอยหลังของ Kiosk, ระยะเวลาป้องกันการโหวตซ้ำ, อายุรหัส SMS OTP และการซิงค์ข้อมูลข้ามแท็บโดยไม่ต้อง Restart เซิร์ฟเวอร์",
    steps: [
      {
        stepNumber: 1,
        title: "เข้าสู่หน้าจอการตั้งค่า /settings",
        description: "ระบบแบ่งการตั้งค่าออกเป็น 5 หมวด: General (ทั่วไป), Dashboard, Satisfaction Kiosk, Reports, และ Localization",
      },
      {
        stepNumber: 2,
        title: "การปรับแต่งการทำงานของตู้ Kiosk หน้าร้าน",
        description: "ในหมวด 'Satisfaction Settings' สามารถปรับเปลี่ยนพารามิเตอร์สำคัญได้ทันที:",
        detailPoints: [
          "Thank You Auto-Reset Duration: ระยะเวลานับถอยหลังหน้าขอบคุณ (เช่น ปรับจาก 5 เป็น 2 วินาที)",
          "Anti-Duplicate Spam Window: ระยะเวลาหน่วงป้องกันการกดซ้ำซ้อน (เช่น 1,500 มิลลิวินาที)",
          "Touch Button Scale & Layout: ปรับขนาดอิโมจิและข้อความแสดงผลบนหน้าจอ",
        ],
      },
      {
        stepNumber: 3,
        title: "การกระจายคำสั่งสดไปยังตู้ Kiosk (Cross-Window Reactive Event)",
        description: "เมื่อกดปุ่ม 'บันทึกการตั้งค่า' ระบบจะส่ง Event csat_satisfaction_settings_updated ไปยังหน้า /satisfaction ที่เปิดอยู่ทุกเครื่องทันทีโดยไม่ต้องรีเฟรชหน้าจอ",
      },
    ],
  },
  {
    id: "manual-audit",
    title: "การตรวจสอบประวัติการทำรายการและสุขภาพระบบ (Audit Trail & Health)",
    moduleCode: "AUDIT-10",
    targetTiers: ["Tier 1: Super Admin"],
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "history_edu",
    route: "/audit",
    summary: "คู่มือการตรวจสอบบันทึกความปลอดภัย การเปรียบเทียบข้อมูลก่อน-หลังแก้ไข (Deep Diff Inspector) และการทดสอบ Latency เซิร์ฟเวอร์สด",
    steps: [
      {
        stepNumber: 1,
        title: "การตรวจสอบบันทึกประวัติการเปลี่ยนแปลง (Audit Logs)",
        description: "เข้าหน้า /audit เพื่อดูรายการบันทึกทุกการกระทำในระบบ เช่น มีใครสร้าง แก้ไข หรือลบข้อมูลสาขา แบรนด์ หรือสิทธิ์",
        detailPoints: [
          "บันทึกชื่อผู้ทำรายการ (Actor Snapshot), บทบาท, เวลาทำรายการที่แม่นยำ และ Client IP Address",
          "ค้นหาตามชื่อผู้ใช้ หรือกรองตามช่วงเวลาและประเภทการกระทำ (CREATE, UPDATE, DELETE)",
        ],
      },
      {
        stepNumber: 2,
        title: "การดูความต่างของข้อมูล (Deep Diff Inspector)",
        description: "คลิกที่รายการบันทึกเพื่อเปิดดูเปรียบเทียบค่าเดิม (Old Value) กับค่าใหม่ (New Value) เป็นรายฟิลด์แบบชัดเจน",
      },
      {
        stepNumber: 3,
        title: "การทดสอบสัญญาณและสุขภาพบริการ (Service Health Telemetry)",
        description: "ในแท็บ Service Health แสดงสถานะความพร้อมของฐานข้อมูล PostgreSQL, Background Worker และมีปุ่ม 'Ping Service' เพื่อทดสอบค่า Latency แบบสด",
      },
    ],
  },
];

// ==========================================================================
// ─── 3. FAQ & TROUBLESHOOTING DATA (คำถามพบบ่อยและวิธีแก้ปัญหา)
// ==========================================================================

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-kiosk-offline",
    category: "kiosk",
    question: "ตู้ Kiosk หน้าร้านแสดงสถานะ Offline หรือคะแนนโหวตไม่เข้าแดชบอร์ด ต้องทำอย่างไร?",
    answer: "1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต/Wi-Fi ของแท็บเล็ตหน้าร้าน\n2. ตรวจสอบว่าหน้าจอยังเปิดอยู่ที่ URL /satisfaction หรือไม่ หากเผลอกดปิดให้เปิดใหม่และกด F11 เต็มจอ\n3. ให้พนักงานแตะทดสอบโหวต 1 ครั้งเพื่อส่ง Heartbeat หากยิงผ่าน ระบบจะปรับสถานะกลับเป็น Online ภายใน 10 วินาที\n4. หากยังไม่หาย ให้ตรวจสอบว่าเซิร์ฟเวอร์ Backend API ยังทำงานปกติที่หน้า /audit",
    actionRoute: "/satisfaction",
    actionText: "เปิดหน้าตู้ Kiosk",
  },
  {
    id: "faq-otp-not-received",
    category: "auth",
    question: "เข้าสู่ระบบแล้วไม่ได้รับรหัส SMS OTP ภายใน 3 นาที หรือรหัสหมดอายุ?",
    answer: "1. ตรวจสอบว่าเบอร์โทรศัพท์ที่ผูกกับบัญชีในหน้า /usermanagement ถูกต้องหรือไม่\n2. สังเกตเลขอ้างอิง (Ref Code 4 หลัก) บนหน้าจอว่าตรงกับ SMS ที่ได้รับหรือไม่\n3. หากหมดเวลา 180 วินาที ให้กดปุ่ม 'ส่งรหัส OTP ใหม่อีกครั้ง'\n4. ผู้ดูแลระบบสามารถตรวจสอบอายุ OTP ได้ในหน้า /settings หรือตรวจสอบบันทึกการส่งใน Audit Log",
    actionRoute: "/login",
    actionText: "ไปที่หน้า Login",
  },
  {
    id: "faq-scope-missing",
    category: "dashboard",
    question: "ทำไมในแดชบอร์ดหรือผังสาขาไม่แสดงข้อมูลของบางแบรนด์หรือบางจังหวัด?",
    answer: "เนื่องจากระบบมีนโยบายรักษาความปลอดภัย 5-Tier Data Isolation หากบัญชีของท่านเป็นระดับ Regional Manager หรือ Area Manager ท่านจะมองเห็นได้เฉพาะสาขาที่อยู่ในเขตความรับผิดชอบของท่านเท่านั้น หากต้องการเข้าถึงสาขาเพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ (Super Admin) เพื่อเพิ่มสิทธิ์ในหน้า /dataaccess",
    actionRoute: "/dashboard",
    actionText: "เปิดแดชบอร์ด",
  },
  {
    id: "faq-kiosk-timer",
    category: "system",
    question: "ต้องการปรับเวลานับถอยหลังหน้าจอขอบคุณของ Kiosk ให้เร็วขึ้น ทำอย่างไร?",
    answer: "สำหรับผู้ดูแลระบบ (Super Admin) ให้ไปที่หน้า /settings -> เลือกแท็บ 'Satisfaction' -> ปรับช่อง 'Thank You Display Duration' เป็นตัวเลขวินาทีที่ต้องการ (เช่น 2 หรือ 3 วินาที) แล้วกดบันทึก ระบบจะส่งการอัปเดตแบบสดไปยังตู้ Kiosk ทุกตู้ทันทีโดยไม่ต้องรีสตาร์ต",
    actionRoute: "/settings",
    actionText: "ไปที่หน้า Settings",
  },
  {
    id: "faq-dual-brand",
    category: "system",
    question: "สาขาที่มี 2 แบรนด์เปิดบริการร่วมกัน (Co-Location) ต้องตั้งค่าอย่างไร?",
    answer: "ไปที่หน้า /branch -> กดแก้ไขสาขาที่ต้องการ -> ในส่วน 'แบรนด์ที่เปิดบริการ' ให้ติ๊กเลือกทั้ง 2 แบรนด์ (เช่น ติ๊กทั้ง KFC และ Mister Donut) แล้วกดบันทึก ระบบจะจัดเก็บข้อมูลลงตาราง branch_brands ทำให้ตู้ Kiosk และรายงานแดชบอร์ดแยกเก็บคะแนนของทั้ง 2 แบรนด์ได้อย่างถูกต้อง",
    actionRoute: "/branch",
    actionText: "ไปที่หน้าจัดการสาขา",
  },
];

// ==========================================================================
// ─── 4. SYSTEM PAGES & ALGORITHM AUDIT MATRIX (16 หน้าจอของระบบ)
// ==========================================================================

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
    screenName: "Documentation & User Manual",
    componentPath: "Screens/Admin/Documentation",
    tierAccess: "Tier 1–5 (ทุกคน)",
    tierBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    category: "support",
    summaryAlgorithm: "Interactive Multi-Tab Knowledge Base, Dynamic Checklists, Role Guide Matrix และ API Payload Inspector",
    detailedLogic: [
      "Interactive 4-Tab Center: แบ่งเป็น คู่มือการใช้งานเว็บ (User Manual), ตรวจรับอัลกอริทึม (16 หน้า), API Integration, และ Troubleshooting/FAQ",
      "Search & Role Filter: ค้นหาข้อความด่วน และกรองคู่มือตามระดับ Tier ของผู้ใช้",
      "Clipboard cURL Utility: คัดลอก cURL Request สำหรับยิง API OAuth 2.0 พร้อมแสดงสถานะ Copied",
      "Direct Jump Navigation: นำทางไปยังแต่ละหน้าจอของระบบได้โดยตรงจากคู่มือ",
    ],
    checkpoints: [
      "สลับดูแท็บคู่มือทั้ง 4 แท็บได้อย่างลื่นไหล",
      "สามารถค้นหาตามหัวข้อหรือกรองตาม Tier ได้แม่นยำ",
      "กดปุ่ม Copy Code แล้วคัดลอก cURL ลง Clipboard สำเร็จ",
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

const DOCUMENT_TOPICS: DocumentTopicItem[] = [
  { anchorId: "overview", topicTitle: "API Overview & Architecture" },
  { anchorId: "prerequisites", topicTitle: "Prerequisites & Tokens" },
  { anchorId: "generating-token", topicTitle: "Generating Access Token" },
  { anchorId: "handling-response", topicTitle: "Handling Response & Errors" },
  { anchorId: "feedback-payload", topicTitle: "Kiosk Sentiment Ingestion" },
  { anchorId: "status-matrix", topicTitle: "HTTP Status Matrix" },
];

// ==========================================================================
// ─── 5. MAIN DOCUMENTATION COMPONENT
// ==========================================================================

export default function DocumentationScreen() {
  const [activeTab, setActiveTab] = useState<"user_manual" | "pages_algorithm" | "api_guide" | "troubleshooting">("user_manual");
  const [activeAnchorId, setActiveAnchorId] = useState<string>("generating-token");
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleTier, setSelectedRoleTier] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "core" | "support">("all");
  const [expandedManualId, setExpandedManualId] = useState<string | null>("manual-auth");
  const [expandedPageId, setExpandedPageId] = useState<number | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-kiosk-offline");
  const [checkedCheckpoints, setCheckedCheckpoints] = useState<Record<string, boolean>>({});

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

  // Toggle Checkpoint Checkbox
  const handleToggleCheckpoint = (checkpointKey: string) => {
    setCheckedCheckpoints((prev) => ({
      ...prev,
      [checkpointKey]: !prev[checkpointKey],
    }));
  };

  // กรองคู่มือ User Manual ตามคำค้นและบทบาท Tier
  const filteredManuals = USER_MANUAL_GUIDES.filter((manual) => {
    const matchesSearch =
      manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.moduleCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRoleTier === "all" ||
      manual.targetTiers.some((t) => t.toLowerCase().includes(selectedRoleTier.toLowerCase()));

    return matchesSearch && matchesRole;
  });

  // กรองหน้าจอระบบ 16 หน้า
  const filteredPages = SYSTEM_PAGES.filter((page) => {
    const matchesSearch =
      page.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.screenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.summaryAlgorithm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || page.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // กรอง FAQ
  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    return (
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION WITH STATS & TAB SWITCHER ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 uppercase tracking-wide">
                CSAT Platform Knowledge Center
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                v2.4 Enterprise
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="material-symbols-outlined text-blue-900 text-3xl">menu_book</span>
              คู่มือการใช้งานระบบ & พิมพ์เขียวสถาปัตยกรรม (Docs Center)
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              ศูนย์รวมคู่มือการปฏิบัติงานสำหรับผู้ใช้งานทุกระดับ (5-Tier Role Manuals), ตารางตรวจรับอัลกอริทึม 16 หน้าจอหลักสำหรับเตรียม Refactor, และพิมพ์เขียวเชื่อมต่อ API OAuth 2.0
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[85px]">
              <div className="text-[11px] text-slate-500 font-medium">ระดับสิทธิ์</div>
              <div className="text-base font-bold text-slate-900">5 Tiers</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[85px]">
              <div className="text-[11px] text-slate-500 font-medium">หน้าจอระบบ</div>
              <div className="text-base font-bold text-blue-900">16 Screens</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[85px]">
              <div className="text-[11px] text-slate-500 font-medium">คู่มือขั้นตอน</div>
              <div className="text-base font-bold text-emerald-700">10 Guides</div>
            </div>
          </div>
        </div>

        {/* ─── 4 MAIN TABS NAVIGATION ─── */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("user_manual");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "user_manual"
                ? "bg-blue-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            คู่มือการใช้งานเว็บ (User Manual)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("pages_algorithm");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pages_algorithm"
                ? "bg-blue-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            พิมพ์เขียว 16 หน้าจอ & Checkpoints
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("api_guide");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "api_guide"
                ? "bg-blue-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">api</span>
            คู่มือเชื่อมต่อ API (OAuth & Ingestion)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("troubleshooting");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "troubleshooting"
                ? "bg-blue-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">help_center</span>
            ศูนย์แก้ปัญหา & FAQ
          </button>
        </div>
      </div>

      {/* ─── TAB 1: USER MANUAL (คู่มือการใช้งานระบบแยกตามโมดูลและบทบาท) ─── */}
      {activeTab === "user_manual" && (
        <div className="space-y-6">
          
          {/* Controls: Search and Role Tier Filter */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาคู่มือ (เช่น 2FA, ตู้ Kiosk, แดชบอร์ด, สิทธิ์)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">บทบาท:</span>
              <button
                type="button"
                onClick={() => setSelectedRoleTier("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRoleTier === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleTier("Tier 1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRoleTier === "Tier 1"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleTier("Brand")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRoleTier === "Brand"
                    ? "bg-purple-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Brand Owner
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleTier("Manager")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRoleTier === "Manager"
                    ? "bg-amber-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                RM / AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleTier("Branch")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRoleTier === "Branch"
                    ? "bg-emerald-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Branch Staff หน้าร้าน
              </button>
            </div>
          </div>

          {/* Role Access Matrix Summary Callout */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  5-Tier Role-Based Access Control Structure
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  โครงสร้างระดับการเข้าถึงข้อมูลและหน้าที่ความรับผิดชอบ
                </h3>
                <p className="text-xs text-blue-200/90 mt-1 max-w-2xl leading-relaxed">
                  ระบบจำกัดสิทธิ์แบบ Strict 5-Tier Data Isolation ป้องกันข้อมูลรั่วไหลข้ามสาขาและข้ามระดับการบริหาร
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-blue-100 shrink-0 w-full md:w-auto">
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <strong className="block text-white">Tier 1: Super Admin</strong> ดูแลทั้งระบบ + ตั้งค่าความปลอดภัย
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <strong className="block text-white">Tier 2: Brand Owner</strong> วิเคราะห์ภาพรวมแบรนด์
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <strong className="block text-white">Tier 3–4: RM & AM</strong> ควบคุมภูมิภาคและกลุ่มเขต
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 col-span-2 sm:col-span-3">
                  <strong className="inline text-white">Tier 5: Branch Staff</strong> ปฏิบัติการตู้ Kiosk หน้าร้าน + มอนิเตอร์ผลคะแนนประจำสาขา
                </div>
              </div>
            </div>
          </div>

          {/* User Manual Cards Accordion List */}
          <div className="space-y-4">
            {filteredManuals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-slate-300 text-5xl">search_off</span>
                <p className="text-sm font-semibold text-slate-700">ไม่พบคู่มือที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-slate-500">กรุณาลองเปลี่ยนคำค้นหา หรือกดเลือกดูคู่มือทั้งหมด</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRoleTier("all");
                  }}
                  className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              filteredManuals.map((manual) => {
                const isExpanded = expandedManualId === manual.id;

                return (
                  <div
                    key={manual.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all overflow-hidden"
                  >
                    {/* Header Clickable Row */}
                    <div
                      onClick={() => setExpandedManualId(isExpanded ? null : manual.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start md:items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <span className="material-symbols-outlined text-[20px]">{manual.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {manual.moduleCode}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900">
                              {manual.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {manual.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                        <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end">
                          {manual.targetTiers.slice(0, 2).map((tier, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                            >
                              {tier.split(":")[0]}
                            </span>
                          ))}
                          {manual.targetTiers.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{manual.targetTiers.length - 2} ระดับ
                            </span>
                          )}
                        </div>

                        <Link
                          href={manual.route}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          เปิดหน้านี้
                        </Link>

                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-700 transition-transform p-1"
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

                    {/* Expanded Steps & Instruction Content */}
                    {isExpanded && (
                      <div className="p-6 border-t border-slate-100 bg-white space-y-6 animate-fadeIn">
                        
                        {/* Target Tiers Pill Box */}
                        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">กลุ่มผู้ใช้งานที่เกี่ยวข้อง:</span>
                          {manual.targetTiers.map((tier, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs font-semibold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200"
                            >
                              {tier}
                            </span>
                          ))}
                        </div>

                        {/* Visual Component Illustration */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-purple-700 text-sm">schema</span>
                            แผนภาพจำลองสถาปัตยกรรม & หน้าจอ (Architecture & Visual Mockup)
                          </h4>
                          {manual.id === "manual-auth" && <AuthManualIllustration />}
                          {manual.id === "manual-kiosk" && <KioskManualIllustration />}
                          {manual.id === "manual-dashboard" && <DashboardManualIllustration />}
                          {manual.id === "manual-brand-branch" && <BrandBranchManualIllustration />}
                          {manual.id === "manual-events" && <EventCampaignManualIllustration />}
                          {manual.id === "manual-users-scopes" && <UserScopeManualIllustration />}
                          {manual.id === "manual-roles-matrix" && <RoleMatrixManualIllustration />}
                          {manual.id === "manual-notifications" && <AlertNotificationIllustration />}
                          {manual.id === "manual-settings" && <SettingsConfigIllustration />}
                          {manual.id === "manual-audit" && <AuditTrailIllustration />}
                        </div>

                        {/* Step by Step Timeline */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-blue-700 text-sm">format_list_numbered</span>
                            ขั้นตอนการปฏิบัติงานทีละขั้น (Step-by-Step Instructions)
                          </h4>

                          <div className="space-y-4">
                            {manual.steps.map((st) => (
                              <div
                                key={st.stepNumber}
                                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                              >
                                <span className="w-7 h-7 rounded-full bg-blue-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {st.stepNumber}
                                </span>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-slate-900">{st.title}</h5>
                                  <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                                  
                                  {st.detailPoints && st.detailPoints.length > 0 && (
                                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 mt-2">
                                      {st.detailPoints.map((dp, dpIdx) => (
                                        <li key={dpIdx}>{dp}</li>
                                      ))}
                                    </ul>
                                  )}

                                  {st.warningNote && (
                                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                                      <span className="material-symbols-outlined text-amber-700 text-sm shrink-0 mt-0.5">warning</span>
                                      <span><strong>ข้อควรระวัง:</strong> {st.warningNote}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips & Guidance Callout */}
                        {manual.proTip && (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-emerald-700 text-base shrink-0 mt-0.5">lightbulb</span>
                            <div>
                              <strong className="font-bold text-emerald-950">เคล็ดลับการใช้งาน (Pro-Tip):</strong>{" "}
                              <span>{manual.proTip}</span>
                            </div>
                          </div>
                        )}

                        {manual.warningNote && (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-rose-700 text-base shrink-0 mt-0.5">error</span>
                            <div>
                              <strong className="font-bold text-rose-950">คำเตือนด้านความปลอดภัย:</strong>{" "}
                              <span>{manual.warningNote}</span>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ─── TAB 2: SYSTEM PAGES & ALGORITHM AUDIT MATRIX (16 หน้า) ─── */}
      {activeTab === "pages_algorithm" && (
        <div className="space-y-6">
          
          {/* Controls: Search and Filter */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาตาม Route, ชื่อหน้า, หรือ Algorithm..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "support"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ระบบสนับสนุน (4)
              </button>
            </div>
          </div>

          {/* Cards Grid for 16 Pages */}
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
                      <span className="badge-live text-[11px]">Ready for Refactor</span>
                      
                      <Link
                        href={page.route}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                        ไปที่หน้า
                      </Link>

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
                          Checkpoints สำหรับการตรวจเช็กความถูกต้องก่อน Refactor
                        </h4>
                        <div className="space-y-1.5">
                          {page.checkpoints.map((cp, idx) => {
                            const checkpointKey = `cp_${page.id}_${idx}`;
                            const isChecked = !!checkedCheckpoints[checkpointKey];

                            return (
                              <div
                                key={idx}
                                onClick={() => handleToggleCheckpoint(checkpointKey)}
                                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                  isChecked ? "bg-emerald-50/70 text-emerald-900 line-through" : "hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  id={checkpointKey}
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded text-blue-600 cursor-pointer"
                                />
                                <label htmlFor={checkpointKey} className="cursor-pointer select-none">
                                  {cp}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-600">Component:</span>{" "}
                          <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            Frontend/src/{page.componentPath}
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

      {/* ─── TAB 3: API INTEGRATION GUIDE (OAuth 2.0 & Ingestion) ─── */}
      {activeTab === "api_guide" && (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* Main Article Content Container */}
          <article className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-8">
            
            {/* Section: Overview */}
            <section id="overview" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                API Overview & Architecture
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                CSAT Enterprise Admin API เป็นอินเทอร์เฟซ RESTful ความเร็วสูง (High-throughput, Low-latency) 
                สำหรับรับคะแนนความรู้สึกจากตู้ Kiosk หน้าร้าน, บริหารจัดการขอบเขตสาขาตาม 5-Tier Data Scope, 
                และดึงข้อมูลสถิติคะแนนความพึงพอใจแบบเรียลไทม์ โดยการเชื่อมต่อระหว่างระบบต้องยืนยันตัวตนผ่านโปรโตคอล OAuth 2.0 พร้อมเข้ารหัส TLS 1.3
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
                  มีคู่รหัส <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">client_id</code> และ <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">client_secret</code> ที่ได้รับอนุมัติจากผู้ดูแลระบบ
                </li>
                <li>
                  ได้รับการกำหนดสิทธิ์ Role Permission สำหรับ API Integration ในหน้าจอ <span className="font-semibold text-slate-800">Role Management</span>
                </li>
                <li>
                  ส่งคำขอผ่านโปรโตคอล HTTPS พร้อมเข้ารหัสความปลอดภัย TLS 1.3
                </li>
              </ul>

              {/* Note Callout Box */}
              <div className="bg-blue-50/80 border-l-4 border-blue-900 p-4 rounded-r-xl flex items-start gap-3 mt-4">
                <span className="material-symbols-outlined text-blue-900 text-[20px] shrink-0 mt-0.5">info</span>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-blue-950 font-bold">ข้อกำหนดด้านความปลอดภัย:</strong> Access Token มีอายุการใช้งาน 60 นาที ไคลเอนต์ควรพัฒนากลไก Token Rotation หรือ Refresh Token ล่วงหน้าก่อนหมดอายุ 5 นาที เพื่อให้ระบบ Kiosk ไม่สะดุด
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
                ยิงคำขอแบบ POST ไปยัง Token Gateway โดยระบุ Content-Type เป็น <code className="bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">application/x-www-form-urlencoded</code>:
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
                เมื่อยืนยันสิทธิ์ถูกต้อง ระบบจะตอบกลับเป็น JSON Payload พร้อม Access Token และเวลาหมดอายุ:
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
                การส่งผลโหวตความรู้สึกจากตู้ Kiosk ส่งคำขอแบบ POST ไปยัง <code className="bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">POST /api/satisfaction/vote</code>:
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

            {/* Section: HTTP Status Matrix */}
            <section id="status-matrix" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                HTTP Response Codes & Error Matrix
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Status Code</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3">คำอธิบายและการแก้ไข</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-mono font-bold text-emerald-700">200 OK / 201 Created</td>
                      <td className="p-3 font-semibold text-slate-900">สำเร็จ</td>
                      <td className="p-3">ประมวลผลคำขอสำเร็จ บันทึกคะแนนเรียบร้อย</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-amber-700">400 Bad Request</td>
                      <td className="p-3 font-semibold text-slate-900">ข้อมูลผิดพลาด</td>
                      <td className="p-3">โครงสร้าง JSON ไม่ถูกต้อง หรือ sentiment อยู่นอกช่วง 1–3</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-rose-700">401 Unauthorized</td>
                      <td className="p-3 font-semibold text-slate-900">ไม่ได้รับอนุญาต</td>
                      <td className="p-3">Access Token หมดอายุ หรือไม่ส่ง Bearer Header</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-rose-700">403 Forbidden</td>
                      <td className="p-3 font-semibold text-slate-900">เกินสิทธิ์</td>
                      <td className="p-3">ไม่มีสิทธิ์เข้าถึงสาขาหรือแบรนด์นี้ (ขัดกับ 5-Tier Scope)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-purple-700">429 Too Many Requests</td>
                      <td className="p-3 font-semibold text-slate-900">โหวตถี่เกินกำหนด</td>
                      <td className="p-3">ติด Anti-Spam Rate Limit กรุณาหน่วงเวลาตามที่ระบุใน Header</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-slate-700">500 Server Error</td>
                      <td className="p-3 font-semibold text-slate-900">เซิร์ฟเวอร์ขัดข้อง</td>
                      <td className="p-3">ข้อผิดพลาดภายในระบบ ให้ตรวจสอบสถานะในหน้า /audit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

          </article>

          {/* Right Sticky Table of Contents (On this page) */}
          <aside className="w-full xl:w-64 shrink-0 hidden xl:block sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
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

      {/* ─── TAB 4: TROUBLESHOOTING & FAQ (ศูนย์แก้ปัญหาและคำถามพบบ่อย) ─── */}
      {activeTab === "troubleshooting" && (
        <div className="space-y-6">
          
          {/* FAQ Search Header */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-900 text-xl">contact_support</span>
                คำถามที่พบบ่อยและวิธีแก้ปัญหาการปฏิบัติงาน (FAQ & Troubleshooting)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                รวบรวมปัญหาที่พบบ่อยในการใช้งานตู้ Kiosk, การยืนยันตัวตน, และการกำหนดสิทธิ์
              </p>
            </div>

            <div className="relative w-full md:max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาปัญหา..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Diagnostic Flowchart Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-lg">wifi_off</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">1. Kiosk ขาดการเชื่อมต่อ</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ตรวจสาย LAN หรือสัญญาณ Wi-Fi ของเครื่องแท็บเล็ต แล้วแตะหน้าจอ 1 ครั้งเพื่อส่ง Heartbeat Ping
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-lg">sms_failed</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">2. ไม่ได้รับ SMS OTP</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                รอครบ 3 นาทีแล้วกดปุ่มขอรหัสใหม่ พร้อมตรวจเช็กเบอร์โทรในหน้า User Management ว่าตรงกับเครื่องจริง
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-lg">sync_problem</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">3. สิทธิ์สาขาไม่แสดง</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ติดต่อ Super Admin เพื่อตรวจสอบตาราง Data Access Scopes และผูกสิทธิ์สาขาในหน้า Data Access
              </p>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-900 text-xs font-bold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {faq.question}
                      </span>
                    </div>

                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-700 space-y-4 animate-fadeIn">
                      <div className="whitespace-pre-line leading-relaxed pl-9">
                        {faq.answer}
                      </div>

                      {faq.actionRoute && (
                        <div className="pl-9 pt-2">
                          <Link
                            href={faq.actionRoute}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            {faq.actionText || "ไปที่หน้านี้"}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
