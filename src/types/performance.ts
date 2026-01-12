/**
 * Performance Types - Dynamic EAV Pattern
 * 
 * This module defines types that mimic a dynamic database structure
 * for flexible monthly KPI management.
 */

// ============================================================================
// KPI CATEGORIES
// ============================================================================

/**
 * KPI categories for grouping performance metrics.
 */
export type KPICategory = 'TOP_LINE' | 'BOTTOM_LINE';

// ============================================================================
// CONFIG TABLE (performance_params)
// ============================================================================

/**
 * KPI Parameter Configuration - mimics 'performance_params' database table.
 * Defines what KPIs are measured for a given period.
 */
export interface KPIParameterConfig {
    id: string;
    code: string;           // Unique identifier e.g., 'REVENUE_DATA'
    label: string;          // Display name e.g., 'Revenue Data (Gb)'
    kpi_category: KPICategory;
    period: string;         // Period code e.g., '2025-12'
    sort_order: number;     // Display order within category
    is_active: boolean;     // Whether this KPI is currently active
    unit?: string;          // Optional unit e.g., 'Gb', 'Rp', 'pcs'
    format?: 'number' | 'currency' | 'percent';  // Display format
}

// ============================================================================
// VALUE TABLE (performance_values)
// ============================================================================

/**
 * KPI Value - mimics 'performance_values' database table.
 * Stores actual performance data per TAP per parameter.
 */
export interface KPIValue {
    id: string;
    tap_id: string;         // FK to TAPMaster
    param_code: string;     // FK to KPIParameterConfig.code
    target: number;
    actual: number;
    commitment: number;     // Committed target
    lmsd: number;           // Last Month Same Date (for comparison)
}

// ============================================================================
// MASTER DATA
// ============================================================================

/**
 * TAP Master - reference data for TAP locations.
 */
export interface TAPMaster {
    id: string;
    name: string;
    region?: string;
}

// ============================================================================
// COMPUTED/VIEW TYPES
// ============================================================================

/**
 * Calculated metrics derived from KPIValue.
 */
export interface KPIMetrics extends KPIValue {
    achievement_pct: number;      // (actual / target) * 100
    gap: number;                  // actual - target
    mom_growth: number;           // ((actual - lmsd) / lmsd) * 100
    commitment_gap: number;       // actual - commitment
}

/**
 * Aggregated row for display in performance table.
 * Groups all KPI values for a single TAP.
 */
export interface PerformanceTableRow {
    tap: TAPMaster;
    metrics: Record<string, KPIMetrics>;  // param_code -> metrics
}

/**
 * Summary totals for a KPI parameter across all TAPs.
 */
export interface KPISummary {
    param_code: string;
    total_target: number;
    total_actual: number;
    total_commitment: number;
    total_lmsd: number;
    achievement_pct: number;
    mom_growth: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate metrics from raw KPIValue.
 */
export const calculateMetrics = (value: KPIValue): KPIMetrics => {
    const achievement_pct = value.target > 0
        ? (value.actual / value.target) * 100
        : 0;
    const gap = value.actual - value.target;
    const mom_growth = value.lmsd > 0
        ? ((value.actual - value.lmsd) / value.lmsd) * 100
        : 0;
    const commitment_gap = value.actual - value.commitment;

    return {
        ...value,
        achievement_pct,
        gap,
        mom_growth,
        commitment_gap,
    };
};

/**
 * Get achievement status color class.
 */
export const getAchievementColor = (pct: number): string => {
    if (pct >= 100) return 'text-green-600';
    if (pct >= 80) return 'text-yellow-600';
    return 'text-red-600';
};

/**
 * Get achievement badge variant.
 */
export const getAchievementVariant = (pct: number): 'success' | 'warning' | 'error' => {
    if (pct >= 100) return 'success';
    if (pct >= 80) return 'warning';
    return 'error';
};

/**
 * Format value based on format type.
 */
export const formatKPIValue = (
    value: number,
    format?: 'number' | 'currency' | 'percent',
    unit?: string
): string => {
    if (format === 'currency') {
        if (value >= 1_000_000_000) {
            return `Rp ${(value / 1_000_000_000).toFixed(2)}B`;
        }
        if (value >= 1_000_000) {
            return `Rp ${(value / 1_000_000).toFixed(1)}M`;
        }
        return `Rp ${value.toLocaleString()}`;
    }

    if (format === 'percent') {
        return `${value.toFixed(1)}%`;
    }

    // Default number format
    const formatted = value >= 1000
        ? value.toLocaleString()
        : value.toFixed(0);

    return unit ? `${formatted} ${unit}` : formatted;
};
