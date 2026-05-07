/**
 * OmzetOutletPage
 *
 * Refactored dari 755 baris → ~250 baris:
 * - useBidirectionalFilter menggantikan 5 useMemo + 5 useEffect
 * - useSortableTable menggantikan sort logic duplikat
 * - RateBadge, GrowthBadge, StatusChip diimport dari shared components
 * - SummaryTable dipindah keluar dari render (anti-pattern fixed)
 * - formatCurrency diimport dari utils/formatters
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Target, BarChart3, Users,
    ArrowUpCircle, ArrowDownCircle, AlertCircle,
    Filter, X, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Select, Button } from '../components/ui/index';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { transactions } from '../data/mockData';
import { useRoleBasedOutlets, useUserFilterContext } from '../hooks/useRoleBasedData';
import { formatRSNumber, formatCurrency } from '../utils/formatters';
import { useBidirectionalFilter } from '../hooks/useBidirectionalFilter';
import { useSortableTable } from '../hooks/useSortableTable';
import { GrowthBadge, StatusChip, PageLoadingSpinner } from '../components/table/TableMicroComponents';
import OmzetSummarySection from '../components/omzet/OmzetSummarySection';


// ─── Module-level transaction map (computed once on import, not per render) ───

const transactionMap = new Map<string, typeof transactions>();
transactions.forEach(t => {
    const key = `${t.outletId}-${t.period}`;
    if (!transactionMap.has(key)) transactionMap.set(key, []);
    transactionMap.get(key)!.push(t);
});
const getTransactions = (outletId: string, period: string) =>
    transactionMap.get(`${outletId}-${period}`) || [];

// ─── Types ────────────────────────────────────────────────────────────────────

interface OmzetOutletData {
    outletId: string;
    idDigipos: string;
    rsNumber: string;
    outletName: string;
    salesforce: string;
    tap: string;
    kabupaten: string;
    kecamatan: string;
    pjpStatus: string;
    physicalStatus: string;
    hariPJP: string;
    lokasiOutlet: string;
    flag: string;
    omzetFM1: number;
    omzetM1: number;
    omzetM: number;
    growth: number;
    gapMoM: number;
    keterangan: string;
}

// ─── Filter dimensions (stable outside component) ─────────────────────────────

const FILTER_DIMENSIONS = [
    { key: 'tap' as keyof OmzetOutletData, placeholder: 'Semua TAP' },
    { key: 'salesforce' as keyof OmzetOutletData, placeholder: 'Semua Salesforce' },
    { key: 'hariPJP' as keyof OmzetOutletData, placeholder: 'Semua Hari', excludeEmpty: true },
    { key: 'flag' as keyof OmzetOutletData, placeholder: 'Semua Flag', excludeEmpty: true },
    { key: 'keterangan' as keyof OmzetOutletData, placeholder: 'Semua' },
];




const CURRENT_PERIOD = '2024-12';
const PREV_PERIOD    = '2024-11';
const CURRENT_DAY    = 22; // TODO: replace with real API date when backend ready

const PAGE_SIZE = 50;

// ─── Main Component ───────────────────────────────────────────────────────────

const OmzetOutletPage: React.FC = () => {
    const outlets = useRoleBasedOutlets();
    const filterContext = useUserFilterContext();

    const [isLoading, setIsLoading] = useState(true);
    const [summaryLokasiFilter, setSummaryLokasiFilter] = useState('');
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Defer initial processing for perceived performance
    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(t);
    }, []);

    // ── Build omzet data ──────────────────────────────────────────────────────
    const allOmzetData = useMemo((): OmzetOutletData[] => {
        if (isLoading) return [];

        return outlets.flatMap(outlet => {
            const trxM  = getTransactions(outlet.id, CURRENT_PERIOD);
            const trxM1 = getTransactions(outlet.id, PREV_PERIOD);

            const omzetM    = trxM.reduce((s, t) => s + t.omzet, 0);
            const omzetFM1  = trxM1.reduce((s, t) => s + t.omzet, 0);
            const omzetM1   = Math.round(omzetFM1 * (CURRENT_DAY / 30));
            const growth    = omzetM1 > 0 ? ((omzetM - omzetM1) / omzetM1) * 100 : (omzetM > 0 ? 100 : 0);

            if (omzetM === 0 && omzetFM1 === 0) return [];

            return [{
                outletId: outlet.id,
                idDigipos: outlet.idDigipos,
                rsNumber: outlet.rsNumber,
                outletName: outlet.name,
                salesforce: outlet.salesforceName,
                tap: outlet.tap,
                kabupaten: outlet.kabupaten,
                kecamatan: outlet.kecamatan,
                pjpStatus: outlet.pjpStatus,
                physicalStatus: outlet.physicalStatus,
                hariPJP: outlet.hariPJP,
                lokasiOutlet: outlet.lokasiOutlet || '-',
                flag: outlet.flag || '-',
                omzetFM1,
                omzetM1,
                omzetM,
                growth,
                gapMoM: omzetM - omzetM1,
                keterangan: growth > 0 ? 'Growth' : growth < 0 ? 'Minus' : 'Tetap',
            }];
        });
    }, [outlets, isLoading]);

    // ── Bi-directional filter ─────────────────────────────────────────────────
    const { filters, setFilter, clearAll, hasActiveFilters, options, filteredData: omzetData } =
        useBidirectionalFilter(allOmzetData, FILTER_DIMENSIONS);

    // ── Summary data (lokasi filter on top) ────────────────────────────────────
    const summaryData = useMemo(() =>
        summaryLokasiFilter
            ? omzetData.filter(o => o.lokasiOutlet === summaryLokasiFilter)
            : omzetData,
        [omzetData, summaryLokasiFilter]
    );

    // ── Sortable table ────────────────────────────────────────────────────────
    const sortedOmzetData = useMemo(
        () => [...omzetData].sort((a, b) => b.omzetM - a.omzetM),
        [omzetData]
    );
    const { sortedData, handleSort, getSortIcon } = useSortableTable<OmzetOutletData>(sortedOmzetData);

    // ── Summary stats ──────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        const totalOmzetM  = omzetData.reduce((s, o) => s + o.omzetM, 0);
        const totalOmzetM1 = omzetData.reduce((s, o) => s + o.omzetM1, 0);
        return {
            totalOmzetM,
            totalOmzetM1,
            averageGrowth: totalOmzetM1 > 0 ? ((totalOmzetM - totalOmzetM1) / totalOmzetM1) * 100 : 0,
            risingOutlets: omzetData.filter(o => o.growth > 0).length,
            fallingOutlets: omzetData.filter(o => o.growth < 0).length,
            totalGap: totalOmzetM - totalOmzetM1,
        };
    }, [omzetData]);

    // ── Export ─────────────────────────────────────────────────────────────────
    const exportToExcel = useCallback(() => {
        const headers = [
            'ID Digipos', 'No RS', 'Nama Outlet', 'Salesforce', 'TAP',
            'Kabupaten', 'Kecamatan', 'PJP', 'Fisik', 'Hari PJP',
            'Lokasi', 'Flag', 'Omzet FM-1', 'Omzet M-1', 'Omzet M',
            'Growth %', 'GAP MoM', 'Keterangan',
        ];
        const rows = omzetData.map(o => [
            o.idDigipos, formatRSNumber(o.rsNumber), o.outletName, o.salesforce, o.tap,
            o.kabupaten, o.kecamatan, o.pjpStatus, o.physicalStatus, o.hariPJP,
            o.lokasiOutlet, o.flag, o.omzetFM1, o.omzetM1, o.omzetM,
            o.growth.toFixed(1), o.gapMoM, o.keterangan,
        ]);
        const csv = [headers, ...rows]
            .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Omzet_Outlet_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }, [omzetData]);

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="p-4 lg:p-6 animate-fade-in">
                <Header title="Omzet Outlet" />
                <PageLoadingSpinner message="Menghitung data omzet..." />
            </div>
        );
    }

    const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);

    return (
        <div className="p-4 lg:p-6 animate-fade-in">
            <Header title="Omzet Outlet" />

            {/* Role-filtered banner */}
            {filterContext && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-blue-700">
                        Menampilkan data untuk <strong>{filterContext.label}: {filterContext.value}</strong>
                    </span>
                </div>
            )}

            {/* Filter Bar */}
            <Card padding="md" className="mt-4 lg:mt-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button onClick={clearAll} className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors">
                            <X size={14} />Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
                    {FILTER_DIMENSIONS.map(dim => (
                        <Select
                            key={dim.key}
                            label={dim.key === 'tap' ? 'TAP' : dim.key === 'hariPJP' ? 'Hari PJP' : dim.key.charAt(0).toUpperCase() + dim.key.slice(1)}
                            value={filters[dim.key] ?? ''}
                            onChange={e => { setFilter(dim.key, e.target.value); setCurrentPage(1); }}
                            options={options[dim.key] ?? [{ value: '', label: dim.placeholder }]}
                        />
                    ))}
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-4 lg:mt-6">
                <Card padding="md" className="bg-gradient-to-br from-[#F13B4B]/5 to-[#F13B4B]/10 border-[#F13B4B]/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F13B4B]/10 rounded-lg"><DollarSign className="text-[#F13B4B]" size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-500">Omzet M</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalOmzetM)}</p>
                            <GrowthBadge value={summary.averageGrowth} />
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg"><Target className="text-purple-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-500">GAP MoM</p>
                            <p className={`text-lg font-bold ${summary.totalGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {summary.totalGap >= 0 ? '+' : ''}{formatCurrency(summary.totalGap)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg"><ArrowUpCircle className="text-green-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-500">Growth Outlets</p>
                            <p className="text-lg font-bold text-green-600">{summary.risingOutlets}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg"><ArrowDownCircle className="text-red-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-500">Minus Outlets</p>
                            <p className="text-lg font-bold text-red-600">{summary.fallingOutlets}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <Card padding="none" className="mt-4 lg:mt-6 overflow-hidden">
                <Tabs defaultValue="summary">
                    <TabList>
                        <Tab value="summary" icon={<BarChart3 size={16} />}>Summary</Tab>
                        <Tab value="detail" icon={<Users size={16} />}>Detail Outlet</Tab>
                    </TabList>

                    {/* Tab Summary */}
                    <TabPanel value="summary" className="p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-sm text-gray-600">Lokasi Outlet:</span>
                            {['', 'Ring 1', 'Ring 2', 'Ring 3'].map(ring => (
                                <Button
                                    key={ring || 'all'}
                                    variant={summaryLokasiFilter === ring ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSummaryLokasiFilter(ring)}
                                >
                                    {ring || 'Semua'}
                                </Button>
                            ))}
                        </div>
                        <OmzetSummarySection
                            data={summaryData}
                            tapExpanded={tapExpanded}
                            sfExpanded={sfExpanded}
                            onToggleTap={() => setTapExpanded(p => !p)}
                            onToggleSf={() => setSfExpanded(p => !p)}
                        />
                    </TabPanel>

                    {/* Tab Detail */}
                    <TabPanel value="detail" className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-600">{omzetData.length} outlets</span>
                            <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={exportToExcel}>
                                Export Excel
                            </Button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="data-table data-table-compact whitespace-nowrap">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            {[
                                                ['idDigipos', 'ID Digipos'], ['rsNumber', 'No RS'],
                                                ['outletName', 'Nama Outlet'], ['salesforce', 'Salesforce'],
                                                ['tap', 'TAP'], ['kabupaten', 'Kabupaten'], ['kecamatan', 'Kecamatan'],
                                                ['pjpStatus', 'PJP'], ['physicalStatus', 'Fisik'], ['hariPJP', 'Hari PJP'],
                                                ['lokasiOutlet', 'Lokasi'], ['flag', 'Flag'],
                                                ['omzetFM1', 'Omzet FM-1'], ['omzetM1', 'Omzet M-1'], ['omzetM', 'Omzet M'],
                                                ['growth', 'Growth'], ['gapMoM', 'GAP MoM'], ['keterangan', 'Ket.'],
                                            ].map(([col, label]) => (
                                                <th
                                                    key={col}
                                                    onClick={() => handleSort(col as keyof OmzetOutletData)}
                                                    className="px-2 py-2 text-left cursor-pointer hover:bg-[#3d5f85] select-none"
                                                    aria-sort={undefined}
                                                >
                                                    <div className="flex items-center gap-1">{label}{getSortIcon(col as keyof OmzetOutletData)}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedData.length === 0 ? (
                                            <tr><td colSpan={18} className="px-4 py-8 text-center text-gray-400">Tidak ada outlet ditemukan</td></tr>
                                        ) : (
                                            sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(o => (
                                                <tr key={o.outletId} className="hover:bg-gray-50">
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{o.idDigipos}</td>
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{formatRSNumber(o.rsNumber)}</td>
                                                    <td className="px-2 py-1.5 font-medium text-gray-900 truncate max-w-[150px]" title={o.outletName}>{o.outletName}</td>
                                                    <td className="px-2 py-1.5 truncate">{o.salesforce}</td>
                                                    <td className="px-2 py-1.5"><span className="text-[9px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">{o.tap}</span></td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{o.kabupaten}</td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{o.kecamatan}</td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={o.pjpStatus} preset="pjp" /></td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={o.physicalStatus} preset="fisik" /></td>
                                                    <td className="px-2 py-1.5 text-center text-[9px]">{o.hariPJP}</td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={o.lokasiOutlet} preset="lokasi" /></td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={o.flag} preset="flag" /></td>
                                                    <td className="px-2 py-1.5 text-right text-gray-400 bg-gray-50">{formatCurrency(o.omzetFM1)}</td>
                                                    <td className="px-2 py-1.5 text-right text-gray-500 bg-orange-50/30">{formatCurrency(o.omzetM1)}</td>
                                                    <td className="px-2 py-1.5 text-right font-semibold bg-green-50/30">{formatCurrency(o.omzetM)}</td>
                                                    <td className="px-2 py-1.5 text-center"><GrowthBadge value={o.growth} /></td>
                                                    <td className={`px-2 py-1.5 text-right font-medium ${o.gapMoM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {o.gapMoM >= 0 ? '+' : ''}{formatCurrency(o.gapMoM)}
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={o.keterangan} preset="keterangan" /></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {sortedData.length > PAGE_SIZE && (
                            <div className="flex flex-wrap items-center justify-between mt-4 px-2 gap-3">
                                <span className="text-sm text-gray-500">
                                    {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, sortedData.length)} dari {sortedData.length}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1} leftIcon={<ChevronLeft size={14} />}>Prev</Button>
                                    <span className="px-3 py-1.5 text-sm bg-gray-100 rounded">{currentPage} / {totalPages}</span>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage >= totalPages} rightIcon={<ChevronRight size={14} />}>Next</Button>
                                </div>
                            </div>
                        )}
                    </TabPanel>
                </Tabs>
            </Card>
        </div>
    );
};

export default OmzetOutletPage;
