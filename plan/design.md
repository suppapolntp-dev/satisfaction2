---
name: Neo-Mint Customer Satisfaction & Feedback Operations
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#4953bc'
  on-secondary: '#ffffff'
  secondary-container: '#8792fe'
  on-secondary-container: '#17228f'
  tertiary: '#944a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#fa913b'
  on-tertiary-container: '#663100'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  canvas-mint: '#E8F1EB'
  surface-pure: '#FFFFFF'
  surface-subtle: '#F8FAFC'
  mint-soft: '#86EFAC'
  mint-tint: '#D7F4DF'
  mint-gradient-end: '#C8ECD2'
  amber-warning: '#FBBF24'
  hatch-slate: '#94A3B8'
  text-muted: '#64748B'
  border-hairline: '#E2E8F0'
typography:
  display-kpi:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 40px
    letterSpacing: -0.03em
  display-kpi-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '900'
    lineHeight: 32px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 26px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  caption-tick:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Design System & UI Style Guidelines: Neo-Mint Customer Satisfaction & Operations

> **Platform:** Satisfaction & CX Operations Analytics Platform  
> **Target Audience:** Customer Support Leads, CX Managers, QA Teams, and Live Chat Agents  
> **Document Purpose:** Canonical UI/UX specification, Design Tokens, and Component Architecture for Satisfaction Tracking (CSAT, NPS, CES & Conversation Auditing)

---

## 1. Brand & Style

### 1.1 Personality & Purpose
ระบบดีไซน์นี้ผสานความชัดเจนของระบบวิเคราะห์ข้อมูลระดับ Enterprise SaaS เข้ากับความผ่อนคลายและเป็นมิตรของการบริหารจัดการประสบการณ์ลูกค้า (Customer Experience & Satisfaction) บุคลิกของงานดีไซน์ให้ความรู้สึกมั่นคง สงบ และอ่านข้อมูลได้ง่ายแม้ในช่วงที่มีเคสสะสมหนาแน่น ช่วยลดความตึงเครียดของทีมซัพพอร์ตและผู้ดูแลระบบขณะตรวจสอบคะแนนความพึงพอใจ (CSAT), การแจ้งเตือนเคสวิกฤต (Detractor Alerts) หรือการไล่อ่านประวัติแชทยาวๆ ด้วยบรรยากาศที่โปร่งสบายตา

### 1.2 Aesthetic Movement: Modern Data-Dense SaaS with Organic Tactility
โครงสร้างภาพวางสมดุลระหว่าง Bento Grid ที่คมชัด กับความโค้งมนที่ดูเป็นธรรมชาติ:
- **Neo-Mint Atmosphere:** แทนที่สีเทาเย็นชืดและพื้นขาวจ้าด้วยพื้นหลังโทนสีเขียวเสจมิ้นต์ (`#E8F1EB`) ช่วยลดอาการล้าของสายตาเมื่อต้องมอนิเตอร์แดชบอร์ดความพึงพอใจหรือตรวจคุณภาพแชท (QA) ต่อเนื่องเป็นเวลานาน
- **Squircle Enclosures & Pill Terminals:** กรอบการ์ดขนาดใหญ่ใช้มุมโค้งมนระดับ `24px` ถึง `36px` เพื่อโอบล้อมกราฟและตัวเลขสถิติที่อัดแน่น ในขณะที่ปุ่มกด ตัวกรอง และป้ายสถานะ (Sentiment / Status Chips) ใช้ทรงแคปซูลโค้งมนเต็มรูปแบบ (`rounded-full`)
- **Dual-Encoded 45° Micro-Hatching:** ลายเส้นทแยงมุม 45 องศา ใช้แทนสถานะ "รอการประเมินผล (Pending Survey)", "เคสที่ยังไม่ได้ปิด", หรือ "ข้อมูลที่อยู่ระหว่างรอผลตอบกลับจากลูกค้า" ช่วยให้แยกแยะสถานะได้ทันทีโดยไม่ต้องพึ่งพาสีเพียงอย่างเดียว

---

## 2. Colors & Sentiment Mapping

### 2.1 Hierarchy & Role Distribution
ใช้คอนทราสต์ที่ชัดเจนระหว่างตัวอักษรสีเข้มจัด พื้นผิวการ์ดสีขาวบริสุทธิ์ และพื้นหลังสีเขียวมิ้นต์:

- **Canvas (`#E8F1EB`):** พื้นหลังหลักโทนเสจมิ้นต์ สร้างมิติและความลึกให้พื้นที่ทำงาน
- **Surface (`#FFFFFF`):** พื้นผิวของการ์ด ตาราง และหน้าต่างรายละเอียด (Drawer/Modal) เพื่อความคมชัดสูงสุดในการอ่านข้อมูล
- **Primary / Positive Sentiment (`#22C55E` & `#006e2f`):** แทนคะแนนความพึงพอใจระดับสูง (Promoters / 4-5 Stars / Positive CSAT), เคสที่แก้ไขสำเร็จแล้ว และปุ่ม Action หลัก
- **Secondary / Neutral & Telemetry (`#818CF8` & `#4953bc`):** ใช้กับกราฟเส้นโค้งบอกแนวโน้ม (Trend Arcs), คะแนนระดับปานกลาง (Passives), อัตราการตอบกลับ (Response Rate) และการแบ่งกลุ่มหมวดหมู่คำติชม
- **Tertiary (`#FB923C`) & Warning (`#FBBF24`):** ใช้เตือนเคสที่ลูกค้าเริ่มรอนาน (SLA Breach Warning), คะแนนความพึงพอใจที่เริ่มลดลง หรือเคสที่ต้องรีบติดตามผล (Follow-up Required)
- **Error / Negative Sentiment (`#ba1a1a` & `#ffdad6`):** ใช้เน้นย้ำคะแนนติดลบ (Detractors / 1-2 Stars), ข้อร้องเรียนรุนแรงที่ต้องได้รับการแก้ไขด่วน (Escalated Tickets)
- **Neutral (`#0F172A` / `#131b2e`):** สีเทาเข้มเกือบดำ ให้ค่าคอนทราสต์สูงถึง 16:1 บนพื้นขาว สำหรับหัวข้อและตัวเลข KPI หลัก (เช่น ค่าเฉลี่ย CSAT 94.8%)
- **Text Muted (`#64748B`):** ข้อมูลประกอบ เช่น เวลาที่ส่งแบบสอบถาม ชื่อเจ้าหน้าที่ หรือแกนของกราฟ

### 2.2 The 45° Diagonal Hatch Fill Pattern
สำหรับโควตาแบบสอบถามที่ส่งไปแล้วแต่ยังไม่ได้รับคำตอบ (Pending Feedback) หรือเคสที่พักไว้ (On-Hold):
```css
repeating-linear-gradient(
  45deg,
  rgba(148, 163, 184, 0.45),
  rgba(148, 163, 184, 0.45) 1.5px,
  transparent 1.5px,
  transparent 5.5px
)