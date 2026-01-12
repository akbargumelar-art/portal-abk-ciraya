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

// Navigation items with role restrictions
export const navigationItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        path: '/dashboard',
    },
    {
        id: 'reports',
        label: 'Looker Reports',
        icon: 'reports',
        path: '/reports',
        roles: ['admin_super', 'admin', 'manager'],
    },
    // Outlet Group
    {
        id: 'outlet-menu',
        label: 'Outlet',
        icon: 'outlet',
        path: '/outlets',
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce'],
        children: [
            {
                id: 'outlets',
                label: 'Outlet Register',
                icon: 'outlet',
                path: '/outlets',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce'],
            },
            {
                id: 'stock-perdana',
                label: 'Stock Perdana',
                icon: 'stock',
                path: '/stock/perdana',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce'],
            },
            {
                id: 'stock-voucher',
                label: 'Stock Voucher',
                icon: 'voucher',
                path: '/stock/voucher',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce'],
            },
            {
                id: 'omzet',
                label: 'Omzet Outlet',
                icon: 'omzet',
                path: '/omzet',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
        ],
    },
    // Sales Plan Group (REMOVED Monitoring Visit)
    {
        id: 'sales-plan-menu',
        label: 'Sales Plan',
        icon: 'salesPlan',
        path: '/sales-plan',
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
        children: [
            {
                id: 'sales-plan-perdana',
                label: 'Perdana',
                icon: 'stock',
                path: '/sales-plan/perdana',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'sales-plan-voucher',
                label: 'Voucher Fisik',
                icon: 'voucher',
                path: '/sales-plan/voucher',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'sales-plan-cvm',
                label: 'CVM',
                icon: 'salesPlan',
                path: '/sales-plan/cvm',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'sales-plan-pop-material',
                label: 'POP Material',
                icon: 'pop',
                path: '/sales-plan/pop-material',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
        ],
    },
    // Sell Thru Group
    {
        id: 'sell-thru-menu',
        label: 'Sell Thru',
        icon: 'sellThru',
        path: '/sell-thru',
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
        children: [
            {
                id: 'sell-thru-nota',
                label: 'ST Nota',
                icon: 'sellThru',
                path: '/sell-thru/nota',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'sell-thru-digipos',
                label: 'ST Digipos',
                icon: 'sellThru',
                path: '/sell-thru/digipos',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'sell-thru-d2c',
                label: 'Penjualan D2C',
                icon: 'sellThru',
                path: '/sell-thru/d2c',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
        ],
    },
    // Performansi Group (REVAMPED)
    {
        id: 'performance-menu',
        label: 'Performansi',
        icon: 'performance',
        path: '/performance',
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
        children: [
            {
                id: 'performance-topline',
                label: 'Top Line',
                icon: 'performance',
                path: '/performance/topline',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'performance-5s4r',
                label: '5s-4r',
                icon: 'performance',
                path: '/performance/5s4r',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'performance-marketshare',
                label: 'Market Share',
                icon: 'performance',
                path: '/performance/marketshare',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'performance-aktifasi',
                label: 'Aktifasi',
                icon: 'performance',
                path: '/performance/aktifasi',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'performance-sellout',
                label: 'Sellout',
                icon: 'performance',
                path: '/performance/sellout',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'performance-inject-voucher',
                label: 'Inject Voucher Fisik',
                icon: 'performance',
                path: '/performance/inject-voucher',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'performance-redeem-voucher',
                label: 'Redeem Voucher Fisik',
                icon: 'performance',
                path: '/performance/redeem-voucher',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
        ],
    },
    // KPI Group (REVAMPED)
    {
        id: 'kpi-menu',
        label: 'KPI',
        icon: 'kpi',
        path: '/kpi',
        roles: ['admin_super', 'admin', 'manager'],
        children: [
            {
                id: 'kpi-cluster',
                label: 'KPI Cluster',
                icon: 'kpi',
                path: '/kpi/cluster',
                roles: ['admin_super', 'admin', 'manager'],
            },
            {
                id: 'kpi-sf',
                label: 'KPI SF',
                icon: 'kpi',
                path: '/kpi/sf',
                roles: ['admin_super', 'admin', 'manager'],
            },
        ],
    },
    // Program Group
    {
        id: 'program-menu',
        label: 'Program',
        icon: 'program',
        path: '/program',
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
        children: [
            {
                id: 'program-scs',
                label: 'SCS',
                icon: 'program',
                path: '/program/scs',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'program-retina',
                label: 'Retina',
                icon: 'program',
                path: '/program/retina',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
        ],
    },
    // Fee Group (REVAMPED)
    {
        id: 'fee-menu',
        label: 'Fee / Komisi',
        icon: 'fee',
        path: '/fee',
        roles: ['admin_super', 'admin', 'manager'],
        children: [
            {
                id: 'fee-management',
                label: 'Management Fee',
                icon: 'fee',
                path: '/fee/management',
                roles: ['admin_super', 'admin', 'manager'],
            },
            {
                id: 'fee-marketing',
                label: 'Marketing Fee',
                icon: 'fee',
                path: '/fee/marketing',
                roles: ['admin_super', 'admin', 'manager'],
            },
            {
                id: 'fee-gross-profit',
                label: 'Gross Profit',
                icon: 'fee',
                path: '/fee/gross-profit',
                roles: ['admin_super', 'admin', 'manager'],
            },
        ],
    },
    // DOA Group (NEW)
    {
        id: 'doa-menu',
        label: 'DOA',
        icon: 'doa',
        path: '/doa',
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
        children: [
            {
                id: 'doa-alokasi',
                label: 'Alokasi',
                icon: 'doa',
                path: '/doa/alokasi',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'doa-listsn',
                label: 'List SN',
                icon: 'doa',
                path: '/doa/list-sn',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
            {
                id: 'doa-stock',
                label: 'Stock',
                icon: 'doa',
                path: '/doa/stock',
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
            },
        ],
    },
    // Single items
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
        roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c'],
    },
    // Data Upload Group
    {
        id: 'upload-menu',
        label: 'Data Upload',
        icon: 'upload',
        path: '/data-upload',
        roles: ['admin_super', 'admin', 'manager'],
        children: [
            {
                id: 'upload-sales',
                label: 'Upload Sales',
                icon: 'upload',
                path: '/data-upload/sales',
                roles: ['admin_super', 'admin', 'manager'],
            },
            {
                id: 'upload-inventory',
                label: 'Upload Inventory',
                icon: 'upload',
                path: '/data-upload/inventory',
                roles: ['admin_super', 'admin', 'manager'],
            },
        ],
    },
    // Dokumentasi Group (REVAMPED)
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
                roles: ['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce', 'direct_sales'],
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
        label: 'User Management',
        icon: 'users',
        path: '/users',
        roles: ['admin_super'],
    },
    {
        id: 'settings',
        label: 'Pengaturan',
        icon: 'settings',
        path: '/settings',
        roles: ['admin_super'],
    },
];

// Filter navigation by role
export const getNavigationForRole = (role: UserRole): NavItem[] => {
    return navigationItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(role);
    });
};
