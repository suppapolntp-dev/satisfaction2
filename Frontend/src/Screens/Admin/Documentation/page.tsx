"use client";

import React, { useState } from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างสารบัญเอกสาร API)
// ==========================================================================
interface DocumentTopicItem {
  anchorId: string;
  topicTitle: string;
}

const DOCUMENT_TOPICS: DocumentTopicItem[] = [
  { anchorId: "overview", topicTitle: "API Overview" },
  { anchorId: "prerequisites", topicTitle: "Prerequisites & Tokens" },
  { anchorId: "generating-token", topicTitle: "Generating Access Token" },
  { anchorId: "handling-response", topicTitle: "Handling Response & Errors" },
  { anchorId: "feedback-payload", topicTitle: "Kiosk Sentiment Payload" },
];

// ==========================================================================
// ─── 2. MAIN DOCUMENTATION SCREEN COMPONENT
// ==========================================================================
export default function DocumentationScreen() {
  const [activeAnchorId, setActiveAnchorId] = useState<string>("generating-token");
  const [isCopied, setIsCopied] = useState(false);

  // ฟังก์ชันคัดลอก cURL Request
  const handleCopyClipboardClick = () => {
    const curlCode = `curl -X POST https://api.csat-enterprise.com/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"`;

    navigator.clipboard.writeText(curlCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          API Documentation & Integration Guide
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          OAuth 2.0 authentication flows, sentiment feedback endpoints, and client credential setup.
        </p>
      </div>

      {/* ─── 2. TWO-COLUMN LAYOUT (ARTICLE + ON-THIS-PAGE SIDEBAR) ─── */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Article Content Container */}
        <article className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
          
          {/* Section: Overview */}
          <section id="overview" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
              API Overview & Architecture
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The CSAT Enterprise Admin API provides high-throughput, low-latency REST endpoints for 
              receiving sentiment votes from touchscreen Kiosks, managing multi-tenant branch scopes, 
              and retrieving real-time analytics data. All server-to-server communications require OAuth 2.0 with JWT tokens.
            </p>
          </section>

          {/* Section: Prerequisites */}
          <section id="prerequisites" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
              Prerequisites & Client Credentials
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                An active <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">client_id</code> and <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">client_secret</code> provisioned from the Admin Console.
              </li>
              <li>
                Appropriate role permissions granted in the <span className="font-semibold text-slate-800">Role Management</span> section.
              </li>
              <li>
                TLS 1.3 encryption enabled for all HTTP requests.
              </li>
            </ul>

            {/* Note Callout Box */}
            <div className="bg-blue-50/80 border-l-4 border-blue-900 p-4 rounded-r-xl flex items-start gap-3 mt-4">
              <span className="material-symbols-outlined text-blue-900 text-[20px] shrink-0 mt-0.5">info</span>
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-blue-950 font-bold">Security Note:</strong> Access tokens expire after 60 minutes. Clients should implement automated token refresh logic using the refresh endpoint to maintain uninterrupted polling.
              </div>
            </div>
          </section>

          {/* Section: Generating Access Token */}
          <section id="generating-token" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
              Generating an Access Token
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send an authenticated POST request to the token authorization gateway encoded as <code className="bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">application/x-www-form-urlencoded</code>:
            </p>

            {/* cURL Code Block Container */}
            <div className="rounded-xl border border-slate-800 overflow-hidden shadow-xs">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400 font-bold">cURL Request Payload</span>
                <button
                  type="button"
                  onClick={handleCopyClipboardClick}
                  className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors outline-none cursor-pointer text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isCopied ? "check" : "content_copy"}
                  </span>
                  <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 bg-slate-900 m-0 leading-6">
{`curl -X POST https://api.csat-enterprise.com/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"`}
              </pre>
            </div>
          </section>

          {/* Section: Handling Response */}
          <section id="handling-response" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
              Handling Token Response
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              A successful token exchange returns a JSON payload containing the <code className="bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">access_token</code>. Attach this bearer token in the HTTP Authorization header:
            </p>

            <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-emerald-400 leading-relaxed">
{`{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": "csat:read csat:write branch:access"
}`}
            </div>
          </section>

          {/* Feedback Form Widget */}
          <div className="pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Was this documentation helpful?</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Your input helps our developer experience team improve documentation.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => alert("ขอบคุณสำหรับการให้คะแนนความพึงพอใจ!")}
                  className="btn-secondary text-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">thumb_up</span>
                  Yes
                </button>
                <button 
                  type="button" 
                  onClick={() => alert("ขอบคุณสำหรับข้อเสนอแนะ เราจะปรับปรุงเอกสารให้ดียิ่งขึ้น")}
                  className="btn-secondary text-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">thumb_down</span>
                  No
                </button>
              </div>
            </div>
          </div>

        </article>

        {/* Right Sticky Table of Contents (On this page) */}
        <aside className="w-full xl:w-64 shrink-0 hidden xl:block sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              On this page
            </h4>
            <nav className="space-y-1 text-xs">
              {DOCUMENT_TOPICS.map((topicItem) => {
                const isTopicActive = topicItem.anchorId === activeAnchorId;

                return (
                  <a
                    key={topicItem.anchorId}
                    href={`#${topicItem.anchorId}`}
                    onClick={() => setActiveAnchorId(topicItem.anchorId)}
                    className={`block py-1.5 px-2.5 rounded-lg transition-colors font-medium ${
                      isTopicActive
                        ? "bg-blue-50 text-blue-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {topicItem.topicTitle}
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

      </div>

    </div>
  );
}