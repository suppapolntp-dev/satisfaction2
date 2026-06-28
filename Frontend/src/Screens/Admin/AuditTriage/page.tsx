"use client";

import React, { useState, useMemo } from "react";
import SearchInput from "@/Components/Inputs/SearchInput";

// =========================================================================
// 1. TYPE DEFINITIONS & INTERFACES (Clean & Explicit)
// =========================================================================
interface CodeLineDiff {
  lineNumber: string;
  lineText: string;
  isHighlighted: boolean;
}

interface AuditEvent {
  id: string;
  category: string;
  timestamp: string;
  title: string;
  summary: string;
  status: "Pending Review" | "Currently Viewing" | "Unassigned";
  severity: "Critical" | "Regular";
  requestedBy: string;
  workflowRef: string;
  userInitials: string;
  targetEmployee: string;
  explanation: string;
  diffBefore: CodeLineDiff[];
  diffAfter: CodeLineDiff[];
}

// Mock Data ตัวอย่างสำหรับทดสอบระบบ
const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "AUD-8829-X",
    category: "Access Control",
    timestamp: "Oct 27, 2023 · 14:32:11",
    title: "Elevated Database Privileges Update",
    summary: "Bypassed standard boundary to grant production access temporarily.",
    status: "Pending Review",
    severity: "Critical",
    requestedBy: "Somsak Dev",
    workflowRef: "WF-DB-990",
    userInitials: "SS",
    targetEmployee: "John Doe",
    explanation: "Urgent hotfix required directly on production cluster due to replication lag.",
    diffBefore: [{ lineNumber: "12", lineText: "allowAccess = false", isHighlighted: true }],
    diffAfter: [{ lineNumber: "12", lineText: "allowAccess = true // Temp", isHighlighted: true }]
  }
];

// =========================================================================
// 2. SUB-COMPONENTS (Component & Clean)
// =========================================================================

// --- KPI Badge Component ---
interface KpiBadgeProps {
  label: string;
  value: string;
  icon: string;
  iconColorClass: string;
}
function KpiBadge({ label, value, icon, iconColorClass }: KpiBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[10px] font-bold text-gray-500 uppercase leading-none">{label}</div>
      <div className={`text-lg font-bold leading-none ${label === "Critical" ? "text-red-600" : ""}`}>{value}</div>
      <span className={`material-symbols-outlined text-[16px] ${iconColorClass}`}>{icon}</span>
    </div>
  );
}

// --- Diff Panel Component ---
interface DiffPanelProps {
  title: string;
  lines: CodeLineDiff[];
  highlightBgClass: string;
  highlightTextClass: string;
}
function DiffPanel({ title, lines, highlightBgClass, highlightTextClass }: DiffPanelProps) {
  return (
    <div className="flex flex-col">
      <div className="bg-slate-800 px-4 py-1.5 border-b border-slate-700 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
        {title}
      </div>
      <div className="p-4 space-y-1">
        {lines.map((line) => (
          <div
            key={`${title}-${line.lineNumber}`}
            className={`flex gap-3 -mx-4 px-4 ${line.isHighlighted ? highlightBgClass : ""}`}
          >
            <span className="w-6 text-slate-600 text-right select-none shrink-0">{line.lineNumber}</span>
            <span className={`whitespace-pre truncate ${line.isHighlighted ? highlightTextClass : ""}`}>
              {line.lineText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 3. MAIN COMPONENT
// =========================================================================
export default function AuditScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState("AUD-8829-X");
  const [events] = useState<AuditEvent[]>(MOCK_AUDIT_EVENTS);

  // Filter รายการ Event ตามช่องค้นหา (Derived State)
  const filteredEvents = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return events;

    return events.filter(
      (item) =>
        item.title.toLowerCase().includes(cleanQuery) ||
        item.summary.toLowerCase().includes(cleanQuery)
    );
  }, [events, searchQuery]);

  // ค้นหา Event ปัจจุบันที่เลือกดูอยู่
  const activeEvent = useMemo(() => {
    return events.find((item) => item.id === selectedId) ?? events[0];
  }, [events, selectedId]);

  // Action Handlers
  const handleApprove = (id: string) => {
    alert(`อนุมัติการเปลี่ยนแปลงรหัสเหตุการณ์ ${id} เรียบร้อยแล้ว`);
  };

  const handleFlagReview = (id: string) => {
    alert(`ติดธงแจ้งเตือนตรวจสอบเพิ่มเติมสำหรับเหตุการณ์ ${id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--background)] text-[var(--on-surface)]">
      
      {/* ─── HEADER SECTION ─── */}
      <header className="flex justify-between items-center w-full px-6 h-16 bg-white border-b border-[var(--outline-variant)] shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[var(--on-surface)]">Audit Triage</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Unacknowledged Event Queue
          </p>
        </div>

        {/* Executive KPIs Banner */}
        <div className="hidden lg:flex items-center gap-8 border-x border-[var(--outline-variant)]/30 px-8 h-full">
          <KpiBadge label="Score" value="98.4%" icon="trending_up" iconColorClass="text-green-600" />
          <KpiBadge label="Critical" value="42" icon="warning" iconColorClass="text-red-600" />
        </div>

        {/* ค้นหาและปุ่มรีเฟรช */}
        <div className="flex items-center gap-4">
          <div className="w-64">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter queue..."
            />
          </div>
          <button
            type="button"
            onClick={() => console.log("Refreshing pipeline...")}
            className="flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </header>

      {/* ─── MAIN LAYOUT (SPLIT-PANE) ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR: AUDIT LIST */}
        <aside className="flex flex-col w-96 border-r border-[var(--outline-variant)] bg-gray-50 shrink-0">
          <div className="p-3 border-b border-[var(--outline-variant)] bg-white flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Queue: {filteredEvents.length} Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5">
            {filteredEvents.map((item) => {
              const isSelected = item.id === selectedId;
              const isCritical = item.severity === "Critical";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 border-b border-[var(--outline-variant)]/60 transition-all block border-l-4 ${
                    isSelected
                      ? "bg-blue-50/60 border-[var(--primary)]"
                      : isCritical
                      ? "bg-white border-red-500"
                      : "bg-white border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase ${isCritical ? "text-red-600" : "text-[var(--primary)]"}`}>
                      {item.severity}: {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--on-surface)] truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.summary}
                  </p>
                </button>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">
                No compliance logs match your filter query.
              </div>
            )}
          </div>
        </aside>

        {/* CONTENT PANEL: DETAIL & VISUAL DIFF */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Detail Header */}
          {activeEvent && (
            <>
              <div className="px-8 py-6 border-b border-[var(--outline-variant)] bg-gray-50 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="px-2 py-0.5 bg-blue-900 text-white text-[10px] font-bold rounded uppercase">
                        {activeEvent.category}
                      </span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-xs text-gray-600 font-medium">
                        Event ID: {activeEvent.id}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--on-surface)]">
                      {activeEvent.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Change requested by <span className="text-[var(--on-surface)] font-semibold">{activeEvent.requestedBy}</span> via workflow <span className="underline">{activeEvent.workflowRef}</span>.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                        {activeEvent.userInitials}
                      </div>
                      <span className="text-sm font-medium">{activeEvent.targetEmployee}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{activeEvent.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Code Diff Layout */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Modification Box */}
                  <div className="bg-white border border-[var(--outline-variant)] rounded-xl p-5 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Modification Logic Explanation
                    </h4>
                    <p className="text-sm text-[var(--on-surface)] leading-relaxed">
                      {activeEvent.explanation}
                    </p>
                  </div>

                  {/* Diff Editor */}
                  <div className="flex flex-col border border-[var(--outline-variant)] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-[var(--outline-variant)]">
                      <span className="text-xs font-bold text-gray-500 uppercase">Policy Config Context</span>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-gray-700 bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed">
                      <DiffPanel 
                        title="Before Changes" 
                        lines={activeEvent.diffBefore} 
                        highlightBgClass="bg-red-950/50" 
                        highlightTextClass="text-red-400" 
                      />
                      <DiffPanel 
                        title="After Changes" 
                        lines={activeEvent.diffAfter} 
                        highlightBgClass="bg-green-950/50" 
                        highlightTextClass="text-green-400" 
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <footer className="h-20 border-t border-[var(--outline-variant)] bg-white flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
                <button
                  type="button"
                  onClick={() => console.log("Requesting clarification...")}
                  className="border border-[var(--outline-variant)] px-4 py-2 text-sm font-semibold rounded-lg text-gray-600 flex items-center gap-2 hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  Request Clarification
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFlagReview(activeEvent.id)}
                    className="flex items-center gap-2 px-5 py-2 text-red-600 text-sm font-semibold border border-red-200 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    Flag for Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(activeEvent.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Approve Change
                  </button>
                </div>
              </footer>
            </>
          )}

        </section>
      </div>
    </div>
  );
}