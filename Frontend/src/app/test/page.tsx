"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SatisfactionScreen from "@/Screens/User/Satifaction/page";
import DashboardScreen from "@/Screens/Admin/Dashboard/page";
import BrandManagementScreen from "@/Screens/Admin/BrandManagement/page";
import EventManagementScreen from "@/Screens/Admin/EventManagement/page";
import { ErrorView } from "@/Components/Errors";

// ประเภทหน้าจอทั้งหมดที่เลือกเทสได้
export type ScreenRouteKey =
  | "way-to-go"
  | "dashboard"
  | "satisfaction"
  | "brand"
  | "event"
  | "error-500"
  | "error-404"
  | "error-403"
  | "runtime-crash"
  | "empty";

export interface LogMessage {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
  source: string;
  message: string;
  detail?: string;
}

const SCREEN_OPTIONS: { key: ScreenRouteKey; label: string; route: string; icon: string; category: "app" | "error" | "sandbox" }[] = [
  { key: "way-to-go", label: "Way to go! (Dribbble 1:1 Reference)", route: "/test?view=way-to-go", icon: "celebration", category: "error" },
  { key: "error-500", label: "Error 500 (Oops! Something went wrong)", route: "/500", icon: "error", category: "error" },
  { key: "error-404", label: "Error 404 (Not Found)", route: "/404", icon: "search_off", category: "error" },
  { key: "error-403", label: "Error 403 (Access Denied)", route: "/unauthorized", icon: "lock", category: "error" },
  { key: "dashboard", label: "Dashboard (/dashboard)", route: "/dashboard", icon: "dashboard", category: "app" },
  { key: "satisfaction", label: "Satisfaction Kiosk (/satisfaction)", route: "/satisfaction", icon: "sentiment_satisfied", category: "app" },
  { key: "brand", label: "Brand Management (/brand)", route: "/brand", icon: "store", category: "app" },
  { key: "event", label: "Event Management (/event)", route: "/event", icon: "event", category: "app" },
  { key: "runtime-crash", label: "Runtime Crash Simulator", route: "/test?crash=true", icon: "bug_report", category: "sandbox" },
  { key: "empty", label: "Blank Testing Slot", route: "/test?slot=blank", icon: "add_box", category: "sandbox" },
];

/**
 * 💥 Error Thrower Component สำหรับทดสอบว่าหน้าจอจับ Error ได้อย่างไร
 */
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated Runtime Crash: TypeError: Cannot read properties of undefined (reading 'calculateCSATScore')");
  }
  return (
    <div className="p-8 text-center bg-white rounded-3xl border-2 border-[#0F2231] shadow-xl max-w-md mx-auto my-12">
      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-semibold text-2xl border border-emerald-200">
        <span className="material-symbols-outlined text-[28px]">check_circle</span>
      </div>
      <h3 className="text-lg font-bold text-[#0F2231]">Component ทำงานปกติ</h3>
      <p className="text-xs text-slate-500 mt-2 mb-5 leading-relaxed">
        กดปุ่มจำลองด้านล่างเพื่อสั่ง Throw Exception จริง แล้วดูว่า React Error Boundary ดักจับและส่ง Log Messages ลง Console อย่างไร
      </p>
    </div>
  );
}

/**
 * 🛡️ Test Error Boundary สำหรับดักจับ Crash ในหน้า Playground และส่ง Log เข้าสู่ Console
 */
class PlaygroundErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    currentScreen: ScreenRouteKey;
    onLog: (log: Omit<LogMessage, "id" | "timestamp">) => void;
    onReset: () => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    currentScreen: ScreenRouteKey;
    onLog: (log: Omit<LogMessage, "id" | "timestamp">) => void;
    onReset: () => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onLog({
      level: "ERROR",
      source: `[ErrorBoundary @ ${this.props.currentScreen}]`,
      message: error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิดใน Component",
      detail: `${error.stack || ""}\nComponent Stack: ${errorInfo.componentStack || ""}`,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onLog({
      level: "SUCCESS",
      source: "[ErrorBoundary]",
      message: `กู้คืนสถานะสำเร็จ (Reset Boundary สำหรับหน้า ${this.props.currentScreen})`,
    });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorView
          statusCode={500}
          title="Oops something went wrong!"
          description="Error Boundary ตรวจพบข้อผิดพลาดขณะเรนเดอร์หน้าจอ ข้อมูลถูกบันทึกใน Log Messages ด้านล่างแล้ว"
          errorCode="ERR_COMPONENT_RENDER_CRASH"
          error={this.state.error}
          reset={this.handleReset}
          primaryAction={{
            label: "ลองใหม่อีกครั้ง (Reset)",
            icon: "refresh",
            onClick: this.handleReset,
          }}
          secondaryAction={{
            label: "กลับสู่หน้า Dashboard",
            icon: "dashboard",
            href: "/dashboard",
          }}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * 🧪 Developer Test Playground (/test)
 * หน้าทดสอบ Sandbox สำหรับสลับหน้าจอ ดูจุดเกิด Error และ Log Messages แบบเรียลไทม์
 */
export default function TestPlaygroundPage() {
  const [selectedScreen, setSelectedScreen] = useState<ScreenRouteKey>("way-to-go");
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [logFilter, setLogFilter] = useState<"ALL" | "ERROR" | "WARN" | "INFO">("ALL");
  const [isLogConsoleExpanded, setIsLogConsoleExpanded] = useState(true);
  const [hasSimulatedCrash, setHasSimulatedCrash] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  // ฟังก์ชันเพิ่ม Log Message พร้อมบันทึกเวลา
  const addLog = (newLog: Omit<LogMessage, "id" | "timestamp">) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;

    const entry: LogMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timeStr,
      ...newLog,
    };

    setLogs((prev) => [entry, ...prev].slice(0, 100)); // เก็บสูงสุด 100 logs
  };

  // Log เริ่มต้นเมื่อโหลดหน้า Playground
  useEffect(() => {
    addLog({
      level: "INFO",
      source: "[Playground]",
      message: "Developer Test Playground พร้อมทำงาน — เลือกหน้าบน Navbar เพื่อทดสอบการเรนเดอร์และตรวจสอบ Error",
    });
    addLog({
      level: "INFO",
      source: "[Navigation]",
      message: `กำลังเปิดหน้าเริ่มต้น: ${selectedScreen}`,
    });
  }, []);

  // เมื่อเปลี่ยนหน้าจอ
  const handleSelectScreen = (key: ScreenRouteKey) => {
    setSelectedScreen(key);
    setHasSimulatedCrash(false);
    const target = SCREEN_OPTIONS.find((s) => s.key === key);
    addLog({
      level: "INFO",
      source: "[Navigation]",
      message: `สลับไปยังหน้า: ${target?.label || key} (Route: ${target?.route || "-"})`,
    });
  };

  // จำลองยิง Error Log จาก API
  const handleSimulateApiError = () => {
    addLog({
      level: "ERROR",
      source: "[API Client: /api/v1/analytics/csat]",
      message: "HTTP 500 Internal Server Error: PostgreSQL replica connection pool exhausted",
      detail:
        "Npgsql.NpgsqlException: The connection pool has reached its maximum size of 100.\n   at Satifaction2.Backend.Services.ScopeFilterService.ApplyUserScopeAsync(IScopeFilterContext ctx)\n   at Satifaction2.Backend.Controllers.DashboardController.GetMetricsAsync()",
    });
  };

  // คัดลอก Logs
  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.source} - ${l.message}${l.detail ? `\nDetail: ${l.detail}` : ""}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  // ล้าง Logs
  const handleClearLogs = () => {
    setLogs([]);
    addLog({
      level: "INFO",
      source: "[Console]",
      message: "ล้าง Log Messages เรียบร้อยแล้ว",
    });
  };

  // กรอง Logs
  const filteredLogs = logs.filter((log) => {
    if (logFilter === "ALL") return true;
    return log.level === logFilter;
  });

  const errorCount = logs.filter((l) => l.level === "ERROR").length;
  const currentOption = SCREEN_OPTIONS.find((s) => s.key === selectedScreen);

  // Mock Error Object สำหรับโหมด Error 500
  const mock500Error = new Error("DatabaseConnectionTimeout: Failed to connect to Enterprise PostgreSQL replica pool") as Error & { digest?: string };
  mock500Error.digest = "51FC-3D73";
  mock500Error.stack =
    "Error: DatabaseConnectionTimeout: Failed to connect to Enterprise PostgreSQL replica pool\n    at async QueryExecutor.execute (D:\\DevProject\\Project\\Satifaction2\\Backend\\Services\\ScopeFilterService.cs:42:15)\n    at async DashboardController.GetMetrics (D:\\DevProject\\Project\\Satifaction2\\Backend\\Controllers\\DashboardController.cs:88:9)";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* ─── Top Navbar พร้อม Page Selector ─── */}
      <header className="bg-[#0C2B3A] text-white border-b border-slate-700/80 px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F95C2C] flex items-center justify-center font-bold text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">science</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">Developer Playground</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-[#2BB5B0] border border-slate-700">
                  /test
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                เลือกหน้าเพื่อดูว่าติด Error จุดไหน หรือทดสอบ Error Boundary
              </p>
            </div>
          </div>

          {/* ─── Page Selector Dropdown & Quick Actions ─── */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Screen Picker Dropdown */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px] pointer-events-none">
                {currentOption?.icon || "layers"}
              </span>
              <select
                value={selectedScreen}
                onChange={(e) => handleSelectScreen(e.target.value as ScreenRouteKey)}
                className="pl-9 pr-8 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-white hover:border-[#2BB5B0] focus:border-[#2BB5B0] focus:ring-1 focus:ring-[#2BB5B0] transition-all cursor-pointer shadow-xs appearance-none"
              >
                <optgroup label="📱 หน้าจอระบบหลัก (Core Screens)">
                  {SCREEN_OPTIONS.filter((s) => s.category === "app").map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🥀 Error Pages (Adam Fard Style)">
                  {SCREEN_OPTIONS.filter((s) => s.category === "error").map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🧪 Sandbox & Simulator">
                  {SCREEN_OPTIONS.filter((s) => s.category === "sandbox").map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 text-slate-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Quick Simulate API Error Button */}
            <button
              onClick={handleSimulateApiError}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="จำลองข้อผิดพลาดจาก Backend API เพื่อดูใน Log Messages"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span className="hidden sm:inline">จำลอง Error Log</span>
            </button>

            {/* Open Real Route Button */}
            {currentOption?.route && !currentOption.route.startsWith("/test") && (
              <Link
                href={currentOption.route}
                target="_blank"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0E747F]/40 text-[#2BB5B0] border border-[#2BB5B0]/30 hover:bg-[#0E747F]/60 transition-all ml-1 cursor-pointer"
                title={`เปิดหน้าจริง ${currentOption.route} ในแท็บใหม่`}
              >
                <span>เปิดหน้าจริง</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Viewport (Wrapped in Error Boundary) ─── */}
      <main className="flex-1 w-full bg-slate-50 relative overflow-y-auto">
        <PlaygroundErrorBoundary
          currentScreen={selectedScreen}
          onLog={addLog}
          onReset={() => setHasSimulatedCrash(false)}
        >
          {selectedScreen === "way-to-go" && (
            <ErrorView
              statusCode={200}
              title="Way to go!"
              description="you’ve create your first rule. time to add more rules and fully optimize all your prices."
              primaryAction={{
                label: "Got It",
                onClick: () =>
                  addLog({
                    level: "SUCCESS",
                    source: "[Dribbble Reference 1:1]",
                    message: "User clicked 'Got It' button successfully",
                  }),
              }}
            />
          )}

          {selectedScreen === "dashboard" && <DashboardScreen />}

          {selectedScreen === "satisfaction" && <SatisfactionScreen />}

          {selectedScreen === "brand" && <BrandManagementScreen />}

          {selectedScreen === "event" && <EventManagementScreen />}

          {selectedScreen === "error-500" && (
            <ErrorView
              statusCode={500}
              title="Oops something went wrong!"
              description="ระบบพบปัญหาในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง หรือกลับไปที่หน้าหลัก"
              errorCode="51FC-3D73"
              error={mock500Error}
              reset={() =>
                addLog({
                  level: "SUCCESS",
                  source: "[Error 500]",
                  message: "กดปุ่มลองใหม่อีกครั้ง — ทำการรีเซ็ตสถานะเรียบร้อย",
                })
              }
              primaryAction={{
                label: "ลองใหม่อีกครั้ง",
                icon: "refresh",
                onClick: () =>
                  addLog({
                    level: "SUCCESS",
                    source: "[Error 500]",
                    message: "กดปุ่มลองใหม่อีกครั้ง — ทำการรีเซ็ตสถานะเรียบร้อย",
                  }),
              }}
              secondaryAction={{
                label: "กลับสู่หน้า Dashboard",
                icon: "dashboard",
                href: "/dashboard",
              }}
            />
          )}

          {selectedScreen === "error-404" && (
            <ErrorView
              statusCode={404}
              title="Oops! ไม่พบหน้าที่ต้องการ (404)"
              description="หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่พร้อมใช้งานชั่วคราวในระบบ Enterprise CSAT"
              errorCode="ERR_404_NOT_FOUND"
              primaryAction={{
                label: "กลับสู่หน้า Dashboard",
                icon: "dashboard",
                href: "/dashboard",
              }}
              secondaryAction={{
                label: "เข้าสู่ระบบ",
                icon: "login",
                href: "/login",
              }}
            />
          )}

          {selectedScreen === "error-403" && (
            <ErrorView
              statusCode={403}
              title="Oops! ปฏิเสธการเข้าถึง (403)"
              description="คุณไม่มีสิทธิ์ระดับ Role หรือ Data Access Tier ที่จำเป็นในการเข้าถึงหน้านี้ หากต้องการใช้งานกรุณาติดต่อผู้ดูแลระบบ"
              errorCode="ERR_403_FORBIDDEN"
              primaryAction={{
                label: "กลับสู่หน้า Dashboard",
                icon: "dashboard",
                href: "/dashboard",
              }}
              secondaryAction={{
                label: "เข้าสู่ระบบด้วยบัญชีอื่น",
                icon: "login",
                href: "/login",
              }}
            />
          )}

          {selectedScreen === "runtime-crash" && (
            <div className="p-8 max-w-xl mx-auto">
              <BuggyComponent shouldThrow={hasSimulatedCrash} />
              {!hasSimulatedCrash && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      addLog({
                        level: "WARN",
                        source: "[Simulator]",
                        message: "กำลังสั่ง Trigger Runtime Crash Exception...",
                      });
                      setHasSimulatedCrash(true);
                    }}
                    className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>ยิง Exception จำลอง (Trigger Crash)</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    เมื่อกดปุ่ม Component จะโยน Error และ Error Boundary จะแสดงผลหน้า Error พร้อมบันทึก Log ด้านล่าง
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedScreen === "empty" && (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-2xl mb-3 text-slate-500 shadow-xs">
                +
              </div>
              <p className="text-sm font-semibold text-slate-700">Blank Testing Slot</p>
              <p className="text-xs text-slate-400 mt-1">
                ช่องทดสอบว่าง สำหรับนำ Component หรือ Screen อื่นๆ มาทดลองเรนเดอร์
              </p>
            </div>
          )}
        </PlaygroundErrorBoundary>
      </main>

      {/* ─── Log Messages Console (Docked at Bottom) ─── */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white sticky bottom-0 z-40 transition-all duration-200">
        {/* Console Header Bar */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogConsoleExpanded(!isLogConsoleExpanded)}
              className="flex items-center gap-1.5 font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#2BB5B0]">
                {isLogConsoleExpanded ? "expand_more" : "expand_less"}
              </span>
              <span>Log Messages</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                {logs.length}
              </span>
            </button>

            {errorCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {errorCount} Error{errorCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Filter Pills & Actions */}
          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
              {(["ALL", "ERROR", "WARN", "INFO"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                    logFilter === filter ? "bg-[#0E747F] text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Copy Logs */}
            <button
              onClick={handleCopyLogs}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="คัดลอก Logs ทั้งหมด"
            >
              <span className="material-symbols-outlined text-[13px]">
                {copiedFeedback ? "check" : "content_copy"}
              </span>
              <span>{copiedFeedback ? "คัดลอกแล้ว" : "Copy"}</span>
            </button>

            {/* Clear Logs */}
            <button
              onClick={handleClearLogs}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="ล้าง Logs"
            >
              <span className="material-symbols-outlined text-[13px]">delete</span>
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Collapsible Console Log Body */}
        {isLogConsoleExpanded && (
          <div className="max-h-56 min-h-[140px] overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 bg-[#07131D]">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                ไม่มีข้อความ Log ในหมวดหมู่นี้
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isError = log.level === "ERROR";
                const isWarn = log.level === "WARN";
                const isSuccess = log.level === "SUCCESS";

                const badgeColor = isError
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : isWarn
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : isSuccess
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30";

                return (
                  <div
                    key={log.id}
                    className={`p-2 rounded-lg border transition-all ${
                      isError
                        ? "bg-red-950/30 border-red-900/50"
                        : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 select-none text-[10px] mt-0.5">
                        {log.timestamp}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded border text-[9px] font-bold tracking-wider uppercase select-none ${badgeColor}`}
                      >
                        {log.level}
                      </span>
                      <span className="text-[#2BB5B0] font-semibold text-[10px] select-none">
                        {log.source}
                      </span>
                      <span
                        className={`flex-1 break-words ${
                          isError ? "text-red-300 font-medium" : "text-slate-200"
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>

                    {log.detail && (
                      <div className="mt-1.5 pl-6">
                        <pre className="p-2 rounded bg-slate-950 text-slate-400 text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800/60">
                          {log.detail}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>
        )}
      </footer>
    </div>
  );
}

