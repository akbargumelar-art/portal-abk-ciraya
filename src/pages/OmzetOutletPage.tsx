import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronRight,
    DollarSign,
    Target,
    BarChart3,
    Users,
    ArrowUpCircle,
    ArrowDownCircle,
    AlertCircle,
    MapPin,
    User,
    Filter,
    X,
    Download,
    ChevronLeft,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Select, Button } from '../components/ui/index';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { transactions } from '../data/mockData';
import { useRoleBasedOutlets, useUserFilterContext } from '../hooks/useRoleBasedData';
import { formatRSNumber } from '../utils/formatters';

// Pre-compute transaction map at module level (computed once on import)
const transactionMap = new Map<string, typeof transactions>();
transactions.forEach(t => {
    const key = `${t.outletId}-${t.period}`;
    if (!transactionMap.has(key)) {
        transactionMap.set(key, []);
    }
    transactionMap.get(key)!.push(t);
});

// Helper to get transactions quickly
const getTransactions = (outletId: string, period: string) => {
    return transactionMap.get(`${outletId}-${period}`) || [];
};

// Summary row interface
interface SummaryRow {
    tap: string;
    salesforce?: string;
    pjpCount: number;
    omzetM1: number;
    omzetM: number;
    growth: number;
    gap: number;
    oaOmzet: number;
    oaOmzetRatePJP: number;
    oaGrowth: number;
    oaGrowthRatePJP: number;
}

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

// Full Page Loading Overlay
const PageLoadingOverlay: React.FC = () => (
    <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#E11D48] rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-700 font-medium text-lg">Memuat data...</p>
            <p className="text-sm text-gray-400">Mohon tunggu sebentar</p>
        </div>
    </div>
);

const OmzetOutletPage: React.FC = () => {
    const outlets = useRoleBasedOutlets();
    const filterContext = useUserFilterContext();

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Filter state - bi-directional
    const [tapFilter, setTapFilter] = useState('');
    const [salesforceFilter, setSalesforceFilter] = useState('');
    const [hariPJPFilter, setHariPJPFilter] = useState('');
    const [flagFilter, setFlagFilter] = useState('');
    const [keteranganFilter, setKeteranganFilter] = useState('');

    // Summary Lokasi filter
    const [summaryLokasiFilter, setSummaryLokasiFilter] = useState('');

    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // Pagination state for detail table
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    // Sorting state for Detail table
    const [sortColumn, setSortColumn] = useState<keyof OmzetOutletData | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Defer initial processing with longer delay for visibility
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    // Calculate omzet data first (needed for filter options) - uses module-level getTransactions
    const allOmzetData = useMemo((): OmzetOutletData[] => {
        if (isLoading) return [];

        const result: OmzetOutletData[] = [];
        const currentDay = 22;

        outlets.forEach(outlet => {
            const outletTrxM = getTransactions(outlet.id, '2024-12');
            const outletTrxM1 = getTransactions(outlet.id, '2024-11');

            const omzetM = outletTrxM.reduce((sum, t) => sum + t.omzet, 0);
            const omzetFM1 = outletTrxM1.reduce((sum, t) => sum + t.omzet, 0);
            const omzetM1 = Math.round(omzetFM1 * (currentDay / 30));

            const growth = omzetM1 > 0 ? ((omzetM - omzetM1) / omzetM1) * 100 : (omzetM > 0 ? 100 : 0);
            const gapMoM = omzetM - omzetM1;

            let keterangan = 'Tetap';
            if (growth > 0) keterangan = 'Growth';
            else if (growth < 0) keterangan = 'Minus';

            if (omzetM > 0 || omzetFM1 > 0) {
                result.push({
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
                    gapMoM,
                    keterangan,
                });
            }
        });

        return result;
    }, [outlets, isLoading]);

    // Bi-directional filter options
    const tapOptions = useMemo(() => {
        const subset = allOmzetData.filter(o => {
            if (salesforceFilter && o.salesforce !== salesforceFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (keteranganFilter && o.keterangan !== keteranganFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.tap))].sort();
        return [{ value: '', label: 'Semua TAP' }, ...unique.map(t => ({ value: t, label: t }))];
    }, [allOmzetData, salesforceFilter, hariPJPFilter, flagFilter, keteranganFilter]);

    const salesforceOptions = useMemo(() => {
        const subset = allOmzetData.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (keteranganFilter && o.keterangan !== keteranganFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.salesforce))].sort();
        return [{ value: '', label: 'Semua Salesforce' }, ...unique.map(s => ({ value: s, label: s }))];
    }, [allOmzetData, tapFilter, hariPJPFilter, flagFilter, keteranganFilter]);

    const hariPJPOptions = useMemo(() => {
        const subset = allOmzetData.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforce !== salesforceFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (keteranganFilter && o.keterangan !== keteranganFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.hariPJP))].filter(Boolean).sort();
        return [{ value: '', label: 'Semua Hari' }, ...unique.map(h => ({ value: h, label: h }))];
    }, [allOmzetData, tapFilter, salesforceFilter, flagFilter, keteranganFilter]);

    const flagOptions = useMemo(() => {
        const subset = allOmzetData.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforce !== salesforceFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            if (keteranganFilter && o.keterangan !== keteranganFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.flag))].filter(f => f !== '-').sort();
        return [{ value: '', label: 'Semua Flag' }, ...unique.map(f => ({ value: f, label: f }))];
    }, [allOmzetData, tapFilter, salesforceFilter, hariPJPFilter, keteranganFilter]);

    const keteranganOptions = useMemo(() => {
        const subset = allOmzetData.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforce !== salesforceFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.keterangan))].sort();
        return [{ value: '', label: 'Semua' }, ...unique.map(k => ({ value: k, label: k }))];
    }, [allOmzetData, tapFilter, salesforceFilter, hariPJPFilter, flagFilter]);

    // Auto-clear if selection not in options
    useEffect(() => {
        if (tapFilter && !tapOptions.some(o => o.value === tapFilter)) setTapFilter('');
    }, [tapOptions, tapFilter]);

    useEffect(() => {
        if (salesforceFilter && !salesforceOptions.some(o => o.value === salesforceFilter)) setSalesforceFilter('');
    }, [salesforceOptions, salesforceFilter]);

    useEffect(() => {
        if (hariPJPFilter && !hariPJPOptions.some(o => o.value === hariPJPFilter)) setHariPJPFilter('');
    }, [hariPJPOptions, hariPJPFilter]);

    useEffect(() => {
        if (flagFilter && !flagOptions.some(o => o.value === flagFilter)) setFlagFilter('');
    }, [flagOptions, flagFilter]);

    useEffect(() => {
        if (keteranganFilter && !keteranganOptions.some(o => o.value === keteranganFilter)) setKeteranganFilter('');
    }, [keteranganOptions, keteranganFilter]);

    const hasActiveFilters = tapFilter || salesforceFilter || hariPJPFilter || flagFilter || keteranganFilter;

    const clearAllFilters = () => {
        setTapFilter('');
        setSalesforceFilter('');
        setHariPJPFilter('');
        setFlagFilter('');
        setKeteranganFilter('');
    };

    // Filtered omzet data
    const omzetData = useMemo((): OmzetOutletData[] => {
        return allOmzetData.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforce !== salesforceFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (keteranganFilter && o.keterangan !== keteranganFilter) return false;
            return true;
        }).sort((a, b) => b.omzetM - a.omzetM);
    }, [allOmzetData, tapFilter, salesforceFilter, hariPJPFilter, flagFilter, keteranganFilter]);

    // Summary data with Lokasi filter
    const summaryData = useMemo(() => {
        if (!summaryLokasiFilter) return omzetData;
        return omzetData.filter(o => o.lokasiOutlet === summaryLokasiFilter);
    }, [omzetData, summaryLokasiFilter]);

    // Sorted omzet data for detail table
    const sortedOmzetData = useMemo(() => {
        if (!sortColumn) return omzetData;

        return [...omzetData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Handle strings
            const aStr = String(aVal || '').toLowerCase();
            const bStr = String(bVal || '').toLowerCase();

            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr);
            }
            return bStr.localeCompare(aStr);
        });
    }, [omzetData, sortColumn, sortDirection]);

    // Sort handler
    const handleSort = (column: keyof OmzetOutletData) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Get sort icon for column
    const getSortIcon = (column: keyof OmzetOutletData) => {
        if (sortColumn !== column) {
            return <ArrowUpDown size={10} className="ml-1 opacity-40" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={10} className="ml-1 text-yellow-300" />
            : <ArrowDown size={10} className="ml-1 text-yellow-300" />;
    };

    // Export to Excel function
    const exportToExcel = useCallback(() => {
        const headers = [
            'ID Digipos', 'No RS', 'Nama Outlet', 'Salesforce', 'TAP',
            'Kabupaten', 'Kecamatan', 'PJP', 'Fisik', 'Hari PJP',
            'Lokasi', 'Flag', 'Omzet FM-1', 'Omzet M-1', 'Omzet M',
            'Growth %', 'GAP MoM', 'Keterangan'
        ];

        const rows = omzetData.map(o => [
            o.idDigipos, formatRSNumber(o.rsNumber), o.outletName, o.salesforce, o.tap,
            o.kabupaten, o.kecamatan, o.pjpStatus, o.physicalStatus, o.hariPJP,
            o.lokasiOutlet, o.flag, o.omzetFM1, o.omzetM1, o.omzetM,
            o.growth.toFixed(1), o.gapMoM, o.keterangan
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Omzet_Outlet_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [omzetData]);

    // Summary per TAP
    const tapSummary: SummaryRow[] = useMemo(() => {
        const tapMap = new Map<string, OmzetOutletData[]>();

        summaryData.forEach(outlet => {
            if (!tapMap.has(outlet.tap)) tapMap.set(outlet.tap, []);
            tapMap.get(outlet.tap)!.push(outlet);
        });

        return Array.from(tapMap.entries()).map(([tap, outletList]) => {
            const pjpCount = outletList.filter(o => o.pjpStatus === 'PJP').length;
            const omzetM1 = outletList.reduce((sum, o) => sum + o.omzetM1, 0);
            const omzetM = outletList.reduce((sum, o) => sum + o.omzetM, 0);
            const growth = omzetM1 > 0 ? ((omzetM - omzetM1) / omzetM1) * 100 : 0;
            const gap = omzetM - omzetM1;
            const oaOmzet = outletList.filter(o => o.omzetM > 0).length;
            const oaGrowth = outletList.filter(o => o.growth > 0).length;

            return {
                tap,
                pjpCount,
                omzetM1,
                omzetM,
                growth,
                gap,
                oaOmzet,
                oaOmzetRatePJP: pjpCount > 0 ? (oaOmzet / pjpCount) * 100 : 0,
                oaGrowth,
                oaGrowthRatePJP: pjpCount > 0 ? (oaGrowth / pjpCount) * 100 : 0,
            };
        }).sort((a, b) => a.tap.localeCompare(b.tap));
    }, [summaryData]);

    // Summary per Salesforce
    const sfSummary: SummaryRow[] = useMemo(() => {
        const sfMap = new Map<string, { tap: string; outlets: OmzetOutletData[] }>();

        summaryData.forEach(outlet => {
            if (!sfMap.has(outlet.salesforce)) {
                sfMap.set(outlet.salesforce, { tap: outlet.tap, outlets: [] });
            }
            sfMap.get(outlet.salesforce)!.outlets.push(outlet);
        });

        return Array.from(sfMap.entries()).map(([sf, data]) => {
            const pjpCount = data.outlets.filter(o => o.pjpStatus === 'PJP').length;
            const omzetM1 = data.outlets.reduce((sum, o) => sum + o.omzetM1, 0);
            const omzetM = data.outlets.reduce((sum, o) => sum + o.omzetM, 0);
            const growth = omzetM1 > 0 ? ((omzetM - omzetM1) / omzetM1) * 100 : 0;
            const gap = omzetM - omzetM1;
            const oaOmzet = data.outlets.filter(o => o.omzetM > 0).length;
            const oaGrowth = data.outlets.filter(o => o.growth > 0).length;

            return {
                tap: data.tap,
                salesforce: sf,
                pjpCount,
                omzetM1,
                omzetM,
                growth,
                gap,
                oaOmzet,
                oaOmzetRatePJP: pjpCount > 0 ? (oaOmzet / pjpCount) * 100 : 0,
                oaGrowth,
                oaGrowthRatePJP: pjpCount > 0 ? (oaGrowth / pjpCount) * 100 : 0,
            };
        }).sort((a, b) => a.tap.localeCompare(b.tap) || (a.salesforce || '').localeCompare(b.salesforce || ''));
    }, [summaryData]);

    // Summary stats
    const summary = useMemo(() => {
        const totalOmzetM = omzetData.reduce((sum, o) => sum + o.omzetM, 0);
        const totalOmzetM1 = omzetData.reduce((sum, o) => sum + o.omzetM1, 0);
        const averageGrowth = totalOmzetM1 > 0 ? ((totalOmzetM - totalOmzetM1) / totalOmzetM1) * 100 : 0;
        const risingOutlets = omzetData.filter(o => o.growth > 0).length;
        const fallingOutlets = omzetData.filter(o => o.growth < 0).length;
        const totalGap = totalOmzetM - totalOmzetM1;

        return { totalOmzetM, totalOmzetM1, averageGrowth, risingOutlets, fallingOutlets, totalGap };
    }, [omzetData]);

    // Format currency
    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)}B`;
        if (Math.abs(value) >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
        if (Math.abs(value) >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
        return `Rp ${value.toLocaleString()}`;
    };

    // Rate Badge
    const RateBadge = ({ value }: { value: number }) => {
        const color = value >= 80 ? 'bg-green-100 text-green-700' : value >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
        return <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${color}`}>{value.toFixed(1)}%</span>;
    };

    // Growth Badge
    const GrowthBadge = ({ value }: { value: number }) => {
        const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500';
        const icon = value > 0 ? <TrendingUp size={10} /> : value < 0 ? <TrendingDown size={10} /> : null;
        return (
            <span className={`flex items-center justify-center gap-0.5 ${color} font-medium text-[9px]`}>
                {icon}
                {value > 0 ? '+' : ''}{value.toFixed(1)}%
            </span>
        );
    };

    // Summary Table component
    const SummaryTable = ({ data, title, icon, expanded, onToggle, showSalesforce = false }: {
        data: SummaryRow[];
        title: string;
        icon: React.ReactNode;
        expanded: boolean;
        onToggle: () => void;
        showSalesforce?: boolean;
    }) => (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                    <span className="text-xs text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-[9px] border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a] text-white">
                            <tr className="border-b">
                                <th className="p-2 text-left" rowSpan={2}>TAP</th>
                                {showSalesforce && <th className="p-2 text-left" rowSpan={2}>Salesforce</th>}
                                <th className="p-2 text-center" rowSpan={2}>PJP</th>
                                <th className="p-2 text-right" rowSpan={2}>Omzet M-1</th>
                                <th className="p-2 text-right" rowSpan={2}>Omzet M</th>
                                <th className="p-2 text-center" rowSpan={2}>Growth</th>
                                <th className="p-2 text-right" rowSpan={2}>GAP</th>
                                <th className="p-2 text-center border-l bg-[#4a6a8a]" colSpan={2}>OA Omzet</th>
                                <th className="p-2 text-center border-l bg-[#4a6a8a]" colSpan={2}>OA Growth</th>
                            </tr>
                            <tr className="bg-[#5a7a9a] text-white">
                                <th className="p-1.5 text-center border-l">Count</th>
                                <th className="p-1.5 text-center">Rate PJP</th>
                                <th className="p-1.5 text-center border-l">Count</th>
                                <th className="p-1.5 text-center">Rate PJP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 border-b">
                                    <td className="p-2 font-medium">{row.tap}</td>
                                    {showSalesforce && <td className="p-2 text-gray-700">{row.salesforce}</td>}
                                    <td className="p-2 text-center font-semibold text-blue-700">{row.pjpCount}</td>
                                    <td className="p-2 text-right text-gray-500">{formatCurrency(row.omzetM1)}</td>
                                    <td className="p-2 text-right font-semibold">{formatCurrency(row.omzetM)}</td>
                                    <td className="p-2 text-center"><GrowthBadge value={row.growth} /></td>
                                    <td className={`p-2 text-right font-medium ${row.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {row.gap >= 0 ? '+' : ''}{formatCurrency(row.gap)}
                                    </td>
                                    <td className="p-2 text-center border-l bg-green-50/20 font-semibold">{row.oaOmzet}</td>
                                    <td className="p-2 text-center bg-green-50/20"><RateBadge value={row.oaOmzetRatePJP} /></td>
                                    <td className="p-2 text-center border-l bg-blue-50/20 font-semibold">{row.oaGrowth}</td>
                                    <td className="p-2 text-center bg-blue-50/20"><RateBadge value={row.oaGrowthRatePJP} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // Show loading overlay
    if (isLoading) {
        return (
            <div className="p-6 animate-fade-in">
                <Header title="Omzet Outlet" />
                <PageLoadingOverlay />
            </div>
        );
    }

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Omzet Outlet" />

            {/* Role-filtered data banner */}
            {filterContext && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-500" />
                    <span className="text-sm text-blue-700">
                        Menampilkan data untuk <strong>{filterContext.label}: {filterContext.value}</strong>
                    </span>
                </div>
            )}

            {/* Filter Bar */}
            <Card padding="md" className="mt-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors">
                            <X size={14} />Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Select label="TAP" value={tapFilter} onChange={e => setTapFilter(e.target.value)} options={tapOptions} />
                    <Select label="Salesforce" value={salesforceFilter} onChange={e => setSalesforceFilter(e.target.value)} options={salesforceOptions} />
                    <Select label="Hari PJP" value={hariPJPFilter} onChange={e => setHariPJPFilter(e.target.value)} options={hariPJPOptions} />
                    <Select label="Flag Outlet" value={flagFilter} onChange={e => setFlagFilter(e.target.value)} options={flagOptions} />
                    <Select label="Keterangan" value={keteranganFilter} onChange={e => setKeteranganFilter(e.target.value)} options={keteranganOptions} />
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Card padding="md" className="bg-gradient-to-br from-[#F13B4B]/5 to-[#F13B4B]/10 border-[#F13B4B]/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F13B4B]/10 rounded-lg"><DollarSign className="text-[#F13B4B]" size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Omzet M</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalOmzetM)}</p>
                            <GrowthBadge value={summary.averageGrowth} />
                        </div>
                    </div>
                </Card>

                <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg"><Target className="text-purple-600" size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">GAP MoM</p>
                            <p className={`text-xl font-bold ${summary.totalGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {summary.totalGap >= 0 ? '+' : ''}{formatCurrency(summary.totalGap)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg"><ArrowUpCircle className="text-green-600" size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Growth Outlets</p>
                            <p className="text-xl font-bold text-green-600">{summary.risingOutlets}</p>
                        </div>
                    </div>
                </Card>

                <Card padding="md" className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg"><ArrowDownCircle className="text-red-600" size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Minus Outlets</p>
                            <p className="text-xl font-bold text-red-600">{summary.fallingOutlets}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <Card padding="none" className="mt-6 overflow-hidden">
                <Tabs defaultValue="summary">
                    <TabList>
                        <Tab value="summary" icon={<BarChart3 size={16} />}>Summary</Tab>
                        <Tab value="detail" icon={<Users size={16} />}>Detail Outlet</Tab>
                    </TabList>

                    {/* Tab 1: Summary */}
                    <TabPanel value="summary" className="p-4">
                        {/* Lokasi Filter Buttons */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-white">Lokasi Outlet:</span>
                            <div className="flex gap-2">
                                <Button variant={summaryLokasiFilter === '' ? 'primary' : 'outline'} size="sm" onClick={() => setSummaryLokasiFilter('')}>Semua</Button>
                                <Button variant={summaryLokasiFilter === 'Ring 1' ? 'primary' : 'outline'} size="sm" onClick={() => setSummaryLokasiFilter('Ring 1')}>Ring 1</Button>
                                <Button variant={summaryLokasiFilter === 'Ring 2' ? 'primary' : 'outline'} size="sm" onClick={() => setSummaryLokasiFilter('Ring 2')}>Ring 2</Button>
                                <Button variant={summaryLokasiFilter === 'Ring 3' ? 'primary' : 'outline'} size="sm" onClick={() => setSummaryLokasiFilter('Ring 3')}>Ring 3</Button>
                            </div>
                        </div>

                        <SummaryTable data={tapSummary} title="Summary per TAP" icon={<MapPin size={16} className="text-blue-600" />} expanded={tapExpanded} onToggle={() => setTapExpanded(!tapExpanded)} />
                        <SummaryTable data={sfSummary} title="Summary per Salesforce" icon={<User size={16} className="text-green-600" />} expanded={sfExpanded} onToggle={() => setSfExpanded(!sfExpanded)} showSalesforce={true} />
                    </TabPanel>

                    {/* Tab 2: Detail Outlet */}
                    <TabPanel value="detail" className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-white">{omzetData.length} outlets</span>
                            <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={exportToExcel}>Export Excel</Button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="w-full text-[10px]">
                                    <thead className="sticky top-0 z-10 bg-[#2c4a6a] text-xs font-semibold text-white uppercase">
                                        <tr className="border-b">
                                            <th onClick={() => handleSort('idDigipos')} className="px-2 py-2 text-left min-w-[90px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">ID Digipos{getSortIcon('idDigipos')}</div></th>
                                            <th onClick={() => handleSort('rsNumber')} className="px-2 py-2 text-left min-w-[100px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">No RS{getSortIcon('rsNumber')}</div></th>
                                            <th onClick={() => handleSort('outletName')} className="px-2 py-2 text-left min-w-[150px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">Nama Outlet{getSortIcon('outletName')}</div></th>
                                            <th onClick={() => handleSort('salesforce')} className="px-2 py-2 text-left min-w-[100px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">Salesforce{getSortIcon('salesforce')}</div></th>
                                            <th onClick={() => handleSort('tap')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">TAP{getSortIcon('tap')}</div></th>
                                            <th onClick={() => handleSort('kabupaten')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">Kabupaten{getSortIcon('kabupaten')}</div></th>
                                            <th onClick={() => handleSort('kecamatan')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center">Kecamatan{getSortIcon('kecamatan')}</div></th>
                                            <th onClick={() => handleSort('pjpStatus')} className="px-2 py-2 text-center min-w-[50px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">PJP{getSortIcon('pjpStatus')}</div></th>
                                            <th onClick={() => handleSort('physicalStatus')} className="px-2 py-2 text-center min-w-[50px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">Fisik{getSortIcon('physicalStatus')}</div></th>
                                            <th onClick={() => handleSort('hariPJP')} className="px-2 py-2 text-center min-w-[60px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">Hari PJP{getSortIcon('hariPJP')}</div></th>
                                            <th onClick={() => handleSort('lokasiOutlet')} className="px-2 py-2 text-center min-w-[60px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">Lokasi{getSortIcon('lokasiOutlet')}</div></th>
                                            <th onClick={() => handleSort('flag')} className="px-2 py-2 text-center min-w-[70px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">Flag{getSortIcon('flag')}</div></th>
                                            <th onClick={() => handleSort('omzetFM1')} className="px-2 py-2 text-right min-w-[90px] bg-[#4a6a8a] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-end">Omzet FM-1{getSortIcon('omzetFM1')}</div></th>
                                            <th onClick={() => handleSort('omzetM1')} className="px-2 py-2 text-right min-w-[90px] bg-[#4a6a8a] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-end">Omzet M-1{getSortIcon('omzetM1')}</div></th>
                                            <th onClick={() => handleSort('omzetM')} className="px-2 py-2 text-right min-w-[90px] bg-[#4a6a8a] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-end">Omzet M{getSortIcon('omzetM')}</div></th>
                                            <th onClick={() => handleSort('growth')} className="px-2 py-2 text-center min-w-[60px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">Growth{getSortIcon('growth')}</div></th>
                                            <th onClick={() => handleSort('gapMoM')} className="px-2 py-2 text-right min-w-[80px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-end">GAP MoM{getSortIcon('gapMoM')}</div></th>
                                            <th onClick={() => handleSort('keterangan')} className="px-2 py-2 text-center min-w-[70px] cursor-pointer hover:bg-[#3d5f85]"><div className="flex items-center justify-center">Keterangan{getSortIcon('keterangan')}</div></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedOmzetData.length === 0 ? (
                                            <tr><td colSpan={18} className="px-4 py-8 text-center text-gray-400">No outlets found</td></tr>
                                        ) : (
                                            sortedOmzetData.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(outlet => (
                                                <tr key={outlet.outletId} className="hover:bg-gray-50">
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{outlet.idDigipos}</td>
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{formatRSNumber(outlet.rsNumber)}</td>
                                                    <td className="px-2 py-1.5 font-medium text-gray-900 truncate max-w-[150px]" title={outlet.outletName}>{outlet.outletName}</td>
                                                    <td className="px-2 py-1.5 text-gray-900 truncate">{outlet.salesforce}</td>
                                                    <td className="px-2 py-1.5"><span className="text-[9px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">{outlet.tap}</span></td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kabupaten}</td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kecamatan}</td>
                                                    <td className="px-2 py-1.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.pjpStatus === 'PJP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{outlet.pjpStatus}</span></td>
                                                    <td className="px-2 py-1.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.physicalStatus === 'Fisik' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{outlet.physicalStatus}</span></td>
                                                    <td className="px-2 py-1.5 text-center text-[9px]">{outlet.hariPJP}</td>
                                                    <td className="px-2 py-1.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.lokasiOutlet === 'Ring 1' ? 'bg-green-100 text-green-700' : outlet.lokasiOutlet === 'Ring 2' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-600'}`}>{outlet.lokasiOutlet}</span></td>
                                                    <td className="px-2 py-1.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.flag === 'Big Pareto' ? 'bg-orange-100 text-orange-700' : outlet.flag === 'Pareto Retail' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{outlet.flag}</span></td>
                                                    <td className="px-2 py-1.5 text-right text-gray-400 bg-gray-50">{formatCurrency(outlet.omzetFM1)}</td>
                                                    <td className="px-2 py-1.5 text-right text-gray-500 bg-orange-50/30">{formatCurrency(outlet.omzetM1)}</td>
                                                    <td className="px-2 py-1.5 text-right font-semibold bg-green-50/30">{formatCurrency(outlet.omzetM)}</td>
                                                    <td className="px-2 py-1.5 text-center"><GrowthBadge value={outlet.growth} /></td>
                                                    <td className={`px-2 py-1.5 text-right font-medium ${outlet.gapMoM >= 0 ? 'text-green-600' : 'text-red-600'}`}>{outlet.gapMoM >= 0 ? '+' : ''}{formatCurrency(outlet.gapMoM)}</td>
                                                    <td className="px-2 py-1.5 text-center"><span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${outlet.keterangan === 'Growth' ? 'bg-green-100 text-green-700' : outlet.keterangan === 'Minus' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{outlet.keterangan}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {omzetData.length > pageSize && (
                            <div className="flex items-center justify-between mt-4 px-2">
                                <span className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, omzetData.length)} of {omzetData.length}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        leftIcon={<ChevronLeft size={14} />}
                                    >
                                        Prev
                                    </Button>
                                    <span className="px-3 py-1.5 text-sm bg-gray-100 rounded">{currentPage} / {Math.ceil(omzetData.length / pageSize)}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(omzetData.length / pageSize), p + 1))}
                                        disabled={currentPage >= Math.ceil(omzetData.length / pageSize)}
                                        rightIcon={<ChevronRight size={14} />}
                                    >
                                        Next
                                    </Button>
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
