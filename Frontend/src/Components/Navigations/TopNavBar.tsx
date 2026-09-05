import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/Context/SidebarContext";
import { useAuth } from "@/Context/AuthContext";
import { searchGlobalApp, GlobalSearchResult } from "@/Lib/search/searchEngine";
import { brandService } from "@/Services/brandService";
import { branchService } from "@/Services/branchService";
import { userService } from "@/Services/userService";
import { eventService } from "@/Services/eventService";
import { roleService } from "@/Services/roleService";

// ==========================================================================
// ─── TOP NAVBAR COMPONENT WITH LIVE GLOBAL SEARCH ENGINE & USER PROFILE
// ==========================================================================

export default function TopNavBar() {
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useSidebar();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicEntities, setDynamicEntities] = useState<GlobalSearchResult[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // โหลดข้อมูลจริงจาก Database / Services เมื่อ Focus หรือ Mount
  useEffect(() => {
    async function loadSearchableData() {
      try {
        const [brands, branches, users, events, roles] = await Promise.all([
          brandService.getBrands().catch(() => []),
          branchService.getBranches().catch(() => []),
          userService.getUsers().catch(() => []),
          eventService.getEvents().catch(() => []),
          roleService.getRoles().catch(() => []),
        ]);

        const results: GlobalSearchResult[] = [];

        // Brands
        (brands || []).forEach((b) => {
          results.push({
            id: b.brandId,
            title: b.brandName,
            subtitle: `${b.category || "Brand"} · ${b.parentCompanyName || ""}`,
            category: "Brand",
            route: "/brand",
            badge: b.brandId,
            icon: "branding_watermark",
          });
        });

        // Branches
        (branches || []).forEach((br) => {
          results.push({
            id: br.id,
            title: br.name,
            subtitle: `รหัส: ${br.code} · ${br.region || ""} ${br.province ? `> จ.${br.province}` : ""}`,
            category: "Branch",
            route: "/branch",
            badge: br.code,
            icon: "storefront",
          });
        });

        // Users
        (users || []).forEach((u) => {
          results.push({
            id: u.id,
            title: `${u.firstName} ${u.lastName}`,
            subtitle: `${u.email} · ${u.tierLevel || u.role}`,
            category: "User",
            route: "/usermanagement",
            badge: u.tierLevel || u.role,
            icon: "person",
          });
        });

        // Events
        (events || []).forEach((e) => {
          results.push({
            id: e.eventId,
            title: e.eventName,
            subtitle: `${e.eventDate} · ${e.brandScope || ""} · ${e.eventLocation || ""}`,
            category: "Event",
            route: "/event",
            badge: e.eventCategory,
            icon: "event",
          });
        });

        // Roles
        (roles || []).forEach((r) => {
          results.push({
            id: r.roleId,
            title: r.roleName,
            subtitle: r.roleDescription,
            category: "Role",
            route: "/roles",
            badge: r.roleId,
            icon: "admin_panel_settings",
          });
        });

        setDynamicEntities(results);
      } catch (err) {
        console.error("Failed to load global search items", err);
      }
    }

    loadSearchableData();
  }, []);

  // กรองผลการค้นหาแบบ Realtime จาก Global Search Engine
  const searchResults: GlobalSearchResult[] = useMemo(() => {
    return searchGlobalApp(searchQuery, dynamicEntities);
  }, [searchQuery, dynamicEntities]);

  // คีย์ลัด Ctrl+K หรือ ⌘K เพื่อโฟกัสที่ช่องค้นหาได้จากทุกที่
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ปิด Dropdown เมื่อคลิกนอกพื้นที่ Search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // การเลื่อนแป้นพิมพ์ (Arrow Up / Arrow Down / Enter)
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    }
  };

  // เมื่อเลือกรายการผลการค้นหา -> นำทางไปยังหน้านั้นทันที
  const handleSelectResult = (item: GlobalSearchResult) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    router.push(item.route);
  };

  return (
    <header className="flex justify-between items-center w-full h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-colors duration-200">
      
      {/* ─── 1. TOGGLE BUTTON & GLOBAL SEARCH ─── */}
      <div ref={searchContainerRef} className="relative flex items-center gap-3 w-full max-w-lg">
        
        {/* Quick Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          title={isSidebarCollapsed ? "ขยายแถบเมนูข้าง (Expand Sidebar)" : "ย่อแถบเมนูข้าง (Collapse Sidebar)"}
          className="p-2 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors outline-none cursor-pointer flex items-center justify-center shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSidebarCollapsed ? "menu" : "menu_open"}
          </span>
        </button>

        {/* Global Search Input Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>

          <input
            ref={searchInputRef}
            type="text"
            placeholder="ค้นหาทุกหน้า เมนู สาขา ผู้ใช้ หรือข้อมูลในระบบ..."
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all placeholder:text-slate-400 shadow-2xs"
          />

          {/* Clear Button */}
          {searchQuery && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="w-5 h-5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ─── Global Search Live Dropdown Results ─── */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-98 duration-150 max-h-[420px] flex flex-col">
              
              {/* Results Header */}
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-[11px] text-slate-500 font-bold">
                <span>ผลการค้นหาทั่วทั้งระบบ ({searchResults.length} รายการ)</span>
                <span className="text-[10px] text-slate-400 font-normal">กด Enter เพื่อเปิดหน้านั้น</span>
              </div>

              {/* Results List */}
              <div className="overflow-y-auto divide-y divide-slate-100 p-1.5 flex-1">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">search_off</span>
                    ไม่พบข้อมูลที่ตรงกับ <span className="font-bold text-slate-600">"{searchQuery}"</span>
                  </div>
                ) : (
                  searchResults.map((item, index) => {
                    const isSelected = index === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected ? "bg-blue-50 border border-blue-200/80 shadow-2xs" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Category Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{item.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {item.category}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-900 border border-blue-100 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                        </div>

                        {/* Direct Path Link / Enter Icon */}
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-[18px]">
                          arrow_forward
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Results Footer */}
              <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Enterprise Global Search Engine</span>
                <span className="font-mono">CRG App Search</span>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ─── 2. ACTIONS & ADMIN PROFILE ─── */}
      <div className="flex items-center gap-3 ml-auto">
        
        {/* Notification Bell Icon */}
        <button 
          type="button" 
          onClick={() => router.push("/notifications")}
          title="Notifications"
          className="text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-full p-2 transition-colors relative outline-none flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 mx-1 select-none pointer-events-none"></div>

        {/* ─── Interactive User Profile Menu & Dropdown ─── */}
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors outline-none cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shadow-xs border border-blue-800 select-none group-hover:scale-105 transition-transform">
              {user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "SA" : "SA"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "System Admin"}
              </span>
              <span className="text-[10px] text-blue-900 font-semibold">
                {user?.tierLevel || user?.roleName || "Super Administrator"}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 transition-transform duration-200">
              {isProfileMenuOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
              
              {/* User Header Details */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-bold shadow-xs border border-blue-800 shrink-0">
                  {user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "SA" : "SA"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "System Admin"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {user?.email || "admin@satisfaction.local"}
                  </div>
                  <div className="mt-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-mono">
                      {user?.tierLevel || user?.roleName || "SuperAdmin"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-1.5 space-y-0.5 text-xs text-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/docs");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400">description</span>
                  <span>API Documentation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400">settings</span>
                  <span>System Settings</span>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
                      await logout();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium text-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-rose-500">logout</span>
                  <span>Sign Out (ออกจากระบบ)</span>
                </button>
              </div>

            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}