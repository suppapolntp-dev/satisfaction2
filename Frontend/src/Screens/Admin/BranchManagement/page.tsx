"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput from "@/Components/Inputs/SelectInput";
import BranchModal from "@/Components/Modals/BranchModal";
import { BranchModel } from "@/Types/branch";
import { branchService } from "@/Services/branchService";
import { brandService } from "@/Services/brandService";
import { searchBranches } from "@/Lib/search/searchEngine";

export default function BranchManagementScreen() {
  const [branchesList, setBranchesList] = useState<BranchModel[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Controlled Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchModel | null>(null);

  // Load from services on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [branches, brands] = await Promise.all([
          branchService.getBranches(),
          brandService.getBrands(),
        ]);
        setBranchesList(branches || []);
        setAvailableBrands(brands ? brands.map((b) => b.brandName) : []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // KPI Stats
  const statsOverviewData: StatItem[] = useMemo(() => {
    const total = branchesList.length;
    const activeLocations = branchesList.filter((b) => b.status === "Active").length;
    const dualBrandCount = branchesList.filter((b) => (b.brands && b.brands.length > 1) || b.brand.includes("+")).length;
    const totalVotes = branchesList.reduce((acc, b) => acc + (b.totalVotes || 0), 0);

    const hasData = total > 0;

    return [
      {
        label: "Total Branches (สาขาทั้งหมด)",
        value: hasData ? `${total} สาขา` : "-",
        change: "",
        isUp: true,
        icon: "storefront",
        color: "text-blue-600",
      },
      {
        label: "Dual-Brand Co-Locations",
        value: hasData ? `${dualBrandCount} สาขา` : "-",
        change: "",
        isUp: true,
        icon: "join_inner",
        color: "text-purple-600",
      },
      {
        label: "Active Branches (เปิดบริการ)",
        value: hasData ? `${activeLocations} สาขา` : "-",
        change: "",
        isUp: true,
        icon: "check_circle",
        color: "text-emerald-600",
      },
      {
        label: "Total Customer Votes",
        value: hasData ? `${totalVotes.toLocaleString()} โหวต` : "-",
        change: "",
        isUp: true,
        icon: "poll",
        color: "text-amber-600",
      },
    ];
  }, [branchesList]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: BranchModel) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (branchData: {
    code: string;
    name: string;
    brand: string;
    brands: string[];
    region: string;
    province: string;
    kioskCount: number;
    status: "Active" | "Inactive";
  }) => {
    if (editingBranch) {
      const updated = await branchService.updateBranch(editingBranch.id, branchData);
      setBranchesList((prev) =>
        prev.map((b) => (b.id === editingBranch.id ? updated : b))
      );
    } else {
      const created = await branchService.createBranch({
        ...branchData,
        satisfaction: 0,
        totalVotes: 0,
      });
      setBranchesList((prev) => [created, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Table Columns
  const branchTableColumns: TableColumn<BranchModel>[] = [
    {
      key: "code",
      label: "Branch Code",
      sortable: true,
      render: (b) => (
        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
          {b.code}
        </span>
      ),
    },
    {
      key: "name",
      label: "Branch Name & Brands (สาขา & แบรนด์)",
      sortable: true,
      render: (b) => {
        const brands = b.brands && b.brands.length > 0 ? b.brands : [b.brand];

        return (
          <div>
            <div className="text-body font-bold text-slate-900">
              {b.name}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {brands.map((brandName, idx) => (
                <span key={idx} className="text-sub border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
                  {brandName}
                </span>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      key: "region",
      label: "Area / Province (ภาค & จังหวัด)",
      sortable: true,
      render: (b) => (
        <div>
          <span className="text-body font-semibold text-slate-800">{b.region}</span>
          <span className="text-sub block font-medium">จ. {b.province}</span>
        </div>
      ),
    },
    {
      key: "kioskCount",
      label: "Kiosks",
      sortable: true,
      render: (b) => (
        <span className="inline-flex items-center gap-1 text-body font-bold text-slate-700">
          <span className="material-symbols-outlined text-sm text-blue-900">tablet_mac</span>
          {b.kioskCount} ตู้
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (b) => (
        <span className={b.status === "Active" ? "badge-active" : "badge-inactive"}>
          <span className={`w-1.5 h-1.5 rounded-full ${b.status === "Active" ? "bg-emerald-600" : "bg-slate-400"}`} />
          {b.status}
        </span>
      ),
    },
  ];

  // Actions
  const branchTableActions: TableAction<BranchModel>[] = [
    {
      label: "Edit Branch",
      icon: "edit",
      onClick: (b) => handleOpenEditModal(b),
    },
    {
      label: "Delete Branch",
      icon: "delete",
      variant: "danger",
      onClick: async (b) => {
        if (confirm(`คุณต้องการลบสาขา "${b.name}" หรือไม่?`)) {
          await branchService.deleteBranch(b.id);
          setBranchesList((prev) => prev.filter((item) => item.id !== b.id));
        }
      },
    },
  ];

  // Filtering using modular search algorithm
  const filteredBranches = useMemo(() => {
    let result = searchBranches(searchQuery, branchesList);

    if (selectedBrand !== "All Brands") {
      result = result.filter((b) => b.brand.includes(selectedBrand) || (b.brands && b.brands.includes(selectedBrand)));
    }
    if (selectedRegion !== "All Regions") {
      result = result.filter((b) => b.region === selectedRegion);
    }
    if (selectedStatus !== "All Statuses") {
      result = result.filter((b) => b.status === selectedStatus);
    }

    return result;
  }, [branchesList, searchQuery, selectedBrand, selectedRegion, selectedStatus]);

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">storefront</span>
            Branch & Co-Location Store Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการข้อมูลสาขาในเครือ CRG รองรับสาขา Dual-Brand (เช่น Mister Donut + Arigato ในสาขาเดียวกัน)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-primary text-xs shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          + เพิ่มสาขาใหม่
        </button>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={statsOverviewData} />

      {/* ─── 3. SEARCH & FILTERS ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="ค้นหาชื่อสาขา, รหัสสาขา, แบรนด์ หรือจังหวัด..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <div className="w-full sm:w-44">
            <SelectInput
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={[
                { value: "All Brands", label: "ทุกแบรนด์ (All Brands)" },
                ...availableBrands.map((brandName) => ({
                  value: brandName,
                  label: brandName,
                })),
              ]}
            />
          </div>

          <div className="w-full sm:w-44">
            <SelectInput
              value={selectedRegion}
              onChange={setSelectedRegion}
              options={[
                { value: "All Regions", label: "ทุกภาค (All Regions)" },
                { value: "ภาคเหนือ", label: "ภาคเหนือ" },
                { value: "ภาคตะวันออก", label: "ภาคตะวันออก" },
                { value: "กรุงเทพฯ และปริมณฑล", label: "กรุงเทพฯ และปริมณฑล" },
                { value: "ภาคใต้", label: "ภาคใต้" },
                { value: "ภาคตะวันออกเฉียงเหนือ", label: "ภาคตะวันออกเฉียงเหนือ" },
              ]}
            />
          </div>

          <div className="w-full sm:w-40">
            <SelectInput
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: "All Statuses", label: "ทุกสถานะ" },
                { value: "Active", label: "Active (เปิดบริการ)" },
                { value: "Inactive", label: "Inactive (ปิดปรับปรุง)" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ─── 4. DATA TABLE ─── */}
      <DataTable
        columns={branchTableColumns}
        data={filteredBranches}
        actions={branchTableActions}
        emptyMessage="ยังไม่มีข้อมูลสาขาในระบบ"
      />

      {/* ─── 5. ADD / EDIT BRANCH MODAL ─── */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBranch={editingBranch}
        masterBrands={availableBrands}
        onSave={handleSaveBranch}
      />

    </div>
  );
}