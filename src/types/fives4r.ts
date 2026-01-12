/**
 * 5S & 4R Performance Types
 * 
 * Based on Excel report structure with nested headers
 */

// ===========================================
// 5S DATA INTERFACE
// ===========================================
export interface FiveSData {
    tap_name: string;

    // SA (Trx) - Sales Activation
    sa_m1: number;
    sa_actual: number;
    sa_mom_pct: number;
    sa_target: number;
    sa_ach_pct: number;

    // ST (Trx) - Sell Through
    st_m1: number;
    st_actual: number;
    st_daily: number;
    st_mom_pct: number;
    st_target: number;
    st_ach_pct: number;

    // SO (Trx) - Sell Out
    so_m1: number;
    so_actual: number;
    so_daily: number;
    so_mom_pct: number;
    so_target: number;
    so_ach_pct: number;
    ratio_st_so: number;
    ratio_sa_so: number;

    // Ratio
    stock_qty: number;
    stock_days: number;
    cluster_domination: number;
    cluster_healthy: number;

    // Sales Renewal
    sr_pct: number;
    so_qty: number;
    renewal_qty: number;
    renewal_mom_pct: number;

    // Rev New Sales (Bn)
    rev_ns_m1: number;
    rev_ns_actual: number;
    rev_ns_mom_pct: number;
    rev_ns_target: number;
    rev_ns_ach_pct: number;

    // Rev SA (Bn)
    rev_sa_m1: number;
    rev_sa_actual: number;
    rev_sa_mom_pct: number;

    // Rev SO (Bn)
    rev_so_m1: number;
    rev_so_actual: number;
    rev_so_mom_pct: number;
    rev_so_target: number;
    rev_so_ach_pct: number;
}

// ===========================================
// 4R DATA INTERFACE
// ===========================================
export interface FourRData {
    tap_name: string;

    // RS Coverage
    register: number;
    pjp_fisik_m1: number;
    pjp_fisik_actual: number;
    cov_mom_pct: number;
    rate_to_register: number;

    // RS ST-SP (OA) - Outlet Active Starter Pack
    oa_sp_m1: number;
    oa_sp_actual: number;
    oa_sp_mom: number;
    rate_oa_sp_pjp: number;
    qty_st: number;
    avg_st_outlet: number;

    // RS ST-SP (OP) - Outlet Productive Starter Pack
    op_sp_m1: number;
    op_sp_actual: number;
    op_sp_mom: number;
    rate_op_sp_pjp: number;

    // RS ST PV (OA) - Outlet Active Physical Voucher
    oa_pv_m1: number;
    oa_pv_actual: number;
    oa_pv_mom: number;
    rate_oa_pv_pjp: number;
    qty_st_pv: number;
    avg_st_pv_outlet: number;

    // RS ST PV (OP) - Outlet Productive Physical Voucher
    op_pv_m1: number;
    op_pv_actual: number;
    op_pv_mom: number;
    rate_op_pv_pjp: number;

    // RS Omset
    omset_m1: number;
    omset_actual: number;
    omset_mom: number;
    rate_omset_pjp: number;
    rev_m1: number;
    rev_actual: number;
    rev_mom: number;
}
