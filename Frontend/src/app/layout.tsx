import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import TouchEnabler from "@/app/TouchEnabler";
import { ModalProvider } from "@/Context/ModalContext";


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kiosk Satisfaction Survey",
  description: "Airport Kiosk Satisfaction Survey System",
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
      <body className="h-full w-full bg-white text-neutral-800 antialiased select-none transition-colors duration-200">
        <TouchEnabler />
        {/* ModalProvider ครอบทุกหน้า — Modal render ใน body ชั้นนี้เสมอ */}
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}