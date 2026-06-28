"use client";

import React, { useState, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput from "@/Components/Inputs/SelectInput";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างข้อมูลชัดเจนเต็มคำ ไม่มักง่าย) ───────────────
// ==========================================================================

interface CorporateBrandItem {
  brandId: string;
  brandName: string;
  parentCompanyName: string;
  totalBranchesCount: number;
  brandStatus: "Active" | "Inactive";
  createdDateString: string;
  brandIconName: string;
}

// ==========================================================================
// ─── 2. STATIC MOCK DATA (ชุดข้อมูลจำลองปราศจากไอดีสั้นมักง่าย) ────────────────
// ==========================================================================

const DEFAULT_COMPANY_BRANDS: CorporateBrandItem[] = [
  { 
    brandId: "BRAND_LUXE_RETAIL", 
    brandName: "Luxe Retail", 
    parentCompanyName: "Global Retail Inc.", 
    totalBranchesCount: 342, 
    brandStatus: "Active", 
    createdDateString: "Jan 12, 2023", 
    brandIconName: "shopping_bag" 
  }
];

export default function BrandManagementScreen() {
  // สเตตัสควบคุมตัวกรอง (Controlled States)
  const [searchBrandQuery, setSearchBrandQuery] = useState("");
  const [selectedParentCompany, setSelectedParentCompany] = useState("All Parent Companies");
  const [selectedBrandStatus, setSelectedBrandStatus] = useState("All Statuses");

  // ─── 3. STATS DATA MAPPING (คำนวณสถิติส่งผ่านพร็อพเข้าหากล่องกลาง) ───
  const statsOverviewData: StatItem[] = useMemo(() => [
    { label: "Total Brands", value: "156", change: "+12 from last quarter", isUp: true, icon: "branding_watermark", color: "text-blue-600" },
    { label: "Active Brands", value: "142", change: "91% of total enterprise", isUp: true, icon: "check_circle", color: "text-emerald-500" },
    { label: "Total Branches", value: "1,204", change: "+48 new openings", isUp: true, icon: "store", color: "text-purple-600" },
    { label: "Pending Sync", value: "3", change: "Awaiting cluster approval", isUp: false, icon: "sync", color: "text-amber-500" }
  ], []);

  // ─── 4. TABLE COLUMN CONFIGURATIONS (กำหนดหัวข้อคอลัมน์ส่งเข้าตารางกลาง) ───
  const brandTableColumns: TableColumn<CorporateBrandItem>[] = useMemo(() => [
    {
      key: "brandIconName",
      label: "Logo",
      render: (brandRow) => (
        <div className="w-9 h-9 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-variant)] flex items-center justify-center shadow-sm select-none">
          <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-lg">
            {brandRow.brandIconName}
          </span>
        </div>
      )
    },
    { key: "brandName", label: "Brand Name", sortable: true },
    { key: "parentCompanyName", label: "Parent Company", sortable: true },
    { 
      key: "totalBranchesCount", 
      label: "Total Branches", 
      sortable: true,
      render: (brandRow) => <span className="font-bold">{brandRow.totalBranchesCount.toLocaleString()}</span>
    },
    {
      key: "brandStatus",
      label: "Status",
      render: (brandRow) => {
        const isBrandActive = brandRow.brandStatus === "Active";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border select-none ${
            isBrandActive 
              ? "bg-green-100 text-green-800 border-green-200" 
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}>
            {brandRow.brandStatus}
          </span>
        );
      }
    },
    { key: "createdDateString", label: "Created Date" }
  ], []);

  // ─── 5. ROW ACTIONS CONFIGURATIONS (ปุ่มกดท้ายแถว วิ่งเข้า TableDropdown อัตโนมัติ) ───
  const brandTableActions: TableAction<CorporateBrandItem>[] = useMemo(() => [
    { label: "Edit Brand", icon: "edit", onClick: (brandRow) => console.log("Edit entity:", brandRow.brandName) },
    { label: "View Branches", icon: "store", onClick: (brandRow) => console.log("Branches matrix view:", brandRow.brandName) },
    { label: "Delete Brand", icon: "delete", variant: "danger", onClick: (brandRow) => console.log("Delete targeted:", brandRow.brandName) }
  ], []);

  // ─── 6. FILTER LOGIC (คำนวณตัวกรองความปลอดภัยฝั่งหน้าบ้าน) ───
  const filteredCompanyBrands = useMemo(() => {
    return DEFAULT_COMPANY_BRANDS.filter((individualBrand: CorporateBrandItem) => {
      const matchesSearchQuery = 
        individualBrand.brandName.toLowerCase().includes(searchBrandQuery.toLowerCase()) ||
        individualBrand.parentCompanyName.toLowerCase().includes(searchBrandQuery.toLowerCase());
      
      const matchesCompanyFilter = 
        selectedParentCompany === "All Parent Companies" || 
        individualBrand.parentCompanyName === selectedParentCompany;
      
      const matchesStatusFilter = 
        selectedBrandStatus === "All Statuses" || 
        individualBrand.brandStatus === selectedBrandStatus;

      return matchesSearchQuery && matchesCompanyFilter && matchesStatusFilter;
    });
  }, [searchBrandQuery, selectedParentCompany, selectedBrandStatus]);

  return (
    <div className="bg-transparent flex flex-col gap-6 w-full">
      
      {/* ── HEADER PAGE SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-[var(--on-surface-variant)] mb-1 font-medium select-none">
            <span>Settings</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[var(--on-surface)] font-semibold">Brand Management</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--on-surface)] tracking-tight">
            Brand Management
          </h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
            Manage corporate brands, branch networks and operational status.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => console.log("Trigger modal overlay: Create New Brand")}
          className="btn-primary flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          Add Brand
        </button>
      </div>

      {/* ── STATS OVERVIEW SECTION (สวมคอมโพเนนต์กลาง 5 ช่องสล็อตพรีเมียม) ── */}
      <StatsGrid data={statsOverviewData}>
        {/* คอลลัมน์ที่ 5: การ์ดพิเศษสำหรับ CSAT ลอยเด่นประดับองค์กร */}
        <div className="bg-[var(--primary-container)] text-white rounded-[var(--radius-lg)] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[140px]">
          <div className="flex justify-between items-start z-10">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              Avg. Satisfaction
            </span>
            <span className="material-symbols-outlined text-blue-300 text-[20px] select-none pointer-events-none">
              sentiment_satisfied
            </span>
          </div>
          
          <div className="mt-2 z-10">
            <div className="text-3xl font-extrabold tracking-tight">88.5%</div>
            <p className="text-[11px] text-blue-200 mt-1 flex items-center gap-1">
              <span className="font-semibold text-rose-400">↓ -1.2%</span> vs last month
            </p>
          </div>
          
          <span className="material-symbols-outlined absolute right-[-10px] bottom-[-15px] text-blue-800/20 text-8xl pointer-events-none select-none">
            star_rate
          </span>
        </div>
      </StatsGrid>

      {/* ── DATA DATA TABLE CONTAINER ── */}
      <div className="card flex flex-col overflow-hidden bg-white">
        
        {/* BAR FILTERS CONTROLS */}
        <div className="p-4 border-b border-[var(--outline-variant)] bg-[var(--surface-variant)]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:max-w-xs">
            <SearchInput 
              value={searchBrandQuery}
              onChange={setSearchBrandQuery}
              placeholder="Search brands or companies..."
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <SelectInput
              value={selectedParentCompany}
              onChange={setSelectedParentCompany}
              options={[
                { label: "All Parent Companies", value: "All Parent Companies" },
                { label: "Global Retail Inc.", value: "Global Retail Inc." },
                { label: "TechCorp Solutions", value: "TechCorp Solutions" },
                { label: "Hospitality Group", value: "Hospitality Group" }
              ]}
            />
            
            <SelectInput
              value={selectedBrandStatus}
              onChange={setSelectedBrandStatus}
              options={[
                { label: "All Statuses", value: "All Statuses" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" }
              ]}
            />
          </div>
        </div>

        {/* CORE DATA TABLE COMPONENT (สวมปลั๊กคลังตารางตัวจริงระบบจัดเรียง + ดรอปดาวน์) ── */}
        <DataTable 
          columns={brandTableColumns}
          data={filteredCompanyBrands}
          actions={brandTableActions}
          emptyMessage="ไม่พบข้อมูลแบรนด์องค์กรที่ตรงกับเงื่อนไขการค้นหา"
        />

      </div>
    </div>
  );
}