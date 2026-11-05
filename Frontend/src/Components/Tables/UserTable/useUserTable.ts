"use client";

import { useState, useMemo, useCallback } from "react";
import { UserModel, UserTierLevel, UserStatus } from "@/Types/user";

export type UserTableSortField =
  | "userCode"
  | "name"
  | "email"
  | "role"
  | "tierLevel"
  | "status"
  | "createdDate";

export type UserTableSortDirection = "asc" | "desc";

export type UserTableColumnKey =
  | "userCode"
  | "name"
  | "role"
  | "scope"
  | "status"
  | "createdDate";

export interface ColumnDefinition {
  key: UserTableColumnKey;
  label: string;
}

export const USER_TABLE_COLUMNS: ColumnDefinition[] = [
  { key: "userCode", label: "User ID & Tier" },
  { key: "name", label: "Full Name & Email" },
  { key: "role", label: "Role" },
  { key: "scope", label: "Assigned Scope" },
  { key: "status", label: "Status" },
  { key: "createdDate", label: "Created Date" },
];

export interface UseUserTableOptions {
  users?: UserModel[];
  initialPageSize?: number;
}

export function useUserTable({
  users = [],
  initialPageSize = 8,
}: UseUserTableOptions = {}) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<UserTableSortField>("name");
  const [sortDirection, setSortDirection] = useState<UserTableSortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Column visibility state (Fardo style)
  const [visibleColumns, setVisibleColumns] = useState<Record<UserTableColumnKey, boolean>>({
    userCode: true,
    name: true,
    role: true,
    scope: true,
    status: true,
    createdDate: true,
  });
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Row selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Toggle single column visibility
  const toggleColumnVisibility = useCallback((columnKey: UserTableColumnKey) => {
    setVisibleColumns((prev) => {
      // Prevent hiding all columns
      const currentlyVisible = Object.values(prev).filter(Boolean).length;
      if (prev[columnKey] && currentlyVisible <= 1) {
        return prev;
      }
      return {
        ...prev,
        [columnKey]: !prev[columnKey],
      };
    });
  }, []);

  // Reset column visibility to all visible
  const resetColumnVisibility = useCallback(() => {
    setVisibleColumns({
      userCode: true,
      name: true,
      role: true,
      scope: true,
      status: true,
      createdDate: true,
    });
  }, []);

  // Sorting handler
  const handleSort = useCallback((field: UserTableSortField) => {
    setSortField((previousField) => {
      if (previousField === field) {
        setSortDirection((previousDirection) => (previousDirection === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
    setCurrentPage(1);
  }, []);

  // Filtered list
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return users.filter((user) => {
      // Keyword filter
      if (normalizedKeyword) {
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
        const userCode = (user.userCode ?? "").toLowerCase();
        const email = (user.email ?? "").toLowerCase();
        const role = (user.role ?? "").toLowerCase();
        const brands = (user.assignedBrands ?? []).join(" ").toLowerCase();
        const branches = (user.assignedBranches ?? []).join(" ").toLowerCase();

        const matchesKeyword =
          fullName.includes(normalizedKeyword) ||
          userCode.includes(normalizedKeyword) ||
          email.includes(normalizedKeyword) ||
          role.includes(normalizedKeyword) ||
          brands.includes(normalizedKeyword) ||
          branches.includes(normalizedKeyword);

        if (!matchesKeyword) return false;
      }

      // Tier filter
      if (tierFilter !== "All" && user.tierLevel !== tierFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "All" && user.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchKeyword, tierFilter, statusFilter]);

  // Sorted list
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((userA, userB) => {
      let comparison = 0;

      switch (sortField) {
        case "userCode":
          comparison = (userA.userCode ?? "").localeCompare(userB.userCode ?? "");
          break;
        case "name": {
          const nameA = `${userA.firstName ?? ""} ${userA.lastName ?? ""}`.trim();
          const nameB = `${userB.firstName ?? ""} ${userB.lastName ?? ""}`.trim();
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "email":
          comparison = (userA.email ?? "").localeCompare(userB.email ?? "");
          break;
        case "role":
          comparison = (userA.role ?? "").localeCompare(userB.role ?? "");
          break;
        case "tierLevel":
          comparison = (userA.tierLevel ?? "").localeCompare(userB.tierLevel ?? "");
          break;
        case "status":
          comparison = (userA.status ?? "").localeCompare(userB.status ?? "");
          break;
        case "createdDate":
          comparison = (userA.createdDate ?? "").localeCompare(userB.createdDate ?? "");
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, safeCurrentPage, pageSize]);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  const handleResetFilters = useCallback(() => {
    setSearchKeyword("");
    setTierFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchKeyword !== "" || tierFilter !== "All" || statusFilter !== "All";

  // Selection handlers
  const toggleSelectUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedUserIds((prev) => {
      const allCurrentPageIds = paginatedUsers.map((u) => u.id);
      const isAllCurrentSelected = allCurrentPageIds.every((id) => prev.has(id));

      const next = new Set(prev);
      if (isAllCurrentSelected) {
        allCurrentPageIds.forEach((id) => next.delete(id));
      } else {
        allCurrentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [paginatedUsers]);

  const clearSelection = useCallback(() => {
    setSelectedUserIds(new Set());
  }, []);

  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedUsers.length === 0) return false;
    return paginatedUsers.every((u) => selectedUserIds.has(u.id));
  }, [paginatedUsers, selectedUserIds]);

  const isSomeCurrentPageSelected = useMemo(() => {
    if (paginatedUsers.length === 0) return false;
    return (
      paginatedUsers.some((u) => selectedUserIds.has(u.id)) &&
      !isAllCurrentPageSelected
    );
  }, [paginatedUsers, selectedUserIds, isAllCurrentPageSelected]);

  // Status counts for Fardo tabs
  const statusCounts = useMemo(() => {
    const all = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const inactive = users.filter((u) => u.status === "Inactive").length;
    return { all, active, inactive };
  }, [users]);

  // Export engine: writes a CSV, XLSX, or JSON "tal como la ves" (with filters & visible columns applied)
  const exportData = useCallback(
    (format: "csv" | "xlsx" | "json") => {
      // If rows are selected, export selected rows; otherwise export all filtered/sorted rows
      const targetRows =
        selectedUserIds.size > 0
          ? sortedUsers.filter((u) => selectedUserIds.has(u.id))
          : sortedUsers;

      if (targetRows.length === 0) {
        return;
      }

      // Column definitions that are currently visible
      const activeColumns = USER_TABLE_COLUMNS.filter(
        (col) => visibleColumns[col.key] !== false
      );

      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `users_export_${timestamp}`;

      if (format === "json") {
        // Build JSON containing only visible columns
        const jsonData = targetRows.map((user) => {
          const rowData: Record<string, unknown> = {};
          activeColumns.forEach((col) => {
            switch (col.key) {
              case "userCode":
                rowData["UserCode"] = user.userCode;
                rowData["TierLevel"] = user.tierLevel;
                break;
              case "name":
                rowData["FullName"] = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                rowData["Email"] = user.email;
                break;
              case "role":
                rowData["Role"] = user.role;
                break;
              case "scope":
                rowData["Brands"] = user.assignedBrands?.join(", ") || user.brand || "-";
                rowData["Branches"] = user.assignedBranches?.join(", ") || user.branch || "-";
                break;
              case "status":
                rowData["Status"] = user.status;
                break;
              case "createdDate":
                rowData["CreatedDate"] = user.createdDate || "-";
                break;
            }
          });
          return rowData;
        });

        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        // Headers with visible columns only
        const headers: string[] = [];
        activeColumns.forEach((col) => {
          if (col.key === "userCode") {
            headers.push("User Code", "Tier Level");
          } else if (col.key === "name") {
            headers.push("Full Name", "Email");
          } else if (col.key === "role") {
            headers.push("Role");
          } else if (col.key === "scope") {
            headers.push("Assigned Brands", "Assigned Branches");
          } else if (col.key === "status") {
            headers.push("Status");
          } else if (col.key === "createdDate") {
            headers.push("Created Date");
          }
        });

        // Rows
        const rows = targetRows.map((user) => {
          const fields: string[] = [];
          activeColumns.forEach((col) => {
            if (col.key === "userCode") {
              fields.push(`"${user.userCode || ""}"`, `"${user.tierLevel || ""}"`);
            } else if (col.key === "name") {
              const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
              fields.push(`"${fullName}"`, `"${user.email || ""}"`);
            } else if (col.key === "role") {
              fields.push(`"${user.role || ""}"`);
            } else if (col.key === "scope") {
              const brands = user.assignedBrands?.join("; ") || user.brand || "-";
              const branches = user.assignedBranches?.join("; ") || user.branch || "-";
              fields.push(`"${brands}"`, `"${branches}"`);
            } else if (col.key === "status") {
              fields.push(`"${user.status || ""}"`);
            } else if (col.key === "createdDate") {
              fields.push(`"${user.createdDate || ""}"`);
            }
          });
          return fields.join(",");
        });

        // UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
        const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "xlsx") {
        // Export HTML Table Spreadsheet format (.xls/xlsx compatible natively by Excel)
        const headers: string[] = [];
        activeColumns.forEach((col) => {
          if (col.key === "userCode") {
            headers.push("User Code", "Tier Level");
          } else if (col.key === "name") {
            headers.push("Full Name", "Email");
          } else if (col.key === "role") {
            headers.push("Role");
          } else if (col.key === "scope") {
            headers.push("Assigned Brands", "Assigned Branches");
          } else if (col.key === "status") {
            headers.push("Status");
          } else if (col.key === "createdDate") {
            headers.push("Created Date");
          }
        });

        const rowsHtml = targetRows
          .map((user) => {
            const cells: string[] = [];
            activeColumns.forEach((col) => {
              if (col.key === "userCode") {
                cells.push(`<td>${user.userCode || ""}</td>`, `<td>${user.tierLevel || ""}</td>`);
              } else if (col.key === "name") {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                cells.push(`<td>${fullName}</td>`, `<td>${user.email || ""}</td>`);
              } else if (col.key === "role") {
                cells.push(`<td>${user.role || ""}</td>`);
              } else if (col.key === "scope") {
                const brands = user.assignedBrands?.join(", ") || user.brand || "-";
                const branches = user.assignedBranches?.join(", ") || user.branch || "-";
                cells.push(`<td>${brands}</td>`, `<td>${branches}</td>`);
              } else if (col.key === "status") {
                cells.push(`<td>${user.status || ""}</td>`);
              } else if (col.key === "createdDate") {
                cells.push(`<td>${user.createdDate || ""}</td>`);
              }
            });
            return `<tr>${cells.join("")}</tr>`;
          })
          .join("");

        const tableHtml = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
              <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Users</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
            </head>
            <body>
              <table border="1">
                <thead>
                  <tr style="background-color: #f1f5f9; font-weight: bold;">
                    ${headers.map((h) => `<th>${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </body>
          </html>
        `;

        const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.xls`;
        link.click();
        URL.revokeObjectURL(url);
      }

      setIsExportMenuOpen(false);
    },
    [selectedUserIds, sortedUsers, visibleColumns]
  );

  return {
    searchKeyword,
    setSearchKeyword,
    tierFilter,
    setTierFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    currentPage: safeCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedUsers,
    activeMenuUserId,
    setActiveMenuUserId,
    hasActiveFilters,
    visibleColumns,
    isColumnsMenuOpen,
    setIsColumnsMenuOpen,
    isExportMenuOpen,
    setIsExportMenuOpen,
    toggleColumnVisibility,
    resetColumnVisibility,
    selectedUserIds,
    toggleSelectUser,
    toggleSelectAll,
    clearSelection,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    statusCounts,
    exportData,
    handleSort,
    handlePageChange,
    handleResetFilters,
  };
}

