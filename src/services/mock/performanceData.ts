/**
 * Performance Mock Data Generator - Dynamic EAV Pattern
 * 
 * This module provides mock data that mimics what would come from
 * a dynamic database structure with performance_params and performance_values tables.
 */

import type {
    KPIParameterConfig,
    KPIValue,
    TAPMaster,
    PerformanceTableRow,
    KPISummary,
} from '../../types/performance';
import { calculateMetrics } from '../../types/performance';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateId = (): string =>
    Math.random().toString(36).substring(2, 10);

// ============================================================================
// TAP MASTER DATA
// ============================================================================

export const tapMaster: TAPMaster[] = [
    { id: 'TAP-CRB', name: 'TAP Cirebon', region: 'Cirebon' },
    { id: 'TAP-KNG', name: 'TAP Kuningan', region: 'Kuningan' },
    { id: 'TAP-MJL', name: 'TAP Majalengka', region: 'Majalengka' },
    { id: 'TAP-IND', name: 'TAP Indramayu', region: 'Indramayu' },
    { id: 'TAP-SBG', name: 'TAP Subang', region: 'Subang' },
];

// ============================================================================
// KPI PARAMETER CONFIGURATIONS
// These would come from a 'performance_params' table in a real database.
// Can be changed monthly without code modifications.
// ============================================================================

export const kpiParameters: KPIParameterConfig[] = [
    // TOP LINE KPIs
    {
        id: 'KPI-001',
        code: 'REVENUE_DATA',
        label: 'Revenue Data (Gb)',
        kpi_category: 'TOP_LINE',
        period: '2024-12',
        sort_order: 1,
        is_active: true,
        unit: 'Gb',
        format: 'number',
    },
    {
        id: 'KPI-002',
        code: 'REVENUE_VOICE',
        label: 'Revenue Voice',
        kpi_category: 'TOP_LINE',
        period: '2024-12',
        sort_order: 2,
        is_active: true,
        format: 'currency',
    },
    {
        id: 'KPI-003',
        code: 'REVENUE_SMS',
        label: 'Revenue SMS',
        kpi_category: 'TOP_LINE',
        period: '2024-12',
        sort_order: 3,
        is_active: true,
        format: 'currency',
    },
    {
        id: 'KPI-004',
        code: 'GROSS_ADD',
        label: 'Gross Add',
        kpi_category: 'TOP_LINE',
        period: '2024-12',
        sort_order: 4,
        is_active: true,
        unit: 'subs',
        format: 'number',
    },
    {
        id: 'KPI-005',
        code: 'NET_ADD_30D',
        label: 'Net Add 30D',
        kpi_category: 'TOP_LINE',
        period: '2024-12',
        sort_order: 5,
        is_active: true,
        unit: 'subs',
        format: 'number',
    },
    // BOTTOM LINE KPIs
    {
        id: 'KPI-101',
        code: 'OUTLET_AKTIF',
        label: 'Outlet Aktif',
        kpi_category: 'BOTTOM_LINE',
        period: '2024-12',
        sort_order: 1,
        is_active: true,
        unit: 'outlet',
        format: 'number',
    },
    {
        id: 'KPI-102',
        code: 'SO_PERDANA',
        label: 'SO Perdana',
        kpi_category: 'BOTTOM_LINE',
        period: '2024-12',
        sort_order: 2,
        is_active: true,
        unit: 'pcs',
        format: 'number',
    },
    {
        id: 'KPI-103',
        code: 'SO_VOUCHER',
        label: 'SO Voucher',
        kpi_category: 'BOTTOM_LINE',
        period: '2024-12',
        sort_order: 3,
        is_active: true,
        unit: 'pcs',
        format: 'number',
    },
    {
        id: 'KPI-104',
        code: 'PJP_VISIT',
        label: 'PJP Visit Rate',
        kpi_category: 'BOTTOM_LINE',
        period: '2024-12',
        sort_order: 4,
        is_active: true,
        format: 'percent',
    },
];

// ============================================================================
// KPI VALUES GENERATOR
// These would come from a 'performance_values' table in a real database.
// ============================================================================

const generateKPIValue = (tap_id: string, param: KPIParameterConfig): KPIValue => {
    let baseTarget: number;

    // Set realistic base targets based on KPI type
    switch (param.code) {
        case 'REVENUE_DATA':
            baseTarget = randomInt(8000, 15000);
            break;
        case 'REVENUE_VOICE':
            baseTarget = randomInt(50_000_000, 150_000_000);
            break;
        case 'REVENUE_SMS':
            baseTarget = randomInt(10_000_000, 50_000_000);
            break;
        case 'GROSS_ADD':
            baseTarget = randomInt(500, 2000);
            break;
        case 'NET_ADD_30D':
            baseTarget = randomInt(100, 500);
            break;
        case 'OUTLET_AKTIF':
            baseTarget = randomInt(150, 400);
            break;
        case 'SO_PERDANA':
            baseTarget = randomInt(2000, 8000);
            break;
        case 'SO_VOUCHER':
            baseTarget = randomInt(5000, 15000);
            break;
        case 'PJP_VISIT':
            baseTarget = randomInt(80, 95);
            break;
        default:
            baseTarget = randomInt(100, 1000);
    }

    const target = baseTarget;
    const actual = Math.round(target * (0.7 + Math.random() * 0.6)); // 70% - 130%
    const commitment = Math.round(target * (0.95 + Math.random() * 0.1)); // 95% - 105%
    const lmsd = Math.round(actual * (0.8 + Math.random() * 0.4)); // 80% - 120% of actual

    return {
        id: generateId(),
        tap_id,
        param_code: param.code,
        target,
        actual,
        commitment,
        lmsd,
    };
};

// Generate all KPI values
export const generateKPIValues = (): KPIValue[] => {
    const values: KPIValue[] = [];
    const activeParams = kpiParameters.filter(p => p.is_active);

    tapMaster.forEach(tap => {
        activeParams.forEach(param => {
            values.push(generateKPIValue(tap.id, param));
        });
    });

    return values;
};

// Pre-generated values for consistent display
export const kpiValues: KPIValue[] = generateKPIValues();

// ============================================================================
// DATA AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Get KPI parameters by category.
 */
export const getParametersByCategory = (category: 'TOP_LINE' | 'BOTTOM_LINE'): KPIParameterConfig[] => {
    return kpiParameters
        .filter(p => p.kpi_category === category && p.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);
};

/**
 * Get all active parameters.
 */
export const getActiveParameters = (): KPIParameterConfig[] => {
    return kpiParameters
        .filter(p => p.is_active)
        .sort((a, b) => {
            // Sort by category first, then sort_order
            if (a.kpi_category !== b.kpi_category) {
                return a.kpi_category === 'TOP_LINE' ? -1 : 1;
            }
            return a.sort_order - b.sort_order;
        });
};

/**
 * Get parameter config by code.
 */
export const getParameterByCode = (code: string): KPIParameterConfig | undefined => {
    return kpiParameters.find(p => p.code === code);
};

/**
 * Build performance table rows from raw values.
 * Groups values by TAP and calculates metrics.
 */
export const buildPerformanceTableRows = (
    values: KPIValue[] = kpiValues,
    taps: TAPMaster[] = tapMaster
): PerformanceTableRow[] => {
    return taps.map(tap => {
        const tapValues = values.filter(v => v.tap_id === tap.id);
        const metrics: Record<string, ReturnType<typeof calculateMetrics>> = {};

        tapValues.forEach(value => {
            metrics[value.param_code] = calculateMetrics(value);
        });

        return { tap, metrics };
    });
};

/**
 * Calculate summary totals for each KPI parameter.
 */
export const calculateKPISummaries = (
    values: KPIValue[] = kpiValues
): KPISummary[] => {
    const paramCodes = [...new Set(values.map(v => v.param_code))];

    return paramCodes.map(code => {
        const paramValues = values.filter(v => v.param_code === code);

        const total_target = paramValues.reduce((sum, v) => sum + v.target, 0);
        const total_actual = paramValues.reduce((sum, v) => sum + v.actual, 0);
        const total_commitment = paramValues.reduce((sum, v) => sum + v.commitment, 0);
        const total_lmsd = paramValues.reduce((sum, v) => sum + v.lmsd, 0);

        return {
            param_code: code,
            total_target,
            total_actual,
            total_commitment,
            total_lmsd,
            achievement_pct: total_target > 0 ? (total_actual / total_target) * 100 : 0,
            mom_growth: total_lmsd > 0 ? ((total_actual - total_lmsd) / total_lmsd) * 100 : 0,
        };
    });
};

export const filterValuesByCategory = (
    category: 'TOP_LINE' | 'BOTTOM_LINE',
    values: KPIValue[] = kpiValues
): KPIValue[] => {
    const categoryParams = getParametersByCategory(category);
    const paramCodes = categoryParams.map(p => p.code);
    return values.filter(v => paramCodes.includes(v.param_code));
};

// ============================================================================
// CATEGORY-SPECIFIC KPI CONFIGURATIONS (Per Submenu Page)
// ============================================================================

/**
 * TOP LINE KPIs - Revenue and subscriber metrics
 */
export const TOP_LINE_KPIS: KPIParameterConfig[] = [
    { id: 'TL-001', code: 'REV_DATA', label: 'Revenue Data', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 1, is_active: true, format: 'currency' },
    { id: 'TL-002', code: 'REV_VOICE', label: 'Revenue Voice', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 2, is_active: true, format: 'currency' },
    { id: 'TL-003', code: 'REV_SMS', label: 'Revenue SMS', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 3, is_active: true, format: 'currency' },
    { id: 'TL-004', code: 'REV_VAS', label: 'Revenue VAS', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 4, is_active: true, format: 'currency' },
    { id: 'TL-005', code: 'GROSS_ADD', label: 'Gross Add', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 5, is_active: true, unit: 'subs', format: 'number' },
    { id: 'TL-006', code: 'NET_ADD_30D', label: 'Net Add 30D', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 6, is_active: true, unit: 'subs', format: 'number' },
];

/**
 * 5S-4R KPIs - Performance metrics
 */
export const FIVE_S_FOUR_R_KPIS: KPIParameterConfig[] = [
    // 5S
    { id: '5S-001', code: '5S_SPEED', label: 'Speed', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 1, is_active: true, format: 'percent' },
    { id: '5S-002', code: '5S_SCALE', label: 'Scale', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 2, is_active: true, format: 'percent' },
    { id: '5S-003', code: '5S_SCORE', label: 'Score', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 3, is_active: true, format: 'percent' },
    { id: '5S-004', code: '5S_SKILL', label: 'Skill', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 4, is_active: true, format: 'percent' },
    { id: '5S-005', code: '5S_SPIRIT', label: 'Spirit', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 5, is_active: true, format: 'percent' },
    // 4R
    { id: '4R-001', code: '4R_REVENUE', label: 'Revenue', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 6, is_active: true, format: 'currency' },
    { id: '4R-002', code: '4R_REACH', label: 'Reach', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 7, is_active: true, unit: 'outlet', format: 'number' },
    { id: '4R-003', code: '4R_RETENTION', label: 'Retention', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 8, is_active: true, format: 'percent' },
    { id: '4R-004', code: '4R_RECRUITMENT', label: 'Recruitment', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 9, is_active: true, unit: 'subs', format: 'number' },
];

/**
 * MARKET SHARE KPIs
 */
export const MARKET_SHARE_KPIS: KPIParameterConfig[] = [
    { id: 'MS-001', code: 'MS_DATA', label: 'MS Data', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 1, is_active: true, format: 'percent' },
    { id: 'MS-002', code: 'MS_VOICE', label: 'MS Voice', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 2, is_active: true, format: 'percent' },
    { id: 'MS-003', code: 'MS_PERDANA', label: 'MS Perdana', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 3, is_active: true, format: 'percent' },
    { id: 'MS-004', code: 'MS_VOUCHER', label: 'MS Voucher', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 4, is_active: true, format: 'percent' },
    { id: 'MS-005', code: 'MS_DEVICE', label: 'MS Device', kpi_category: 'TOP_LINE', period: '2024-12', sort_order: 5, is_active: true, format: 'percent' },
];

/**
 * AKTIFASI KPIs - Activation metrics
 */
export const AKTIFASI_KPIS: KPIParameterConfig[] = [
    { id: 'AKT-001', code: 'GROSS_ADD_SP', label: 'Gross Add simPATI', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 1, is_active: true, unit: 'subs', format: 'number' },
    { id: 'AKT-002', code: 'GROSS_ADD_BYU', label: 'Gross Add byU', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 2, is_active: true, unit: 'subs', format: 'number' },
    { id: 'AKT-003', code: 'GROSS_ADD_LOOP', label: 'Gross Add Loop', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 3, is_active: true, unit: 'subs', format: 'number' },
    { id: 'AKT-004', code: 'NET_ADD_7D', label: 'Net Add 7D', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 4, is_active: true, unit: 'subs', format: 'number' },
    { id: 'AKT-005', code: 'NET_ADD_30D', label: 'Net Add 30D', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 5, is_active: true, unit: 'subs', format: 'number' },
    { id: 'AKT-006', code: 'CHURN_RATE', label: 'Churn Rate', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 6, is_active: true, format: 'percent' },
];

/**
 * SELLOUT KPIs
 */
export const SELLOUT_KPIS: KPIParameterConfig[] = [
    { id: 'SO-001', code: 'SO_PERDANA_SP', label: 'SO Perdana simPATI', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 1, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'SO-002', code: 'SO_PERDANA_BYU', label: 'SO Perdana byU', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 2, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'SO-003', code: 'SO_VOUCHER_DATA', label: 'SO Voucher Data', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 3, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'SO-004', code: 'SO_VOUCHER_TELP', label: 'SO Voucher Telp', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 4, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'SO-005', code: 'SO_DEVICE', label: 'SO Device', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 5, is_active: true, unit: 'unit', format: 'number' },
];

/**
 * INJECT VOUCHER FISIK KPIs
 */
export const INJECT_VOUCHER_KPIS: KPIParameterConfig[] = [
    { id: 'INJ-001', code: 'INJ_5K', label: 'Inject Rp 5.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 1, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'INJ-002', code: 'INJ_10K', label: 'Inject Rp 10.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 2, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'INJ-003', code: 'INJ_25K', label: 'Inject Rp 25.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 3, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'INJ-004', code: 'INJ_50K', label: 'Inject Rp 50.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 4, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'INJ-005', code: 'INJ_100K', label: 'Inject Rp 100.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 5, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'INJ-006', code: 'INJ_TOTAL_VALUE', label: 'Total Value Inject', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 6, is_active: true, format: 'currency' },
];

/**
 * REDEEM VOUCHER FISIK KPIs
 */
export const REDEEM_VOUCHER_KPIS: KPIParameterConfig[] = [
    { id: 'RDM-001', code: 'RDM_5K', label: 'Redeem Rp 5.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 1, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'RDM-002', code: 'RDM_10K', label: 'Redeem Rp 10.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 2, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'RDM-003', code: 'RDM_25K', label: 'Redeem Rp 25.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 3, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'RDM-004', code: 'RDM_50K', label: 'Redeem Rp 50.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 4, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'RDM-005', code: 'RDM_100K', label: 'Redeem Rp 100.000', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 5, is_active: true, unit: 'pcs', format: 'number' },
    { id: 'RDM-006', code: 'RDM_TOTAL_VALUE', label: 'Total Value Redeem', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 6, is_active: true, format: 'currency' },
    { id: 'RDM-007', code: 'RDM_RATE', label: 'Redeem Rate', kpi_category: 'BOTTOM_LINE', period: '2024-12', sort_order: 7, is_active: true, format: 'percent' },
];

// ============================================================================
// CATEGORY VALUE GENERATORS
// ============================================================================

/**
 * Generate KPI values for a specific category KPIs
 */
export const generateCategoryValues = (kpis: KPIParameterConfig[]): KPIValue[] => {
    const values: KPIValue[] = [];

    tapMaster.forEach(tap => {
        kpis.forEach(kpi => {
            let baseTarget: number;

            // Set realistic base targets
            if (kpi.format === 'currency') {
                baseTarget = randomInt(50_000_000, 500_000_000);
            } else if (kpi.format === 'percent') {
                baseTarget = randomInt(70, 100);
            } else {
                baseTarget = randomInt(500, 5000);
            }

            const target = baseTarget;
            const actual = Math.round(target * (0.7 + Math.random() * 0.6));
            const commitment = Math.round(target * (0.95 + Math.random() * 0.1));
            const lmsd = Math.round(actual * (0.8 + Math.random() * 0.4));

            values.push({
                id: generateId(),
                tap_id: tap.id,
                param_code: kpi.code,
                target,
                actual,
                commitment,
                lmsd,
            });
        });
    });

    return values;
};

// Pre-generated values for each category
export const topLineValues = generateCategoryValues(TOP_LINE_KPIS);
export const fiveS4RValues = generateCategoryValues(FIVE_S_FOUR_R_KPIS);
export const marketShareValues = generateCategoryValues(MARKET_SHARE_KPIS);
export const aktifasiValues = generateCategoryValues(AKTIFASI_KPIS);
export const selloutValues = generateCategoryValues(SELLOUT_KPIS);
export const injectVoucherValues = generateCategoryValues(INJECT_VOUCHER_KPIS);
export const redeemVoucherValues = generateCategoryValues(REDEEM_VOUCHER_KPIS);

