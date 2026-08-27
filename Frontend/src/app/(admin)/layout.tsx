import type { Metadata } from "next";
import AdminLayoutShell from "@/Components/Navigations/AdminLayoutShell";

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
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  );
}