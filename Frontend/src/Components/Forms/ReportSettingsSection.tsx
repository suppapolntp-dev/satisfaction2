"use client";

import React from "react";

export interface ReportSettingsState {
  pdfHeaderTitle: string;
  pdfFooterNote: string;
  defaultExportFormat: "excel" | "pdf";
  includeWatermark: boolean;
}

interface ReportSettingsSectionProps {
  reportConfig: ReportSettingsState;
  onUpdateReportConfig: (updatedFields: Partial<ReportSettingsState>) => void;
}

export default function ReportSettingsSection({
  reportConfig,
  onUpdateReportConfig,
}: ReportSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">description</span>
          Report & Export Settings (การตั้งค่ารายงานและการส่งออกข้อมูล)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure automated PDF and Excel headers, confidentiality notices, and watermark rules.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* PDF Header Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            PDF Header Title
          </label>
          <input
            type="text"
            value={reportConfig.pdfHeaderTitle}
            onChange={(inputEvent) => onUpdateReportConfig({ pdfHeaderTitle: inputEvent.target.value })}
            className="input-text w-full"
          />
        </div>

        {/* PDF Footer Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            PDF Footer Disclaimer & Note
          </label>
          <textarea
            rows={2}
            value={reportConfig.pdfFooterNote}
            onChange={(textAreaEvent) => onUpdateReportConfig({ pdfFooterNote: textAreaEvent.target.value })}
            className="input-text w-full"
          />
        </div>

        <hr className="border-slate-100" />

        {/* Default Export Format */}
        <div className="max-w-md space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Default Export Format
          </label>
          <select
            value={reportConfig.defaultExportFormat}
            onChange={(selectEvent) => onUpdateReportConfig({ defaultExportFormat: selectEvent.target.value as "excel" | "pdf" })}
            className="input-select w-full"
          >
            <option value="excel">Microsoft Excel (.xlsx)</option>
            <option value="pdf">Adobe PDF (.pdf)</option>
          </select>
        </div>
      </div>
    </section>
  );
}
