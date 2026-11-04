# 🤖 Antigravity Project Rules: Customer Satisfaction (CSAT) Platform

Welcome to the **Customer Satisfaction & Multi-Tier Analytics Platform (Central Restaurants Group - CRG)**.

---

## 🎨 MANDATORY DIRECTIVE: UI/UX Pro Max Design Intelligence

For ANY and ALL frontend, UI/UX, styling, layout, typography, components, or screens tasks in this repository, the AI MUST read and strictly follow the design intelligence guidelines:
1. **Mandatory Skill Reference**:
   - Read `.agents/skills/ui-ux-pro-max/SKILL.md` before generating or modifying UI components.
2. **Design Intelligence CLI**:
   - Run Python search script to find styles, color palettes, typography, and UX reasoning:
     ```bash
     python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
     python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain [style|color|typography|ux|icons|chart|landing]
     python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack html-tailwind
     ```
3. **Core Enforcements**:
   - **60-30-10 Color Rule**: 60% dominant neutral, 30% secondary structure, 10% intentional accent. WCAG AAA/AA contrast compliance.
   - **8pt Spatial Grid**: Strict 8pt spatial grid for padding, margin, gap, and sizing.
   - **Complete 5 States**: Default, Hover, Active/Focus, Loading, Empty, and Error states for all interactive components.
   - **Accessible Micro-Interactions**: Smooth transitions respecting `prefers-reduced-motion`.
   - **Strict API-Ready Mode**: Zero hardcoded mock data in UI templates. All values bound to typed props/DTOs. No emojis as icons (use Lucide/SVG).

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

- [ui-ux-pro-max](file:///d:/DevProject/Project/Satifaction2/.agents/skills/ui-ux-pro-max/SKILL.md) — UI/UX Pro Max Design Intelligence, design systems, color harmonies, 8pt grid, WCAG accessibility, and stack-specific UI implementation.
- [csat-architecture-coding-standards](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-architecture-coding-standards/SKILL.md) — Clean Architecture, OOP patterns, file placement, and RESTful API standards.
- [csat-5tier-scope-engine](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-5tier-scope-engine/SKILL.md) — 5-Tier data scoping and RBAC authorization.
- [csat-kiosk-vote-pipeline](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-kiosk-vote-pipeline/SKILL.md) — Touchscreen Kiosk UI, vote ingestion, and CSAT metric calculations.
- [csat-auth-mfa-manager](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-auth-mfa-manager/SKILL.md) — JWT tokens, 2FA SMS OTP, and dynamic security configuration.
- [csat-db-seeder-migration](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-db-seeder-migration/SKILL.md) — PostgreSQL Docker lifecycle, EF Core migrations, and DbInitializer test data.
- [csat-fullstack-dev-workflow](file:///d:/DevProject/Project/Satifaction2/.agents/skills/csat-fullstack-dev-workflow/SKILL.md) — Local environment boot sequence, health checks, and troubleshooting runbooks.
