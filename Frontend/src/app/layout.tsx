import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import TouchEnabler from "@/app/TouchEnabler";
import { AuthProvider } from "@/Context/AuthContext";
import { ModalProvider } from "@/Context/ModalContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Satisfaction Management",
  description: "Satisfaction Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-screen w-full antialiased overflow-hidden`}
      style={{ colorScheme: "light" }}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="h-full w-full bg-white text-neutral-800 transition-colors duration-200">
        <TouchEnabler />
        <AuthProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}