# 📊 Enterprise CSAT Customer Satisfaction & Multi-Tier Analytics Platform

ระบบประเมินความพึงพอใจลูกค้าแบบ Kiosk Touchscreen และศูนย์บริหารจัดการข้อมูลองค์กรระดับ Enterprise สำหรับเครือข่ายธุรกิจร้านอาหารและสนามบิน (เช่น **CRG - Central Restaurants Group**)

---

## 🏢 สถาปัตยกรรมลำดับชั้นองค์กร (5-Tier Organizational Hierarchy)

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

## ⚡ วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

```bash
# ติดตั้ง Dependencies
npm install

# รัน Development Server
npm run dev

# ทดสอบ Production Build
npm run build
```

เปิดบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## ⌨️ คีย์ลัดในระบบ (Global Keyboard Shortcuts)
- **<kbd>Ctrl</kbd> + <kbd>K</kbd>** (หรือ **<kbd>⌘</kbd> + <kbd>K</kbd>** บน Mac): โฟกัสช่อง **Global Search** บน Navbar จากหน้าใดก็ได้ เพื่อค้นหาหน้าจอ, สาขา หรือการตั้งค่าทันที
