/**
 * OmzetSummarySection
 *
 * Dipisah dari OmzetOutletPage — sama seperti StockSummarySection.
 * Menampilkan summary per TAP dan per Salesforce dengan metric omzet.
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, MapPin, User } from 'lucide-react';
import { GrowthBadge } from '../table/TableMicroComponents';
import { formatCurrency } from '../../utils/formatters';

interface OmzetRow {
    tap: string;
    salesforce: string;
    keterangan: string;
    omzetFM1: number;
    omzetM1: number;
    omzetM: number;
    growth: number;
    gapMoM: number;
    pjpStatus: string;
}

interface SummaryGroup {
    tap: string;
    salesforce?: string;
    outletCount: number;
    pjpCount: number;
    growthCount: number;
    minusCount: number;
    totalOmzetFM1: number;
    totalOmzetM1: number;
    totalOmzetM: number;
    totalGap: number;
    growthPct: number;
}

interface OmzetSummarySectionProps {
    data: OmzetRow[];
    tapExpanded: boolean;
    sfExpanded: boolean;
    onToggleTap: () => void;
    onToggleSf: () => void;
}

function calcGroup(tap: string, sf: string | undefined, rows: OmzetRow[]): SummaryGroup {
    const totalM1 = rows.reduce((s, r) => s + r.omzetM1, 0);
    const totalM  = rows.reduce((s, r) => s + r.omzetM, 0);
    return {
        tap, salesforce: sf,
        outletCount: rows.length,
        pjpCount: rows.filter(r => r.pjpStatus === 'PJP').length,
        growthCount: rows.filter(r => r.growth > 0).length,
        minusCount: rows.filter(r => r.growth < 0).length,
        totalOmzetFM1: rows.reduce((s, r) => s + r.omzetFM1, 0),
        totalOmzetM1: totalM1,
        totalOmzetM: totalM,
        totalGap: totalM - totalM1,
        growthPct: totalM1 > 0 ? ((totalM - totalM1) / totalM1) * 100 : 0,
    };
}

interface GroupTableProps {
    rows: SummaryGroup[];
    title: string;
    icon: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    showSalesforce?: boolean;
}

const GroupTable: React.FC<GroupTableProps> = ({
    rows, title, icon, expanded, onToggle, showSalesforce = false
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
                        <tr className="bg-[#3d5f85] text-white">
                            <th className="px-3 py-2 text-left">TAP</th>
                            {showSalesforce && <th className="px-3 py-2 text-left">Salesforce</th>}
                            <th className="px-3 py-2 text-center">Outlets</th>
                            <th className="px-3 py-2 text-center">PJP</th>
                            <th className="px-3 py-2 text-center">Growth</th>
                            <th className="px-3 py-2 text-center">Minus</th>
                            <th className="px-3 py-2 text-right bg-[#2c4a6a]">Omzet FM-1</th>
                            <th className="px-3 py-2 text-right bg-[#3d5f85]">Omzet M-1</th>
                            <th className="px-3 py-2 text-right bg-[#2c4a6a]">Omzet M</th>
                            <th className="px-3 py-2 text-right bg-[#3d5f85]">Growth %</th>
                            <th className="px-3 py-2 text-right bg-[#2c4a6a]">GAP MoM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 border-b">
                                <td className="px-3 py-2 font-medium">{r.tap}</td>
                                {showSalesforce && <td className="px-3 py-2 text-gray-700">{r.salesforce}</td>}
                                <td className="px-3 py-2 text-center font-semibold">{r.outletCount}</td>
                                <td className="px-3 py-2 text-center text-blue-700 font-semibold">{r.pjpCount}</td>
                                <td className="px-3 py-2 text-center text-green-600 font-semibold">{r.growthCount}</td>
                                <td className="px-3 py-2 text-center text-red-600 font-semibold">{r.minusCount}</td>
                                <td className="px-3 py-2 text-right text-gray-400 bg-gray-50">{formatCurrency(r.totalOmzetFM1)}</td>
                                <td className="px-3 py-2 text-right text-gray-600 bg-orange-50/30">{formatCurrency(r.totalOmzetM1)}</td>
                                <td className="px-3 py-2 text-right font-semibold bg-green-50/30">{formatCurrency(r.totalOmzetM)}</td>
                                <td className="px-3 py-2 text-center"><GrowthBadge value={r.growthPct} /></td>
                                <td className={`px-3 py-2 text-right font-semibold ${r.totalGap >= 0 ? 'text-green-600 bg-green-50/20' : 'text-red-600 bg-red-50/20'}`}>
                                    {r.totalGap >= 0 ? '+' : ''}{formatCurrency(r.totalGap)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const OmzetSummarySection: React.FC<OmzetSummarySectionProps> = ({
    data, tapExpanded, sfExpanded, onToggleTap, onToggleSf
}) => {
    const tapSummary = useMemo(() => {
        const map = new Map<string, OmzetRow[]>();
        data.forEach(r => {
            if (!map.has(r.tap)) map.set(r.tap, []);
            map.get(r.tap)!.push(r);
        });
        return Array.from(map.entries())
            .map(([tap, rows]) => calcGroup(tap, undefined, rows))
            .sort((a, b) => a.tap.localeCompare(b.tap));
    }, [data]);

    const sfSummary = useMemo(() => {
        const map = new Map<string, { tap: string; rows: OmzetRow[] }>();
        data.forEach(r => {
            if (!map.has(r.salesforce)) map.set(r.salesforce, { tap: r.tap, rows: [] });
            map.get(r.salesforce)!.rows.push(r);
        });
        return Array.from(map.entries())
            .map(([sf, { tap, rows }]) => calcGroup(tap, sf, rows))
            .sort((a, b) => a.tap.localeCompare(b.tap) || (a.salesforce ?? '').localeCompare(b.salesforce ?? ''));
    }, [data]);

    return (
        <>
            <GroupTable
                rows={tapSummary}
                title="Summary per TAP"
                icon={<MapPin size={16} className="text-blue-600" />}
                expanded={tapExpanded}
                onToggle={onToggleTap}
            />
            <GroupTable
                rows={sfSummary}
                title="Summary per Salesforce"
                icon={<User size={16} className="text-green-600" />}
                expanded={sfExpanded}
                onToggle={onToggleSf}
                showSalesforce
            />
        </>
    );
};

export default OmzetSummarySection;
