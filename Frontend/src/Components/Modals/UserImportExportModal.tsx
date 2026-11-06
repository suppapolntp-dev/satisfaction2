"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ImportedUserModel } from "@/Types/user";

export type { ImportedUserModel };

interface UserImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsers: ImportedUserModel[];
  availableBrands?: string[];
  onImportSuccess: (newUsers: ImportedUserModel[]) => void;
}

export default function UserImportExportModal({
  isOpen,
  onClose,
  currentUsers,
  availableBrands = [],
  onImportSuccess,
}: UserImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");

  // ─── Import State ───
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ImportedUserModel[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Export State ───
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "xml">("csv");
  const [exportBrandFilter, setExportBrandFilter] = useState("All");

  if (!isOpen) return null;

  // ─── 1. ฟังก์ชันดาวน์โหลดไฟล์ตัวอย่าง Template (CSV / JSON) ───
  const handleDownloadSampleTemplate = (format: "csv" | "json") => {
    if (format === "csv") {
      const sampleCsv = 
        "firstName,lastName,email,phone,brand,region,province,branch,role,status\n" +
        "Somchai,Kiatsakul,somchai.k@company.com,+66 81 234 5678,Brand Name,ภาคเหนือ,เชียงใหม่,Branch Name,Administrator,Active\n";
      
      downloadFile(sampleCsv, "sample_user_import_template.csv", "text/csv;charset=utf-8;");
    } else {
      const sampleJson = JSON.stringify([
        {
          firstName: "Somchai",
          lastName: "Kiatsakul",
          email: "somchai.k@company.com",
          phone: "+66 81 234 5678",
          brand: "Brand Name",
          region: "ภาคเหนือ",
          province: "เชียงใหม่",
          branch: "Branch Name",
          role: "Administrator",
          status: "Active"
        }
      ], null, 2);

      downloadFile(sampleJson, "sample_user_import_template.json", "application/json");
    }
  };

  // ─── 2. ฟังก์ชันอ่านและถอดรหัสไฟล์ Import (CSV, JSON, XML) ───
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportError(null);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        const fileName = file.name.toLowerCase();

        let importedList: ImportedUserModel[] = [];

        if (fileName.endsWith(".json")) {
          // Parse JSON
          const rawData = JSON.parse(fileContent);
          if (Array.isArray(rawData)) {
            importedList = rawData.map((item, index) => ({
              id: item.id || `IMP-${Date.now()}-${index}`,
              userCode: item.userCode || `EMP-${100 + index}`,
              firstName: item.firstName || item.first_name || "Unknown",
              lastName: item.lastName || item.last_name || "",
              email: item.email || `user${index}@imported.com`,
              phone: item.phone || "-",
              brand: item.brand || "All Brands",
              region: item.region || "-",
              province: item.province || "-",
              branch: item.branch || "All Branches",
              role: item.role || "Manager",
              tierLevel: item.tierLevel || "Branch Staff",
              status: (item.status === "Inactive" ? "Inactive" : "Active") as "Active" | "Inactive",
            }));
          } else {
            throw new Error("โครงสร้าง JSON ต้องเป็น Array ของ Object รายชื่อผู้ใช้งาน");
          }
        } else if (fileName.endsWith(".csv")) {
          // Parse CSV
          const lines = fileContent.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
          if (lines.length <= 1) {
            throw new Error("ไฟล์ CSV ว่างเปล่า หรือไม่มีแถวข้อมูล");
          }

          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
          
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map((c) => c.trim());
            if (cols.length >= 3) {
              const parsedStatus = (cols[headers.indexOf("status")] || cols[9] || "Active").toLowerCase();
              importedList.push({
                id: `IMP-${Date.now()}-${i}`,
                userCode: `EMP-${100 + i}`,
                firstName: cols[headers.indexOf("firstname")] || cols[0] || "User",
                lastName: cols[headers.indexOf("lastname")] || cols[1] || "",
                email: cols[headers.indexOf("email")] || cols[2] || `user${i}@imported.com`,
                phone: cols[headers.indexOf("phone")] || cols[3] || "-",
                brand: cols[headers.indexOf("brand")] || cols[4] || "All Brands",
                region: cols[headers.indexOf("region")] || cols[5] || "-",
                province: cols[headers.indexOf("province")] || cols[6] || "-",
                branch: cols[headers.indexOf("branch")] || cols[7] || "All Branches",
                role: cols[headers.indexOf("role")] || cols[8] || "Manager",
                tierLevel: "Branch Staff",
                status: parsedStatus.includes("inact") ? "Inactive" : "Active",
              });
            }
          }
        } else {
          throw new Error("รองรับเฉพาะไฟล์นามสกุล .CSV หรือ .JSON เท่านั้น");
        }

        if (importedList.length === 0) {
          throw new Error("ไม่พบรายการข้อมูลที่ถูกต้องในไฟล์");
        }

        setParsedUsers(importedList);
      } catch (err: any) {
        setImportError(err.message || "เกิดข้อผิดพลาดในการประมวลผลไฟล์");
        setParsedUsers([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setImportError("ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  // ─── 3. ยืนยันการ Import เข้าสู่ระบบ ───
  const handleConfirmImport = () => {
    if (parsedUsers.length === 0) return;
    onImportSuccess(parsedUsers);
    onClose();
  };

  // ─── 4. ฟังก์ชัน Export ข้อมูล (CSV, JSON, XML) ───
  const handleExecuteExport = () => {
    let usersToExport = currentUsers;
    if (exportBrandFilter !== "All") {
      usersToExport = usersToExport.filter((u) => Boolean(u.brand && u.brand.includes(exportBrandFilter)));
    }

    if (usersToExport.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออกตามเงื่อนไขที่เลือก");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (exportFormat === "json") {
      const jsonContent = JSON.stringify(usersToExport, null, 2);
      downloadFile(jsonContent, `users_export_${timestamp}.json`, "application/json");
    } else if (exportFormat === "csv") {
      const csvHeader = "ID,First Name,Last Name,Email,Phone,Brand,Region,Province,Branch,Role,Status\n";
      const csvRows = usersToExport.map((u) => 
        `"${u.id}","${u.firstName}","${u.lastName}","${u.email}","${u.phone || ""}","${u.brand}","${u.region || ""}","${u.province || ""}","${u.branch}","${u.role}","${u.status}"`
      ).join("\n");
      downloadFile(csvHeader + csvRows, `users_export_${timestamp}.csv`, "text/csv;charset=utf-8;");
    } else if (exportFormat === "xml") {
      let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<Users>\n';
      usersToExport.forEach((u) => {
        xmlContent += `  <User id="${u.id}">\n`;
        xmlContent += `    <FirstName>${u.firstName}</FirstName>\n`;
        xmlContent += `    <LastName>${u.lastName}</LastName>\n`;
        xmlContent += `    <Email>${u.email}</Email>\n`;
        xmlContent += `    <Phone>${u.phone || ""}</Phone>\n`;
        xmlContent += `    <Brand>${u.brand}</Brand>\n`;
        xmlContent += `    <Region>${u.region || ""}</Region>\n`;
        xmlContent += `    <Province>${u.province || ""}</Province>\n`;
        xmlContent += `    <Branch>${u.branch}</Branch>\n`;
        xmlContent += `    <Role>${u.role}</Role>\n`;
        xmlContent += `    <Status>${u.status}</Status>\n`;
        xmlContent += `  </User>\n`;
      });
      xmlContent += "</Users>";
      downloadFile(xmlContent, `users_export_${timestamp}.xml`, "application/xml");
    }
  };

  // Utility ดาวน์โหลดไฟล์ไปยังเบราว์เซอร์
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-xl">swap_vert</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                User Bulk Import & Export Center
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                นำเข้าและส่งออกฐานข้อมูลผู้ใช้งาน รองรับไฟล์ CSV, JSON, XML
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "import"
                ? "border-blue-900 text-blue-900 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Bulk Import (นำเข้าข้อมูล)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "export"
                ? "border-blue-900 text-blue-900 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Data (ส่งออกไฟล์)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          {/* ─── TAB 1: IMPORT ─── */}
          {activeTab === "import" && (
            <div className="space-y-4">
              
              {/* Template Download Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">ดาวน์โหลดไฟล์ตัวอย่างต้นแบบ (Sample Templates)</span>
                  <span className="text-[11px] text-slate-500">ใช้ไฟล์แม่แบบเพื่อความถูกต้องของโครงสร้างฟิลด์ข้อมูล</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSampleTemplate("csv")}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-[11px] hover:bg-slate-50 flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Template (.CSV)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSampleTemplate("json")}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-[11px] hover:bg-slate-50 flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Template (.JSON)
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-4xl text-blue-900 mb-2">
                  cloud_upload
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  รองรับไฟล์รูปแบบ .CSV และ .JSON (ขนาดไฟล์ไม่เกิน 10MB)
                </p>
                {selectedFile && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-900 font-mono font-bold rounded-xl border border-blue-200">
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 font-semibold text-xs">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview Table */}
              {parsedUsers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      ตัวอย่างข้อมูลที่ตรวจพบ ({parsedUsers.length} รายชื่อ):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      พร้อมนำเข้า
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2">ชื่อ-นามสกุล</th>
                          <th className="p-2">อีเมล</th>
                          <th className="p-2">แบรนด์</th>
                          <th className="p-2">สาขา</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedUsers.slice(0, 10).map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-semibold text-slate-800">{u.firstName} {u.lastName}</td>
                            <td className="p-2 font-mono text-slate-600">{u.email}</td>
                            <td className="p-2 text-slate-700">{u.brand}</td>
                            <td className="p-2 text-slate-600">{u.branch}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedUsers.length > 10 && (
                    <p className="text-[10px] text-slate-400 text-right">
                      ...และอีก {parsedUsers.length - 10} รายการ
                    </p>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ─── TAB 2: EXPORT ─── */}
          {activeTab === "export" && (
            <div className="space-y-4">
              
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">เลือกรูปแบบไฟล์ที่ต้องการส่งออก (File Format)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "csv", label: "Excel / CSV (.csv)", desc: "เปิดบน Excel & Google Sheets", icon: "table_view" },
                    { id: "json", label: "JSON Document (.json)", desc: "โครงสร้างข้อมูลมาตรฐาน API", icon: "data_object" },
                    { id: "xml", label: "XML Format (.xml)", desc: "สำหรับเชื่อมต่อระบบ Enterprise", icon: "code" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportFormat(fmt.id as "csv" | "json" | "xml")}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        exportFormat === fmt.id
                          ? "border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-blue-900 text-2xl mb-2">{fmt.icon}</span>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{fmt.label}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{fmt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block">กรองแบรนด์ที่ต้องการส่งออก (Filter by Brand)</label>
                <select
                  value={exportBrandFilter}
                  onChange={(e) => setExportBrandFilter(e.target.value)}
                  className="input-select w-full bg-white"
                >
                  <option value="All">ทุกแบรนด์ (All Brands - ทั้งหมด {currentUsers.length} รายชื่อ)</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-950 block">พร้อมส่งออกข้อมูล</span>
                  <span className="text-[11px] text-blue-700">
                    {exportBrandFilter === "All" ? currentUsers.length : currentUsers.filter((u) => u.brand === exportBrandFilter).length} รายการ ในรูปแบบ .{exportFormat.toUpperCase()}
                  </span>
                </div>
                <span className="material-symbols-outlined text-blue-900 text-3xl">download_done</span>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>

          {activeTab === "import" ? (
            <button
              type="button"
              disabled={parsedUsers.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className={`btn-primary shadow-xs ${parsedUsers.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Confirm Import ({parsedUsers.length} Users)
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExecuteExport}
              className="btn-primary shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download Export File (.{exportFormat.toUpperCase()})
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
