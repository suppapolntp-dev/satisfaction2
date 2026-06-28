"use client";

import React, { useState } from "react";

// ─── 1. นิยามโครงสร้างข้อมูลสารบัญแบบเต็มคำ (Interfaces) ───
interface DocumentTopicItem {
    anchorId: string;
    topicTitle: string;
}

export default function DocumentationScreen() {
    // ชุดข้อมูลจำลองรายการสารบัญประจำบทความ (Table of Contents)
    const DOCUMENT_TOPICS: DocumentTopicItem[] = [
        { anchorId: "prerequisites", topicTitle: "Prerequisites" },
        { anchorId: "generating-token", topicTitle: "Generating an Access Token" },
        { anchorId: "handling-response", topicTitle: "Handling the Response" },
    ];

    // สเตตัสในการจำลองสถานะ Active ของหัวข้อสารบัญที่เปิดอ่านอยู่
    const [activeAnchorId, setActiveAnchorId] = useState<string>("generating-token");

    // ฟังก์ชันจำลองการกดคัดลอกข้อความ cURL (Junior-Friendly)
    const handleCopyClipboardClick = () => {
        console.log("cURL Request text targeted and copied to clipboard successfully.");
    };

    return (
        <div className="w-full flex flex-col xl:flex-row gap-margin-page">
            {/* ─── Center Content Area (ส่วนบทความหลัก) ─── */}
            <article className="flex-1 min-w-0 max-w-3xl">
                {/* Breadcrumbs เส้นทางนำทางส่วนบน */}
                <nav aria-label="Breadcrumb" className="flex text-body-md text-[var(--on-surface-variant)] mb-stack-lg">
                    <ol className="inline-flex items-center space-x-2">
                        <li className="inline-flex items-center">
                            <a href="#" className="hover:text-[var(--primary)] transition-colors">Documentation</a>
                        </li>
                        <li className="flex items-center">
                            <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                            <a href="#" className="hover:text-[var(--primary)] transition-colors">Getting Started</a>
                        </li>
                        <li aria-current="page" className="flex items-center">
                            <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                            <span className="text-[var(--on-surface)] font-medium">Authentication Flow</span>
                        </li>
                    </ol>
                </nav>

                {/* ส่วนหัวของบทความ */}
                <header className="mb-10">
                    <h1 className="font-headline-lg text-headline-lg text-[var(--on-surface)] font-semibold mb-4">
                        Authentication Flow
                    </h1>
                    <div className="flex items-center gap-4 text-body-md text-[var(--on-surface-variant)] pb-6 border-b border-[var(--outline-variant)]">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            <span>Last updated: Oct 24, 2023</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>5 min read</span>
                        </div>
                    </div>
                </header>

                {/* เนื้อหารายละเอียดบทความหลัก */}
                <div className="text-body-lg text-[var(--on-surface)] space-y-6">
                    <p className="leading-relaxed">
                        The CSAT Admin API uses OAuth 2.0 with JWT (JSON Web Tokens) for secure authentication and authorization.
                        This guide explains how to implement the server-to-server authentication flow required to integrate your
                        application with our enterprise platform.
                    </p>

                    {/* หัวข้อที่ 1: Prerequisites */}
                    <h2 id="prerequisites" className="font-headline-md text-headline-md font-semibold text-[var(--on-surface)] mt-10 mb-4">
                        Prerequisites
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>
                            An active <code className="bg-[var(--surface-container-low)] text-[var(--error)] px-1 py-0.5 rounded text-sm font-mono">client_id</code> and <code className="bg-[var(--surface-container-low)] text-[var(--error)] px-1 py-0.5 rounded text-sm font-mono">client_secret</code> from the Admin Console.
                        </li>
                        <li>
                            Appropriate role permissions granted in the Role Management section.
                        </li>
                    </ul>

                    {/* กล่องข้อความแจ้งเตือนสีน้ำเงินพรีเมียม */}
                    <div className="bg-[var(--surface-container-low)] border-l-4 border-[var(--primary)] p-4 rounded-r-lg my-6 flex gap-3">
                        <span className="material-symbols-outlined text-[var(--primary)] shrink-0">info</span>
                        <div className="text-body-md text-[var(--on-surface-variant)]">
                            <strong>Note:</strong> Tokens expire after 60 minutes. You must implement token refresh logic to maintain an active session without user interruption.
                        </div>
                    </div>

                    {/* หัวข้อที่ 2: Generating an Access Token */}
                    <h2 id="generating-token" className="font-headline-md text-headline-md font-semibold text-[var(--on-surface)] mt-10 mb-4">
                        Generating an Access Token
                    </h2>
                    <p className="leading-relaxed mb-4">
                        To obtain a token, make a POST request to the token endpoint with your credentials. The request must be encoded as <code className="bg-[var(--surface-container-low)] text-[var(--error)] px-1 py-0.5 rounded text-sm font-mono">application/x-www-form-urlencoded</code>.
                    </p>

                    {/* บล็อกจำลองโค้ดโปรแกรม (Code Block Container) */}
                    <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg overflow-hidden my-6">
                        <div className="bg-[var(--surface-container-highest)] px-4 py-2 border-b border-[var(--outline-variant)] flex justify-between items-center text-sm">
                            <span className="font-mono text-[var(--on-surface-variant)]">cURL Request</span>
                            <button
                                type="button"
                                onClick={handleCopyClipboardClick}
                                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center gap-1 transition-colors outline-none"
                            >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                                <span>Copy</span>
                            </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm font-mono text-[var(--on-surface)] bg-[var(--surface-container)] m-0 leading-6">
                            {`curl -X POST https://api.csat-enterprise.com/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"`}
                        </pre>
                    </div>

                    {/* หัวข้อที่ 3: Handling the Response */}
                    <h2 id="handling-response" className="font-headline-md text-headline-md font-semibold text-[var(--on-surface)] mt-10 mb-4">
                        Handling the Response
                    </h2>
                    <p className="leading-relaxed mb-4">
                        A successful request returns a JSON response containing the <code className="bg-[var(--surface-container-low)] text-[var(--error)] px-1 py-0.5 rounded text-sm font-mono">access_token</code>. You must include this token in the Authorization header of subsequent API calls.
                    </p>

                    <div className="w-full h-48 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-lg flex flex-col items-center justify-center text-center p-4">
                        <span className="material-symbols-outlined text-3xl text-[var(--outline)] mb-2">schema</span>
                        <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">Authentication Flow Diagram Placeholder</p>
                        <p className="text-xs text-[var(--outline)] mt-1">OAuth 2.0 Flow Core Blueprint</p>
                    </div>
                </div>

                {/* ฟอร์มตัวประเมินประโยชน์หน้าคู่มือ (Feedback Widget) */}
                <div className="mt-16 pt-8 border-t border-[var(--outline-variant)]">
                    <div className="bg-[var(--surface-container-low)] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-headline-md text-body-lg font-semibold text-[var(--on-surface)]">Was this page helpful?</h4>
                            <p className="text-body-md text-[var(--on-surface-variant)] mt-1">Your feedback helps us improve our documentation.</p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-[var(--outline-variant)] rounded-lg text-[var(--on-surface)] hover:bg-[var(--surface-container)] hover:border-[var(--outline)] transition-colors bg-[var(--surface-container-lowest)] active:scale-95 outline-none">
                                <span className="material-symbols-outlined text-[var(--primary)]">thumb_up</span>
                                <span className="font-medium">Yes</span>
                            </button>
                            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-[var(--outline-variant)] rounded-lg text-[var(--on-surface)] hover:bg-[var(--surface-container)] hover:border-[var(--outline)] transition-colors bg-[var(--surface-container-lowest)] active:scale-95 outline-none">
                                <span className="material-symbols-outlined text-[var(--on-surface-variant)]">thumb_down</span>
                                <span className="font-medium">No</span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* ─── Right Sidebar Area (สารบัญเจาะลึกประจำเพจ) ─── */}
            <aside className="w-full xl:w-64 flex-shrink-0 hidden xl:block">
                <div className="pl-4 border-l border-[var(--outline-variant)] sticky top-24">
                    <h4 className="font-label-md text-label-md font-semibold text-[var(--on-surface)] uppercase tracking-wider mb-4">
                        On this page
                    </h4>
                    <nav className="space-y-2 text-body-md">
                        {DOCUMENT_TOPICS.map((topic) => {
                            const isItemActive = topic.anchorId === activeAnchorId;
                            return (
                                <a
                                    key={topic.anchorId}
                                    href={`#${topic.anchorId}`}
                                    onClick={() => setActiveAnchorId(topic.anchorId)}
                                    className={`block py-1 pl-3 -ml-px border-l-2 transition-all ${isItemActive
                                            ? "border-[var(--primary)] text-[var(--primary)] font-medium"
                                            : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
                                        }`}
                                >
                                    {topic.topicTitle}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </div>
    );
}