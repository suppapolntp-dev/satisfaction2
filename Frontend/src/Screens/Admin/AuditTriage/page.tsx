"use client";

import React, { useState, useMemo } from "react";
// à¸”à¸¶à¸‡à¸„à¸­à¸¡à¹‚à¸žà¹€à¸™à¸™à¸•à¹Œà¸„à¹‰à¸™à¸«à¸²à¸—à¸µà¹ˆà¹€à¸›à¹‡à¸™à¸ªà¹ˆà¸§à¸™à¸à¸¥à¸²à¸‡à¸‚à¸­à¸‡à¸—à¸µà¸¡à¸¡à¸²à¸£à¹ˆà¸§à¸¡à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸ˆà¸£à¸´à¸‡ à¹„à¸¡à¹ˆà¸¡à¸±à¹ˆà¸§à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸«à¸¡à¹ˆà¸‹à¹‰à¸³à¸‹à¹‰à¸­à¸™
import SearchInput from "@/Components/Inputs/SearchInput";

// â”€â”€â”€ 1. à¸™à¸´à¸¢à¸²à¸¡à¹‚à¸„à¸£à¸‡à¸ªà¸£à¹‰à¸²à¸‡à¸›à¸£à¸°à¹€à¸ à¸—à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ (TypeScript Interfaces) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CodeDiffLine {
  lineNumber: string;
  lineText: string;
  isLineHighlighted: boolean;
}

interface AuditLogEvent {
  eventId: string;
  categoryName: string;
  timestampText: string;
  eventTitle: string;
  descriptionSummary: string;
  eventStatus: "Pending Review" | "Currently Viewing" | "Unassigned";
  severityLevel: "Critical" | "Regular";
  requestedByUserName: string;
  workflowReferenceText: string;
  userInitials: string;
  targetEmployeeName: string;
  modificationExplanation: string;
  codeDiffBeforeList: CodeDiffLine[];
  codeDiffAfterList: CodeDiffLine[];
}

// â”€â”€â”€ 2. à¸Šà¸¸à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸³à¸¥à¸­à¸‡ (Mock Data) à¹à¸šà¸šà¸žà¸­à¸”à¸µà¸„à¸³ à¸ªà¸·à¹ˆà¸­à¸„à¸§à¸²à¸¡à¸«à¸¡à¸²à¸¢à¸Šà¸±à¸”à¹€à¸ˆà¸™ à¹„à¸¡à¹ˆà¹ƒà¸Šà¹‰ ID à¸¡à¸±à¸à¸‡à¹ˆà¸²à¸¢ â”€â”€â”€
const INITIAL_AUDIT_EVENTS: AuditLogEvent[] = [];

export default function AuditScreen() {
  // â”€â”€â”€ 3. à¸£à¸°à¸šà¸šà¸„à¸§à¸šà¸„à¸¸à¸¡à¸ªà¸–à¸²à¸™à¸° State (à¸Šà¸·à¹ˆà¸­à¸•à¸±à¸§à¹à¸›à¸£à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸¢à¸´à¸š à¸­à¹ˆà¸²à¸™à¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [searchEventQuery, setSearchEventQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("AUD-8829-X");
  const [auditEventList, setAuditEventList] = useState<AuditLogEvent[]>(INITIAL_AUDIT_EVENTS);

  // â”€â”€â”€ 4. à¸£à¸°à¸šà¸šà¸”à¸±à¸à¸à¸£à¸­à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸žà¸·à¹ˆà¸­à¸„à¸§à¸²à¸¡à¸¥à¸·à¹ˆà¸™à¹„à¸«à¸¥à¸«à¸™à¹‰à¸²à¸šà¹‰à¸²à¸™ (Derived State) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredAuditEvents = useMemo(() => {
    const searchTargetLowercase = searchEventQuery.toLowerCase();
    return auditEventList.filter((individualEvent) => {
      return (
        individualEvent.eventTitle.toLowerCase().includes(searchTargetLowercase) ||
        individualEvent.descriptionSummary.toLowerCase().includes(searchTargetLowercase)
      );
    });
  }, [auditEventList, searchEventQuery]);

  // à¸„à¹‰à¸™à¸«à¸²à¸§à¸±à¸•à¸–à¸¸à¸à¸´à¸ˆà¸à¸£à¸£à¸¡à¸—à¸µà¹ˆà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸à¸³à¸¥à¸±à¸‡à¹€à¸›à¸´à¸”à¸à¸”à¸”à¸¹à¸­à¸¢à¸¹à¹ˆ à¸“ à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™à¸šà¸™à¸«à¸™à¹‰à¸²à¸ˆà¸­à¸à¸±à¹ˆà¸‡à¸‚à¸§à¸²
  const activeSelectedEvent = useMemo(() => {
    return (
      auditEventList.find((individualEvent) => individualEvent.eventId === selectedEventId) ??
      auditEventList[0]
    );
  }, [auditEventList, selectedEventId]);

  // â”€â”€â”€ 5. à¸Ÿà¸±à¸‡à¸à¹Œà¸Šà¸±à¸™à¸ªà¸³à¸«à¸£à¸±à¸šà¸£à¸±à¸šà¸„à¸³à¸ªà¸±à¹ˆà¸‡à¸à¸²à¸£à¸„à¸¥à¸´à¸à¸›à¸¸à¹ˆà¸¡à¸•à¹ˆà¸²à¸‡à¹† (Action Handlers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleApproveEvent = (targetEventId: string) => {
    console.log("Approved compliance log change for ID:", targetEventId);
    alert(`à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡à¸£à¸«à¸±à¸ªà¹€à¸«à¸•à¸¸à¸à¸²à¸£à¸“à¹Œ ${targetEventId} à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§`);
  };

  const handleFlagEvent = (targetEventId: string) => {
    console.log("Flagged event for intermediate review:", targetEventId);
    alert(`à¸•à¸´à¸”à¸˜à¸‡à¹à¸ˆà¹‰à¸‡à¹€à¸•à¸·à¸­à¸™à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡à¸ªà¸³à¸«à¸£à¸±à¸šà¹€à¸«à¸•à¸¸à¸à¸²à¸£à¸“à¹Œ ${targetEventId}`);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--background)] text-[var(--on-surface)]">
      
      {/* â”€â”€ HEADER SECTION â”€â”€ */}
      <header className="flex justify-between items-center w-full px-6 h-16 bg-white border-b border-[var(--outline-variant)] shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--on-surface)]">Audit Triage</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Unacknowledged Event Queue
            </p>
          </div>
        </div>

        {/* Executive KPIs Banner */}
        <div className="hidden lg:flex items-center gap-8 border-x border-[var(--outline-variant)]/30 px-8 h-full">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase leading-none">Score</div>
            <div className="text-lg font-bold leading-none">98.4%</div>
            <span className="material-symbols-outlined text-green-600 text-[16px]">trending_up</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase leading-none">Critical</div>
            <div className="text-lg font-bold text-red-600 leading-none">42</div>
            <span className="material-symbols-outlined text-red-600 text-[16px]">warning</span>
          </div>
        </div>

        {/* à¹à¸œà¸‡à¸„à¹‰à¸™à¸«à¸²à¸„à¸¸à¸¡à¸œà¹ˆà¸²à¸™à¸ªà¸¥à¹‡à¸­à¸•à¸„à¸­à¸¡à¹‚à¸žà¹€à¸™à¸™à¸•à¹Œà¸ªà¹ˆà¸§à¸™à¸à¸¥à¸²à¸‡à¸£à¹ˆà¸§à¸¡à¸à¸±à¸šà¸›à¸¸à¹ˆà¸¡à¸à¸”à¸£à¸µà¹€à¸Ÿà¸£à¸Š */}
        <div className="flex items-center gap-4">
          <div className="w-64">
            <SearchInput
              value={searchEventQuery}
              onChange={setSearchEventQuery}
              placeholder="Filter queue..."
            />
          </div>
          <button
            type="button"
            onClick={() => console.log("Refreshing audit log pipeline data...")}
            className="flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </header>

      {/* â”€â”€ MAIN SPLIT-PANE LAYOUT â”€â”€ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ðŸ“‘ LEFT SIDEBAR: AUDIT QUEUE LIST */}
        <aside className="flex flex-col w-96 border-r border-[var(--outline-variant)] bg-white shrink-0">
          <div className="p-3 border-b border-[var(--outline-variant)] bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Queue: {filteredAuditEvents.length} Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 space-y-0.5">
            {filteredAuditEvents.map((individualEvent) => {
              // à¹€à¸Šà¹‡à¸à¸ªà¹€à¸•à¸•à¸±à¸ªà¹€à¸žà¸·à¹ˆà¸­à¸ªà¸¥à¸±à¸šà¸à¸²à¸£à¹à¸ªà¸”à¸‡à¸œà¸¥à¸ªà¸–à¸²à¸™à¸°à¹à¸¥à¸°à¸à¸²à¸£à¹€à¸™à¹‰à¸™à¸ªà¸µà¸žà¸·à¹‰à¸™à¸«à¸¥à¸±à¸‡
              const isEventSelected = individualEvent.eventId === selectedEventId;
              const isCriticalSeverity = individualEvent.severityLevel === "Critical";

              return (
                <button
                  key={individualEvent.eventId}
                  type="button"
                  onClick={() => setSelectedEventId(individualEvent.eventId)}
                  className={`w-full text-left p-4 border-b border-[var(--outline-variant)]/60 transition-all block border-l-4 ${
                    isEventSelected
                      ? "bg-blue-50/60 border-[var(--primary)]"
                      : isCriticalSeverity
                      ? "bg-white border-red-500"
                      : "bg-white border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase ${isCriticalSeverity ? "text-red-600" : "text-[var(--primary)]"}`}>
                      {individualEvent.severityLevel}: {individualEvent.categoryName}
                    </span>
                    <span className="text-[10px] text-gray-400">{individualEvent.timestampText}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--on-surface)] truncate">
                    {individualEvent.eventTitle}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {individualEvent.descriptionSummary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isCriticalSeverity ? "bg-red-500" : "bg-[var(--primary)]"}`} />
                    <span className="text-[11px] text-gray-600 font-medium">
                      {individualEvent.eventId} â€¢ {isEventSelected ? "Currently Viewing" : individualEvent.eventStatus}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredAuditEvents.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">
                No compliance logs match your filter query.
              </div>
            )}
          </div>
        </aside>

        {/* ðŸ’» RIGHT CONTENT PANEL: VISUAL DIFF & EVENT DETAILS */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Detail View Header */}
          <div className="px-8 py-6 border-b border-[var(--outline-variant)] bg-gray-50 shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="px-2 py-0.5 bg-blue-900 text-white text-[10px] font-bold rounded uppercase">
                    {activeSelectedEvent.categoryName}
                  </span>
                  <span className="text-gray-400 text-xs">â€¢</span>
                  <span className="text-xs text-gray-600 font-medium">
                    Event ID: {activeSelectedEvent.eventId}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--on-surface)]">
                  {activeSelectedEvent.eventTitle}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Change requested by <span className="text-[var(--on-surface)] font-semibold">{activeSelectedEvent.requestedByUserName}</span> via automated workflow <span className="underline">{activeSelectedEvent.workflowReferenceText}</span>.
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                    {activeSelectedEvent.userInitials}
                  </div>
                  <span className="text-sm font-medium">{activeSelectedEvent.targetEmployeeName}</span>
                </div>
                <span className="text-[11px] text-gray-400">Oct 27, 2023 Â· 14:32:11</span>
              </div>
            </div>
          </div>

          {/* Visual Diffing Content Space */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Change Modification Purpose Box */}
              <div className="bg-white border border-[var(--outline-variant)] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Modification Logic Explanation
                </h4>
                <p className="text-sm text-[var(--on-surface)] leading-relaxed">
                  {activeSelectedEvent.modificationExplanation}
                </p>
              </div>

              {/* Code/Policy Structured Diff View */}
              {activeSelectedEvent.codeDiffBeforeList.length > 0 && (
                <div className="flex flex-col border border-[var(--outline-variant)] rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-[var(--outline-variant)]">
                    <span className="text-xs font-bold text-gray-500 uppercase">Policy Config Context</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-red-200" />
                        <span className="text-[10px] text-gray-500 font-bold">DELETIONS</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-green-200" />
                        <span className="text-[10px] text-gray-500 font-bold">ADDITIONS</span>
                      </div>
                    </div>
                  </div>

                  {/* à¸à¸£à¸°à¸”à¸²à¸™à¹‚à¸„à¹‰à¸”à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸šà¸‹à¹‰à¸²à¸¢-à¸‚à¸§à¸² */}
                  <div className="grid grid-cols-2 divide-x divide-gray-700 bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed">
                    
                    {/* à¸à¸±à¹ˆà¸‡à¸ªà¸ à¸²à¸§à¸°à¸à¹ˆà¸­à¸™à¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚ (Before) */}
                    <div className="flex flex-col">
                      <div className="bg-slate-800 px-4 py-1.5 border-b border-slate-700 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Before Changes
                      </div>
                      <div className="p-4 space-y-1">
                        {activeSelectedEvent.codeDiffBeforeList.map((individualCodeLine) => (
                          <div
                            key={`before-${individualCodeLine.lineNumber}`}
                            className={`flex gap-3 -mx-4 px-4 ${individualCodeLine.isLineHighlighted ? "bg-red-950/50 text-red-400" : ""}`}
                          >
                            <span className="w-6 text-slate-600 text-right select-none shrink-0">
                              {individualCodeLine.lineNumber}
                            </span>
                            <span className="whitespace-pre truncate">{individualCodeLine.lineText}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* à¸à¸±à¹ˆà¸‡à¸ªà¸ à¸²à¸§à¸°à¸«à¸¥à¸±à¸‡à¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚ (After) */}
                    <div className="flex flex-col">
                      <div className="bg-slate-800 px-4 py-1.5 border-b border-slate-700 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        After Changes
                      </div>
                      <div className="p-4 space-y-1">
                        {activeSelectedEvent.codeDiffAfterList.map((individualCodeLine) => (
                          <div
                            key={`after-${individualCodeLine.lineNumber}`}
                            className={`flex gap-3 -mx-4 px-4 ${individualCodeLine.isLineHighlighted ? "bg-green-950/50 text-green-400" : ""}`}
                          >
                            <span className="w-6 text-slate-600 text-right select-none shrink-0">
                              {individualCodeLine.lineNumber}
                            </span>
                            <span className="whitespace-pre truncate">{individualCodeLine.lineText}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Informational Insights Warning Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-600">report_problem</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Security Guard Warning</span>
                    <p className="text-xs text-amber-800 mt-0.5">
                      This scope modification bypasses standard departmental boundaries for {activeSelectedEvent.targetEmployeeName}.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Automated Audit Trail Note</span>
                    <p className="text-xs text-blue-800 mt-0.5">
                      Similar operational escalation patterns were approved for 3 other users in the same sector last week.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* âš¡ STICKY TRIAGE PANEL ACTIONS FOOTER */}
          <footer className="h-20 border-t border-[var(--outline-variant)] bg-white flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
            <div>
              <button
                type="button"
                onClick={() => console.log("Requesting more clarifications for event:", selectedEventId)}
                className="btn-ghost border border-[var(--outline-variant)] px-4 py-2 text-sm font-semibold rounded-lg text-gray-600 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">help</span>
                Request Clarification
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFlagEvent(selectedEventId)}
                className="flex items-center gap-2 px-5 py-2 text-red-600 text-sm font-semibold border border-red-200 hover:bg-red-50 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">flag</span>
                Flag for Review
              </button>
              <button
                type="button"
                onClick={() => handleApproveEvent(selectedEventId)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-950 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Approve Change
              </button>
            </div>
          </footer>

        </section>
      </div>

    </div>
  );
}