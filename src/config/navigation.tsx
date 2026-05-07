import {
    LayoutDashboard,
    Store,
    Package,
    CreditCard,
    TrendingUp,
    ClipboardList,
    FileText,
    BarChart3,
    Users,
    Settings,
    Link,
    MessageSquare,
    Image,
    Zap,
    Target,
    Award,
    Gift,
    DollarSign,
    Upload,
    FolderOpen,
    Database,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavItem, UserRole } from '../types';
import { getPathAccessRoles } from './appRouteConfig';
import { roleHasAccess } from '../utils/roleAccess';

// Icon mapping
export const iconMap: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    outlet: Store,
    stock: Package,
    voucher: CreditCard,
    omzet: TrendingUp,
    salesPlan: ClipboardList,
    visit: FileText,
    reports: BarChart3,
    users: Users,
    settings: Settings,
    links: Link,
    complaint: MessageSquare,
    pop: Image,
    sellThru: Zap,
    performance: Target,
    kpi: Award,
    program: Gift,
    fee: DollarSign,
    upload: Upload,
    docs: FolderOpen,
    doa: Database,
};

/**
 * Menu tree (labels + paths). Access rules live in `appRouteConfig` (`getPathAccessRoles`)
 * so routes and sidebar stay aligned.
 */
export const navigationItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        path: '/dashboard',
    },
    {
        id: 'reports',
        label: 'Laporan Looker',
        icon: 'reports',
        path: '/reports',
    },
    {
        id: 'outlet-menu',
        label: 'Outlet',
        icon: 'outlet',
        path: '/outlets',
        children: [
            {
                id: 'outlets',
                label: 'Register Outlet',
                icon: 'outlet',
                path: '/outlets',
            },
            {
                id: 'stock-perdana',
                label: 'Stok Perdana',
                icon: 'stock',
                path: '/stock/perdana',
            },
            {
                id: 'stock-voucher',
                label: 'Stok Voucher',
                icon: 'voucher',
                path: '/stock/voucher',
            },
            {
                id: 'omzet',
                label: 'Omzet Outlet',
                icon: 'omzet',
                path: '/omzet',
            },
        ],
    },
    {
        id: 'sales-plan-menu',
        label: 'Sales Plan',
        icon: 'salesPlan',
        path: '/sales-plan',
        children: [
            {
                id: 'sales-plan-perdana',
                label: 'Perdana',
                icon: 'stock',
                path: '/sales-plan/perdana',
            },
            {
                id: 'sales-plan-voucher',
                label: 'Voucher Fisik',
                icon: 'voucher',
                path: '/sales-plan/voucher',
            },
            {
                id: 'sales-plan-cvm',
                label: 'CVM',
                icon: 'salesPlan',
                path: '/sales-plan/cvm',
            },
            {
                id: 'sales-plan-pop-material',
                label: 'Material POP',
                icon: 'pop',
                path: '/sales-plan/pop-material',
            },
        ],
    },
    {
        id: 'sell-thru-menu',
        label: 'Sell-thru',
        icon: 'sellThru',
        path: '/sell-thru',
        children: [
            {
                id: 'sell-thru-nota',
                label: 'ST Nota',
                icon: 'sellThru',
                path: '/sell-thru/nota',
            },
            {
                id: 'sell-thru-digipos',
                label: 'ST Digipos',
                icon: 'sellThru',
                path: '/sell-thru/digipos',
            },
            {
                id: 'sell-thru-d2c',
                label: 'Penjualan D2C',
                icon: 'sellThru',
                path: '/sell-thru/d2c',
            },
        ],
    },
    {
        id: 'performance-menu',
        label: 'Performansi',
        icon: 'performance',
        path: '/performance',
        children: [
            {
                id: 'performance-topline',
                label: 'Top Line',
                icon: 'performance',
                path: '/performance/topline',
            },
            {
                id: 'performance-5s4r',
                label: '5s-4r',
                icon: 'performance',
                path: '/performance/5s4r',
            },
            {
                id: 'performance-marketshare',
                label: 'Market Share',
                icon: 'performance',
                path: '/performance/marketshare',
            },
            {
                id: 'performance-aktifasi',
                label: 'Aktivasi',
                icon: 'performance',
                path: '/performance/aktifasi',
            },
            {
                id: 'performance-sellout',
                label: 'Sellout',
                icon: 'performance',
                path: '/performance/sellout',
            },
            {
                id: 'performance-inject-voucher',
                label: 'Inject Voucher Fisik',
                icon: 'performance',
                path: '/performance/inject-voucher',
            },
            {
                id: 'performance-redeem-voucher',
                label: 'Redeem Voucher Fisik',
                icon: 'performance',
                path: '/performance/redeem-voucher',
            },
        ],
    },
    {
        id: 'kpi-menu',
        label: 'KPI',
        icon: 'kpi',
        path: '/kpi',
        children: [
            {
                id: 'kpi-cluster',
                label: 'KPI Cluster',
                icon: 'kpi',
                path: '/kpi/cluster',
            },
            {
                id: 'kpi-sf',
                label: 'KPI SF',
                icon: 'kpi',
                path: '/kpi/sf',
            },
        ],
    },
    {
        id: 'program-menu',
        label: 'Program',
        icon: 'program',
        path: '/program',
        children: [
            {
                id: 'program-scs',
                label: 'SCS',
                icon: 'program',
                path: '/program/scs',
            },
            {
                id: 'program-retina',
                label: 'Retina',
                icon: 'program',
                path: '/program/retina',
            },
        ],
    },
    {
        id: 'fee-menu',
        label: 'Fee / Komisi',
        icon: 'fee',
        path: '/fee',
        children: [
            {
                id: 'fee-management',
                label: 'Management Fee',
                icon: 'fee',
                path: '/fee/management',
            },
            {
                id: 'fee-marketing',
                label: 'Marketing Fee',
                icon: 'fee',
                path: '/fee/marketing',
            },
            {
                id: 'fee-gross-profit',
                label: 'Gross Profit',
                icon: 'fee',
                path: '/fee/gross-profit',
            },
        ],
    },
    {
        id: 'doa-menu',
        label: 'DOA',
        icon: 'doa',
        path: '/doa',
        children: [
            {
                id: 'doa-alokasi',
                label: 'Alokasi',
                icon: 'doa',
                path: '/doa/alokasi',
            },
            {
                id: 'doa-listsn',
                label: 'List SN',
                icon: 'doa',
                path: '/doa/list-sn',
            },
            {
                id: 'doa-stock',
                label: 'Stok',
                icon: 'doa',
                path: '/doa/stock',
            },
        ],
    },
    {
        id: 'complaint',
        label: 'Komplain',
        icon: 'complaint',
        path: '/complaint',
    },
    {
        id: 'pop',
        label: 'Monitoring POP',
        icon: 'pop',
        path: '/pop-monitoring',
    },
    {
        id: 'upload-menu',
        label: 'Unggah Data',
        icon: 'upload',
        path: '/data-upload',
        children: [
            {
                id: 'upload-sales',
                label: 'Unggah Sales',
                icon: 'upload',
                path: '/data-upload/sales',
            },
            {
                id: 'upload-inventory',
                label: 'Unggah Inventory',
                icon: 'upload',
                path: '/data-upload/inventory',
            },
        ],
    },
    {
        id: 'docs-menu',
        label: 'Dokumentasi',
        icon: 'docs',
        path: '/docs',
        children: [
            {
                id: 'docs-visit',
                label: 'Monitoring Visit',
                icon: 'visit',
                path: '/docs/visit',
            },
            {
                id: 'docs-documents',
                label: 'Dokumen',
                icon: 'docs',
                path: '/docs/documents',
            },
            {
                id: 'docs-video',
                label: 'Video Roleplay',
                icon: 'docs',
                path: '/docs/video',
            },
        ],
    },
    {
        id: 'links',
        label: 'Link Penting',
        icon: 'links',
        path: '/links',
    },
    {
        id: 'users',
        label: 'Manajemen Pengguna',
        icon: 'users',
        path: '/users',
    },
    {
        id: 'settings',
        label: 'Pengaturan',
        icon: 'settings',
        path: '/settings',
    },
];

function filterNavItem(item: NavItem, role: UserRole): NavItem | null {
    if (item.children?.length) {
        const nextChildren = item.children
            .map((c) => filterNavItem(c, role))
            .filter((c): c is NavItem => c !== null);
        if (nextChildren.length === 0) return null;
        return { ...item, children: nextChildren };
    }
    const allowed = getPathAccessRoles(item.path);
    return roleHasAccess(role, allowed) ? item : null;
}

export const getNavigationForRole = (role: UserRole): NavItem[] => {
    return navigationItems
        .map((item) => filterNavItem(item, role))
        .filter((item): item is NavItem => item !== null);
};
