/**
 * Market Share Types
 * 
 * Based on FB Share.csv and FB(KEC)++.csv structure
 */

// ===========================================
// CITY/BRANCH VIEW INTERFACE
// ===========================================
export interface MarketShareDiff {
    tsel: number;
    isat: number;
    xl: number;
    three: number;
}

export interface MarketShareCity {
    city_name: string;

    // Current Share (%)
    tsel_share: number;
    isat_share: number;
    xl_share: number;
    three_share: number;
    sf_share: number; // SmartFren or Others

    // Trends (Difference)
    wow_diff: MarketShareDiff;  // Week over Week
    mom_diff: MarketShareDiff;  // Month over Month
    yoy_diff: MarketShareDiff;  // Year over Year

    // Insights
    rank_tsel: number;
    highest_competitor: string;
    gap_to_highest: number; // Gap between Tsel and highest competitor
}

// ===========================================
// KECAMATAN VIEW INTERFACE
// ===========================================
export interface MarketShareKecamatan {
    // Hierarchy
    cluster: string;
    tap_name: string;
    kabupaten: string;
    kecamatan: string;

    // Current Share (M) - %
    tsel_share: number;
    ioh_share: number;      // Indosat Ooredoo Hutchison
    xl_plus_share: number;  // XL + Axis

    // Week-1 (W-1) - %
    tsel_w1: number;
    ioh_w1: number;
    xl_plus_w1: number;

    // Month-1 (M-1) - %
    tsel_m1: number;
    ioh_m1: number;
    xl_plus_m1: number;

    // Metrics
    wow_tsel_growth: number;   // tsel_share - tsel_w1
    mom_tsel_growth: number;   // tsel_share - tsel_m1
    win_lose_status: 'WIN' | 'LOSE';
    gap_to_highest: number;
    rank_tsel: number;  // 1, 2, or 3
}

// ===========================================
// TREND CHART DATA
// ===========================================
export interface TrendFBData {
    week: string;       // W1, W2, W3, W4
    tsel: number;
    ioh: number;
    xl_plus: number;
}
