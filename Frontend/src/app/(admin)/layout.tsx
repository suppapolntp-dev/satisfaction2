import type { Metadata } from "next";
import AdminLayoutShell from "@/Components/Navigations/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Satisfaction Management - Backoffice",
  description: "Enterprise satisfaction management and real-time monitoring center.",
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