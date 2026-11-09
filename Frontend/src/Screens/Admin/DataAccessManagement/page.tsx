"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
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
import DataAccessTable from "@/Components/Tables/DataAccessTable";
import TierLevelManagementModal from "@/Components/Modals/TierLevelManagementModal";
import TierLevelFormModal from "@/Components/Modals/TierLevelFormModal";
import { useModal } from "@/Context/ModalContext";
import { useApiMode } from "@/Context/ApiModeContext";

// ==========================================================================
// ─── MAIN DATA ACCESS MANAGEMENT COMPONENT
// ==========================================================================

export interface DataAccessManagementScreenProps {
  hideHeader?: boolean;
}

export default function DataAccessManagementScreen({
  hideHeader = false,
}: DataAccessManagementScreenProps = {}) {
  const { isApiEnabled } = useApiMode();
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

  // Dynamic Organization Hierarchy constructed from DB
  const [brandHierarchy, setBrandHierarchy] = useState<BrandItem[]>([]);

  // Load from services on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);

        if (!isApiEnabled) {
          setUsersList([]);
          setTierLevels([]);
          setAvailableBrandsList([]);
          setAvailableBranchesList([]);
          setCustomScopes([]);
          setBrandHierarchy([]);
          return;
        }

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
  }, [isApiEnabled]);

  // ─── SCOPE CONTEXT (กระเป๋า / ชั้นหนังสือของสโคปที่เลือก) ───
  const currentScopeContext = useMemo(() => {
    if (selectedScopeLevel === "CUSTOM_SCOPE" && selectedCustomScope) {
      return {
        title: `กลุ่มกำหนดเอง: ${selectedCustomScope.name}`,
        subtitle: "Custom Co-Location Scope",
        tier: "Custom Scope",
        tierKey: "Custom Scope" as const,
        description: selectedCustomScope.description || "กลุ่มสโคปกำหนดเองสำหรับผู้จัดการที่ดูแลร้านหลายแบรนด์ หรือจัดกลุ่มสาขาเฉพาะ",
        brands: selectedCustomScope.brands,
        branches: selectedCustomScope.branches,
      };
    }
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      return {
        title: `${selectedBranch.name} (${selectedBranch.code || "-"})`,
        subtitle: `${selectedBrand?.name || ""} > ${selectedRegion?.name || ""} > จ.${selectedProvince?.name || ""}`,
        tier: "Branch Staff (Tier 5)",
        tierKey: "Branch Staff" as const,
        description: `ขอบเขตสาขาเฉพาะจุด: ผู้ใช้งานที่ได้รับสิทธิ์ในสโคปนี้จะดูตู้ Kiosks และแดชบอร์ดเฉพาะสาขา ${selectedBranch.name} เท่านั้น`,
        brands: selectedBrand ? [selectedBrand.name] : [],
        branches: [selectedBranch.name],
      };
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince) {
      return {
        title: `จ.${selectedProvince.name} (${selectedBrand?.name || ""})`,
        subtitle: `${selectedBrand?.name || ""} > ${selectedRegion?.name || ""}`,
        tier: "Area Manager (AM - Tier 4)",
        tierKey: "Area Manager (AM)" as const,
        description: `ขอบเขตระดับจังหวัด/เขต (Area Manager): ผู้จัดการในสโคปนี้สามารถดูแดชบอร์ดสรุปของทุกสาขาในจังหวัด ${selectedProvince.name} ได้`,
        brands: selectedBrand ? [selectedBrand.name] : [],
        branches: selectedProvince.branches.map((b) => b.name),
      };
    }
    if (selectedScopeLevel === "REGION" && selectedRegion) {
      return {
        title: `${selectedRegion.name} (${selectedBrand?.name || ""})`,
        subtitle: `${selectedBrand?.name || ""}`,
        tier: "Regional Manager (RM - Tier 3)",
        tierKey: "Regional Manager (RM)" as const,
        description: `ขอบเขตระดับภูมิภาค (Regional Manager): ผู้จัดการในสโคปนี้สามารถดูแดชบอร์ดสรุปของทุกสาขาใน ${selectedRegion.name} ได้`,
        brands: selectedBrand ? [selectedBrand.name] : [],
        branches: selectedRegion.provinces.flatMap((p) => p.branches.map((b) => b.name)),
      };
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      return {
        title: `แบรนด์ ${selectedBrand.name}`,
        subtitle: "Brand-Level Scope",
        tier: "Brand Owner (Tier 2)",
        tierKey: "Brand Owner" as const,
        description: `ขอบเขตระดับแบรนด์: ผู้บริหารแบรนด์ ${selectedBrand.name} สามารถดูแดชบอร์ดและสถิติภาพรวมของทุกสาขาทั่วประเทศภายใต้แบรนด์นี้ได้`,
        brands: [selectedBrand.name],
        branches: [],
      };
    }
    return {
      title: "🏢 ภาพรวมระดับองค์กร (Super Admin Level)",
      subtitle: "Global Enterprise Scope",
      tier: "Super Admin (Tier 1)",
      tierKey: "Super Admin" as const,
      description: "ขอบเขตสูงสุดระดับสำนักงานใหญ่: ผู้ดูแลระบบสามารถดูและบริหารจัดการข้อมูลแดชบอร์ดของทุกแบรนด์และทุกสาขาในระบบได้",
      brands: availableBrandsList,
      branches: [],
    };
  }, [selectedScopeLevel, selectedCustomScope, selectedBranch, selectedProvince, selectedRegion, selectedBrand, availableBrandsList]);

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
      {!hideHeader && (
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
      )}

      {/* ─── MAIN WORKSPACE: SLIM TREE HIERARCHY + RIGHT DETAIL TABLE (image_782ae7.png) ─── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* ─── LEFT: 5-TIER SCOPE HIERARCHY SIDEBAR (298px Master Parity) ─── */}
        <div className="w-full lg:w-[298px] xl:w-[298px] shrink-0 space-y-3">
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

        {/* ─── RIGHT: ASSIGNED USERS DETAIL TABLE (Direct Table with Add Scope + Add User) ─── */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          <DataAccessTable
            users={filteredUsers}
            isLoading={isLoading}
            scopeTitle={currentScopeContext.title}
            scopeTier={currentScopeContext.tier}
            onAddScope={handleOpenCreateCustomScope}
            onAddUser={handleOpenAddModal}
            onEditUser={handleOpenEditModal}
            onDeleteUser={handleDeleteUser}
          />
        </div>

      </div>

      {/* ─── 4. ADD / EDIT DATA ACCESS MODAL ─── */}
      <DataAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        defaultScope={{
          scopePath: currentScopeContext.subtitle
            ? `${currentScopeContext.subtitle} > ${currentScopeContext.title}`
            : currentScopeContext.title,
          tierLevel: currentScopeContext.tierKey,
          assignedBrands: currentScopeContext.brands,
          assignedBranches: currentScopeContext.branches,
        }}
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