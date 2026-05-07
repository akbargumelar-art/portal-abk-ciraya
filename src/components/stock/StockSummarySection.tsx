/**
 * StockSummarySection
 *
 * Dipisah dari StockPage (sebelumnya inline, 300+ baris JSX di dalam render).
 * Berisi: SummaryTable per TAP dan per Salesforce, dengan kolom stock metrics.
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, MapPin, User } from 'lucide-react';
import { RateBadge } from '../table/TableMicroComponents';

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

interface OutletData {
    tap: string;
    salesforce: string;
    pjpStatus: string;
    lokasiOutlet: string;
    totalBeli: number;
    totalSO: number;
    totalSisa: number;
}

interface SummaryRow {
    tap: string;
    salesforce?: string;
    pjpCount: number;
    outletBelanja: number;
    qtyBelanja: number;
    stockGt0Outlet: number;
    stockGt0RateToPJP: number;
    stockGt0Qty: number;
    stockGt0QtyPerOutlet: number;
    stock0ToOutletBelanja: number;
    stock0RateToBelanja: number;
    stock0ToOutletPJP: number;
    stock0RateToPJP: number;
    soDaily: number;
    stockDays: number;
    stockQty1: number;
    stockQty2to5: number;
    stockQty6to10: number;
    stockQty11to20: number;
    stockQtyGt20: number;
}

interface StockSummarySectionProps {
    data: OutletData[];
    type: 'perdana' | 'voucher';
    tapExpanded: boolean;
    sfExpanded: boolean;
    onToggleTap: () => void;
    onToggleSf: () => void;
}

// ─────────────────────────────────────────────────────
// Helper: calculate one summary row
// ─────────────────────────────────────────────────────

function calcRow(tap: string, sf: string | undefined, outlets: OutletData[]): SummaryRow {
    const pjpCount = outlets.filter(o => o.pjpStatus === 'PJP').length;
    const outletBelanja = outlets.filter(o => o.totalBeli > 0).length;
    const qtyBelanja = outlets.reduce((s, o) => s + o.totalBeli, 0);

    const gt0 = outlets.filter(o => o.totalSisa > 0);
    const stockGt0Outlet = gt0.length;
    const stockGt0Qty = gt0.reduce((s, o) => s + o.totalSisa, 0);

    const st0 = outlets.filter(o => o.totalSisa === 0);
    const stock0ToOutletBelanja = st0.filter(o => o.totalBeli > 0).length;
    const stock0ToOutletPJP = st0.filter(o => o.pjpStatus === 'PJP').length;

    const totalSO = outlets.reduce((s, o) => s + o.totalSO, 0);
    const totalSisa = outlets.reduce((s, o) => s + o.totalSisa, 0);
    const soDaily = totalSO / 30;

    return {
        tap, salesforce: sf, pjpCount,
        outletBelanja, qtyBelanja,
        stockGt0Outlet,
        stockGt0RateToPJP: pjpCount > 0 ? (stockGt0Outlet / pjpCount) * 100 : 0,
        stockGt0Qty,
        stockGt0QtyPerOutlet: stockGt0Outlet > 0 ? stockGt0Qty / stockGt0Outlet : 0,
        stock0ToOutletBelanja,
        stock0RateToBelanja: outletBelanja > 0 ? (stock0ToOutletBelanja / outletBelanja) * 100 : 0,
        stock0ToOutletPJP,
        stock0RateToPJP: pjpCount > 0 ? (stock0ToOutletPJP / pjpCount) * 100 : 0,
        soDaily,
        stockDays: soDaily > 0 ? totalSisa / soDaily : 0,
        stockQty1: outlets.filter(o => o.totalSisa === 1).length,
        stockQty2to5: outlets.filter(o => o.totalSisa >= 2 && o.totalSisa <= 5).length,
        stockQty6to10: outlets.filter(o => o.totalSisa >= 6 && o.totalSisa <= 10).length,
        stockQty11to20: outlets.filter(o => o.totalSisa >= 11 && o.totalSisa <= 20).length,
        stockQtyGt20: outlets.filter(o => o.totalSisa > 20).length,
    };
}

// ─────────────────────────────────────────────────────
// SummaryTable — reusable collapsible table
// ─────────────────────────────────────────────────────

interface SummaryTableProps {
    rows: SummaryRow[];
    title: string;
    icon: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    showSalesforce?: boolean;
    soRedeem?: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({
    rows, title, icon, expanded, onToggle, showSalesforce = false, soRedeem = 'SO'
}) => (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            aria-expanded={expanded}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-semibold text-gray-800 text-sm">{title}</span>
                <span className="text-xs text-gray-500">({rows.length} items)</span>
            </div>
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {expanded && (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="data-table data-table-compact whitespace-nowrap">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-gray-700">
                            <th className="p-2 text-left bg-[#2c4a6a] text-white" rowSpan={2}>TAP</th>
                            {showSalesforce && <th className="p-2 text-left bg-[#2c4a6a] text-white" rowSpan={2}>Salesforce</th>}
                            <th className="p-2 text-center bg-[#2c4a6a] text-white" rowSpan={2}>PJP</th>
                            <th className="p-2 text-center bg-[#3d5f85] text-white border-l border-gray-700" colSpan={2}>Belanja (ST)</th>
                            <th className="p-2 text-center bg-[#3d5f85] text-white border-l border-gray-700" colSpan={4}>Stock &gt;0</th>
                            <th className="p-2 text-center bg-[#3d5f85] text-white border-l border-gray-700" colSpan={4}>Stock 0</th>
                            <th className="p-2 text-center bg-[#2c4a6a] text-white border-l border-gray-700" rowSpan={2}>{soRedeem} Daily</th>
                            <th className="p-2 text-center bg-[#2c4a6a] text-white" rowSpan={2}>Stock Days</th>
                            <th className="p-2 text-center bg-[#3d5f85] text-white border-l border-gray-700" colSpan={5}>Stock per Qty</th>
                        </tr>
                        <tr className="bg-[#3d5f85] text-white border-b border-gray-700">
                            <th className="p-1.5 text-center border-l border-gray-700">Outlet</th>
                            <th className="p-1.5 text-center">Qty</th>
                            <th className="p-1.5 text-center border-l border-gray-700">Outlet</th>
                            <th className="p-1.5 text-center">Rate</th>
                            <th className="p-1.5 text-center">Qty</th>
                            <th className="p-1.5 text-center">Qty/O</th>
                            <th className="p-1.5 text-center border-l border-gray-700">to Belanja</th>
                            <th className="p-1.5 text-center">Rate</th>
                            <th className="p-1.5 text-center">to PJP</th>
                            <th className="p-1.5 text-center">Rate</th>
                            <th className="p-1.5 text-center border-l border-gray-700">1</th>
                            <th className="p-1.5 text-center">2-5</th>
                            <th className="p-1.5 text-center">6-10</th>
                            <th className="p-1.5 text-center">11-20</th>
                            <th className="p-1.5 text-center">&gt;20</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 border-b">
                                <td className="p-2 font-medium">{row.tap}</td>
                                {showSalesforce && <td className="p-2 text-gray-700">{row.salesforce}</td>}
                                <td className="p-2 text-center font-semibold text-blue-700">{row.pjpCount}</td>
                                <td className="p-2 text-center bg-orange-50/20">{row.outletBelanja}</td>
                                <td className="p-2 text-center bg-orange-50/20 font-medium">{row.qtyBelanja.toLocaleString()}</td>
                                <td className="p-2 text-center bg-green-50/20 border-l">{row.stockGt0Outlet}</td>
                                <td className="p-2 text-center bg-green-50/20"><RateBadge value={row.stockGt0RateToPJP} /></td>
                                <td className="p-2 text-center bg-green-50/20">{row.stockGt0Qty.toLocaleString()}</td>
                                <td className="p-2 text-center bg-green-50/20 font-medium">{row.stockGt0QtyPerOutlet.toFixed(1)}</td>
                                <td className="p-2 text-center bg-red-50/20 border-l">{row.stock0ToOutletBelanja}</td>
                                <td className="p-2 text-center bg-red-50/20"><RateBadge value={row.stock0RateToBelanja} invert /></td>
                                <td className="p-2 text-center bg-red-50/20">{row.stock0ToOutletPJP}</td>
                                <td className="p-2 text-center bg-red-50/20"><RateBadge value={row.stock0RateToPJP} invert /></td>
                                <td className="p-2 text-center bg-blue-50/20 border-l font-medium">{row.soDaily.toFixed(1)}</td>
                                <td className="p-2 text-center bg-blue-50/20 font-bold">{row.stockDays.toFixed(0)}</td>
                                <td className={`p-2 text-center border-l ${row.stockQty1 > 0 ? 'text-red-600 font-bold bg-red-50' : 'text-gray-400'}`}>{row.stockQty1 || '-'}</td>
                                <td className={`p-2 text-center ${row.stockQty2to5 > 0 ? 'text-orange-600 font-medium bg-orange-50/30' : 'text-gray-400'}`}>{row.stockQty2to5 || '-'}</td>
                                <td className={`p-2 text-center ${row.stockQty6to10 > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{row.stockQty6to10 || '-'}</td>
                                <td className={`p-2 text-center ${row.stockQty11to20 > 0 ? 'text-green-600' : 'text-gray-400'}`}>{row.stockQty11to20 || '-'}</td>
                                <td className={`p-2 text-center ${row.stockQtyGt20 > 0 ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{row.stockQtyGt20 || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

// ─────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────

const StockSummarySection: React.FC<StockSummarySectionProps> = ({
    data, type, tapExpanded, sfExpanded, onToggleTap, onToggleSf
}) => {
    const soRedeem = type === 'voucher' ? 'Redeem' : 'SO';

    const tapSummary = useMemo(() => {
        const map = new Map<string, OutletData[]>();
        data.forEach(o => {
            if (!map.has(o.tap)) map.set(o.tap, []);
            map.get(o.tap)!.push(o);
        });
        return Array.from(map.entries())
            .map(([tap, list]) => calcRow(tap, undefined, list))
            .sort((a, b) => a.tap.localeCompare(b.tap));
    }, [data]);

    const sfSummary = useMemo(() => {
        const map = new Map<string, { tap: string; outlets: OutletData[] }>();
        data.forEach(o => {
            if (!map.has(o.salesforce)) map.set(o.salesforce, { tap: o.tap, outlets: [] });
            map.get(o.salesforce)!.outlets.push(o);
        });
        return Array.from(map.entries())
            .map(([sf, { tap, outlets }]) => calcRow(tap, sf, outlets))
            .sort((a, b) => a.tap.localeCompare(b.tap) || (a.salesforce ?? '').localeCompare(b.salesforce ?? ''));
    }, [data]);

    return (
        <>
            <SummaryTable
                rows={tapSummary}
                title="Summary per TAP"
                icon={<MapPin size={16} className="text-blue-600" />}
                expanded={tapExpanded}
                onToggle={onToggleTap}
                soRedeem={soRedeem}
            />
            <SummaryTable
                rows={sfSummary}
                title="Summary per Salesforce"
                icon={<User size={16} className="text-green-600" />}
                expanded={sfExpanded}
                onToggle={onToggleSf}
                showSalesforce
                soRedeem={soRedeem}
            />
        </>
    );
};

export default StockSummarySection;
