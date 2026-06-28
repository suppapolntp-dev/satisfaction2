"use client";

import React, { useState, useMemo } from "react";
import SearchInput from "@/Components/Inputs/SearchInput";
import DataTable, { TableColumn } from "@/Components/Tables/DataTable";

// ─── 1. นิยามโครงสร้างประเภทข้อมูล (Descriptive Interfaces) ───
interface ParentCompanyItem {
  companyId: string;
  companyName: string;
}

interface BrandItem {
  brandId: string;
  brandName: string;
}

interface BranchItem {
  branchId: string;
  branchName: string;
  isBranchChecked: boolean;
}

interface AccessAssignmentRow {
  assignmentId: string;
  entityName: string;
  entityType: "User" | "Role";
  inheritanceType: string;
  permissionLevel: string;
  userInitials: string;
}

export default function DataAccessManagementScreen() {
  // ─── 2. ระบบควบคุมสถานะ (Controlled States) ───
  const [searchFilterQueries, setSearchFilterQueries] = useState({
    companyQuery: "",
    brandQuery: "",
    branchQuery: "",
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // อาร์เรย์สำหรับรองรับข้อมูลเชื่อมต่อจาก API หลังบ้าน
  const [parentCompanyList, setParentCompanyList] = useState<ParentCompanyItem[]>([]);
  const [brandList, setBrandList] = useState<BrandItem[]>([]);
  const [branchList, setBranchList] = useState<BranchItem[]>([]);
  const [assignmentList, setAssignmentList] = useState<AccessAssignmentRow[]>([]);

  // ─── 3. ระบบกรองข้อมูล (Client-side Search Filters) ───
  const filteredParentCompanies = useMemo(() => {
    return parentCompanyList.filter((individualCompany) =>
      individualCompany.companyName.toLowerCase().includes(searchFilterQueries.companyQuery.toLowerCase())
    );
  }, [parentCompanyList, searchFilterQueries.companyQuery]);

  const filteredBrands = useMemo(() => {
    return brandList.filter((individualBrand) =>
      individualBrand.brandName.toLowerCase().includes(searchFilterQueries.brandQuery.toLowerCase())
    );
  }, [brandList, searchFilterQueries.brandQuery]);

  const filteredBranches = useMemo(() => {
    return branchList.filter((individualBranch) =>
      individualBranch.branchName.toLowerCase().includes(searchFilterQueries.branchQuery.toLowerCase())
    );
  }, [branchList, searchFilterQueries.branchQuery]);

  // ─── 4. ฟังก์ชันเปลี่ยนค่า Checkbox ฝั่งสาขา ───
  const handleBranchCheckboxChange = (targetBranchId: string) => {
    const updatedBranches = branchList.map((individualBranch) => 
      individualBranch.branchId === targetBranchId
        ? { ...individualBranch, isBranchChecked: !individualBranch.isBranchChecked }
        : individualBranch
    );
    setBranchList(updatedBranches);
  };

  // ─── 5. ชุดคำสั่งปุ่มจัดการท้ายแถวตาราง (Row Actions) ───
  const tableRowActions = [
    {
      label: "Edit",
      icon: "edit",
      onClick: (clickedRow: AccessAssignmentRow) => console.log("Edit entity:", clickedRow.entityName),
    },
    {
      label: "Remove",
      icon: "delete",
      variant: "danger" as const,
      onClick: (clickedRow: AccessAssignmentRow) => console.log("Remove target:", clickedRow.entityName),
    },
  ];

  // ─── 6. การตั้งค่าคอลลัมน์สำหรับ DataTable ───
  const assignTableColumns: TableColumn<AccessAssignmentRow>[] = [
    {
      key: "entityName",
      label: "Entity Name",
      render: (assignmentRow: AccessAssignmentRow) => (
        <div className="flex items-center gap-2 font-medium">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-bold flex items-center justify-center">
            {assignmentRow.userInitials}
          </div>
          <span>{assignmentRow.entityName}</span>
        </div>
      ),
    },
    { key: "entityType", label: "Type" },
    {
      key: "inheritanceType",
      label: "Inheritance",
      render: (assignmentRow: AccessAssignmentRow) => (
        <span className="inline-flex items-center gap-1 text-[var(--on-surface-variant)]">
          <span className="material-symbols-outlined text-[16px]">
            {assignmentRow.entityType === "Role" ? "account_tree" : "arrow_right_alt"}
          </span>
          {assignmentRow.inheritanceType}
        </span>
      ),
    },
    {
      key: "permissionLevel",
      label: "Permission Level",
      render: (assignmentRow: AccessAssignmentRow) => {
        const isFullAccess = assignmentRow.permissionLevel === "Full Access";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isFullAccess
                ? "bg-[var(--secondary-container)] text-[var(--secondary)]"
                : "bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
            }`}
          >
            {assignmentRow.permissionLevel}
          </span>
        );
      },
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)]">Data Access Management</h2>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Configure data visibility and access scope for roles and users.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => console.log("Resetting filters configuration...")}
            className="btn-secondary flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list_off</span>
            Reset Filters
          </button>
          <button
            type="button"
            onClick={() => console.log("Saving current scope config:", { selectedCompanyId, selectedBrandId })}
            className="btn-primary flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Configuration
          </button>
        </div>
      </div>

      {/* BENTO SCOPE SELECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 1. Parent Group Card */}
        <div className="card flex flex-col h-[400px]">
          <div className="p-4 border-b border-[var(--outline-variant)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[var(--primary)] text-[20px]">domain</span>
              <h3 className="text-xl font-bold text-[var(--on-surface)]">1. Parent Group</h3>
            </div>
            <SearchInput
              value={searchFilterQueries.companyQuery}
              onChange={(updatedValue) => setSearchFilterQueries({ ...searchFilterQueries, companyQuery: updatedValue })}
              placeholder="Search groups..."
            />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
            {filteredParentCompanies.map((individualCompany) => {
              const isCompanySelected = selectedCompanyId === individualCompany.companyId;
              return (
                <button
                  key={individualCompany.companyId}
                  type="button"
                  onClick={() => setSelectedCompanyId(individualCompany.companyId)}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors text-sm ${
                    isCompanySelected
                      ? "bg-[var(--secondary-container)] text-[var(--on-surface)] border border-[var(--primary)] font-medium"
                      : "hover:bg-[var(--surface-variant)] text-[var(--on-surface)]"
                  }`}
                >
                  <span>{individualCompany.companyName}</span>
                  {isCompanySelected && (
                    <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Brand Card */}
        <div className="card flex flex-col h-[400px]">
          <div className="p-4 border-b border-[var(--outline-variant)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[var(--primary)] text-[20px]">branding_watermark</span>
              <h3 className="text-xl font-bold text-[var(--on-surface)]">2. Brand</h3>
            </div>
            <SearchInput
              value={searchFilterQueries.brandQuery}
              onChange={(updatedValue) => setSearchFilterQueries({ ...searchFilterQueries, brandQuery: updatedValue })}
              placeholder="Filter brands..."
            />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
            {filteredBrands.map((individualBrand) => {
              const isBrandSelected = selectedBrandId === individualBrand.brandId;
              return (
                <button
                  key={individualBrand.brandId}
                  type="button"
                  onClick={() => setSelectedBrandId(individualBrand.brandId)}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors text-sm ${
                    isBrandSelected
                      ? "bg-[var(--secondary-container)] text-[var(--on-surface)] border border-[var(--primary)] font-medium"
                      : "hover:bg-[var(--surface-variant)] text-[var(--on-surface)]"
                  }`}
                >
                  <span>{individualBrand.brandName}</span>
                  {isBrandSelected && (
                    <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Branch Card */}
        <div className="card flex flex-col h-[400px]">
          <div className="p-4 border-b border-[var(--outline-variant)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[var(--primary)] text-[20px]">store</span>
              <h3 className="text-xl font-bold text-[var(--on-surface)]">3. Branch</h3>
            </div>
            <SearchInput
              value={searchFilterQueries.branchQuery}
              onChange={(updatedValue) => setSearchFilterQueries({ ...searchFilterQueries, branchQuery: updatedValue })}
              placeholder="Search branch name..."
            />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
            {filteredBranches.map((individualBranch) => (
              <button
                key={individualBranch.branchId}
                type="button"
                onClick={() => handleBranchCheckboxChange(individualBranch.branchId)}
                className="w-full flex items-center justify-between p-2 rounded text-left hover:bg-[var(--surface-variant)] transition-colors text-[var(--on-surface)] text-sm"
              >
                <span>{individualBranch.branchName}</span>
                <input
                  type="checkbox"
                  checked={individualBranch.isBranchChecked}
                  onChange={() => handleBranchCheckboxChange(individualBranch.branchId)}
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                  className="w-4 h-4 rounded border-[var(--outline-variant)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer accent-[var(--primary)]"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MID-PAGE ACTION STRIP */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => console.log("Applying dynamic scope settings to list bellow...")}
          className="px-6 py-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-variant)] text-[var(--on-surface)] text-xs font-semibold shadow-sm flex items-center gap-2 hover:bg-[var(--outline-variant)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Apply Scope to Table Below
        </button>
      </div>

      {/* ASSIGNMENTS DATATABLE SECTION */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--outline-variant)] flex justify-between items-center bg-[var(--surface)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--on-surface-variant)]">group</span>
            <h3 className="text-xl font-bold text-[var(--on-surface)]">
              Current Assignments for Selected Scope
            </h3>
          </div>
          <button
            type="button"
            onClick={() => console.log("Opening Add Entity form overlay...")}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Entity
          </button>
        </div>

        <DataTable
          columns={assignTableColumns}
          data={assignmentList}
          actions={tableRowActions}
          emptyMessage="No data scope assignments configured for this system layer."
        />
      </div>
    </main>
  );
}