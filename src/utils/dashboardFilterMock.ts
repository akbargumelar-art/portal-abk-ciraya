import type { Outlet, Transaction } from '../types';
import type { FilterState } from '../components/common/FilterBar';
import {
    calculateKPISummary,
    getOutletDistributionByPJP,
    getSalesTrend,
} from '../data/mockData';

function monthsBetween(startIso: string, endIso: string): string[] {
    const months: string[] = [];
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return [];
    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
    const end = new Date(e.getFullYear(), e.getMonth(), 1);
    while (cur <= end) {
        months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
        cur.setMonth(cur.getMonth() + 1);
    }
    return months;
}

function outletMatchesTapRegion(outlet: Outlet, tapCodes: string[]): boolean {
    return tapCodes.some((code) => {
        if (code === 'CIREBON') {
            return outlet.tap.includes('CRB') || /Cirebon/i.test(outlet.kabupaten);
        }
        if (code === 'KUNINGAN') {
            return outlet.tap.includes('KNG') || /Kuningan/i.test(outlet.kabupaten);
        }
        if (code === 'INDRAMAYU') {
            return outlet.tap.includes('IDR') || /Indramayu/i.test(outlet.kabupaten);
        }
        if (code === 'MAJALENGKA') {
            return outlet.tap.includes('MJL') || /Majalengka/i.test(outlet.kabupaten);
        }
        return false;
    });
}

/** Client-side slice of mock outlets/transactions for dashboard widgets. */
export function buildDashboardViewModel(
    outlets: Outlet[],
    transactions: Transaction[],
    filters: FilterState,
) {
    let filteredOutlets = outlets;
    if (filters.tap.length > 0) {
        filteredOutlets = filteredOutlets.filter((o) => outletMatchesTapRegion(o, filters.tap));
    }
    if (filters.salesforce.length > 0) {
        filteredOutlets = filteredOutlets.filter((o) => filters.salesforce.includes(o.salesforceId));
    }

    const outletIds = new Set(filteredOutlets.map((o) => o.id));
    let filteredTransactions = transactions.filter((t) => outletIds.has(t.outletId));

    const months = monthsBetween(filters.date.start, filters.date.end);
    if (months.length > 0) {
        filteredTransactions = filteredTransactions.filter((t) => months.includes(t.period));
    }

    return {
        filteredOutlets,
        kpiSummary: calculateKPISummary(filteredTransactions),
        outletDistribution: getOutletDistributionByPJP(filteredOutlets),
        salesTrend: getSalesTrend(filteredTransactions),
    };
}
