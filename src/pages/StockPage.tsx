import React, { useMemo, useCallback } from 'react';
import { Package, Search, Store, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Input, Select, Button } from '../components/ui/index';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { stockItems, outlets } from '../data/mockData';
import { formatRSNumber } from '../utils/formatters';
import { useBidirectionalFilter } from '../hooks/useBidirectionalFilter';
import { useSortableTable } from '../hooks/useSortableTable';
import { StatusChip } from '../components/table/TableMicroComponents';
import StockSummarySection from '../components/stock/StockSummarySection';
import type { StockItem, Outlet } from '../types';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface StockPageProps {
    type: 'perdana' | 'voucher';
}

// ─────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────

interface OutletStockDetail {
    outletId: string;
    createdAt: string;
    idDigipos: string;
    rsNumber: string;
    outletName: string;
    salesforce: string;
    tap: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
    pjpStatus: string;
    physicalStatus: string;
    hariPJP: string;
    lokasiOutlet: string;
    flag: string;
    longitude: number | undefined;
    latitude: number | undefined;
    groupABeli: number;
    groupASO: number;
    groupASisa: number;
    groupBBeli: number;
    groupBSO: number;
    groupBSisa: number;
    totalBeli: number;
    totalSO: number;
    totalSisa: number;
    infoKeterangan: string;
}

// ─────────────────────────────────────────────────────
// Helper: Build OutletStockDetail from outlet + stock items
// ─────────────────────────────────────────────────────

function buildOutletDetail(
    outlet: Outlet,
    items: StockItem[],
    infoFilter: string,
): OutletStockDetail | null {
    let groupABeli = 0, groupASO = 0, groupASisa = 0;
    let groupBBeli = 0, groupBSO = 0, groupBSisa = 0;

    items.forEach(item => {
        if (item.productGroup === 'A') {
            groupABeli += item.beliM; groupASO += item.sellOutM; groupASisa += item.stockM;
        } else {
            groupBBeli += item.beliM; groupBSO += item.sellOutM; groupBSisa += item.stockM;
        }
    });

    const totalSisa = groupASisa + groupBSisa;
    const infoKeterangan = totalSisa <= 5 ? 'Push Order' : 'Cukup';

    if (infoFilter && infoFilter !== infoKeterangan) return null;

    return {
        outletId: outlet.id,
        createdAt: outlet.createdAt,
        idDigipos: outlet.idDigipos,
        rsNumber: outlet.rsNumber,
        outletName: outlet.name,
        salesforce: outlet.salesforceName,
        tap: outlet.tap,
        kabupaten: outlet.kabupaten,
        kecamatan: outlet.kecamatan,
        kelurahan: outlet.kelurahan,
        pjpStatus: outlet.pjpStatus,
        physicalStatus: outlet.physicalStatus,
        hariPJP: outlet.hariPJP,
        lokasiOutlet: outlet.lokasiOutlet || '-',
        flag: outlet.flag || '-',
        longitude: outlet.longitude,
        latitude: outlet.latitude,
        groupABeli, groupASO, groupASisa,
        groupBBeli, groupBSO, groupBSisa,
        totalBeli: groupABeli + groupBBeli,
        totalSO: groupASO + groupBSO,
        totalSisa,
        infoKeterangan,
    };
}

// ─────────────────────────────────────────────────────
// Filter dimensions definition (stable reference outside component)
// ─────────────────────────────────────────────────────

const FILTER_DIMENSIONS = [
    { key: 'tap' as keyof Outlet, placeholder: 'Semua TAP' },
    { key: 'salesforceName' as keyof Outlet, placeholder: 'Semua Salesforce' },
    { key: 'kabupaten' as keyof Outlet, placeholder: 'Semua Kabupaten' },
    { key: 'lokasiOutlet' as keyof Outlet, placeholder: 'Semua Lokasi', excludeEmpty: true },
    { key: 'flag' as keyof Outlet, placeholder: 'Semua Flag', excludeEmpty: true },
    { key: 'hariPJP' as keyof Outlet, placeholder: 'Semua Hari', excludeEmpty: true },
];


const INFO_OPTIONS = [
    { value: '', label: 'Semua' },
    { value: 'Push Order', label: 'Push Order' },
    { value: 'Cukup', label: 'Cukup' },
];

// ─────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────

const StockPage: React.FC<StockPageProps> = ({ type }) => {
    const title = type === 'perdana' ? 'Stock Perdana' : 'Stock Voucher';
    const soLabel = type === 'perdana' ? 'SO' : 'Redeem';

    // ── Static derived data ──
    const filteredStock = useMemo(
        () => stockItems.filter(s => s.productType === type),
        [type]
    );

    const outletsWithStock = useMemo(() => {
        const outletIds = new Set(filteredStock.map(s => s.outletId));
        return outlets.filter(o => outletIds.has(o.id));
    }, [filteredStock]);

    // ── Info & search filters (not bi-directional) ──
    const [infoFilter, setInfoFilter] = useState('');
    const [outletSearch, setOutletSearch] = useState('');
    const [summaryLokasiFilter, setSummaryLokasiFilter] = useState('');
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // ── Bi-directional filter hook ──
    const { filters, setFilter, clearAll, hasActiveFilters, options } =
        useBidirectionalFilter(outletsWithStock, FILTER_DIMENSIONS);

    // ── Build outlet detail data ──
    const allOutletDetail = useMemo<OutletStockDetail[]>(() => {
        const outletMap = new Map<string, { outlet: Outlet; items: StockItem[] }>();

        filteredStock.forEach(item => {
            const outlet = outlets.find(o => o.id === item.outletId);
            if (!outlet) return;

            // Apply bi-directional filters
            if (filters.tap && outlet.tap !== filters.tap) return;
            if (filters.salesforceName && outlet.salesforceName !== filters.salesforceName) return;
            if (filters.kabupaten && outlet.kabupaten !== filters.kabupaten) return;
            if (filters.lokasiOutlet && outlet.lokasiOutlet !== filters.lokasiOutlet) return;
            if (filters.flag && outlet.flag !== filters.flag) return;
            if (filters.hariPJP && outlet.hariPJP !== filters.hariPJP) return;


            if (!outletMap.has(outlet.id)) outletMap.set(outlet.id, { outlet, items: [] });
            outletMap.get(outlet.id)!.items.push(item);
        });

        const result: OutletStockDetail[] = [];
        outletMap.forEach(({ outlet, items }) => {
            const detail = buildOutletDetail(outlet, items, infoFilter);
            if (detail) result.push(detail);
        });

        return result.sort((a, b) => a.totalSisa - b.totalSisa);
    }, [filteredStock, filters, infoFilter]);

    // ── Search filter ──
    const searchedOutletDetail = useMemo(() => {
        if (!outletSearch) return allOutletDetail;
        const q = outletSearch.toLowerCase();
        return allOutletDetail.filter(o =>
            o.outletName.toLowerCase().includes(q) ||
            o.tap.toLowerCase().includes(q) ||
            o.salesforce.toLowerCase().includes(q) ||
            o.idDigipos.includes(q)
        );
    }, [allOutletDetail, outletSearch]);

    // ── Summary data (lokasi filter on top of allOutletDetail) ──
    const summaryData = useMemo(() =>
        summaryLokasiFilter
            ? allOutletDetail.filter(o => o.lokasiOutlet === summaryLokasiFilter)
            : allOutletDetail,
        [allOutletDetail, summaryLokasiFilter]
    );

    // ── Sortable table hook ──
    const { sortedData: sortedOutletData, handleSort, getSortIcon } =
        useSortableTable<OutletStockDetail>(searchedOutletDetail);

    // ── Export ──
    const exportToExcel = useCallback(() => {
        const headers = [
            'Created At', 'ID Digipos', 'No RS', 'Nama Outlet', 'Salesforce', 'TAP',
            'Kabupaten', 'Kecamatan', 'Kelurahan', 'PJP', 'Fisik', 'Hari PJP',
            'Lokasi', 'Flag', 'Longitude', 'Latitude',
            `Simpati Beli`, `Simpati ${soLabel}`, 'Simpati Sisa',
            `byU Beli`, `byU ${soLabel}`, 'byU Sisa',
            'Total Beli', `Total ${soLabel}`, 'Total Sisa', 'Keterangan',
        ];

        const rows = allOutletDetail.map(o => [
            o.createdAt, o.idDigipos, formatRSNumber(o.rsNumber), o.outletName, o.salesforce, o.tap,
            o.kabupaten, o.kecamatan, o.kelurahan, o.pjpStatus, o.physicalStatus, o.hariPJP,
            o.lokasiOutlet, o.flag, o.longitude?.toFixed(4) || '', o.latitude?.toFixed(4) || '',
            o.groupABeli, o.groupASO, o.groupASisa,
            o.groupBBeli, o.groupBSO, o.groupBSisa,
            o.totalBeli, o.totalSO, o.totalSisa, o.infoKeterangan,
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(' ', '_')}_Detail_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [allOutletDetail, title, soLabel]);

    const byuBgClass = 'bg-sky-50';

    return (
        <div className="p-4 lg:p-6 animate-fade-in">
            <Header
                title={title}
                subtitle="Data Updated: real-time"
            />

            {/* Filter Bar */}
            <Card padding="md" className="mt-4 lg:mt-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                            <X size={14} />Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 lg:gap-3">
                    {FILTER_DIMENSIONS.map(dim => (
                        <Select
                            key={dim.key}
                            label={dim.key === 'tap' ? 'TAP' : dim.key === 'hariPJP' ? 'Hari PJP' : dim.key.charAt(0).toUpperCase() + dim.key.slice(1)}
                            value={filters[dim.key] ?? ''}
                            onChange={e => setFilter(dim.key, e.target.value)}
                            options={options[dim.key] ?? [{ value: '', label: dim.placeholder }]}
                        />
                    ))}
                    <Select
                        label="Info"
                        value={infoFilter}
                        onChange={e => setInfoFilter(e.target.value)}
                        options={INFO_OPTIONS}
                    />
                </div>
            </Card>

            <Card padding="none" className="mt-4 lg:mt-6 overflow-hidden">
                <Tabs defaultValue="summary">
                    <TabList>
                        <Tab value="summary" icon={<Package size={16} />}>Summary</Tab>
                        <Tab value="detail" icon={<Store size={16} />}>Detail Outlet</Tab>
                    </TabList>

                    {/* Tab Summary */}
                    <TabPanel value="summary" className="p-4">
                        {/* Lokasi filter buttons */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-sm text-gray-700">Lokasi Outlet:</span>
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

                        <StockSummarySection
                            data={summaryData}
                            type={type}
                            tapExpanded={tapExpanded}
                            sfExpanded={sfExpanded}
                            onToggleTap={() => setTapExpanded(p => !p)}
                            onToggleSf={() => setSfExpanded(p => !p)}
                        />
                    </TabPanel>

                    {/* Tab Detail Outlet */}
                    <TabPanel value="detail" className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <Input
                                placeholder="Search outlet, TAP, salesforce, ID Digipos..."
                                value={outletSearch}
                                onChange={e => setOutletSearch(e.target.value)}
                                leftIcon={<Search size={16} />}
                                className="max-w-md"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Download size={16} />}
                                onClick={exportToExcel}
                            >
                                Export Excel
                            </Button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="data-table data-table-compact whitespace-nowrap">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-gray-700 divide-x divide-gray-700">
                                            <th colSpan={15} className="px-2 py-2 text-center bg-[#2c4a6a] text-white">Basic Info</th>
                                            <th colSpan={3} className="px-2 py-2 text-center bg-[#3d5f85] text-white">
                                                {type === 'perdana' ? 'Simpati' : 'Voucher Simpati'}
                                            </th>
                                            <th colSpan={3} className="px-2 py-2 text-center bg-[#3d5f85] text-white">
                                                {type === 'perdana' ? 'byU' : 'Voucher byU'}
                                            </th>
                                            <th colSpan={3} className="px-2 py-2 text-center bg-[#3d5f85] text-white">Total</th>
                                            <th colSpan={1} className="px-2 py-2 text-center bg-[#2c4a6a] text-white">Info</th>
                                        </tr>
                                        <tr className="bg-[#3d5f85]">
                                            {[
                                                ['createdAt', 'Created At'], ['idDigipos', 'ID Digipos'], ['rsNumber', 'No RS'],
                                                ['outletName', 'Nama Outlet'], ['salesforce', 'Salesforce'], ['tap', 'TAP'],
                                                ['kabupaten', 'Kabupaten'], ['kecamatan', 'Kecamatan'], ['kelurahan', 'Kelurahan'],
                                                ['pjpStatus', 'PJP'], ['physicalStatus', 'Fisik'], ['hariPJP', 'Hari PJP'],
                                                ['lokasiOutlet', 'Lokasi'], ['flag', 'Flag'],
                                            ].map(([col, label]) => (
                                                <th
                                                    key={col}
                                                    onClick={() => handleSort(col as keyof OutletStockDetail)}
                                                    className="px-2 py-2 text-left cursor-pointer hover:bg-[#4a6a8a] select-none"
                                                    aria-sort={undefined}
                                                >
                                                    <div className="flex items-center gap-1">{label}{getSortIcon(col as keyof OutletStockDetail)}</div>
                                                </th>
                                            ))}
                                            <th className="px-2 py-2 text-center min-w-[100px]">Long-Lat</th>
                                            {[['groupABeli', 'Beli'], ['groupASO', soLabel], ['groupASisa', 'Sisa']].map(([col, label]) => (
                                                <th key={col} onClick={() => handleSort(col as keyof OutletStockDetail)}
                                                    className="px-2 py-2 text-right bg-[#4a6a8a] cursor-pointer hover:bg-[#5a7a9a]">
                                                    <div className="flex items-center justify-end">{label}{getSortIcon(col as keyof OutletStockDetail)}</div>
                                                </th>
                                            ))}
                                            {[['groupBBeli', 'Beli'], ['groupBSO', soLabel], ['groupBSisa', 'Sisa']].map(([col, label]) => (
                                                <th key={col} onClick={() => handleSort(col as keyof OutletStockDetail)}
                                                    className="px-2 py-2 text-right bg-[#4a6a8a] cursor-pointer hover:bg-[#5a7a9a]">
                                                    <div className="flex items-center justify-end">{label}{getSortIcon(col as keyof OutletStockDetail)}</div>
                                                </th>
                                            ))}
                                            {[['totalBeli', 'Beli'], ['totalSO', soLabel], ['totalSisa', 'Sisa']].map(([col, label]) => (
                                                <th key={col} onClick={() => handleSort(col as keyof OutletStockDetail)}
                                                    className="px-2 py-2 text-right bg-[#2c4a6a] font-bold cursor-pointer hover:bg-[#3d5f85]">
                                                    <div className="flex items-center justify-end">{label}{getSortIcon(col as keyof OutletStockDetail)}</div>
                                                </th>
                                            ))}
                                            <th onClick={() => handleSort('infoKeterangan')}
                                                className="px-2 py-2 text-center bg-[#2c4a6a] cursor-pointer hover:bg-[#3d5f85]">
                                                <div className="flex items-center justify-center">Keterangan{getSortIcon('infoKeterangan')}</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedOutletData.length === 0 ? (
                                            <tr>
                                                <td colSpan={25} className="px-4 py-8 text-center text-gray-400">
                                                    Tidak ada outlet ditemukan
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedOutletData.map(outlet => (
                                                <tr key={outlet.outletId} className="hover:bg-gray-50">
                                                    <td className="px-2 py-1.5 text-[9px]">{outlet.createdAt}</td>
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{outlet.idDigipos}</td>
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{formatRSNumber(outlet.rsNumber)}</td>
                                                    <td className="px-2 py-1.5 font-medium text-gray-900 truncate max-w-[150px]" title={outlet.outletName}>{outlet.outletName}</td>
                                                    <td className="px-2 py-1.5 text-gray-900 truncate">{outlet.salesforce}</td>
                                                    <td className="px-2 py-1.5"><span className="text-[9px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">{outlet.tap}</span></td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kabupaten}</td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kecamatan}</td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kelurahan}</td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={outlet.pjpStatus} preset="pjp" /></td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={outlet.physicalStatus} preset="fisik" /></td>
                                                    <td className="px-2 py-1.5 text-center text-[9px]">{outlet.hariPJP}</td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={outlet.lokasiOutlet} preset="lokasi" /></td>
                                                    <td className="px-2 py-1.5 text-center"><StatusChip label={outlet.flag} preset="flag" /></td>
                                                    <td className="px-2 py-1.5 font-mono text-[8px] text-gray-500">
                                                        {outlet.longitude?.toFixed(4)}, {outlet.latitude?.toFixed(4)}
                                                    </td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] bg-red-50/20">{outlet.groupABeli}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] bg-red-50/20">{outlet.groupASO}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-medium bg-red-50/30">{outlet.groupASisa}</td>
                                                    <td className={`px-2 py-1.5 text-right text-[9px] ${byuBgClass}`}>{outlet.groupBBeli}</td>
                                                    <td className={`px-2 py-1.5 text-right text-[9px] ${byuBgClass}`}>{outlet.groupBSO}</td>
                                                    <td className={`px-2 py-1.5 text-right text-[9px] font-medium ${byuBgClass}`}>{outlet.groupBSisa}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-semibold bg-gray-50">{outlet.totalBeli}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-semibold bg-gray-50">{outlet.totalSO}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-bold bg-gray-50">{outlet.totalSisa}</td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <StatusChip label={outlet.infoKeterangan} preset="keterangan" />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabPanel>
                </Tabs>
            </Card>
        </div>
    );
};

export default StockPage;
