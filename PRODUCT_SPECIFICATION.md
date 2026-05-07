# Product Specification: Portal ABK Ciraya

## 1. Document Info
- Product: Portal ABK Ciraya
- Type: Web application (frontend portal + backend API)
- Version: 1.0 (initial specification based on current codebase)
- Date: February 20, 2026

## 2. Product Summary
Portal ABK Ciraya is an operations and performance management portal for field-sales and supervisory teams. The system centralizes outlet data, stock, sales planning, sell-thru tracking, visit documentation, performance dashboards, POP monitoring, KPI reporting, and administrative access control.

The current frontend is feature-rich and role-aware, but mostly powered by mock data. The backend currently provides a separate generic commerce/inventory API (users, products, suppliers, orders) and is not yet aligned to the portal domain modules.

## 3. Objectives
- Provide a single operational workspace for HQ/admin, managers, supervisors, and field teams.
- Standardize monitoring across outlet operations, sales execution, and performance KPIs.
- Improve data visibility with filters, charts, tabular reports, and export capability.
- Enforce role-based access to menus, pages, and actions.
- Transition from mock-driven frontend to production API-driven workflows.

## 4. Non-Goals (Current Phase)
- Native mobile app delivery.
- Full offline-first synchronization.
- Real-time streaming analytics.
- External partner portal access.

## 5. Target Users and Roles
- `admin_super`: full control including user and settings management.
- `admin`: high-level data management and reporting.
- `manager`: broad visibility and reporting access.
- `supervisor_ids` / `spv_ids`: supervise IDS field team.
- `supervisor_d2c` / `spv_d2c`: supervise D2C field team.
- `salesforce`: outlet/visit execution role.
- `direct_sales`: D2C field execution and event notes.

## 6. Product Scope
### 6.1 Core Modules (Frontend Navigation)
- Dashboard
- Looker Reports
- Outlet (register, stock perdana, stock voucher, omzet)
- Sales Plan (perdana, voucher fisik, CVM, POP material)
- Sell Thru (nota, digipos, d2c)
- Performansi (top line, 5s4r, market share, aktifasi, sellout, inject/redeem voucher)
- KPI (cluster, SF)
- Visit Form
- Program (SCS, Retina)
- Fee/Komisi (management fee, marketing fee, gross profit)
- DOA (alokasi, list SN, stock)
- Komplain
- Monitoring POP
- Data Upload (sales, inventory)
- Dokumentasi (monitoring visit, documents, video roleplay)
- Link Penting
- User Management
- Pengaturan

### 6.2 Current Delivery Status
- Authentication and role-based routing: implemented (frontend, mock auth).
- Most pages: implemented UI and interaction patterns with mock/local data.
- Some flows marked under construction (program and data-upload subpages).
- Backend API exists but currently models a different domain and role system.

## 7. Key User Flows
- User logs in and sees route/menu access by role.
- Supervisor reviews dashboard and performance pages using filters.
- Field user submits visit with outlet selection, geolocation, photos, and notes.
- Admin accesses reports, KPI, fee pages, and user management.
- Teams review POP monitoring and documentation artifacts.

## 8. Functional Requirements
- FR-01: System must authenticate users and persist session state.
- FR-02: System must enforce route-level and menu-level role authorization.
- FR-03: Dashboard must display KPI cards, trend charts, and quick status summaries.
- FR-04: Module pages must support filter-driven data views.
- FR-05: Tables must support sorting and export where applicable.
- FR-06: Visit Form must capture outlet, coordinates, photos (max 5), and role-specific notes.
- FR-07: Admin Super must manage users and system settings.
- FR-08: Unauthorized users must be blocked and redirected appropriately.
- FR-09: Application must provide responsive UX for desktop and mobile web.
- FR-10: Data upload workflows must support validation and upload feedback.

## 9. Non-Functional Requirements
- NFR-01: Frontend page transitions should remain performant using lazy-loading.
- NFR-02: API endpoints must use secure auth (JWT) and role checks.
- NFR-03: Sensitive data must not be exposed in client-side mock-only structures in production.
- NFR-04: System should provide clear loading and error states.
- NFR-05: Deployments should support environment-based configuration and reproducible build.

## 10. Data and Integration Requirements
### 10.1 Current Gap
- Frontend domain: telecom/field-sales operations (outlets, visit, sell-thru, KPI, performance).
- Backend domain: generic commerce entities (products, suppliers, resellers, orders) with roles `ADMIN/RESELLER/CUSTOMER`.

### 10.2 Required Alignment
- Define portal-domain API contracts matching frontend modules.
- Normalize role vocabulary between frontend and backend.
- Replace mock service layers incrementally with API-backed services.
- Define source of truth for KPI/report data and historical period filters.

## 11. Success Metrics
- Login success rate and session stability.
- Active usage by role per week.
- Visit form submission completion rate.
- Data freshness and API response time for dashboard/report pages.
- Reduction in manual reporting effort for supervisors/managers.

## 12. Risks and Constraints
- Domain mismatch between frontend and backend can delay productionization.
- Heavy reliance on mock data risks behavior differences after API cutover.
- Role aliasing (`spv_ids` vs `supervisor_ids`) can create authorization inconsistency.
- Large module surface area increases QA scope.

## 13. Recommended Delivery Plan
- Phase 1: Finalize domain model, role matrix, and API contract for portal modules.
- Phase 2: Integrate auth and one vertical slice end-to-end (Dashboard + Visit).
- Phase 3: Migrate high-value modules (Outlet, Sales Plan, Sell Thru, Performansi).
- Phase 4: Complete admin/governance modules and data upload workflows.
- Phase 5: Hardening (tests, monitoring, security review, production rollout).

## 14. Open Questions
- What are the authoritative data sources for each KPI and report widget?
- Which modules are mandatory for MVP go-live vs post-launch?
- Should supervisor role aliases be fully deprecated in favor of one naming scheme?
- What are the expected SLAs for dashboard and table queries?
- What audit requirements apply to user actions and data changes?
