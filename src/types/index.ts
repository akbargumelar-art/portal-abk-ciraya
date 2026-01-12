// Re-export auth types for convenience
export * from './auth';

// Legacy User Roles (kept for backward compatibility)
// Use Role from './auth' for new code
export type UserRole = 'admin_super' | 'admin' | 'manager' | 'supervisor_ids' | 'supervisor_d2c' | 'spv_ids' | 'spv_d2c' | 'salesforce' | 'direct_sales';

// Legacy User Interface (kept for backward compatibility)
// Use User from './auth' for new code
export interface LegacyUser {
    id: string;
    name: string;
    username: string;
    role: UserRole;
    avatar?: string;
    email?: string;
    tap?: string;
    createdAt: string;
}

// Outlet Interface
export interface Outlet {
    id: string;
    name: string;
    idDigipos: string;
    rsNumber: string;
    address: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
    tap: string;
    salesforceId: string;
    salesforceName: string;
    pjpStatus: 'PJP' | 'Non PJP';
    physicalStatus: 'Fisik' | 'Non Fisik';
    physicalGrade: 'Gold' | 'Silver' | 'Bronze';
    digiposStatus: 'active' | 'inactive';
    hariPJP: string;
    nomorKonfirmasi: string;
    ownerPhone: string;
    lokasiOutlet: 'Ring 1' | 'Ring 2' | 'Ring 3';
    flag: 'Retail' | 'Pareto Retail' | 'Big Pareto' | 'Office' | 'D2C';
    latitude?: number;
    longitude?: number;
    lastVisit?: string;
    createdAt: string;
}

// Stock Items
export interface StockItem {
    id: string;
    outletId: string;
    productType: 'perdana' | 'voucher';
    productGroup: 'A' | 'B'; // A = Simpati/Voucher Internet, B = byU/Voucher Game
    productName: string;
    productCode: string;
    stockFM1: number; // Stock 2 months ago
    stockM1: number;  // Stock last month
    stockM: number;   // Current stock (Sisa)
    beliM: number;    // Buy In
    targetM: number;
    sellOutFM1: number;
    sellOutM1: number;
    sellOutM: number; // Sell Out
    period: string; // YYYY-MM
}

// Transaction
export interface Transaction {
    id: string;
    outletId: string;
    period: string; // YYYY-MM
    perdanaSales: number;
    voucherSales: number;
    digiposTrx: number;
    omzet: number;
    createdAt: string;
}

// Sales Plan
export interface SalesPlan {
    id: string;
    salesforceId: string;
    salesforceName: string;
    tap: string;
    category: 'perdana' | 'voucher' | 'cvm';
    productName: string;
    targetM: number;
    actualM1: number;
    actualM: number;
    period: string;
}

// Visit Record
export interface Visit {
    id: string;
    outletId: string;
    userId: string;
    visitDate: string;
    latitude: number;
    longitude: number;
    photos: string[];
    notes: string;
    eventNotes?: string;
    issues?: string[];
    status: 'completed' | 'pending' | 'cancelled';
    createdAt: string;
}

// KPI Summary
export interface KPISummary {
    totalSales: number;
    totalSalesGrowth: number;
    activeOutlets: number;
    activeOutletsGrowth: number;
    digiposTrx: number;
    digiposTrxGrowth: number;
    sellOutQty: number;
    sellOutQtyGrowth: number;
}

// Chart Data
export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface SalesTrendData {
    month: string;
    perdana: number;
    voucher: number;
    digipos: number;
}

// Table Column Definition
export interface TableColumn<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T) => React.ReactNode;
    group?: string;
}

// Grouped Header
export interface GroupedHeader {
    label: string;
    colspan: number;
}

// Filter State
export interface FilterState {
    [key: string]: string | string[] | undefined;
}

// Sort State
export interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

// Pagination State
export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

// Auth Context State - Now re-exported from './auth'
// Legacy AuthState kept for reference, use AuthState from './auth' instead

// Navigation Item
export interface NavItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    roles?: UserRole[];
    children?: NavItem[];
}

// TAP Summary
export interface TAPSummary {
    tap: string;
    outletCount: number;
    activeCount: number;
    totalSales: number;
    totalTarget: number;
    achievement: number;
    salesforceList: SalesforceSummary[];
}

// Salesforce Summary
export interface SalesforceSummary {
    id: string;
    name: string;
    outletCount: number;
    activeCount: number;
    pjpRatio: number;
    registerRatio: number;
    totalSales: number;
    achievement: number;
}

// Omzet Data
export interface OmzetData {
    outletId: string;
    outletName: string;
    rsNumber: string;
    tap: string;
    salesforce: string;
    omzetM1: number;
    omzetM: number;
    momGrowth: number;
    targetM: number;
    achievement: number;
}

// Date Range
export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface SalesPlanProductMetric {
    target: number;
    actualToday: number;
    actualWeek: number;
    actualLastMonth: number;
    actualCurrentMonth: number;
}

export interface SalesPlanOutletData {
    id: string;
    idDigipos: string;
    outletName: string;
    salesforceName: string;
    tap: string;
    kecamatan: string;
    products: {
        [key: string]: SalesPlanProductMetric;
    };
}
