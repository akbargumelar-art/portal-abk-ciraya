/**
 * Aktifasi Performance Types
 * 
 * Supports both Revenue and Quantity metrics for Simpati & byU products
 */

// Base metric structure (reused for Rev and Qty)
export interface MetricSet {
    target: number;
    target_commit: number;
    actual: number;
    last_month_full: number;
    lmsd: number; // Last Month Same Date
}

// Area summary with product breakdown
export interface AreaSummary {
    area_name: string; // "Cirebon", "Kota Cirebon", "Kuningan", "TOTAL"
    simpati: MetricSet;
    byu: MetricSet;
    total: MetricSet;
}

// Daily trend data point
export interface DailyTrend {
    date: string; // "2025-12-01"
    day: number;  // 1-31
    simpati: { current: number; last_month: number };
    byu: { current: number; last_month: number };
    total: { current: number; last_month: number };
}

// Complete aktifasi data structure
export interface AktifasiData {
    revenue: AreaSummary[];
    quantity: AreaSummary[];
    dailyTrendRevenue: Record<string, DailyTrend[]>; // keyed by area_name
    dailyTrendQuantity: Record<string, DailyTrend[]>;
}

// View mode type
export type MetricMode = 'REVENUE' | 'QUANTITY';
