"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import { saveActiveDataAccessProfile } from "@/Lib/dataAccessContext";
import { searchUsers } from "@/Lib/search/searchEngine";
import DataAccessModal from "@/Components/Modals/DataAccessModal";
import { 
  HierarchyScopeLevel, 
  BranchItem, 
  ProvinceItem, 
  RegionItem, 
  BrandItem, 
  UserAccessRecord 
} from "@/Types/dataAccess";
import { 
  dataAccessService, 
  computePermissionsByTier, 
} from "@/Services/dataAccessService";
import { brandService } from "@/Services/brandService";
import { branchService } from "@/Services/branchService";

// ==========================================================================
// ─── MAIN DATA ACCESS MANAGEMENT COMPONENT
// ==========================================================================

export default function DataAccessManagementScreen() {
  const [usersList, setUsersList] = useState<UserAccessRecord[]>([]);
  const [availableBrandsList, setAvailableBrandsList] = useState<string[]>([]);
  const [availableBranchesList, setAvailableBranchesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── SELECTION STATE FOR HIERARCHY DRILL-DOWN ───
  const [selectedScopeLevel, setSelectedScopeLevel] = useState<HierarchyScopeLevel | null>("SUPER_ADMIN");
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionItem | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceItem | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  // Tree Expansion States
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [expandedProvinces, setExpandedProvinces] = useState<Record<string, boolean>>({});

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccessRecord | null>(null);

  // Dynamic Organization Hierarchy constructed from DB
  const [brandHierarchy, setBrandHierarchy] = useState<BrandItem[]>([]);

  // Load from services on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [accessUsers, brands, branches] = await Promise.all([
          dataAccessService.getDataAccessUsers(),
          brandService.getBrands(),
          branchService.getBranches(),
        ]);
        setUsersList(accessUsers || []);
        
        const bNames = brands ? brands.map((b) => b.brandName) : [];
        const brNames = branches ? branches.map((b) => b.name) : [];
        setAvailableBrandsList(bNames);
        setAvailableBranchesList(brNames);

        // Build dynamic hierarchy tree
        if (brands && brands.length > 0) {
          const tree: BrandItem[] = brands.map((b, bIdx) => {
            const relatedBranches = (branches || []).filter(
              (br) => br.brand.includes(b.brandName) || (br.brands && br.brands.includes(b.brandName))
            );

            // Group by region
            const regionsMap = new Map<string, typeof relatedBranches>();
            relatedBranches.forEach((br) => {
              const reg = br.region || "ภูมิภาคทั่วไป";
              if (!regionsMap.has(reg)) regionsMap.set(reg, []);
              regionsMap.get(reg)!.push(br);
            });

            const regionsList: RegionItem[] = Array.from(regionsMap.entries()).map(([regName, regBranches], rIdx) => {
              // Group by province
              const provMap = new Map<string, typeof regBranches>();
              regBranches.forEach((br) => {
                const prov = br.province || "จังหวัดทั่วไป";
                if (!provMap.has(prov)) provMap.set(prov, []);
                provMap.get(prov)!.push(br);
              });

              const provincesList: ProvinceItem[] = Array.from(provMap.entries()).map(([provName, provBranches], pIdx) => ({
                id: `PRV_${bIdx}_${rIdx}_${pIdx}`,
                name: provName,
                branches: provBranches.map((br) => ({
                  id: br.id,
                  code: br.code,
                  name: br.name,
                  brandName: br.brand,
                  kiosksCount: br.kioskCount || 1,
                  csatScore: br.satisfaction ? `${br.satisfaction}%` : "-",
                })),
              }));

              return {
                id: `REG_${bIdx}_${rIdx}`,
                name: regName,
                provinces: provincesList,
              };
            });

            return {
              id: `BRAND_${bIdx}`,
              name: b.brandName,
              logoIcon: "store",
              regions: regionsList,
            };
          });

          setBrandHierarchy(tree);
        } else {
          setBrandHierarchy([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // KPI Stats
  const dataAccessStats: StatItem[] = useMemo(() => {
    const total = usersList.length;
    const multiBrandCount = usersList.filter((u) => u.assignedBrands && u.assignedBrands.length > 1).length;
    const multiBranchCount = usersList.filter((u) => u.assignedBranches && u.assignedBranches.length > 1).length;

    const hasData = total > 0;

    return [
      {
        label: "Total Assigned Users",
        value: hasData ? `${total} บัญชี` : "-",
        change: "",
        isUp: true,
        icon: "lock_person",
        color: "text-blue-600",
      },
      {
        label: "Multi-Brand Accounts",
        value: hasData ? `${multiBrandCount} บัญชี` : "-",
        change: "",
        isUp: true,
        icon: "corporate_fare",
        color: "text-emerald-600",
      },
      {
        label: "Multi-Branch Scopes",
        value: hasData ? `${multiBranchCount} บัญชี` : "-",
        change: "",
        isUp: true,
        icon: "storefront",
        color: "text-purple-600",
      },
      {
        label: "Governance Status",
        value: hasData ? "Active" : "-",
        change: "",
        isUp: true,
        icon: "verified_user",
        color: "text-amber-600",
      },
    ];
  }, [usersList]);

  // ─── CLICK HANDLERS FOR LEFT TREE SELECTION ───

  const handleSelectSuperAdminView = () => {
    setSelectedScopeLevel("SUPER_ADMIN");
    setSelectedBrand(null);
    setSelectedRegion(null);
    setSelectedProvince(null);
    setSelectedBranch(null);
  };

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedScopeLevel("BRAND");
    setSelectedBrand(brand);
    setSelectedRegion(null);
    setSelectedProvince(null);
    setSelectedBranch(null);
    setExpandedBrands((prev) => ({ ...prev, [brand.id]: !prev[brand.id] }));
  };

  const handleSelectRegion = (brand: BrandItem, region: RegionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScopeLevel("REGION");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedBranch(null);
    setExpandedRegions((prev) => ({ ...prev, [region.id]: !prev[region.id] }));
  };

  const handleSelectProvince = (brand: BrandItem, region: RegionItem, province: ProvinceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScopeLevel("PROVINCE");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(province);
    setSelectedBranch(null);
    setExpandedProvinces((prev) => ({ ...prev, [province.id]: !prev[province.id] }));
  };

  const handleSelectBranch = (brand: BrandItem, region: RegionItem, province: ProvinceItem, branch: BranchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScopeLevel("BRANCH");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(province);
    setSelectedBranch(branch);
  };

  // ─── FILTER USERS BASED ON THE SELECTED SCOPE LEVEL ───
  const filteredUsers = useMemo(() => {
    if (selectedScopeLevel === "SUPER_ADMIN") {
      return usersList;
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      return usersList.filter((u) => u.assignedBrands.some((b) => selectedBrand.name.includes(b) || b.includes(selectedBrand.name)));
    }
    if (selectedScopeLevel === "REGION" && selectedRegion && selectedBrand) {
      return usersList.filter(
        (u) =>
          u.assignedBrands.some((b) => selectedBrand.name.includes(b) || b.includes(selectedBrand.name)) &&
          u.assignedRegions.includes(selectedRegion.name)
      );
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince && selectedBrand) {
      return usersList.filter(
        (u) =>
          u.assignedBrands.some((b) => selectedBrand.name.includes(b) || b.includes(selectedBrand.name)) &&
          u.assignedProvinces.includes(selectedProvince.name)
      );
    }
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      return usersList.filter(
        (u) =>
          u.assignedBranches.includes(selectedBranch.name) ||
          u.assignedBranches.some((b) => b.includes("ทุกสาขา"))
      );
    }
    return usersList;
  }, [usersList, selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccessRecord) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUserForm = async (userData: any) => {
    const saved = await dataAccessService.saveDataAccessUser({
      ...userData,
      status: userData.status || "Active",
    });

    setUsersList((prev) => {
      const idx = prev.findIndex((u) => u.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });

    setIsModalOpen(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("คุณต้องการเพิกถอนสิทธิ์ Data Access ของผู้ใช้นี้หรือไม่?")) {
      await dataAccessService.deleteDataAccessUser(id);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">admin_panel_settings</span>
            Data Access & Hierarchy Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดสิทธิ์การมองเห็นข้อมูล 5 ระดับ (Super Admin → Brand → Region → Province → Branch)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn-primary text-xs shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          + กำหนดสิทธิ์ใหม่ (Assign Scope)
        </button>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={dataAccessStats} />

      {/* ─── 3. MAIN WORKSPACE: TREE HIERARCHY + RIGHT DETAIL TABLE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── LEFT: 5-TIER HIERARCHY TREE VIEW ─── */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-900 text-base">account_tree</span>
              โครงสร้างองค์กร (Org Hierarchy Tree)
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">คลิกเพื่อกรองข้อมูล</span>
          </div>

          {/* Super Admin Top-Level Button */}
          <div
            onClick={handleSelectSuperAdminView}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
              selectedScopeLevel === "SUPER_ADMIN"
                ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">domain</span>
              <span>🏢 ภาพรวมระดับองค์กร (Super Admin Level)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">All</span>
          </div>

          {/* Dynamic Brands Tree */}
          <div className="space-y-1.5 pt-1">
            {brandHierarchy.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีข้อมูลแบรนด์ในระบบ</p>
            ) : (
              brandHierarchy.map((brand) => {
                const isBrandExpanded = expandedBrands[brand.id];
                const isBrandSelected = selectedScopeLevel === "BRAND" && selectedBrand?.id === brand.id;

                return (
                  <div key={brand.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                    {/* Brand Level Row */}
                    <div
                      onClick={() => handleSelectBrand(brand)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer text-xs font-bold transition-colors ${
                        isBrandSelected
                          ? "bg-blue-50 text-blue-900 border-l-4 border-blue-900"
                          : "bg-slate-50/70 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-blue-900">{brand.logoIcon}</span>
                        <span>{brand.name}</span>
                      </div>
                      <span className="material-symbols-outlined text-sm text-slate-400">
                        {isBrandExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>

                    {/* Region Level Accordion */}
                    {isBrandExpanded && (
                      <div className="pl-3 pr-2 py-1 space-y-1 bg-white border-t border-slate-100">
                        {brand.regions.length === 0 ? (
                          <p className="text-[10px] text-slate-400 py-1 pl-2">ยังไม่มีสาขา</p>
                        ) : (
                          brand.regions.map((region) => {
                            const isRegionExpanded = expandedRegions[region.id];
                            const isRegionSelected = selectedScopeLevel === "REGION" && selectedRegion?.id === region.id;

                            return (
                              <div key={region.id} className="rounded-xl overflow-hidden border border-slate-100">
                                <div
                                  onClick={(e) => handleSelectRegion(brand, region, e)}
                                  className={`p-2 flex items-center justify-between text-xs font-semibold cursor-pointer ${
                                    isRegionSelected ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-xs text-slate-500">map</span>
                                    <span>{region.name}</span>
                                  </div>
                                  <span className="material-symbols-outlined text-xs text-slate-400">
                                    {isRegionExpanded ? "expand_less" : "expand_more"}
                                  </span>
                                </div>

                                {/* Province Level */}
                                {isRegionExpanded && (
                                  <div className="pl-3 pr-1 py-1 space-y-1 bg-slate-50/50">
                                    {region.provinces.map((prov) => {
                                      const isProvExpanded = expandedProvinces[prov.id];
                                      const isProvSelected = selectedScopeLevel === "PROVINCE" && selectedProvince?.id === prov.id;

                                      return (
                                        <div key={prov.id} className="rounded-lg overflow-hidden">
                                          <div
                                            onClick={(e) => handleSelectProvince(brand, region, prov, e)}
                                            className={`p-1.5 flex items-center justify-between text-[11px] font-medium cursor-pointer ${
                                              isProvSelected ? "bg-purple-100 text-purple-900 font-bold" : "hover:bg-slate-100 text-slate-600"
                                            }`}
                                          >
                                            <span>จ.{prov.name}</span>
                                            <span className="material-symbols-outlined text-[12px] text-slate-400">
                                              {isProvExpanded ? "expand_less" : "expand_more"}
                                            </span>
                                          </div>

                                          {/* Branch Level */}
                                          {isProvExpanded && (
                                            <div className="pl-2 py-0.5 space-y-0.5">
                                              {prov.branches.map((br) => {
                                                const isBrSelected = selectedScopeLevel === "BRANCH" && selectedBranch?.id === br.id;
                                                return (
                                                  <div
                                                    key={br.id}
                                                    onClick={(e) => handleSelectBranch(brand, region, prov, br, e)}
                                                    className={`p-1.5 rounded text-[10px] cursor-pointer flex items-center justify-between ${
                                                      isBrSelected
                                                        ? "bg-blue-900 text-white font-bold"
                                                        : "text-slate-600 hover:bg-slate-100"
                                                    }`}
                                                  >
                                                    <span className="truncate">{br.name}</span>
                                                    <span className="font-mono opacity-80 shrink-0 ml-1">{br.kiosksCount} ตู้</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT: ASSIGNED USERS DETAIL TABLE ─── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-900">verified_user</span>
                  รายชื่อผู้ได้รับสิทธิ์ (Authorized Users in Selected Scope)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ขอบเขตปัจจุบัน: <span className="font-bold text-blue-900">
                    {selectedScopeLevel === "SUPER_ADMIN" ? "องค์กร (Super Admin Level)" : selectedBrand?.name || "ทั้งหมด"}
                    {selectedRegion ? ` → ${selectedRegion.name}` : ""}
                    {selectedProvince ? ` → จ.${selectedProvince.name}` : ""}
                    {selectedBranch ? ` → ${selectedBranch.name}` : ""}
                  </span>
                </p>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full w-fit">
                {filteredUsers.length} บัญชี
              </span>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">ยังไม่มีข้อมูลสิทธิ์การเข้าถึงข้อมูลในระบบ</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{user.userName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-100">
                          {user.tierLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {user.userEmail} • {user.userPhone}
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px] pt-0.5">
                        <span className="font-bold text-slate-700">แบรนด์:</span>
                        {user.assignedBrands.map((b, i) => (
                          <span key={i} className="text-slate-600 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(user)}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ─── 4. ADD / EDIT DATA ACCESS MODAL ─── */}
      <DataAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        availableBrands={availableBrandsList}
        availableBranches={availableBranchesList}
        onSave={handleSaveUserForm}
      />

    </div>
  );
}