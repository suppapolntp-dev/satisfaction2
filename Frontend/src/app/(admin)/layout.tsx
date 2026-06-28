import type { Metadata } from "next";
import Sidebar from "@/Components/Sidebars/sidebar";
import TopNavBar from "@/Components/Navigations/TopNavBar";

export const metadata: Metadata = {
  title: "CSAT Analytics - Backoffice Management",
  description: "Enterprise management and real-time monitoring center.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-[#191c1e] font-[var(--font-inter)] transition-colors duration-200">
      {/* Sidebar: Fixed width (260px) navigation on the left */}
      <Sidebar />

      {/* Main content area with vertical flex layout */}
      <main className="flex flex-col flex-1 h-full bg-slate-50 overflow-y-auto no-scrollbar pl-[260px]">
        {/* Top navigation bar */}
        <TopNavBar />

        {/* Page content: Fills available space with padding */}
        <div className="flex-1 w-full p-6 transition-colors duration-200">
          {children}
        </div>
      </main>
    </div>
  );
}