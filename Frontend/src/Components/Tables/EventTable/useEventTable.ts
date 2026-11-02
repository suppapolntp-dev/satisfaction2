"use client";

import { useState, useMemo, useCallback } from "react";
import { EventItem } from "@/Types/event";

export type EventTableSortField =
  | "eventName"
  | "eventDate"
  | "brandScope"
  | "eventCategory"
  | "eventStatus";

export type EventTableSortDirection = "asc" | "desc";

export interface UseEventTableOptions {
  events: EventItem[];
  initialPageSize?: number;
}

export function useEventTable({
  events = [],
  initialPageSize = 8,
}: UseEventTableOptions) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortField, setSortField] = useState<EventTableSortField>("eventDate");
  const [sortDirection, setSortDirection] = useState<EventTableSortDirection>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Sorting Handler
  const handleSort = useCallback((field: EventTableSortField) => {
    setSortField((previousField) => {
      if (previousField === field) {
        setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
    setCurrentPage(1);
  }, []);

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return events.filter((item) => {
      // 1. Text Search matching name, code, brand, or location
      const matchesSearch =
        !normalizedKeyword ||
        (item.eventName || "").toLowerCase().includes(normalizedKeyword) ||
        (item.eventId || "").toLowerCase().includes(normalizedKeyword) ||
        (item.brandScope || "").toLowerCase().includes(normalizedKeyword) ||
        (item.eventLocation || "").toLowerCase().includes(normalizedKeyword) ||
        (item.description || "").toLowerCase().includes(normalizedKeyword);

      // 2. Category matching
      const matchesCategory =
        selectedCategory === "ALL" ||
        item.eventCategory.toUpperCase() === selectedCategory.toUpperCase();

      // 3. Status matching
      const itemStatus = (item.eventStatus || "").toUpperCase();
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "COMPLETED" && (itemStatus === "COMPLETED" || itemStatus === "ACTIVE")) ||
        (selectedStatus === "UPCOMING" && (itemStatus === "UPCOMING" || itemStatus === "LIVE"));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchKeyword, selectedCategory, selectedStatus]);

  // Sorted dataset
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((itemA, itemB) => {
      let comparison = 0;

      if (sortField === "eventName") {
        comparison = (itemA.eventName || "").localeCompare(itemB.eventName || "");
      } else if (sortField === "eventDate") {
        const dateA = `${itemA.eventDate} ${itemA.startTime || "00:00"}`;
        const dateB = `${itemB.eventDate} ${itemB.startTime || "00:00"}`;
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === "brandScope") {
        comparison = (itemA.brandScope || "").localeCompare(itemB.brandScope || "");
      } else if (sortField === "eventCategory") {
        comparison = (itemA.eventCategory || "").localeCompare(itemB.eventCategory || "");
      } else if (sortField === "eventStatus") {
        comparison = (itemA.eventStatus || "").localeCompare(itemB.eventStatus || "");
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredEvents, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEvents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedEvents.slice(startIndex, startIndex + pageSize);
  }, [sortedEvents, safeCurrentPage, pageSize]);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchKeyword("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSortField("eventDate");
    setSortDirection("desc");
    setCurrentPage(1);
  }, []);

  return {
    searchKeyword,
    selectedCategory,
    selectedStatus,
    sortField,
    sortDirection,
    currentPage: safeCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedEvents,
    handleSort,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handlePageChange,
    handleResetFilters,
    setPageSize,
  };
}
