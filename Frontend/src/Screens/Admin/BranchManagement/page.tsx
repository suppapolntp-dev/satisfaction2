"use client";

import React, { useState, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput from "@/Components/Inputs/SelectInput";

// 1. นิยามโครงสร้างข้อมูลหลักของสาขา
interface BranchModel {
  id: string;
  code: string;
  name: string;
  brand: string;
  company: string;
  status: "Active" | "Inactive";
  satisfaction: number | null;
}

export default function BranchManagementScreen() {
  const [branches] = useState<BranchModel[]>([]);

  // Controlled States สำหรับฟิลเตอร์คัดกรองข้อมูล
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All Parent Companies");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // ข้อมูลสถิติสำหรับส่งต่อให้ StatsGrid ส่วนกลาง
  const statsData: StatItem[] = useMemo(() => [
    { label: "Total Branches", value: "1,204", change: "+12", isUp: true, icon: "storefront", color: "text-blue-600" },
    { label: "Active Branches", value: "1,150", change: "95.5% operational", isUp: true, icon: "check_circle", color: "text-emerald-500" },
    { label: "Average Satisfaction", value: "88.7%", change: "1.2% vs last quarter", isUp: true, icon: "sentiment_satisfied", color: "text-purple-600" },
    { label: "High-Performing", value: "42", change: "Branches > 95% CSAT", isUp: true, icon: "star", color: "text-amber-500" }
  ], []);

  // ตัวเลือกออปชันสำหรับกล่องคอมโพเนนต์ SelectInput (ไม่ตั้งชื่อมักง่าย)
  const companyOptions = [
    { value: "All Parent Companies", label: "All Parent Companies" },
    { value: "Acme Corp", label: "Acme Corp" },
    { value: "Global Retail Inc", label: "Global Retail Inc" }
  ];

  const brandOptions = [
    { value: "All Brands", label: "All Brands" },
    { value: "Apex Retail", label: "Apex Retail" },
    { value: "Global Travels", label: "Global Travels" },
    { value: "Lux Boutique", label: "Lux Boutique" }
  ];

  const statusOptions = [
    { value: "All Statuses", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ];

  // 2. กำหนดโครงสร้างคอลัมน์ (ถอดคอลัมน์ Actions แมนนวลออกเพื่อให้ตารางกลางควบคุมเอง)
  const columns: TableColumn<BranchModel>[] = [
    { key: "code", label: "Branch Code", sortable: true },
    { key: "name", label: "Branch Name", sortable: true },
    { 
      key: "brand", 
      label: "Brand", 
      render: (branch) => (
        <a href="#" className="text-blue-900 hover:underline font-medium dark:text-blue-400">
          {branch.brand}
        </a>
      )
    },
    { 
      key: "company", 
      label: "Parent Company", 
      render: (branch) => <span className="text-neutral-600 dark:text-neutral-400">{branch.company}</span> 
    },
    { 
      key: "status", 
      label: "Status", 
      render: (branch) => (
        <span 
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border select-none ${
            branch.status === "Active" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-rose-50 text-rose-600 border-rose-200"
          }`}
        >
          {branch.status}
        </span>
      )
    },
    { 
      key: "satisfaction", 
      label: "Satisfaction", 
      sortable: true, 
      render: (branch) => branch.satisfaction ? (
        <span className={`block text-right font-medium ${branch.satisfaction < 75 ? "text-rose-600 font-bold" : "text-neutral-700 dark:text-neutral-300"}`}>
          {branch.satisfaction}%
        </span>
      ) : <span className="block text-right text-neutral-400">--</span>
    }
  ];

  // ชุดเมนูคำสั่งท้ายแถวตาราง
  const tableActions: TableAction<BranchModel>[] = [
    { label: "Edit Branch", icon: "edit", onClick: (branch) => alert(`แก้ไขข้อมูลสาขา: ${branch.code}`) },
    { label: "View CSAT History", icon: "history", onClick: (branch) => console.log("Viewing metrics for:", branch.code) },
    { label: "Deactivate", icon: "block", variant: "danger", onClick: (branch) => console.log("Deactivating branch:", branch.id) },
  ];

  // ระบบตัวกรองข้อมูลฝั่ง Client-side
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany = selectedCompany === "All Parent Companies" || branch.company === selectedCompany;
      const matchesBrand = selectedBrand === "All Brands" || branch.brand === selectedBrand;
      const matchesStatus = selectedStatus === "All Statuses" || branch.status === selectedStatus;
      
      return matchesSearch && matchesCompany && matchesBrand && matchesStatus;
    });
  }, [branches, searchQuery, selectedCompany, selectedBrand, selectedStatus]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      
      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200 bg-white gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">Branch Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage physical and logical locations across your brand portfolio.</p>
        </div>
        <button 
          type="button"
          onClick={() => console.log("Open Add Branch Form modal")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 outline-none touch-manipulation"
        >
          <span className="material-symbols-outlined text-[16px] select-none pointer-events-none">add</span> 
          Add Branch
        </button>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 p-6 flex flex-col gap-6 max-w-[1440px] w-full mx-auto overflow-y-auto">
        
        {/* STATS OVERVIEW GRID */}
        <StatsGrid data={statsData}>
          <div className="bg-blue-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start z-10">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Avg. Satisfaction</span>
              <span className="material-symbols-outlined text-blue-300 text-[20px] select-none pointer-events-none">sentiment_satisfied</span>
            </div>
            <div className="mt-2 z-10">
              <div className="text-3xl font-extrabold tracking-tight">88.7%</div>
              <p className="text-[11px] text-blue-200 mt-1 flex items-center gap-1">
                <span className="font-semibold text-emerald-400">↑ +1.2%</span> vs last quarter
              </p>
            </div>
            <span className="material-symbols-outlined absolute right-[-10px] bottom-[-15px] text-blue-800/40 text-8xl pointer-events-none select-none">star_rate</span>
          </div>
        </StatsGrid>

        {/* DATA TABLE WRAPPER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* TABLE FILTERS BAR (สวมคอมโพเนนต์ย่อยส่วนกลางทั้งหมด ครบเซ็ต) */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search branch name or code..." 
            />
            
            <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
              <SelectInput 
                value={selectedCompany} 
                onChange={setSelectedCompany} 
                options={companyOptions} 
              />

              <SelectInput 
                value={selectedBrand} 
                onChange={setSelectedBrand} 
                options={brandOptions} 
              />

              <SelectInput 
                value={selectedStatus} 
                onChange={setSelectedStatus} 
                options={statusOptions} 
              />
              
              <button type="button" aria-label="More filters" className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-neutral-500 flex items-center justify-center outline-none">
                <span className="material-symbols-outlined text-[18px] select-none pointer-events-none">filter_list</span>
              </button>
            </div>
          </div>

          {/* GENERATED DATA TABLE WITH BUILT-IN SORT & DROPDOWN */}
          <DataTable 
            columns={columns} 
            data={filteredBranches} 
            actions={tableActions} 
            emptyMessage="ไม่พบข้อมูลสาขาที่ตรงกับเงื่อนไขการค้นหา"
          />

          {/* TABLE PAGINATION FOOTER */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-neutral-500 text-xs font-medium select-none">
            <div>Showing 1 to {filteredBranches.length} of {filteredBranches.length} branches</div>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-not-allowed" disabled>
                <span className="material-symbols-outlined text-[16px] flex items-center justify-center">chevron_left</span>
              </button>
              <button type="button" className="px-2.5 py-1 border border-blue-950 bg-blue-50 text-blue-900 rounded-md font-bold">1</button>
              <button type="button" className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors">2</button>
              <button type="button" className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors">3</button>
              <span className="px-1 text-neutral-400">...</span>
              <button type="button" className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors">24</button>
              <button type="button" className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[16px] flex items-center justify-center">chevron_right</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}