# 🤖 Antigravity Project Rules: Customer Satisfaction (CSAT) Platform

Welcome to the **Customer Satisfaction & Multi-Tier Analytics Platform (Central Restaurants Group - CRG)**.

---

## 🏛️ Core Architecture Principles

1. **Strict 5-Tier Data Isolation**:
   - Every sensitive data query MUST apply `IScopeFilterService.ApplyUserScope()` to prevent cross-tenant/cross-scope data leaks between Super Admin (Tier 1), Brand Owners (Tier 2), Regional Managers (Tier 3), Area Managers (Tier 4), and Branch Staff (Tier 5).
2. **2-Step Tiered Authentication**:
   - Tier 1–4 logins enforce SMS OTP verification. Tier 5 (Staff) logs in directly without OTP.
   - Dynamic security parameters are controlled in the `system_settings` table without restarting the API.
3. **Database Single Source of Truth**:
   - Maintain consistency between `DatabaseDesign.md`, `schema.sql`, and C# EF Core entities (`Backend/Entities/`).
4. **Touchscreen Kiosk Usability**:
   - Kiosk views (`Frontend/src/app/(user)/satisfaction`) must feature touch-first interactions (min 64x64px), fast feedback, and an auto-reset idle timeout.

---

## 🔑 Test Credentials (Default Password: `Admin@123456`)

- **Super Admin (Tier 1)**: `admin@satisfaction.local`
- **Brand Manager KFC (Tier 2)**: `bm.kfc@satisfaction.local`
- **Brand Manager Mister Donut (Tier 2)**: `bm.mdo@satisfaction.local`
- **Regional Manager Central (Tier 3)**: `rm.central@satisfaction.local`
- **Area Manager Bangkok (Tier 4)**: `am.bangkok@satisfaction.local`
- **Branch Staff Future Park (Tier 5)**: `staff.futurepark@satisfaction.local`

---

## 🛠️ Specialized Workspace Skills Available in `.agents/skills/`

- [csat-architecture-coding-standards](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-architecture-coding-standards/SKILL.md) — Clean Architecture, OOP patterns, file placement, and RESTful API standards.
- [csat-5tier-scope-engine](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-5tier-scope-engine/SKILL.md) — 5-Tier data scoping and RBAC authorization.
- [csat-kiosk-vote-pipeline](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-kiosk-vote-pipeline/SKILL.md) — Touchscreen Kiosk UI, vote ingestion, and CSAT metric calculations.
- [csat-auth-mfa-manager](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-auth-mfa-manager/SKILL.md) — JWT tokens, 2FA SMS OTP, and dynamic security configuration.
- [csat-db-seeder-migration](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-db-seeder-migration/SKILL.md) — PostgreSQL Docker lifecycle, EF Core migrations, and DbInitializer test data.
- [csat-fullstack-dev-workflow](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-fullstack-dev-workflow/SKILL.md) — Local environment boot sequence, health checks, and troubleshooting runbooks.
