import React, { useMemo, useState, useCallback } from 'react';
import {
    LayoutDashboard,
    Table as TableIcon,
    Search,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronDown,
    ChevronRight,
    MapPin,
    User,
    Clock,
    Download,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, Input, Button } from '../../components/ui';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import FilterBar, { type FilterState } from '../../components/common/FilterBar';
import PeriodControlPanel from '../../components/sales-plan/PeriodControlPanel';
import { salesPlanData } from '../../services/mock/salesPlanData';
import type { OutletSalesPlan, ProductMetric } from '../../types/salesPlan';
import { getProductHeaderBg, getProductCellBg, getProductTargetBg } from '../../utils/brandColors';
import { exportToExcel } from '../../utils/excelExport';
import { formatRSNumber } from '../../utils/formatters';

const productDefaults = [
    { key: 'simpati_3gb', label: 'Simpati 3GB' },
    { key: 'simpati_segel', label: 'Simpati Segel' },
    { key: 'byu_3gb', label: 'byU 3GB' },
    { key: 'byu_segel', label: 'byU Segel' },
];

// Computed columns (aggregates of base products)
const computedColumns = [
    { key: 'total_simpati', label: 'Total Simpati', sources: ['simpati_3gb', 'simpati_segel'] },
    { key: 'total_byu', label: 'Total byU', sources: ['byu_3gb', 'byu_segel'] },
];

// Full display order: Total, Total Simpati, Simpati 3GB, Simpati Segel, Total byU, byU 3GB, byU Segel
const displayProductOrder = [
    { key: 'total', label: 'TOTAL', isTotal: true },
    { key: 'total_simpati', label: 'Total Simpati', isComputed: true },
    { key: 'simpati_3gb', label: 'Simpati 3GB' },
    { key: 'simpati_segel', label: 'Simpati Segel' },
    { key: 'total_byu', label: 'Total byU', isComputed: true },
    { key: 'byu_3gb', label: 'byU 3GB' },
    { key: 'byu_segel', label: 'byU Segel' },
];

// Week color backgrounds for table columns
const weekBgColors: Record<number, string> = {
    1: 'bg-indigo-50',
    2: 'bg-purple-50',
    3: 'bg-pink-50',
    4: 'bg-orange-50',
    5: 'bg-teal-50',
};

const weekHeaderBgColors: Record<number, string> = {
    1: 'bg-indigo-100',
    2: 'bg-purple-100',
    3: 'bg-pink-100',
    4: 'bg-orange-100',
    5: 'bg-teal-100',
};

// Strong product group separator
const productSeparator = "border-l-2 border-gray-400";

const ProgressBar = ({ value }: { value: number }) => {
    let color = 'bg-red-500';
    if (value >= 100) color = 'bg-green-500';
    else if (value >= 80) color = 'bg-yellow-500';

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full ${color}`}
                style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
        </div>
    );
};

// Helper: Format number (thousands separator)
const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
};

const TrendIcon = ({ growth }: { growth: number }) => {
    if (growth > 0) return <div className="flex items-center text-green-600"><TrendingUp size={14} className="mr-1" />{Math.round(growth)}%</div>;
    if (growth < 0) return <div className="flex items-center text-red-600"><TrendingDown size={14} className="mr-1" />{Math.round(growth)}%</div>;
    return <div className="flex items-center text-gray-400"><Minus size={14} className="mr-1" />0%</div>;
};

// Type for aggregated summary data
interface SummaryRow {
    name: string;
    tap?: string; // Added for Salesforce summary
    outletCount: number;
    products: { [key: string]: ProductMetric };
}

const PlanPerdanaPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        date: { start: '', end: '' },
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        tap: [],
        salesforce: [],
        kabupaten: [],
        flag: [],
    });

    // Period Control State
    const [selectedWeeks, setSelectedWeeks] = useState<number[]>([1, 2, 3]);
    const [customRange, setCustomRange] = useState<{ start: number; end: number } | null>(null);

    // Collapsible State for Summary Tables
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Extract unique TAPs from data
    const tapOptions = useMemo(() => {
        const taps = new Set<string>();
        // Use full data or filtered data? Usually filters are based on full data available
        (salesPlanData as unknown as OutletSalesPlan[]).forEach(item => {
            if (item.tap_name) taps.add(item.tap_name);
        });
        return Array.from(taps).sort().map(tap => ({ value: tap, label: tap }));
    }, []);

    // Extract Salesforces based on selected TAP (Cascading)
    const salesforceOptions = useMemo(() => {
        const sfs = new Map<string, string>(); // id -> name
        const sourceData = (salesPlanData as unknown as OutletSalesPlan[]);

        sourceData.forEach(item => {
            // If TAP filter is active, only include SFs from those TAPs
            if (filters.tap.length > 0 && !filters.tap.includes(item.tap_name)) {
                return;
            }
            if (item.salesforce_name) {
                sfs.set(item.salesforce_name, item.salesforce_name);
            }
        });

        return Array.from(sfs.entries()).sort((a, b) => a[1].localeCompare(b[1])).map(([_, name]) => ({
            value: name, // Using name as value as per current filter logic
            label: name
        }));
    }, [filters.tap]);

    // Extract Kabupaten Options
    const kabupatenOptions = useMemo(() => {
        const kabs = new Set<string>();
        (salesPlanData as unknown as OutletSalesPlan[]).forEach(item => {
            if (item.kabupaten) kabs.add(item.kabupaten);
        });
        return Array.from(kabs).sort().map(k => ({ value: k, label: k }));
    }, []);

    // Extract Flag Options
    const flagOptions = useMemo(() => {
        const flags = new Set<string>();
        (salesPlanData as unknown as OutletSalesPlan[]).forEach(item => {
            if (item.outlet_flag) flags.add(item.outlet_flag);
        });
        return Array.from(flags).sort().map(f => ({ value: f, label: f }));
    }, []);

    // Extract Location Options
    const locationOptions = useMemo(() => {
        const locs = new Set<string>();
        (salesPlanData as unknown as OutletSalesPlan[]).forEach(item => {
            if (item.outlet_location) locs.add(item.outlet_location);
        });
        return Array.from(locs).sort().map(l => ({ value: l, label: l }));
    }, []);

    // Filter Logic
    const filteredData = useMemo(() => {
        return (salesPlanData as unknown as OutletSalesPlan[]).filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                item.outlet_name.toLowerCase().includes(searchLower) ||
                item.id_digipos.toLowerCase().includes(searchLower) ||
                item.salesforce_name.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            if (filters.tap && filters.tap.length > 0) {
                const matchesTap = filters.tap.some(t => item.tap_name.includes(t as string));
                if (!matchesTap) return false;
            }

            if (filters.kabupaten && filters.kabupaten.length > 0) {
                if (!filters.kabupaten.includes(item.kabupaten)) return false;
            }

            if (filters.flag && filters.flag.length > 0) {
                if (!filters.flag.includes(item.outlet_flag)) return false;
            }

            // Filter by location
            if (filters.pjpStatus && filters.pjpStatus.length > 0) {
                if (!filters.pjpStatus.includes(item.outlet_location)) return false;
            }

            return true;
        });
    }, [searchQuery, filters]);

    // Helper: Calculate previous month value (mock - 80-120% of current)
    const getPrevMonthValue = (currentValue: number) => {
        return Math.round(currentValue * (0.8 + Math.random() * 0.4));
    };

    // Helper: Calculate MoM percentage
    const calculateMoM = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    // Aggregate data by TAP
    const tapSummary = useMemo((): SummaryRow[] => {
        const tapMap = new Map<string, { outlets: OutletSalesPlan[] }>();

        filteredData.forEach(outlet => {
            const tap = outlet.tap_name;
            if (!tapMap.has(tap)) {
                tapMap.set(tap, { outlets: [] });
            }
            tapMap.get(tap)!.outlets.push(outlet);
        });

        return Array.from(tapMap.entries()).map(([tapName, data]) => {
            const aggregatedProducts: { [key: string]: ProductMetric } = {};

            productDefaults.forEach(prod => {
                const targetMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.target.mtd || 0), 0);
                const actualMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.actual.mtd || 0), 0);
                const targetWeekly = [0, 0, 0, 0, 0].map((_, i) =>
                    data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.target.weekly[i] || 0), 0)
                );
                const actualWeekly = [0, 0, 0, 0, 0].map((_, i) =>
                    data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.actual.weekly[i] || 0), 0)
                );
                const gapWeekly = actualWeekly.map((a, i) => a - targetWeekly[i]);
                const gapMtd = actualMtd - targetMtd;
                const achievementPct = targetMtd > 0 ? (actualMtd / targetMtd) * 100 : 0;
                const momGrowth = data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.mom_growth || 0), 0) / data.outlets.length;

                aggregatedProducts[prod.key] = {
                    target: { weekly: targetWeekly, mtd: targetMtd },
                    actual: { weekly: actualWeekly, mtd: actualMtd },
                    gap: { weekly: gapWeekly, mtd: gapMtd },
                    achievement_pct: achievementPct,
                    mom_growth: momGrowth
                };
            });

            // Calculate computed columns (Total Simpati, Total byU)
            computedColumns.forEach(computed => {
                const sources = computed.sources.map(s => aggregatedProducts[s]).filter(Boolean);
                const targetMtd = sources.reduce((sum, s) => sum + s.target.mtd, 0);
                const actualMtd = sources.reduce((sum, s) => sum + s.actual.mtd, 0);
                const targetWeekly = [0, 0, 0, 0, 0].map((_, i) => sources.reduce((sum, s) => sum + s.target.weekly[i], 0));
                const actualWeekly = [0, 0, 0, 0, 0].map((_, i) => sources.reduce((sum, s) => sum + s.actual.weekly[i], 0));
                const gapWeekly = actualWeekly.map((a, i) => a - targetWeekly[i]);
                const gapMtd = actualMtd - targetMtd;
                const achievementPct = targetMtd > 0 ? (actualMtd / targetMtd) * 100 : 0;
                const momGrowth = sources.reduce((sum, s) => sum + s.mom_growth, 0) / (sources.length || 1);

                aggregatedProducts[computed.key] = {
                    target: { weekly: targetWeekly, mtd: targetMtd },
                    actual: { weekly: actualWeekly, mtd: actualMtd },
                    gap: { weekly: gapWeekly, mtd: gapMtd },
                    achievement_pct: achievementPct,
                    mom_growth: momGrowth
                };
            });

            // Calculate Total Aggregation (TAP)
            const totalTargetMtd = productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.target.mtd || 0), 0);
            const totalActualMtd = productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.actual.mtd || 0), 0);
            const totalTargetWeekly = [0, 0, 0, 0, 0].map((_, i) => productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.target.weekly[i] || 0), 0));
            const totalActualWeekly = [0, 0, 0, 0, 0].map((_, i) => productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.actual.weekly[i] || 0), 0));
            const totalGapWeekly = totalActualWeekly.map((a, i) => a - totalTargetWeekly[i]);
            const totalGapMtd = totalActualMtd - totalTargetMtd;
            const totalAchPct = totalTargetMtd > 0 ? (totalActualMtd / totalTargetMtd) * 100 : 0;
            const totalMomGrowth = productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.mom_growth || 0), 0) / (productDefaults.length || 1);

            aggregatedProducts['total'] = {
                target: { weekly: totalTargetWeekly, mtd: totalTargetMtd },
                actual: { weekly: totalActualWeekly, mtd: totalActualMtd },
                gap: { weekly: totalGapWeekly, mtd: totalGapMtd },
                achievement_pct: totalAchPct,
                mom_growth: totalMomGrowth
            };

            return {
                name: tapName,
                outletCount: data.outlets.length,
                products: aggregatedProducts
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);

    // Aggregate data by Salesforce
    const sfSummary = useMemo((): SummaryRow[] => {
        const sfMap = new Map<string, { outlets: OutletSalesPlan[] }>();

        filteredData.forEach(outlet => {
            const sf = outlet.salesforce_name;
            if (!sfMap.has(sf)) {
                sfMap.set(sf, { outlets: [] });
            }
            sfMap.get(sf)!.outlets.push(outlet);
        });

        return Array.from(sfMap.entries()).map(([sfName, data]) => {
            const aggregatedProducts: { [key: string]: ProductMetric } = {};

            productDefaults.forEach(prod => {
                const targetMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.target.mtd || 0), 0);
                const actualMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.actual.mtd || 0), 0);
                const targetWeekly = [0, 0, 0, 0, 0].map((_, i) =>
                    data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.target.weekly[i] || 0), 0)
                );
                const actualWeekly = [0, 0, 0, 0, 0].map((_, i) =>
                    data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.actual.weekly[i] || 0), 0)
                );
                const gapWeekly = actualWeekly.map((a, i) => a - targetWeekly[i]);
                const gapMtd = actualMtd - targetMtd;
                const achievementPct = targetMtd > 0 ? (actualMtd / targetMtd) * 100 : 0;
                const momGrowth = data.outlets.reduce((sum, o) => sum + (o.products[prod.key]?.mom_growth || 0), 0) / data.outlets.length;

                aggregatedProducts[prod.key] = {
                    target: { weekly: targetWeekly, mtd: targetMtd },
                    actual: { weekly: actualWeekly, mtd: actualMtd },
                    gap: { weekly: gapWeekly, mtd: gapMtd },
                    achievement_pct: achievementPct,
                    mom_growth: momGrowth
                };
            });

            // Calculate computed columns (Total Simpati, Total byU)
            computedColumns.forEach(computed => {
                const sources = computed.sources.map(s => aggregatedProducts[s]).filter(Boolean);
                const targetMtd = sources.reduce((sum, s) => sum + s.target.mtd, 0);
                const actualMtd = sources.reduce((sum, s) => sum + s.actual.mtd, 0);
                const targetWeekly = [0, 0, 0, 0, 0].map((_, i) => sources.reduce((sum, s) => sum + s.target.weekly[i], 0));
                const actualWeekly = [0, 0, 0, 0, 5].map((_, i) => sources.reduce((sum, s) => sum + s.actual.weekly[i], 0));
                const gapWeekly = actualWeekly.map((a, i) => a - targetWeekly[i]);
                const gapMtd = actualMtd - targetMtd;
                const achievementPct = targetMtd > 0 ? (actualMtd / targetMtd) * 100 : 0;
                const momGrowth = sources.reduce((sum, s) => sum + s.mom_growth, 0) / (sources.length || 1);

                aggregatedProducts[computed.key] = {
                    target: { weekly: targetWeekly, mtd: targetMtd },
                    actual: { weekly: actualWeekly, mtd: actualMtd },
                    gap: { weekly: gapWeekly, mtd: gapMtd },
                    achievement_pct: achievementPct,
                    mom_growth: momGrowth
                };
            });

            // Calculate Total Aggregation (SF) - only from base products
            const totalTargetMtd = productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.target.mtd || 0), 0);
            const totalActualMtd = productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.actual.mtd || 0), 0);
            const totalTargetWeekly = [0, 0, 0, 0, 0].map((_, i) => productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.target.weekly[i] || 0), 0));
            const totalActualWeekly = [0, 0, 0, 0, 0].map((_, i) => productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.actual.weekly[i] || 0), 0));
            const totalGapWeekly = totalActualWeekly.map((a, i) => a - totalTargetWeekly[i]);
            const totalGapMtd = totalActualMtd - totalTargetMtd;
            const totalAchPct = totalTargetMtd > 0 ? (totalActualMtd / totalTargetMtd) * 100 : 0;
            const totalMomGrowth = productDefaults.reduce((sum, p) => sum + (aggregatedProducts[p.key]?.mom_growth || 0), 0) / (productDefaults.length || 1);

            aggregatedProducts['total'] = {
                target: { weekly: totalTargetWeekly, mtd: totalTargetMtd },
                actual: { weekly: totalActualWeekly, mtd: totalActualMtd },
                gap: { weekly: totalGapWeekly, mtd: totalGapMtd },
                achievement_pct: totalAchPct,
                mom_growth: totalMomGrowth
            };

            return {
                name: sfName,
                tap: data.outlets[0]?.tap_name || '-',
                outletCount: data.outlets.length,
                products: aggregatedProducts
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);

    // Styles

    const stickyHeaderStyle = "sticky top-0 z-30 bg-gray-100 font-semibold text-gray-700 uppercase p-2";

    // Excel Export Handler
    const handleExportExcel = useCallback(() => {
        const columns = [
            { header: 'ID Digipos', key: 'id_digipos', width: 15 },
            { header: 'Nama Outlet', key: 'outlet_name', width: 25 },
            { header: 'No RS', key: 'rs_number', width: 12 },
            { header: 'TAP', key: 'tap_name', width: 15 },
            { header: 'Salesforce', key: 'salesforce_name', width: 20 },
            { header: 'Kabupaten', key: 'kabupaten', width: 15 },
            { header: 'Kecamatan', key: 'kecamatan', width: 15 },
            { header: 'PJP', key: 'pjp_status', width: 10 },
            { header: 'Fisik', key: 'physical_status', width: 10 },
            { header: 'Lokasi', key: 'outlet_location', width: 12 },
            { header: 'Flag', key: 'outlet_flag', width: 10 },
        ];

        // Add product columns
        displayProductOrder.forEach(product => {
            columns.push(
                { header: `${product.label} - Target`, key: `${product.key}_target`, width: 12 },
                { header: `${product.label} - Aktual`, key: `${product.key}_aktual`, width: 12 },
                { header: `${product.label} - Ach%`, key: `${product.key}_ach`, width: 10 },
                { header: `${product.label} - Gap`, key: `${product.key}_gap`, width: 10 }
            );
        });

        // Prepare data
        const exportData = filteredData.map(row => {
            const flatRow: Record<string, unknown> = {
                id_digipos: row.id_digipos,
                outlet_name: row.outlet_name,
                rs_number: row.rs_number,
                tap_name: row.tap_name,
                salesforce_name: row.salesforce_name,
                kabupaten: row.kabupaten,
                kecamatan: row.kecamatan,
                pjp_status: row.pjp_status,
                physical_status: row.physical_status,
                outlet_location: row.outlet_location,
                outlet_flag: row.outlet_flag,
            };

            // Add product data
            displayProductOrder.forEach(product => {
                const prod = row.products[product.key];
                if (prod) {
                    const achPct = prod.target.mtd > 0 ? Math.round((prod.actual.mtd / prod.target.mtd) * 100) : 0;
                    flatRow[`${product.key}_target`] = prod.target.mtd;
                    flatRow[`${product.key}_aktual`] = prod.actual.mtd;
                    flatRow[`${product.key}_ach`] = `${achPct}%`;
                    flatRow[`${product.key}_gap`] = prod.gap.mtd;
                } else {
                    flatRow[`${product.key}_target`] = 0;
                    flatRow[`${product.key}_aktual`] = 0;
                    flatRow[`${product.key}_ach`] = '0%';
                    flatRow[`${product.key}_gap`] = 0;
                }
            });

            return flatRow;
        });

        exportToExcel({
            filename: 'SalesPlan_Perdana_DetailOutlet',
            sheetName: 'Detail Outlet',
            columns,
            data: exportData
        });
    }, [filteredData]);

    // Summary Table Component with Weekly Filters
    const SummaryTable = ({ data, title, icon, expanded, onToggle, showTap = false }: {
        data: SummaryRow[];
        title: string;
        icon: React.ReactNode;
        expanded: boolean;
        onToggle: () => void;
        showTap?: boolean;
    }) => {
        // Calculate colspan for product group (Summary Table)
        // Base: Tgt, Act, Ach%, M-1, MoM = 5 columns
        // Weekly: T.W, A.W, Ac%, G% = 4 per week (Target, Actual, Achievement%, Growth%)
        // Custom Range: A, G = 2 columns
        const getProductColSpan = () => {
            let span = 5; // Tgt, Act, Ach%, M-1, MoM
            span += selectedWeeks.length * 4; // T.W, A.W, Ac%, G% per week
            if (customRange) span += 2; // A, G for custom range
            return span;
        };

        return (
            <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                {/* Header */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {icon}
                        <span className="font-semibold text-gray-800">{title}</span>
                        <span className="text-sm text-gray-500">({data.length} items)</span>
                    </div>
                    {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {/* Table Content */}
                {expanded && (
                    <div className="overflow-auto max-h-[400px]">
                        <table className="data-table data-table-compact text-left">
                            <thead>
                                <tr className="bg-gray-100 sticky top-0 z-10">
                                    {showTap && <th rowSpan={2} className="py-1 px-2 min-w-[100px] font-semibold border-r border-gray-300 align-middle bg-gray-100">TAP</th>}
                                    <th rowSpan={2} className="py-1 px-2 min-w-[150px] font-semibold border-r border-gray-300 align-middle bg-gray-100">Name</th>
                                    <th rowSpan={2} className="py-1 px-2 min-w-[60px] text-center font-semibold border-r border-gray-300 align-middle bg-gray-100">PJP</th>

                                    {/* Product Groups - using displayProductOrder with brand colors */}
                                    {displayProductOrder.map(group => (
                                        <th key={group.key} colSpan={getProductColSpan()} className={`py-1 px-2 text-center ${productSeparator} font-semibold ${getProductHeaderBg(group.key)}`}>
                                            {group.label}
                                        </th>
                                    ))}
                                </tr>
                                <tr className="text-[10px] sticky top-[23px] z-10">

                                    {/* Sub-headers for all product groups */}
                                    {displayProductOrder.map(group => (
                                        <React.Fragment key={group.key}>
                                            <th className={`p-1 text-center ${productSeparator} ${getProductCellBg(group.key, true)}`}>Tgt</th>
                                            <th className={`p-1 text-center ${getProductCellBg(group.key, true)}`}>Act</th>
                                            <th className={`p-1 text-center ${getProductCellBg(group.key, true)}`}>Ach%</th>

                                            {/* Weekly Columns */}
                                            {selectedWeeks.map(weekNum => (
                                                <React.Fragment key={`${group.key}-w${weekNum}`}>
                                                    <th className={`p-1 text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>T.W{weekNum}</th>
                                                    <th className={`p-1 text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>A.W{weekNum}</th>
                                                    <th className={`p-1 text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>Ac%</th>
                                                    <th className={`p-1 text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>G%</th>
                                                </React.Fragment>
                                            ))}

                                            {/* Custom Range Columns */}
                                            {customRange && (
                                                <React.Fragment>
                                                    <th className="p-1 text-center bg-green-100 text-green-800">A.{customRange.start}-{customRange.end}</th>
                                                    <th className="p-1 text-center bg-green-100 text-green-800">G.{customRange.start}-{customRange.end}</th>
                                                </React.Fragment>
                                            )}

                                            <th className="p-1 text-center bg-amber-100 text-amber-800">M-1</th>
                                            <th className="p-1 text-center bg-amber-100 text-amber-800">MoM</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.name} className="hover:bg-gray-50 border-b border-gray-100">
                                        {showTap && <td className="p-2 font-medium border-r border-gray-200">{row.tap}</td>}
                                        <td className="p-2 font-medium border-r border-gray-200">{row.name}</td>
                                        <td className="p-2 text-center text-gray-500 border-r border-gray-200">{formatNumber(row.outletCount)}</td>

                                        {displayProductOrder.map(group => {
                                            const prod = row.products[group.key];
                                            const bgClass = getProductCellBg(group.key);
                                            const targetBgClass = getProductTargetBg(group.key);

                                            if (!prod) return <td colSpan={getProductColSpan()} key={group.key} className={productSeparator}>-</td>;

                                            const prevMonth = getPrevMonthValue(prod.actual.mtd);
                                            const mom = calculateMoM(prod.actual.mtd, prevMonth);

                                            return (
                                                <React.Fragment key={group.key}>
                                                    <td className={`p-2 text-center ${productSeparator} ${targetBgClass}`}>{formatNumber(prod.target.mtd)}</td>
                                                    <td className={`p-2 text-center font-semibold ${bgClass}`}>{formatNumber(prod.actual.mtd)}</td>
                                                    <td className={`p-2 text-center ${bgClass}`}>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px]">{Math.round(prod.achievement_pct)}%</span>
                                                            <ProgressBar value={prod.achievement_pct} />
                                                        </div>
                                                    </td>

                                                    {/* Weekly Columns */}
                                                    {selectedWeeks.map(weekNum => {
                                                        const weekIdx = weekNum - 1;
                                                        const weekActual = prod.actual.weekly[weekIdx] || 0;
                                                        const weekTarget = prod.target.weekly[weekIdx] || 0;
                                                        const weekAchPct = weekTarget > 0 ? (weekActual / weekTarget) * 100 : 0;

                                                        // Mock Growth calculation matching Detail Table
                                                        const weekPrev = getPrevMonthValue(weekActual);
                                                        const weekGrowthPct = weekPrev > 0 ? ((weekActual - weekPrev) / weekPrev) * 100 : 0;
                                                        const growthColor = weekGrowthPct >= 0 ? 'text-green-600' : 'text-red-600';

                                                        return (
                                                            <React.Fragment key={`${group.key}-w${weekNum}-data`}>
                                                                <td className={`p-2 text-center text-gray-500 ${weekBgColors[weekNum]}`}>{formatNumber(weekTarget)}</td>
                                                                <td className={`p-2 text-center ${weekBgColors[weekNum]}`}>{formatNumber(weekActual)}</td>
                                                                <td className={`p-2 text-center ${weekBgColors[weekNum]}`}>{Math.round(weekAchPct)}%</td>
                                                                <td className={`p-2 text-center font-medium ${weekBgColors[weekNum]} ${growthColor}`}>
                                                                    {weekGrowthPct > 0 ? `+${Math.round(weekGrowthPct)}%` : `${Math.round(weekGrowthPct)}%`}
                                                                </td>
                                                            </React.Fragment>
                                                        );
                                                    })}

                                                    {/* Custom Range Columns */}
                                                    {customRange && (() => {
                                                        const totalDays = new Date(filters.year || 2025, filters.month || 1, 0).getDate();
                                                        const rangeDays = customRange.end - customRange.start + 1;
                                                        const ratio = rangeDays / totalDays;

                                                        const rangeActual = Math.round(prod.actual.mtd * ratio * (0.8 + Math.random() * 0.4));
                                                        const rangeTarget = Math.round(prod.target.mtd * ratio);
                                                        const rangeGap = rangeActual - rangeTarget;
                                                        const gapColor = rangeGap >= 0 ? 'text-green-600' : 'text-red-600';

                                                        return (
                                                            <React.Fragment>
                                                                <td className="p-2 text-center bg-green-50">{formatNumber(rangeActual)}</td>
                                                                <td className={`p-2 text-center font-medium bg-green-50 ${gapColor}`}>
                                                                    {rangeGap > 0 ? `+${formatNumber(rangeGap)}` : rangeGap}
                                                                </td>
                                                            </React.Fragment>
                                                        );
                                                    })()}

                                                    {/* Previous Month & MoM */}
                                                    <td className="p-2 text-center bg-amber-50 text-amber-800">{formatNumber(prevMonth)}</td>
                                                    <td className="p-2 text-center bg-amber-50">
                                                        <TrendIcon growth={mom} />
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // Calculate columns per product for Detail Outlet table
    // Base: Tgt, Act, Ach%, Gap, M-1, MoM = 6 columns
    // Weekly: T.W, A.W, Ac%, G% = 4 per week (Target, Actual, Achievement%, Growth%)
    // Custom Range: T, A, G = 3 columns
    const getProductColSpan = () => {
        let baseSpan = 6; // Tgt, Act, Ach%, Gap, M-1, MoM
        baseSpan += selectedWeeks.length * 4; // T.W, A.W, Ac%, G% per week
        if (customRange) baseSpan += 3; // T, A, G for custom range
        return baseSpan;
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Sales Plan Perdana"
                subtitle=""
            />

            {/* Data Update Info */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            <FilterBar
                onFilterChange={setFilters}
                useMonthPicker={true}
                className="mt-4"
                tapOptions={tapOptions}
                salesforceOptions={salesforceOptions}
                showKabupaten={true}
                showFlag={true}
                showPJPStatus={true}
                kabupatenOptions={kabupatenOptions}
                flagOptions={flagOptions}
                pjpOptions={locationOptions}
            />

            <PeriodControlPanel
                month={filters.month || new Date().getMonth() + 1}
                year={filters.year || new Date().getFullYear()}
                selectedWeeks={selectedWeeks}
                onSelectedWeeksChange={setSelectedWeeks}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
                showCustomDate={false}
            />

            <Card padding="none" className="mt-2">
                <Tabs defaultValue="summary">
                    <TabList>
                        <Tab value="summary" icon={<LayoutDashboard size={16} />}>
                            Summary
                        </Tab>
                        <Tab value="detail" icon={<TableIcon size={16} />}>
                            Detail Outlet
                        </Tab>
                    </TabList>

                    {/* Tab 1: Summary (Per-TAP and Per-Salesforce) */}
                    <TabPanel value="summary" className="p-4">
                        {/* Summary by TAP */}
                        <SummaryTable
                            data={tapSummary}
                            title="Summary per TAP"
                            icon={<MapPin size={18} className="text-blue-600" />}
                            expanded={tapExpanded}
                            onToggle={() => setTapExpanded(!tapExpanded)}
                        />

                        {/* Summary by Salesforce */}
                        <SummaryTable
                            data={sfSummary}
                            title="Summary per Salesforce"
                            icon={<User size={18} className="text-green-600" />}
                            expanded={sfExpanded}
                            onToggle={() => setSfExpanded(!sfExpanded)}
                            showTap={true}
                        />
                    </TabPanel>

                    {/* Tab 2: Detail Outlet */}
                    <TabPanel value="detail" className="p-0">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <Input
                                placeholder="Search Outlet, ID Digipos, or Salesforce..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search size={16} />}
                                className="max-w-md"
                            />
                            <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={handleExportExcel}>
                                Export Excel
                            </Button>
                        </div>

                        <div className="overflow-auto max-h-[600px] relative">
                            <table className="data-table data-table-compact text-left whitespace-nowrap">
                                <thead>
                                    {/* Row 1: Left columns (rowSpan=3) + Product Group Names (rowSpan=2) */}
                                    <tr>

                                        <th rowSpan={2} className={`${stickyHeaderStyle} left-0 z-40 min-w-[80px] border-r border-gray-300 align-middle`}>ID</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} left-[80px] z-40 min-w-[120px] border-r border-gray-300 align-middle`}>Outlet</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} left-[200px] z-40 min-w-[80px] border-r border-gray-300 align-middle`}>Nomor RS</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} left-[280px] z-40 min-w-[120px] border-r border-gray-300 align-middle`}>TAP</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} left-[400px] z-40 min-w-[120px] border-r border-gray-300 align-middle`}>Salesforce</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} min-w-[120px] border-r border-gray-300 align-middle`}>Kabupaten</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} min-w-[120px] border-r border-gray-300 align-middle`}>Kecamatan</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} min-w-[80px] border-r border-gray-300 align-middle`}>PJP</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} min-w-[80px] border-r border-gray-300 align-middle`}>Fisik</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} min-w-[100px] border-r border-gray-300 align-middle`}>Lokasi</th>
                                        <th rowSpan={2} className={`${stickyHeaderStyle} min-w-[100px] border-r border-gray-300 align-middle`}>Flag</th>

                                        {/* Product Groups - rowSpan=2 to span Row 1 and Row 2 */}
                                        {displayProductOrder.map(group => (
                                            <th
                                                key={group.key}
                                                colSpan={getProductColSpan()}
                                                className={`${stickyHeaderStyle} text-center border-l-2 border-gray-400 align-middle ${getProductHeaderBg(group.key)}`}
                                            >
                                                {group.label}
                                            </th>
                                        ))}
                                    </tr>
                                    {/* Row 3: Sub-headers (Tgt, Act, Ach%, etc.) */}
                                    <tr className="sticky top-[23px] z-20">
                                        {/* Product Columns Sub-headers */}
                                        {displayProductOrder.map(group => (
                                            <React.Fragment key={group.key}>
                                                {/* MTD Columns */}
                                                <th className={`p-1 border-b min-w-[50px] text-center border-l-2 border-gray-500 ${getProductCellBg(group.key, true)}`}>Tgt</th>
                                                <th className={`p-1 border-b min-w-[50px] text-center ${getProductCellBg(group.key, true)}`}>Act</th>
                                                <th className={`p-1 border-b min-w-[50px] text-center ${getProductCellBg(group.key, true)}`}>Ach%</th>
                                                <th className={`p-1 border-b min-w-[50px] text-center ${getProductCellBg(group.key, true)}`}>Gap</th>

                                                {/* Weekly Columns */}
                                                {selectedWeeks.map(weekNum => (
                                                    <React.Fragment key={`${group.key}-w${weekNum}`}>
                                                        <th className={`p-1 border-b min-w-[40px] text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>T.W{weekNum}</th>
                                                        <th className={`p-1 border-b min-w-[40px] text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>A.W{weekNum}</th>
                                                        <th className={`p-1 border-b min-w-[40px] text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>Ac%</th>
                                                        <th className={`p-1 border-b min-w-[40px] text-center ${weekHeaderBgColors[weekNum]} text-gray-800`}>G%</th>
                                                    </React.Fragment>
                                                ))}

                                                {/* Custom Range */}
                                                {customRange && (
                                                    <React.Fragment>
                                                        <th className="p-1 border-b min-w-[45px] text-center bg-green-100 text-green-800">T.{customRange.start}-{customRange.end}</th>
                                                        <th className="p-1 border-b min-w-[45px] text-center bg-green-100 text-green-800">A.{customRange.start}-{customRange.end}</th>
                                                        <th className="p-1 border-b min-w-[45px] text-center bg-green-100 text-green-800">G.{customRange.start}-{customRange.end}</th>
                                                    </React.Fragment>
                                                )}

                                                {/* Previous Month & MoM */}
                                                <th className="p-1 border-b min-w-[50px] text-center bg-amber-100 text-amber-800">M-1</th>
                                                <th className="p-1 border-b min-w-[60px] text-center bg-amber-100 text-amber-800">MoM</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row) => (
                                        <tr key={row.outlet_id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <td className="sticky left-0 z-20 bg-white p-2 font-mono border-r border-gray-200">{row.id_digipos}</td>
                                            <td className="sticky left-[80px] z-20 bg-white p-2 font-medium border-r border-gray-200">{row.outlet_name}</td>
                                            <td className="sticky left-[200px] z-20 bg-white p-2 border-r border-gray-200">{formatRSNumber(row.rs_number)}</td>
                                            <td className="sticky left-[280px] z-20 bg-white p-2 border-r border-gray-200">{row.tap_name}</td>
                                            <td className="sticky left-[400px] z-20 bg-white p-2 border-r border-gray-200">{row.salesforce_name}</td>
                                            <td className="p-2 border-r border-gray-200">{row.kabupaten}</td>
                                            <td className="p-2 border-r border-gray-200">{row.kecamatan}</td>
                                            <td className="p-2 border-r border-gray-200 text-center">{row.pjp_status}</td>
                                            <td className="p-2 border-r border-gray-200 text-center">{row.physical_status}</td>
                                            <td className="p-2 border-r border-gray-200 text-center">{row.outlet_location}</td>
                                            <td className="p-2 border-r border-gray-200 text-center">{row.outlet_flag}</td>

                                            {/* Calculate Row Products including Totals and Computed */}
                                            {(() => {
                                                // Pre-calculate totals and computed products for this row
                                                let totalTargetMtd = 0;
                                                let totalActualMtd = 0;
                                                const totalTargetWeekly = [0, 0, 0, 0, 0];
                                                const totalActualWeekly = [0, 0, 0, 0, 0];

                                                productDefaults.forEach(group => {
                                                    const prod = row.products[group.key];
                                                    if (prod) {
                                                        totalTargetMtd += prod.target.mtd;
                                                        totalActualMtd += prod.actual.mtd;
                                                        prod.target.weekly.forEach((val, i) => totalTargetWeekly[i] += val);
                                                        prod.actual.weekly.forEach((val, i) => totalActualWeekly[i] += val);
                                                    }
                                                });

                                                // Calculate computed products (Total Simpati, Total byU)
                                                const computedProducts: { [key: string]: { target: { mtd: number, weekly: number[] }, actual: { mtd: number, weekly: number[] }, gap: { mtd: number, weekly: number[] } } } = {};
                                                computedColumns.forEach(computed => {
                                                    let cTargetMtd = 0, cActualMtd = 0;
                                                    const cTargetWeekly = [0, 0, 0, 0, 0], cActualWeekly = [0, 0, 0, 0, 0];
                                                    computed.sources.forEach(s => {
                                                        const prod = row.products[s];
                                                        if (prod) {
                                                            cTargetMtd += prod.target.mtd;
                                                            cActualMtd += prod.actual.mtd;
                                                            prod.target.weekly.forEach((val, i) => cTargetWeekly[i] += val);
                                                            prod.actual.weekly.forEach((val, i) => cActualWeekly[i] += val);
                                                        }
                                                    });
                                                    computedProducts[computed.key] = {
                                                        target: { mtd: cTargetMtd, weekly: cTargetWeekly },
                                                        actual: { mtd: cActualMtd, weekly: cActualWeekly },
                                                        gap: { mtd: cActualMtd - cTargetMtd, weekly: cActualWeekly.map((a, i) => a - cTargetWeekly[i]) }
                                                    };
                                                });

                                                // Render all products in displayProductOrder
                                                return displayProductOrder.map(group => {
                                                    let prod: { target: { mtd: number, weekly: number[] }, actual: { mtd: number, weekly: number[] }, gap: { mtd: number, weekly: number[] } } | null = null;
                                                    const isTotal = group.key === 'total';
                                                    const isComputed = 'isComputed' in group && group.isComputed;
                                                    const bgClass = getProductCellBg(group.key);
                                                    const targetBgClass = getProductTargetBg(group.key);

                                                    if (isTotal) {
                                                        prod = {
                                                            target: { mtd: totalTargetMtd, weekly: totalTargetWeekly },
                                                            actual: { mtd: totalActualMtd, weekly: totalActualWeekly },
                                                            gap: { mtd: totalActualMtd - totalTargetMtd, weekly: totalActualWeekly.map((a, i) => a - totalTargetWeekly[i]) }
                                                        };
                                                    } else if (isComputed) {
                                                        prod = computedProducts[group.key] || null;
                                                    } else {
                                                        prod = row.products[group.key] || null;
                                                    }

                                                    if (!prod) return <td colSpan={getProductColSpan()} key={group.key} className="border-l-2 border-gray-500">-</td>;

                                                    const gapMtd = prod.gap.mtd;
                                                    const gapMtdColor = gapMtd >= 0 ? 'text-green-600' : 'text-red-600';
                                                    const achievementPct = prod.target.mtd > 0 ? (prod.actual.mtd / prod.target.mtd) * 100 : 0;
                                                    const prevMonth = getPrevMonthValue(prod.actual.mtd);
                                                    const mom = calculateMoM(prod.actual.mtd, prevMonth);

                                                    return (
                                                        <React.Fragment key={group.key}>
                                                            {/* MTD Columns */}
                                                            <td className={`p-2 text-center border-l-2 border-gray-500 ${targetBgClass} ${isTotal ? 'font-bold' : ''}`}>{formatNumber(prod.target.mtd)}</td>
                                                            <td className={`p-2 text-center ${bgClass} ${isTotal ? 'font-bold' : 'font-semibold'}`}>{formatNumber(prod.actual.mtd)}</td>
                                                            <td className={`p-2 text-center ${bgClass} ${isTotal ? 'font-bold' : ''}`}>{Math.round(achievementPct)}%</td>
                                                            <td className={`p-2 text-center ${bgClass} ${isTotal ? 'font-bold' : 'font-medium'} ${gapMtdColor}`}>
                                                                {gapMtd > 0 ? `+${formatNumber(gapMtd)}` : formatNumber(gapMtd)}
                                                            </td>

                                                            {/* Weekly Columns */}
                                                            {selectedWeeks.map(weekNum => {
                                                                const weekIdx = weekNum - 1;
                                                                const tgt = prod!.target.weekly[weekIdx] || 0;
                                                                const act = prod!.actual.weekly[weekIdx] || 0;

                                                                // Achievement %
                                                                const achPct = tgt > 0 ? (act / tgt) * 100 : 0;

                                                                // Growth % (Act vs Prev Month Same Week)
                                                                // Using getPrevMonthValue since historical data isn't explicitly in the model
                                                                const prevAct = getPrevMonthValue(act);
                                                                const growthPct = prevAct > 0 ? ((act - prevAct) / prevAct) * 100 : 0;
                                                                const growthColor = growthPct >= 0 ? 'text-green-600' : 'text-red-600';

                                                                return (
                                                                    <React.Fragment key={`${group.key}-w${weekNum}-data`}>
                                                                        <td className={`p-2 text-center ${isTotal ? 'bg-gray-100 font-bold' : weekBgColors[weekNum]}`}>{formatNumber(tgt)}</td>
                                                                        <td className={`p-2 text-center ${isTotal ? 'bg-gray-100 font-bold' : `font-medium ${weekBgColors[weekNum]}`}`}>{formatNumber(act)}</td>
                                                                        <td className={`p-2 text-center ${isTotal ? 'bg-gray-100 font-bold' : weekBgColors[weekNum]}`}>{Math.round(achPct)}%</td>
                                                                        <td className={`p-2 text-center ${isTotal ? 'bg-gray-100 font-bold' : weekBgColors[weekNum]} ${growthColor}`}>
                                                                            {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                        </td>
                                                                    </React.Fragment>
                                                                );
                                                            })}

                                                            {/* Custom Range Columns - placeholder */}
                                                            {customRange && <td colSpan={3}></td>}

                                                            {/* Previous Month & MoM */}
                                                            <td className="p-2 text-center bg-amber-50 text-amber-800">{formatNumber(prevMonth)}</td>
                                                            <td className="p-2 text-center bg-amber-50">
                                                                <TrendIcon growth={mom} />
                                                            </td>
                                                        </React.Fragment>
                                                    );
                                                });
                                            })()}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                </Tabs>
            </Card>
        </div>
    );
};

export default PlanPerdanaPage;
