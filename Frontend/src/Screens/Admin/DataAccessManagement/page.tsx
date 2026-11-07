"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { saveActiveDataAccessProfile } from "@/Lib/dataAccessContext";
import { searchUsers } from "@/Lib/search/searchEngine";
import DataAccessModal from "@/Components/Modals/DataAccessModal";
import { 
  HierarchyScopeLevel, 
  BranchItem, 
  ProvinceItem, 
  RegionItem, 
  BrandItem, 
  UserAccessRecord,
  CustomScopeGroup,
} from "@/Types/dataAccess";
import { 
  dataAccessService, 
  computePermissionsByTier, 
} from "@/Services/dataAccessService";
import { brandService } from "@/Services/brandService";
import { branchService } from "@/Services/branchService";
import { customScopeService } from "@/Services/customScopeService";
import CustomScopeModal from "@/Components/Modals/CustomScopeModal";
import { tierLevelService, TierLevelModel } from "@/Services/tierLevelService";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";
import SelectInput from "@/Components/Inputs/SelectInput";
import TierLevelManagementModal from "@/Components/Modals/TierLevelManagementModal";
import TierLevelFormModal from "@/Components/Modals/TierLevelFormModal";
import { useModal } from "@/Context/ModalContext";

// ==========================================================================
// ─── MAIN DATA ACCESS MANAGEMENT COMPONENT
// ==========================================================================

export interface DataAccessManagementScreenProps {
  hideHeader?: boolean;
}

export default function DataAccessManagementScreen({
  hideHeader = false,
}: DataAccessManagementScreenProps = {}) {
  const { showConfirm, showSuccess, showError } = useModal();

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
  const [treeSearchQuery, setTreeSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [expandedProvinces, setExpandedProvinces] = useState<Record<string, boolean>>({});

  const handleToggleNode = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Custom Scopes States (Co-Location / Dual-Brand)
  const [customScopes, setCustomScopes] = useState<CustomScopeGroup[]>([]);
  const [selectedCustomScope, setSelectedCustomScope] = useState<CustomScopeGroup | null>(null);
  const [isCustomScopeModalOpen, setIsCustomScopeModalOpen] = useState(false);
  const [editingCustomScope, setEditingCustomScope] = useState<CustomScopeGroup | null>(null);

  // Dynamic Tier Levels States
  const [tierLevels, setTierLevels] = useState<TierLevelModel[]>([]);
  const [isTierManagementModalOpen, setIsTierManagementModalOpen] = useState(false);
  const [isTierFormModalOpen, setIsTierFormModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TierLevelModel | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccessRecord | null>(null);

  // Table Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("All Tiers");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Statuses");

  // Dynamic Organization Hierarchy constructed from DB
  const [brandHierarchy, setBrandHierarchy] = useState<BrandItem[]>([]);

  // Load from services on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [accessUsers, brands, branches, tiers] = await Promise.all([
          dataAccessService.getDataAccessUsers(),
          brandService.getBrands(),
          branchService.getBranches(),
          tierLevelService.getTierLevels(),
        ]);
        setUsersList(accessUsers || []);
        setTierLevels(tiers || []);
        
        const bNames = brands ? brands.map((b) => b.brandName) : [];
        const brNames = branches ? branches.map((b) => b.name) : [];
        setAvailableBrandsList(bNames);
        setAvailableBranchesList(brNames);

        // Load custom scope groups
        const loadedScopes = customScopeService.getCustomScopes();
        setCustomScopes(loadedScopes);

        // Build dynamic hierarchy tree
        if (brands && brands.length > 0) {
          const tree: BrandItem[] = brands.map((b, bIdx) => {
            const relatedBranches = (branches || []).filter(
              (br) => (Boolean(br.brand) && br.brand.includes(b.brandName)) || (br.brands && br.brands.includes(b.brandName))
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
    setSelectedCustomScope(null);
  };

  const handleSelectCustomScope = (scope: CustomScopeGroup) => {
    setSelectedScopeLevel("CUSTOM_SCOPE");
    setSelectedCustomScope(scope);
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
    setSelectedCustomScope(null);
    setExpandedBrands((prev) => ({ ...prev, [brand.id]: !prev[brand.id] }));
  };

  const handleSelectRegion = (brand: BrandItem, region: RegionItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedScopeLevel("REGION");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedBranch(null);
    setSelectedCustomScope(null);
    setExpandedRegions((prev) => ({ ...prev, [region.id]: !prev[region.id] }));
  };

  const handleSelectProvince = (brand: BrandItem, region: RegionItem, province: ProvinceItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedScopeLevel("PROVINCE");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(province);
    setSelectedBranch(null);
    setSelectedCustomScope(null);
    setExpandedProvinces((prev) => ({ ...prev, [province.id]: !prev[province.id] }));
  };

  const handleSelectBranch = (brand: BrandItem, region: RegionItem, province: ProvinceItem, branch: BranchItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedScopeLevel("BRANCH");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(province);
    setSelectedBranch(branch);
    setSelectedCustomScope(null);
  };

  // ─── FILTER USERS BASED ON THE SELECTED SCOPE LEVEL ───
  const filteredUsers = useMemo(() => {
    if (selectedScopeLevel === "SUPER_ADMIN") {
      return usersList;
    }
    if (selectedScopeLevel === "CUSTOM_SCOPE" && selectedCustomScope) {
      return usersList.filter((u) => {
        const matchBrand = selectedCustomScope.brands.some((sb) =>
          u.assignedBrands.some((ub) => ub.includes(sb) || sb.includes(ub))
        );
        const matchBranch = selectedCustomScope.branches.some((sbr) =>
          u.assignedBranches.some((ubr) => ubr.includes(sbr) || sbr.includes(ubr))
        );
        return matchBrand || matchBranch;
      });
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      return usersList.filter((u) => 
        u.tierLevel === "Super Admin" ||
        u.assignedBrands.length === 0 ||
        u.assignedBrands.some((b) => selectedBrand.name.includes(b) || b.includes(selectedBrand.name))
      );
    }
    if (selectedScopeLevel === "REGION" && selectedRegion && selectedBrand) {
      return usersList.filter((u) => {
        const matchBrand = u.tierLevel === "Super Admin" || u.assignedBrands.length === 0 || u.assignedBrands.some((b) => selectedBrand.name.includes(b) || b.includes(selectedBrand.name));
        const matchRegion = u.assignedRegions.length === 0 || u.assignedRegions.includes(selectedRegion.name);
        return matchBrand && matchRegion;
      });
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince && selectedBrand) {
      return usersList.filter((u) => {
        const matchBrand = u.tierLevel === "Super Admin" || u.assignedBrands.length === 0 || u.assignedBrands.some((b) => selectedBrand.name.includes(b) || b.includes(selectedBrand.name));
        const matchProv = u.assignedProvinces.length === 0 || u.assignedProvinces.includes(selectedProvince.name);
        const matchRegion = selectedRegion ? (u.assignedRegions.length === 0 || u.assignedRegions.includes(selectedRegion.name)) : true;
        return matchBrand && matchProv && matchRegion;
      });
    }
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      return usersList.filter((u) => {
        const matchBranch = u.assignedBranches.length === 0 || u.assignedBranches.some((b) => b.includes(selectedBranch.name) || selectedBranch.name.includes(b) || b.includes("ทุกสาขา"));
        return matchBranch;
      });
    }
    return usersList;
  }, [usersList, selectedScopeLevel, selectedCustomScope, selectedBrand, selectedRegion, selectedProvince, selectedBranch]);

  // Combined Search and Dropdown Filtered Data
  const searchedAndFilteredUsers = useMemo(() => {
    let result = filteredUsers;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) =>
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.userEmail && u.userEmail.toLowerCase().includes(q)) ||
        (u.userPhone && u.userPhone.toLowerCase().includes(q)) ||
        (u.tierLevel && u.tierLevel.toLowerCase().includes(q)) ||
        (u.assignedBrands && u.assignedBrands.some((b) => b.toLowerCase().includes(q))) ||
        (u.assignedBranches && u.assignedBranches.some((b) => b.toLowerCase().includes(q)))
      );
    }

    if (selectedTierFilter !== "All Tiers") {
      result = result.filter((u) => u.tierLevel === selectedTierFilter);
    }

    if (selectedStatusFilter !== "All Statuses") {
      result = result.filter((u) => u.status === selectedStatusFilter);
    }

    return result;
  }, [filteredUsers, searchQuery, selectedTierFilter, selectedStatusFilter]);

  // DataTable Column Definitions
  const dataAccessTableColumns: TableColumn<UserAccessRecord>[] = useMemo(
    () => [
      {
        key: "userName",
        label: "ผู้ใช้งาน (User)",
        sortable: true,
        render: (user: UserAccessRecord) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
              {user.userName ? user.userName.charAt(0) : "U"}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">{user.userName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{user.userEmail}</span>
            </div>
          </div>
        ),
      },
      {
        key: "tierLevel",
        label: "ระดับสิทธิ์ (Tier Level)",
        sortable: true,
        render: (user: UserAccessRecord) => (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-100 whitespace-nowrap">
            {user.tierLevel}
          </span>
        ),
      },
      {
        key: "assignedBrands",
        label: "ขอบเขตที่ดูแล (Scope Coverage)",
        render: (user: UserAccessRecord) => (
          <div className="space-y-1 max-w-[220px]">
            <div className="flex flex-wrap gap-1">
              {user.assignedBrands.length === 0 ? (
                <span className="text-[10px] text-slate-400">ทุกแบรนด์</span>
              ) : (
                user.assignedBrands.map((b, i) => (
                  <span key={i} className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                    {b}
                  </span>
                ))
              )}
            </div>
            {user.assignedBranches.length > 0 && (
              <span className="text-[10px] text-slate-400 block truncate" title={user.assignedBranches.join(", ")}>
                สาขา: {user.assignedBranches.join(", ")}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "userPhone",
        label: "เบอร์โทรศัพท์",
        render: (user: UserAccessRecord) => (
          <span className="text-xs text-slate-600 font-mono">{user.userPhone || "-"}</span>
        ),
      },
      {
        key: "status",
        label: "สถานะ (Status)",
        sortable: true,
        render: (user: UserAccessRecord) => (
          <span className={user.status === "Active" ? "badge-active" : "badge-inactive"}>
            {user.status === "Active" ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    []
  );

  const dataAccessTableActions: TableAction<UserAccessRecord>[] = useMemo(
    () => [
      {
        label: "แก้ไขสิทธิ์",
        icon: "edit",
        onClick: (user) => handleOpenEditModal(user),
      },
      {
        label: "เพิกถอนสิทธิ์",
        icon: "delete",
        variant: "danger",
        onClick: (user) => handleDeleteUser(user.id),
      },
    ],
    []
  );

  // ─── CUSTOM SCOPE CRUD HANDLERS ───

  const handleOpenCreateCustomScope = () => {
    setEditingCustomScope(null);
    setIsCustomScopeModalOpen(true);
  };

  const handleOpenEditCustomScope = (scope: CustomScopeGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomScope(scope);
    setIsCustomScopeModalOpen(true);
  };

  const handleSaveCustomScope = async (scopeData: {
    name: string;
    description: string;
    brands: string[];
    branches: string[];
  }) => {
    try {
      if (editingCustomScope) {
        const updated = customScopeService.updateCustomScope(editingCustomScope.id, scopeData);
        setCustomScopes((prev) =>
          prev.map((s) => (s.id === editingCustomScope.id ? updated : s))
        );
        if (selectedCustomScope?.id === editingCustomScope.id) {
          setSelectedCustomScope(updated);
        }
        showSuccess(`แก้ไขกลุ่มสโคป "${scopeData.name}" สำเร็จเรียบร้อย`);
      } else {
        const created = customScopeService.createCustomScope(scopeData);
        setCustomScopes((prev) => [created, ...prev]);
        setSelectedScopeLevel("CUSTOM_SCOPE");
        setSelectedCustomScope(created);
        showSuccess(`สร้างกลุ่มสโคป "${scopeData.name}" สำเร็จเรียบร้อย`);
      }
      setIsCustomScopeModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกกลุ่มสโคปได้");
    }
  };

  const handleDeleteCustomScope = (scope: CustomScopeGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: "ยืนยันการลบกลุ่มสโคป?",
      description: `คุณต้องการลบกลุ่มสโคป "${scope.name}" หรือไม่?`,
      variant: "danger",
      confirmText: "ลบกลุ่มสโคป",
      onConfirm: () => {
        try {
          customScopeService.deleteCustomScope(scope.id);
          setCustomScopes((prev) => prev.filter((s) => s.id !== scope.id));
          if (selectedCustomScope?.id === scope.id) {
            handleSelectSuperAdminView();
          }
          showSuccess(`ลบกลุ่มสโคป "${scope.name}" เรียบร้อยแล้ว`);
        } catch (err: any) {
          showError(err?.message || "ไม่สามารถลบกลุ่มสโคปได้");
        }
      },
    });
  };

  // ─── TIER LEVEL CRUD HANDLERS ───

  const handleOpenCreateTier = () => {
    setEditingTier(null);
    setIsTierFormModalOpen(true);
  };

  const handleOpenEditTier = (tier: TierLevelModel) => {
    setEditingTier(tier);
    setIsTierFormModalOpen(true);
  };

  const handleSaveTier = async (tierData: Omit<TierLevelModel, "id" | "isSystemDefault">) => {
    try {
      if (editingTier) {
        const updated = await tierLevelService.updateTierLevel(editingTier.id, tierData);
        setTierLevels((prev) =>
          prev.map((t) => (t.id === editingTier.id ? updated : t)).sort((a, b) => a.levelOrder - b.levelOrder)
        );
        showSuccess(`แก้ไขระดับสิทธิ์ "${tierData.nameTh}" สำเร็จเรียบร้อย`);
      } else {
        const created = await tierLevelService.createTierLevel(tierData);
        setTierLevels((prev) => [...prev, created].sort((a, b) => a.levelOrder - b.levelOrder));
        showSuccess(`สร้างระดับสิทธิ์ "${tierData.nameTh}" สำเร็จเรียบร้อย`);
      }
      setIsTierFormModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกระดับสิทธิ์ได้");
    }
  };

  const handleDeleteTier = (tier: TierLevelModel) => {
    if (tier.isSystemDefault) {
      showError("ไม่สามารถลบระดับสิทธิ์หลักของระบบ (System Default Tier) ได้");
      return;
    }

    showConfirm({
      title: "ยืนยันการลบระดับสิทธิ์?",
      description: `คุณต้องการลบระดับสิทธิ์ "${tier.nameTh}" (${tier.tierCode}) หรือไม่?`,
      variant: "danger",
      confirmText: "ลบระดับสิทธิ์",
      onConfirm: async () => {
        try {
          await tierLevelService.deleteTierLevel(tier.id);
          setTierLevels((prev) => prev.filter((t) => t.id !== tier.id));
          showSuccess(`ลบระดับสิทธิ์ "${tier.nameTh}" เรียบร้อยแล้ว`);
        } catch (err: any) {
          showError(err?.message || "ไม่สามารถลบระดับสิทธิ์ได้");
        }
      },
    });
  };

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
    try {
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
      showSuccess(`บันทึกสิทธิ์ Data Access ของ "${userData.name || 'ผู้ใช้'}" สำเร็จเรียบร้อย`);
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกสิทธิ์ Data Access ได้");
    }
  };

  const handleDeleteUser = (id: string) => {
    showConfirm({
      title: "ยืนยันการเพิกถอนสิทธิ์?",
      description: "คุณต้องการเพิกถอนสิทธิ์ Data Access ของผู้ใช้นี้ใช่หรือไม่?",
      variant: "danger",
      confirmText: "เพิกถอนสิทธิ์",
      onConfirm: async () => {
        try {
          await dataAccessService.deleteDataAccessUser(id);
          setUsersList((prev) => prev.filter((u) => u.id !== id));
          showSuccess("เพิกถอนสิทธิ์ Data Access เรียบร้อยแล้ว");
        } catch (err: any) {
          showError(err?.message || "ไม่สามารถเพิกถอนสิทธิ์ได้");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      {!hideHeader ? (
        <PageHeader
          title="Data Access & Hierarchy Governance"
          description="กำหนดสิทธิ์การมองเห็นข้อมูล 5 ระดับ (Super Admin → Brand → Region → Province → Branch)"
          tabs={[
            {
              id: "users",
              label: "User Accounts (บัญชีผู้ใช้)",
              badge: usersList.length > 0 ? usersList.length : undefined,
            },
            {
              id: "dataaccess",
              label: "Data Access Scope (ขอบเขตข้อมูล)",
            },
          ]}
          activeTab="dataaccess"
          onTabChange={(tabId) => {
            if (tabId === "users") {
              window.location.href = "/usermanagement";
            }
          }}
          secondaryActions={
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsTierManagementModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="จัดการระดับสิทธิ์องค์กร (Tier Levels) เพิ่ม/แก้ไข/ลบระดับสิทธิ์"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-900">military_tech</span>
                <span>ระดับสิทธิ์องค์กร (Tier Levels)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn-primary text-xs shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ กำหนดสิทธิ์ใหม่ (Assign Scope)</span>
              </button>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900 text-xl">admin_panel_settings</span>
              <span>ผังองค์กรและการกำหนดขอบเขตข้อมูล (Org Hierarchy & Scope Governance)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              กำหนดสิทธิ์การมองเห็นข้อมูล 5 ระดับ (Super Admin → Brand → Region → Province → Branch)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsTierManagementModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="จัดการระดับสิทธิ์องค์กร (Tier Levels) เพิ่ม/แก้ไข/ลบระดับสิทธิ์"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-900">military_tech</span>
              <span>ระดับสิทธิ์องค์กร (Tier Levels)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-primary text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ กำหนดสิทธิ์ใหม่ (Assign Scope)</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={dataAccessStats} />

      {/* ─── 3. MAIN WORKSPACE: SLIM TREE HIERARCHY + RIGHT DETAIL TABLE (image_782ae7.png) ─── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* ─── LEFT: SLIM 5-TIER SCOPE HIERARCHY SIDEBAR (~250px) ─── */}
        <div className="w-full lg:w-60 xl:w-[250px] shrink-0 space-y-3">
          <OrgHierarchyTreeSidebar
            brandHierarchy={brandHierarchy}
            searchQuery={treeSearchQuery}
            onSearchChange={setTreeSearchQuery}
            selectedScopeLevel={selectedScopeLevel || "SUPER_ADMIN"}
            selectedBrand={selectedBrand}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            selectedBranch={selectedBranch}
            expandedNodes={expandedNodes}
            onToggleNode={handleToggleNode}
            onSelectSuperAdmin={handleSelectSuperAdminView}
            onSelectBrand={handleSelectBrand}
            onSelectRegion={handleSelectRegion}
            onSelectProvince={handleSelectProvince}
            onSelectBranch={handleSelectBranch}
            collapsible={false}
            className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-sm"
          />

          {/* ─── CUSTOM CO-LOCATION SCOPES (COMPACT ACCORDION) ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Custom Scopes</span>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCustomScope}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>+ สร้าง</span>
              </button>
            </div>

            <div className="space-y-1">
              {customScopes.length === 0 ? (
                <div className="p-2.5 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400">ยังไม่มีกลุ่มสโคปกำหนดเอง</p>
                </div>
              ) : (
                customScopes.map((scope) => {
                  const isSelected = selectedScopeLevel === "CUSTOM_SCOPE" && selectedCustomScope?.id === scope.id;

                  return (
                    <div
                      key={scope.id}
                      onClick={() => handleSelectCustomScope(scope)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? "bg-blue-50/90 border-blue-300 text-blue-950 shadow-2xs"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold truncate">{scope.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditCustomScope(scope, e)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomScope(scope, e)}
                            className="p-0.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {scope.brands.map((bName) => (
                          <span
                            key={bName}
                            className="text-[9px] font-semibold px-1 py-0.2 rounded bg-white text-blue-900 border border-blue-200/80 shadow-2xs"
                          >
                            {bName}
                          </span>
                        ))}
                        <span className="text-[9px] text-slate-400">
                          {scope.branches.length} สาขา
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: ASSIGNED USERS DETAIL TABLE (UNIFIED 4-SECTION TABLE) ─── */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          {/* Custom Scope Details Banner (if in Custom Scope mode) */}
          {selectedScopeLevel === "CUSTOM_SCOPE" && selectedCustomScope && (
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-900">hub</span>
                  {selectedCustomScope.name}
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-2xs">
                  {selectedCustomScope.id}
                </span>
              </div>
              {selectedCustomScope.description && (
                <p className="text-xs text-slate-600">{selectedCustomScope.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-100/80 text-xs">
                <span className="font-bold text-slate-700 text-[11px]">แบรนด์ที่ดูแลร่วม (Co-Location):</span>
                {selectedCustomScope.brands.map((b) => (
                  <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-white shadow-2xs">
                    {b}
                  </span>
                ))}
                <span className="font-bold text-slate-700 text-[11px] ml-2">สาขาที่ครอบคลุม:</span>
                {selectedCustomScope.branches.length === 0 ? (
                  <span className="text-[11px] text-slate-400">ทุกสาขาของแบรนด์ที่เลือก</span>
                ) : (
                  selectedCustomScope.branches.map((br) => (
                    <span key={br} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {br}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── UNIFIED DATA TABLE (HEAD -> FILTER & SORT -> DATA -> FOOTER) ─── */}
          <DataTable
            title="รายชื่อผู้ได้รับสิทธิ์ (Authorized Users in Selected Scope)"
            subtitle={`ขอบเขตปัจจุบัน: ${
              selectedScopeLevel === "SUPER_ADMIN"
                ? "องค์กร (Super Admin Level)"
                : selectedScopeLevel === "CUSTOM_SCOPE"
                ? `กลุ่มกำหนดเอง: ${selectedCustomScope?.name || ""}`
                : selectedBrand?.name || "ทั้งหมด"
            }${selectedRegion ? ` → ${selectedRegion.name}` : ""}${selectedProvince ? ` → จ.${selectedProvince.name}` : ""}${selectedBranch ? ` → ${selectedBranch.name}` : ""}`}
            icon="verified_user"
            badge={
              <span className="badge-active">
                {searchedAndFilteredUsers.length} บัญชี
              </span>
            }
            searchPlaceholder="ค้นหาชื่อผู้ใช้, อีเมล, แบรนด์, หรือสาขา..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            headerActions={
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn-primary text-xs py-1.5 px-3 shadow-2xs whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                + กำหนดสิทธิ์ใหม่
              </button>
            }
            filters={
              <>
                <div className="w-full sm:w-48">
                  <SelectInput
                    value={selectedTierFilter}
                    onChange={setSelectedTierFilter}
                    options={[
                      { value: "All Tiers", label: "ทุกระดับสิทธิ์ (All Tiers)" },
                      ...tierLevels.map((t) => ({
                        value: t.nameTh,
                        label: `${t.nameTh} (Lv.${t.levelOrder})`,
                      })),
                    ]}
                  />
                </div>

                <div className="w-full sm:w-36">
                  <SelectInput
                    value={selectedStatusFilter}
                    onChange={setSelectedStatusFilter}
                    options={[
                      { value: "All Statuses", label: "ทุกสถานะ" },
                      { value: "Active", label: "Active (ใช้งาน)" },
                      { value: "Inactive", label: "Inactive (ปิดใช้งาน)" },
                    ]}
                  />
                </div>
              </>
            }
            columns={dataAccessTableColumns}
            data={searchedAndFilteredUsers}
            actions={dataAccessTableActions}
            emptyMessage="ไม่พบข้อมูลผู้ได้รับสิทธิ์ในขอบเขตหรือเงื่อนไขที่ค้นหา"
            defaultPageSize={10}
          />
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

      {/* ─── 5. CREATE / EDIT CUSTOM SCOPE MODAL (CO-LOCATION & DUAL-BRAND) ─── */}
      <CustomScopeModal
        isOpen={isCustomScopeModalOpen}
        onClose={() => setIsCustomScopeModalOpen(false)}
        editingScope={editingCustomScope}
        availableBrands={availableBrandsList}
        availableBranches={availableBranchesList}
        onSave={handleSaveCustomScope}
      />

      {/* ─── 6. TIER LEVEL MANAGEMENT MODAL (LIST & CRUD GOVERNANCE) ─── */}
      <TierLevelManagementModal
        isOpen={isTierManagementModalOpen}
        onClose={() => setIsTierManagementModalOpen(false)}
        tierLevels={tierLevels}
        onOpenCreate={handleOpenCreateTier}
        onOpenEdit={handleOpenEditTier}
        onDelete={handleDeleteTier}
      />

      {/* ─── 7. TIER LEVEL FORM MODAL (CREATE / EDIT SPECIFIC TIER) ─── */}
      <TierLevelFormModal
        isOpen={isTierFormModalOpen}
        onClose={() => setIsTierFormModalOpen(false)}
        editingTier={editingTier}
        onSave={handleSaveTier}
      />

    </div>
  );
}