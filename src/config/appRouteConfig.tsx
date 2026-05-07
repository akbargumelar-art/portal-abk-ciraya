import React, { lazy } from 'react';
import type { UserRole } from '../types';
import UnderConstructionPage from '../pages/UnderConstructionPage';

// —— Lazy page chunks (single import site for router + access map) ——
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const OutletRegisterPage = lazy(() => import('../pages/OutletRegisterPage'));
const StockPage = lazy(() => import('../pages/StockPage'));
const OmzetOutletPage = lazy(() => import('../pages/OmzetOutletPage'));
const SalesPlanPage = lazy(() => import('../pages/SalesPlanPage'));
const VisitFormPage = lazy(() => import('../pages/VisitFormPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const LinksPage = lazy(() => import('../pages/LinksPage'));
const UserManagementPage = lazy(() => import('../pages/UserManagementPage'));
const ComplaintPage = lazy(() => import('../pages/ComplaintPage'));
const POPMonitoringPage = lazy(() => import('../pages/POPMonitoringPage'));
const SellThruPage = lazy(() => import('../pages/SellThruPage'));
const PerformancePage = lazy(() => import('../pages/PerformancePage'));
const KPIPage = lazy(() => import('../pages/KPIPage'));
const ProgramPage = lazy(() => import('../pages/ProgramPage'));
const FeePage = lazy(() => import('../pages/FeePage'));
const DataUploadPage = lazy(() => import('../pages/DataUploadPage'));
const DocumentationPage = lazy(() => import('../pages/DocumentationPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const MonitoringVisitPage = lazy(() => import('../pages/sales-plan/MonitoringVisitPage'));
const PlanPerdanaPage = lazy(() => import('../pages/sales-plan/PlanPerdanaPage'));
const PlanVoucherPage = lazy(() => import('../pages/sales-plan/PlanVoucherPage'));
const PlanCVMPage = lazy(() => import('../pages/sales-plan/PlanCVMPage'));
const POPMaterialPage = lazy(() => import('../pages/sales-plan/POPMaterialPage'));
const STNotaPage = lazy(() => import('../pages/sell-thru/STNotaPage'));
const STDigiposPage = lazy(() => import('../pages/sell-thru/STDigiposPage'));
const PenjualanD2CPage = lazy(() => import('../pages/sell-thru/PenjualanD2CPage'));
const TopLinePage = lazy(() => import('../pages/performansi/TopLinePage'));
const FiveS4RPage = lazy(() => import('../pages/performansi/FiveS4RPage'));
const MarketSharePage = lazy(() => import('../pages/performansi/MarketSharePage'));
const AktifasiPage = lazy(() => import('../pages/performansi/AktifasiPage'));
const SelloutPage = lazy(() => import('../pages/performansi/SelloutPage'));
const InjectVoucherPage = lazy(() => import('../pages/performansi/InjectVoucherPage'));
const RedeemVoucherPage = lazy(() => import('../pages/performansi/RedeemVoucherPage'));
const KPIClusterPage = lazy(() => import('../pages/kpi/KPIClusterPage'));
const KPISFPage = lazy(() => import('../pages/kpi/KPISFPage'));
const ManagementFeePage = lazy(() => import('../pages/fee/ManagementFeePage'));
const MarketingFeePage = lazy(() => import('../pages/fee/MarketingFeePage'));
const GrossProfitPage = lazy(() => import('../pages/fee/GrossProfitPage'));
const DOAAlokasiPage = lazy(() => import('../pages/doa/DOAAlokasiPage'));
const DOAListSNPage = lazy(() => import('../pages/doa/DOAListSNPage'));
const DOAStockPage = lazy(() => import('../pages/doa/DOAStockPage'));
const DocumentsPage = lazy(() => import('../pages/dokumentasi/DocumentsPage'));
const VideoRoleplayPage = lazy(() => import('../pages/dokumentasi/VideoRoleplayPage'));

const R_ADMIN_MANAGER: UserRole[] = ['admin_super', 'admin', 'manager'];
const R_OUTLET_FIELD: UserRole[] = [
    'admin_super',
    'admin',
    'manager',
    'supervisor_ids',
    'supervisor_d2c',
    'salesforce',
];
const R_SPV_UP: UserRole[] = ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'];
const R_VISIT_FIELD: UserRole[] = [
    'admin_super',
    'admin',
    'manager',
    'supervisor_ids',
    'supervisor_d2c',
    'salesforce',
    'direct_sales',
];

export interface AppLeafRoute {
    path: string;
    element: React.ReactNode;
}

export interface AppRouteGroup {
    /** When omitted, any authenticated user may access these paths. */
    allowedRoles?: UserRole[];
    routes: AppLeafRoute[];
}

/**
 * Grouped routes share one `<ProtectedRoute allowedRoles={...} />` wrapper.
 * Keep in sync with sidebar paths via `getPathAccessRoles`.
 */
export const protectedRouteGroups: AppRouteGroup[] = [
    {
        routes: [
            { path: '/dashboard', element: <DashboardPage /> },
            { path: '/complaint', element: <ComplaintPage /> },
            { path: '/docs', element: <DocumentationPage /> },
            { path: '/docs/documents', element: <DocumentsPage /> },
            { path: '/docs/video', element: <VideoRoleplayPage /> },
            { path: '/links', element: <LinksPage /> },
        ],
    },
    {
        allowedRoles: R_ADMIN_MANAGER,
        routes: [{ path: '/reports', element: <ReportsPage /> }],
    },
    {
        allowedRoles: R_OUTLET_FIELD,
        routes: [
            { path: '/outlets', element: <OutletRegisterPage /> },
            { path: '/stock/perdana', element: <StockPage type="perdana" /> },
            { path: '/stock/voucher', element: <StockPage type="voucher" /> },
        ],
    },
    {
        allowedRoles: R_SPV_UP,
        routes: [
            { path: '/omzet', element: <OmzetOutletPage /> },
            { path: '/sales-plan', element: <SalesPlanPage /> },
            { path: '/sales-plan/perdana', element: <PlanPerdanaPage /> },
            { path: '/sales-plan/voucher', element: <PlanVoucherPage /> },
            { path: '/sales-plan/cvm', element: <PlanCVMPage /> },
            { path: '/sales-plan/pop-material', element: <POPMaterialPage /> },
            { path: '/sell-thru', element: <SellThruPage /> },
            { path: '/sell-thru/nota', element: <STNotaPage /> },
            { path: '/sell-thru/digipos', element: <STDigiposPage /> },
            { path: '/sell-thru/d2c', element: <PenjualanD2CPage /> },
            { path: '/performance', element: <PerformancePage /> },
            { path: '/performance/topline', element: <TopLinePage /> },
            { path: '/performance/5s4r', element: <FiveS4RPage /> },
            { path: '/performance/marketshare', element: <MarketSharePage /> },
            { path: '/performance/aktifasi', element: <AktifasiPage /> },
            { path: '/performance/sellout', element: <SelloutPage /> },
            { path: '/performance/inject-voucher', element: <InjectVoucherPage /> },
            { path: '/performance/redeem-voucher', element: <RedeemVoucherPage /> },
            { path: '/program', element: <ProgramPage /> },
            {
                path: '/program/scs',
                element: <UnderConstructionPage title="Program SCS" />,
            },
            {
                path: '/program/retina',
                element: <UnderConstructionPage title="Program Retina" />,
            },
            { path: '/doa/alokasi', element: <DOAAlokasiPage /> },
            { path: '/doa/list-sn', element: <DOAListSNPage /> },
            { path: '/doa/stock', element: <DOAStockPage /> },
            { path: '/pop-monitoring', element: <POPMonitoringPage /> },
        ],
    },
    {
        allowedRoles: R_ADMIN_MANAGER,
        routes: [
            { path: '/kpi', element: <KPIPage /> },
            { path: '/kpi/cluster', element: <KPIClusterPage /> },
            { path: '/kpi/sf', element: <KPISFPage /> },
            { path: '/fee', element: <FeePage /> },
            { path: '/fee/management', element: <ManagementFeePage /> },
            { path: '/fee/marketing', element: <MarketingFeePage /> },
            { path: '/fee/gross-profit', element: <GrossProfitPage /> },
            { path: '/data-upload', element: <DataUploadPage /> },
            {
                path: '/data-upload/sales',
                element: <UnderConstructionPage title="Upload Sales" />,
            },
            {
                path: '/data-upload/inventory',
                element: <UnderConstructionPage title="Upload Inventory" />,
            },
        ],
    },
    {
        allowedRoles: R_VISIT_FIELD,
        routes: [
            { path: '/visit', element: <VisitFormPage /> },
            { path: '/docs/visit', element: <MonitoringVisitPage /> },
        ],
    },
    {
        allowedRoles: ['admin_super'],
        routes: [
            { path: '/users', element: <UserManagementPage /> },
            { path: '/settings', element: <SettingsPage /> },
        ],
    },
];

/** Parent paths used in nav without a dedicated page — align visibility with child module. */
const NAV_PARENT_PATH_ACCESS: Record<string, UserRole[] | undefined> = {
    '/doa': R_SPV_UP,
};

let pathRoleCache: Map<string, UserRole[] | undefined> | null = null;

function buildPathRoleMap(): Map<string, UserRole[] | undefined> {
    const map = new Map<string, UserRole[] | undefined>();
    for (const group of protectedRouteGroups) {
        for (const route of group.routes) {
            map.set(route.path, group.allowedRoles);
        }
    }
    for (const [path, roles] of Object.entries(NAV_PARENT_PATH_ACCESS)) {
        map.set(path, roles);
    }
    return map;
}

/** Roles required to open `path`, or `undefined` if any authenticated user may open it. */
export function getPathAccessRoles(path: string): UserRole[] | undefined {
    if (!pathRoleCache) {
        pathRoleCache = buildPathRoleMap();
    }
    return pathRoleCache.get(path);
}
