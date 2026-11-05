"use client";

import React, { useState } from "react";
import Link from "next/link";
import SatisfactionScreen from "@/Screens/User/Satifaction/page";
import { ErrorView } from "@/Components/Errors";

type PlaygroundTab = "error" | "satisfaction" | "empty";
type ErrorPreset = "500" | "404" | "403" | "runtime-crash";

/**
 * 💥 Error Thrower Component สำหรับจำลองข้อผิดพลาดจริงของ React
 */
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated Runtime Crash: TypeError: Cannot read properties of undefined (reading 'fetchData')");
  }
  return (
    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-semibold text-xl">
        <span className="material-symbols-outlined text-[24px]">check_circle</span>
      </div>
      <h3 className="text-base font-bold text-slate-800">Component ทำงานปกติ</h3>
      <p className="text-xs text-slate-500 mt-1 mb-4">
        กดปุ่มด้านล่างเพื่อจำลอง Runtime Exception และดูพฤติกรรมของ Error Boundary
      </p>
    </div>
  );
}

/**
 * 🛡️ Test Error Boundary สำหรับดักจับ Crash ในหน้า Playground
 */
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[TestErrorBoundary] Simulated error caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorView
          statusCode={500}
          title="เกิดข้อผิดพลาดในการโหลดข้อมูล (Simulated Crash)"
          description="ระบบตรวจพบ Runtime Exception จำลอง พร้อมทำงานร่วมกับ Error Boundary อย่างถูกต้อง"
          errorCode="ERR_RUNTIME_SIMULATION"
          error={this.state.error}
          reset={this.handleReset}
          primaryAction={{
            label: "กู้คืนระบบ (Reset Boundary)",
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
 * หน้าทดสอบ Sandbox สำหรับทดลองดึงหน้าต่างๆ มาเรนเดอร์และทดสอบการทำงาน
 */
export default function TestPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>("error");
  const [errorPreset, setErrorPreset] = useState<ErrorPreset>("500");
  const [hasSimulatedCrash, setHasSimulatedCrash] = useState(false);
  const [resetFeedbackCount, setResetFeedbackCount] = useState(0);

  // Mock Error Object สำหรับโหมด 500
  const mock500Error = new Error("DatabaseConnectionTimeout: Failed to connect to Enterprise PostgreSQL replica pool");
  mock500Error.stack =
    "Error: DatabaseConnectionTimeout: Failed to connect to Enterprise PostgreSQL replica pool\n    at async QueryExecutor.execute (D:\\DevProject\\Project\\Satifaction2\\Backend\\Services\\ScopeFilterService.cs:42:15)\n    at async DashboardController.GetMetrics (D:\\DevProject\\Project\\Satifaction2\\Backend\\Controllers\\DashboardController.cs:88:9)";

  const handleManualReset = () => {
    setResetFeedbackCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ─── Control Bar ด้านบนสำหรับสลับเทสหน้าต่างๆ ─── */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧪</span>
          <div>
            <h1 className="text-sm font-bold text-slate-800">
              Developer Playground <span className="text-xs text-slate-400 font-mono">(/test)</span>
            </h1>
            <p className="text-[11px] text-slate-500">
              กำลังทดสอบหน้า:{" "}
              <span className="font-semibold text-[var(--primary-container)]">
                {activeTab === "error"
                  ? `Error Page Showcase (${errorPreset.toUpperCase()})`
                  : activeTab === "satisfaction"
                  ? "Satisfaction Kiosk (3 ปุ่ม)"
                  : "Blank Slot"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Tabs Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("error")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "error"
                ? "bg-[var(--primary-container)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">error_outline</span>
            <span>Error Page Showcase</span>
          </button>
          <button
            onClick={() => setActiveTab("satisfaction")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "satisfaction"
                ? "bg-[var(--primary-container)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
            <span>Satisfaction Screen</span>
          </button>
          <button
            onClick={() => setActiveTab("empty")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "empty"
                ? "bg-[var(--primary-container)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Blank Slot
          </button>

          <Link
            href="/satisfaction"
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-bg)] text-[var(--primary-container)] border border-[var(--accent-light)] hover:bg-[var(--accent-light)]/30 transition-colors ml-2"
          >
            <span>เปิด /satisfaction</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
        </div>
      </header>

      {/* ─── Sub-Bar เฉพาะโหมด Error Page เพื่อสลับ Preset ─── */}
      {activeTab === "error" && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">เลือกแบบ Error:</span>
            <button
              onClick={() => {
                setErrorPreset("500");
                setHasSimulatedCrash(false);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                errorPreset === "500"
                  ? "bg-red-500 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              500 Internal Error
            </button>
            <button
              onClick={() => {
                setErrorPreset("404");
                setHasSimulatedCrash(false);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                errorPreset === "404"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              404 Not Found
            </button>
            <button
              onClick={() => {
                setErrorPreset("403");
                setHasSimulatedCrash(false);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                errorPreset === "403"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              403 Access Denied
            </button>
            <button
              onClick={() => {
                setErrorPreset("runtime-crash");
                setHasSimulatedCrash(false);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                errorPreset === "runtime-crash"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">bug_report</span>
              <span>Test Error Boundary</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {resetFeedbackCount > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check</span>
                ปุ่ม Reset ถูกเรียกใช้งานแล้ว ({resetFeedbackCount} ครั้ง)
              </span>
            )}
            <span className="text-slate-400 text-[11px] font-mono">Component: ErrorView.tsx</span>
          </div>
        </div>
      )}

      {/* ─── Sandbox Viewport ─── */}
      <main className="flex-1 w-full bg-white relative">
        {activeTab === "satisfaction" && <SatisfactionScreen />}

        {activeTab === "error" && (
          <div className="w-full">
            {errorPreset === "500" && (
              <ErrorView
                statusCode={500}
                title="เกิดข้อผิดพลาดในการโหลดข้อมูล"
                description="ระบบไม่สามารถประมวลผลคำขอนี้ได้ในขณะนี้ กรุณากดปุ่มลองใหม่อีกครั้ง หรือกลับไปที่หน้าหลัก"
                errorCode="ERR_500_INTERNAL_SERVER"
                error={mock500Error}
                reset={handleManualReset}
                primaryAction={{
                  label: "ลองใหม่อีกครั้ง",
                  icon: "refresh",
                  onClick: handleManualReset,
                }}
                secondaryAction={{
                  label: "กลับสู่หน้า Dashboard",
                  icon: "dashboard",
                  href: "/dashboard",
                }}
              />
            )}

            {errorPreset === "404" && (
              <ErrorView
                statusCode={404}
                title="404 - ไม่พบหน้าที่ต้องการ"
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

            {errorPreset === "403" && (
              <ErrorView
                statusCode={403}
                title="403 - ปฏิเสธการเข้าถึง (Access Denied)"
                description="คุณไม่มีสิทธิ์ระดับ Role หรือ Data Access Tier ที่จำเป็นในการเข้าถึงหน้านี้ หากจำเป็นต้องใช้งาน กรุณาติดต่อ Super Admin"
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

            {errorPreset === "runtime-crash" && (
              <div className="p-6">
                <TestErrorBoundary onReset={() => setHasSimulatedCrash(false)}>
                  <div className="text-center">
                    <BuggyComponent shouldThrow={hasSimulatedCrash} />
                    {!hasSimulatedCrash && (
                      <button
                        onClick={() => setHasSimulatedCrash(true)}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>ยิง Exception จำลอง (Trigger Crash)</span>
                      </button>
                    )}
                  </div>
                </TestErrorBoundary>
              </div>
            )}
          </div>
        )}

        {activeTab === "empty" && (
          <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xl mb-3 text-slate-500">
              +
            </div>
            <p className="text-sm font-semibold text-slate-700">Blank Testing Slot</p>
            <p className="text-xs text-slate-400 mt-1">
              แก้ไขใน <code className="bg-slate-100 px-1 rounded text-slate-600">Frontend/src/app/test/page.tsx</code> เพื่อนำ Component อื่นมาเทส
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
