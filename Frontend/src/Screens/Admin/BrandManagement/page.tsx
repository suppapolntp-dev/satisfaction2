"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SelectInput from "@/Components/Inputs/SelectInput";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";
import BrandModal from "@/Components/Modals/BrandModal";
import { searchBrands } from "@/Lib/search/searchEngine";
import { BrandModel } from "@/Types/brand";
import { brandService } from "@/Services/brandService";
import { useModal } from "@/Context/ModalContext";

export default function BrandManagementScreen() {
  const { showConfirm, showSuccess, showError } = useModal();

  const [corporateBrands, setCorporateBrands] = useState<BrandModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchBrandQuery, setSearchBrandQuery] = useState("");
  const [selectedParentCompany, setSelectedParentCompany] = useState("All Parent Companies");
  const [selectedBrandStatus, setSelectedBrandStatus] = useState("All Statuses");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandModel | null>(null);

  // Load from brandService on mount
  useEffect(() => {
    async function fetchBrandsData() {
      try {
        setIsLoading(true);
        const data = await brandService.getBrands();
        setCorporateBrands(data || []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrandsData();
  }, []);

  // KPI Stats
  const statsOverviewData: StatItem[] = useMemo(() => {
    const total = corporateBrands.length;
    const activeCount = corporateBrands.filter((b) => b.status === "Active").length;
    const totalBranches = corporateBrands.reduce((acc, b) => acc + (b.totalBranchesCount || 0), 0);

    const hasData = total > 0;

    return [
      {
        label: "Total Brands (แบรนด์ทั้งหมด)",
        value: hasData ? `${total} แบรนด์` : "-",
        change: "",
        isUp: true,
        icon: "branding_watermark",
        color: "text-blue-600",
      },
      {
        label: "Active Brands (เปิดใช้งาน)",
        value: hasData ? `${activeCount} แบรนด์` : "-",
        change: "",
        isUp: true,
        icon: "check_circle",
        color: "text-emerald-600",
      },
      {
        label: "Total Branches (สาขารวม)",
        value: hasData ? `${totalBranches.toLocaleString()} สาขา` : "-",
        change: "",
        isUp: true,
        icon: "store",
        color: "text-purple-600",
      },
      {
        label: "Avg. CSAT (คะแนนเฉลี่ย)",
        value: hasData ? `${(corporateBrands.reduce((acc, b) => acc + parseFloat(b.csatAverage || "0"), 0) / total).toFixed(1)}%` : "-",
        change: "",
        isUp: true,
        icon: "sentiment_satisfied",
        color: "text-amber-600",
      },
    ];
  }, [corporateBrands]);

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: BrandModel) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (brandData: {
    brandId: string;
    brandName: string;
    brandLogoUrl?: string;
    parentCompanyName: string;
    category: string;
    brandIconName: string;
    status: "Active" | "Inactive";
  }) => {
    try {
      if (editingBrand) {
        const updated = await brandService.updateBrand(editingBrand.id, brandData);
        setCorporateBrands((prev) =>
          prev.map((b) => (b.id === editingBrand.id ? updated : b))
        );
        showSuccess(`แก้ไขข้อมูลแบรนด์ "${brandData.brandName}" สำเร็จเรียบร้อย`);
      } else {
        const created = await brandService.createBrand({
          ...brandData,
          totalBranchesCount: 0,
          totalKiosksCount: 0,
          csatAverage: "0.0%",
        });
        setCorporateBrands((prev) => [created, ...prev]);
        showSuccess(`สร้างแบรนด์ใหม่ "${brandData.brandName}" สำเร็จเรียบร้อย`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกข้อมูลแบรนด์ได้");
    }
  };

  const handleDeleteBrand = (id: string, name: string) => {
    showConfirm({
      title: "ยืนยันการลบแบรนด์?",
      description: `คุณต้องการลบแบรนด์ "${name}" ใช่หรือไม่? หากลบแล้วสาขาที่เกี่ยวข้องจะไม่สามารถขายแบรนด์นี้ได้อีก`,
      variant: "danger",
      confirmText: "ลบแบรนด์",
      onConfirm: async () => {
        try {
          await brandService.deleteBrand(id);
          setCorporateBrands((prev) => prev.filter((b) => b.id !== id));
          showSuccess(`ลบแบรนด์ "${name}" สำเร็จเรียบร้อย`);
        } catch (err: any) {
          showError(err?.message || "ไม่สามารถลบแบรนด์ได้");
        }
      },
    });
  };

  // Table Columns
  const brandTableColumns: TableColumn<BrandModel>[] = useMemo(() => [
    {
      key: "brandIconName",
      label: "Brand Logo & Name",
      render: (brandRow) => (
        <div className="flex items-center gap-3">
          {brandRow.brandLogoUrl ? (
            <img
              src={brandRow.brandLogoUrl}
              alt={brandRow.brandName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-blue-50 text-blue-900 flex items-center justify-center font-bold shadow-2xs select-none">
              <span className="material-symbols-outlined text-xl">
                {brandRow.brandIconName || "restaurant"}
              </span>
            </div>
          )}
          <div>
            <div className="text-body font-bold text-slate-900">{brandRow.brandName}</div>
            <div className="text-sub font-mono">{brandRow.brandId}</div>
          </div>
        </div>
      ),
    },
    { key: "parentCompanyName", label: "Parent Company", sortable: true },
    { 
      key: "category", 
      label: "Category", 
      render: (brandRow) => (
        <span className="text-body text-slate-600">{brandRow.category}</span>
      ),
    },
    { 
      key: "totalBranchesCount", 
      label: "Total Branches", 
      sortable: true,
      render: (brandRow) => (
        <span className="text-body font-bold text-slate-800">
          {brandRow.totalBranchesCount ? `${brandRow.totalBranchesCount.toLocaleString()} สาขา` : "-"}
        </span>
      ),
    },
    { 
      key: "csatAverage", 
      label: "Avg. CSAT", 
      sortable: true,
      render: (brandRow) => (
        <span className="text-body font-bold text-emerald-700">
          {brandRow.csatAverage || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (brandRow) => {
        const isBrandActive = brandRow.status === "Active";
        return (
          <span className={isBrandActive ? "badge-active" : "badge-inactive"}>
            <span className={`w-1.5 h-1.5 rounded-full ${isBrandActive ? "bg-emerald-600" : "bg-slate-400"}`}></span>
            {brandRow.status}
          </span>
        );
      },
    },
  ], []);

  // Table Actions
  const brandTableActions: TableAction<BrandModel>[] = useMemo(() => [
    { 
      label: "Edit Brand", 
      icon: "edit", 
      onClick: (brandRow) => handleOpenEditModal(brandRow),
    },
    { 
      label: "Delete Brand", 
      icon: "delete", 
      variant: "danger", 
      onClick: (brandRow) => handleDeleteBrand(brandRow.id, brandRow.brandName),
    },
  ], []);

  // Filter Logic using modular search engine
  const filteredCorporateBrands = useMemo(() => {
    let result = searchBrands(searchBrandQuery, corporateBrands);

    if (selectedParentCompany !== "All Parent Companies") {
      result = result.filter((b) => b.parentCompanyName === selectedParentCompany);
    }
    if (selectedBrandStatus !== "All Statuses") {
      result = result.filter((b) => b.status === selectedBrandStatus);
    }

    return result;
  }, [corporateBrands, searchBrandQuery, selectedParentCompany, selectedBrandStatus]);

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">store</span>
            Brand Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการแบรนด์ธุรกิจในเครือองค์กร โลโก้แบรนด์ และติดตามคะแนนความพึงพอใจของลูกค้า
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-primary shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Add Brand
        </button>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={statsOverviewData} />

      {/* ─── 3. DATA TABLE (UNIFIED LAYOUT: HEAD -> FILTERS -> DATA -> FOOTER) ─── */}
      <DataTable 
        title="รายชื่อแบรนด์ธุรกิจในเครือ (Brand Directory)"
        subtitle="จัดการแบรนด์ธุรกิจ โลโก้ และติดตามสถิติสาขากับคะแนนความพึงพอใจของลูกค้า"
        icon="corporate_fare"
        badge={
          <span className="badge-active">
            {filteredCorporateBrands.length} แบรนด์
          </span>
        }
        searchPlaceholder="ค้นหาชื่อแบรนด์ หรือบริษัทแม่..."
        searchQuery={searchBrandQuery}
        onSearchChange={setSearchBrandQuery}
        filters={
          <>
            <div className="w-full sm:w-56">
              <SelectInput
                value={selectedParentCompany}
                onChange={setSelectedParentCompany}
                options={[
                  { label: "All Parent Companies", value: "All Parent Companies" },
                  { label: "Central Restaurants Group (CRG)", value: "Central Restaurants Group (CRG)" },
                  { label: "Global Retail Inc.", value: "Global Retail Inc." },
                  { label: "Hospitality Group", value: "Hospitality Group" },
                ]}
              />
            </div>
            
            <div className="w-full sm:w-36">
              <SelectInput
                value={selectedBrandStatus}
                onChange={setSelectedBrandStatus}
                options={[
                  { label: "All Statuses", value: "All Statuses" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>
          </>
        }
        columns={brandTableColumns}
        data={filteredCorporateBrands}
        actions={brandTableActions}
        emptyMessage="ยังไม่มีข้อมูลแบรนด์ในระบบ"
        defaultPageSize={10}
      />

      {/* ─── 4. ADD / EDIT BRAND MODAL ─── */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBrand={editingBrand}
        onSave={handleSaveBrand}
      />

    </div>
  );
}