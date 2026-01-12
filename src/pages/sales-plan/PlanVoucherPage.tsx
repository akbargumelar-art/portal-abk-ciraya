import React, { useMemo, useState, memo, useCallback } from 'react';
import {
    LayoutDashboard,
    Table as TableIcon,
    Search,
    ChevronDown,
    ChevronRight,
    MapPin,
    User,
    Clock,
    Download
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, Input, Button } from '../../components/ui';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import FilterBar, { type FilterState } from '../../components/common/FilterBar';
import VoucherFilterPanel from '../../components/sales-plan/VoucherFilterPanel';
import { voucherSalesData } from '../../services/mock/voucherSalesData';
import type { VoucherOutletSalesPlan } from '../../services/mock/voucherSalesData';
import { VOUCHER_PRODUCTS, VALIDITY_LABELS, getShortProductName } from '../../config/voucherConfig';
import type { VoucherProduct } from '../../config/voucherConfig';
import type { ProductMetric } from '../../types/salesPlan';
import { getProductHeaderBg, getProductCellBg, getProductSubHeaderBg, getProductTargetBg } from '../../utils/brandColors';
import { exportToExcel } from '../../utils/excelExport';
import { formatRSNumber } from '../../utils/formatters';

// Week color backgrounds
const weekBgColors: Record<number, string> = {
    1: 'bg-green-50',
    2: 'bg-green-100',
    3: 'bg-green-50',
    4: 'bg-green-100',
    5: 'bg-green-50'
};

// Mock function for previous month value
const getPrevMonthValue = (val: number) => val * (0.9 + Math.random() * 0.2);



// Sort icons
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const weekHeaderBgColors: Record<number, string> = {
    1: 'bg-indigo-100',
    2: 'bg-purple-100',
    3: 'bg-pink-100',
    4: 'bg-orange-100',
    5: 'bg-teal-100',
};

// Helper: Format number (thousands separator)
const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
};

// Strong product group separator
const productSeparator = "border-l-2 border-gray-400";

// Progress Bar Component
const ProgressBar = memo(({ value }: { value: number }) => {
    let color = 'bg-red-500';
    if (value >= 100) color = 'bg-green-500';
    else if (value >= 80) color = 'bg-yellow-500';

    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }}></div>
        </div>
    );
});

// Summary row type
interface SummaryRow {
    name: string;
    tap?: string; // Added for Salesforce summary
    outletCount: number;
    products: { [key: string]: ProductMetric };
}

// Brand + Validity Group Key
interface BrandValidityGroup {
    key: string; // e.g., "simpati_1d"
    brand: 'simpati' | 'byu';
    validity: string;
    label: string; // e.g., "Simpati 1 Hari"
    products: VoucherProduct[];
}

// Calculate total for a group
const calculateGroupTotal = (products: VoucherProduct[], rowProducts: { [key: string]: ProductMetric }, _selectedWeeks: number[]) => {
    let totalTarget = 0;
    let totalActual = 0;
    let totalM1 = 0;
    const weeklyActuals = [0, 0, 0, 0, 0];
    const weeklyGaps = [0, 0, 0, 0, 0];

    products.forEach(product => {
        const data = rowProducts[product.id];
        if (data) {
            totalTarget += data.target.mtd;
            totalActual += data.actual.mtd;

            // Calculate M-1 for this product (Actual - Growth)
            const m1 = data.actual.mtd - (data.mom_growth || 0);
            totalM1 += m1;

            for (let i = 0; i < 5; i++) {
                weeklyActuals[i] += data.actual.weekly[i] || 0;
                weeklyGaps[i] += data.gap.weekly[i] || 0;
            }
        }
    });

    const achievementPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    const gap = totalActual - totalTarget;
    const totalGrowth = totalActual - totalM1;

    return { target: totalTarget, actual: totalActual, achievementPct, gap, weeklyActuals, weeklyGaps, m1: totalM1, growth: totalGrowth };
};

const PlanVoucherPage: React.FC = () => {
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

    // Filter states
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [selectedValidities, setSelectedValidities] = useState<string[]>(['vo', '1d']);
    const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
    const [customRange, setCustomRange] = useState<{ start: number; end: number } | null>(null);

    // Collapsible states
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // Sorting state
    const [sortColumn, setSortColumn] = useState<string>('id_digipos');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) return <ArrowUpDown size={14} className="text-gray-400 ml-1" />;
        return sortDirection === 'asc' ? <ArrowUp size={14} className="text-gray-800 ml-1" /> : <ArrowDown size={14} className="text-gray-800 ml-1" />;
    };

    // Data update timestamp
    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Helper: Get data filtered by all criteria EXCEPT the one specified (for faceted options)
    const validDataForOptions = useMemo(() => {
        return (excludeKey: 'tap' | 'salesforce' | 'kabupaten' | 'flag' | 'location') => {
            return voucherSalesData.filter(item => {
                if (excludeKey !== 'tap' && filters.tap.length > 0 && !filters.tap.includes(item.tap_name)) return false;
                if (excludeKey !== 'salesforce' && filters.salesforce.length > 0 && !filters.salesforce.includes(item.salesforce_name)) return false;
                if (excludeKey !== 'kabupaten' && filters.kabupaten.length > 0 && !filters.kabupaten.includes(item.kabupaten)) return false;
                if (excludeKey !== 'flag' && filters.flag.length > 0 && !filters.flag.includes(item.outlet_flag)) return false;
                if (excludeKey !== 'location' && filters.pjpStatus && filters.pjpStatus.length > 0 && !filters.pjpStatus.includes(item.outlet_location)) return false;
                return true;
            });
        };
    }, [filters]);

    // Extract TAP Options (Cascading)
    const tapOptions = useMemo(() => {
        const data = validDataForOptions('tap');
        const taps = new Set<string>();
        data.forEach(item => { if (item.tap_name) taps.add(item.tap_name); });
        return Array.from(taps).sort().map(tap => ({ value: tap, label: tap }));
    }, [validDataForOptions]);

    // Extract Salesforce Options (Cascading)
    const salesforceOptions = useMemo(() => {
        const data = validDataForOptions('salesforce');
        const sfs = new Set<string>();
        data.forEach(item => { if (item.salesforce_name) sfs.add(item.salesforce_name); });
        return Array.from(sfs).sort().map(sf => ({ value: sf, label: sf }));
    }, [validDataForOptions]);

    // Extract Kabupaten Options (Cascading)
    const kabupatenOptions = useMemo(() => {
        const data = validDataForOptions('kabupaten');
        const kabs = new Set<string>();
        data.forEach(item => { if (item.kabupaten) kabs.add(item.kabupaten); });
        return Array.from(kabs).sort().map(k => ({ value: k, label: k }));
    }, [validDataForOptions]);

    // Extract Flag Options (Cascading)
    const flagOptions = useMemo(() => {
        const data = validDataForOptions('flag');
        const flags = new Set<string>();
        data.forEach(item => { if (item.outlet_flag) flags.add(item.outlet_flag); });
        return Array.from(flags).sort().map(f => ({ value: f, label: f }));
    }, [validDataForOptions]);

    // Extract Location Options
    const locationOptions = useMemo(() => {
        const data = validDataForOptions('location');
        const locs = new Set<string>();
        data.forEach(item => { if (item.outlet_location) locs.add(item.outlet_location); });
        return Array.from(locs).sort().map(l => ({ value: l, label: l }));
    }, [validDataForOptions]);

    // Filter products based on Brand and Validity
    const filteredProducts = useMemo(() => {
        return VOUCHER_PRODUCTS.filter(product => {
            if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false;
            if (selectedValidities.length > 0 && !selectedValidities.includes(product.validity)) return false;
            return true;
        });
    }, [selectedBrand, selectedValidities]);

    // Group products by BRAND + VALIDITY (separated)
    const productGroups = useMemo((): BrandValidityGroup[] => {
        const groupMap = new Map<string, BrandValidityGroup>();

        // Define order: Simpati first, then byU, within each validity
        const validityOrder = ['vo', '1d', '2d', '3d', '5d', '7d', '14d', '30d'];
        const brandOrder: Array<'simpati' | 'byu'> = ['simpati', 'byu'];

        // Create groups
        filteredProducts.forEach(product => {
            const key = `${product.brand}_${product.validity}`;
            if (!groupMap.has(key)) {
                const brandLabel = product.brand === 'simpati' ? 'Simpati' : 'byU';
                const validityLabel = VALIDITY_LABELS[product.validity] || product.validity;
                groupMap.set(key, {
                    key,
                    brand: product.brand as 'simpati' | 'byu',
                    validity: product.validity,
                    label: `${brandLabel} ${validityLabel}`,
                    products: []
                });
            }
            groupMap.get(key)!.products.push(product);
        });

        // Sort groups by brand first (Simpati then byU), then by validity
        return Array.from(groupMap.values()).sort((a, b) => {
            const brandIndexA = brandOrder.indexOf(a.brand);
            const brandIndexB = brandOrder.indexOf(b.brand);
            if (brandIndexA !== brandIndexB) return brandIndexA - brandIndexB;
            return validityOrder.indexOf(a.validity) - validityOrder.indexOf(b.validity);
        });
    }, [filteredProducts]);

    // Filter outlet data
    const filteredData = useMemo(() => {
        return voucherSalesData.filter(item => {
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

            // Filter by selected Brand & Validity (ensure outlet has at least one matching product)
            const hasMatchingProduct = filteredProducts.some(p => item.products[p.id] !== undefined);
            if (!hasMatchingProduct) return false;

            // Filter by location
            if (filters.pjpStatus && filters.pjpStatus.length > 0) {
                if (!filters.pjpStatus.includes(item.outlet_location)) return false;
            }

            return true;
        });
    }, [searchQuery, filters, filteredProducts]);

    // Aggregate by TAP
    const tapSummary = useMemo((): SummaryRow[] => {
        const tapMap = new Map<string, { outlets: VoucherOutletSalesPlan[] }>();
        filteredData.forEach(outlet => {
            if (!tapMap.has(outlet.tap_name)) tapMap.set(outlet.tap_name, { outlets: [] });
            tapMap.get(outlet.tap_name)!.outlets.push(outlet);
        });

        return Array.from(tapMap.entries()).map(([tapName, data]) => {
            const aggregatedProducts: { [key: string]: ProductMetric } = {};
            filteredProducts.forEach(prod => {
                const targetMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.target.mtd || 0), 0);
                const actualMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.actual.mtd || 0), 0);
                const targetWeekly = [0, 0, 0, 0, 0].map((_, i) => data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.target.weekly[i] || 0), 0));
                const actualWeekly = [0, 0, 0, 0, 0].map((_, i) => data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.actual.weekly[i] || 0), 0));
                const gapWeekly = actualWeekly.map((a, i) => a - targetWeekly[i]);
                const gapMtd = actualMtd - targetMtd;
                const achievementPct = targetMtd > 0 ? (actualMtd / targetMtd) * 100 : 0;
                const momGrowth = data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.mom_growth || 0), 0) / data.outlets.length;

                aggregatedProducts[prod.id] = {
                    target: { weekly: targetWeekly, mtd: targetMtd },
                    actual: { weekly: actualWeekly, mtd: actualMtd },
                    gap: { weekly: gapWeekly, mtd: gapMtd },
                    achievement_pct: achievementPct,
                    mom_growth: momGrowth
                };
            });
            return { name: tapName, outletCount: data.outlets.length, products: aggregatedProducts };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData, filteredProducts]);

    // Aggregate by Salesforce
    const sfSummary = useMemo((): SummaryRow[] => {
        const sfMap = new Map<string, { outlets: VoucherOutletSalesPlan[] }>();
        filteredData.forEach(outlet => {
            if (!sfMap.has(outlet.salesforce_name)) sfMap.set(outlet.salesforce_name, { outlets: [] });
            sfMap.get(outlet.salesforce_name)!.outlets.push(outlet);
        });

        return Array.from(sfMap.entries()).map(([sfName, data]) => {
            const aggregatedProducts: { [key: string]: ProductMetric } = {};
            filteredProducts.forEach(prod => {
                const targetMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.target.mtd || 0), 0);
                const actualMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.actual.mtd || 0), 0);
                const targetWeekly = [0, 0, 0, 0, 0].map((_, i) => data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.target.weekly[i] || 0), 0));
                const actualWeekly = [0, 0, 0, 0, 0].map((_, i) => data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.actual.weekly[i] || 0), 0));
                const gapWeekly = actualWeekly.map((a, i) => a - targetWeekly[i]);
                const gapMtd = actualMtd - targetMtd;
                const achievementPct = targetMtd > 0 ? (actualMtd / targetMtd) * 100 : 0;
                const momGrowth = data.outlets.reduce((sum, o) => sum + (o.products[prod.id]?.mom_growth || 0), 0);

                aggregatedProducts[prod.id] = {
                    target: { weekly: targetWeekly, mtd: targetMtd },
                    actual: { weekly: actualWeekly, mtd: actualMtd },
                    gap: { weekly: gapWeekly, mtd: gapMtd },
                    achievement_pct: achievementPct,
                    mom_growth: momGrowth
                };
            });
            return {
                name: sfName,
                tap: data.outlets[0]?.tap_name || '-', // Tap Name for SF Summary
                outletCount: data.outlets.length,
                products: aggregatedProducts
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
        // Sort Data
        const sortedData = useMemo(() => {
            return [...filteredData].sort((a, b) => {
                let aValue: any = a[sortColumn as keyof VoucherOutletSalesPlan];
                let bValue: any = b[sortColumn as keyof VoucherOutletSalesPlan];

                // Handle nested product data sorting if needed (simplified for main columns first)
                // For now, supporting main columns. Complex nested sorting can be added if requested.

                if (typeof aValue === 'string') {
                    return sortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number') {
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }, [filteredData, sortColumn, sortDirection]);

        // Styles
        const stickyHeaderStyle = "sticky top-0 z-30 font-semibold uppercase p-2 border-b border-gray-200 text-[11px] align-middle";

        // Calculate product metric columns count (matches Perdana structure)
        // Base: Tgt, Act, Ach%, M-1, Growth = 5 columns
        // Weekly: T.W, A.W, Ac%, G% = 4 per week (Target, Actual, Achievement%, Growth%)
        // Custom Range: A, G = 2 columns
        const getMetricColSpan = () => {
            let cols = 5; // Tgt, Act, Ach%, M-1, Growth
            cols += selectedWeeks.length * 4; // T.W, A.W, Ac%, G% per week
            if (customRange) cols += 2;
            return cols;
        };

        // Calculate total column span (matches Perdana structure)
        const getTotalColSpan = () => {
            let cols = 5; // Tgt, Act, Ach%, M-1, Growth
            cols += selectedWeeks.length * 4; // T.W, A.W, Ac%, G% per week
            if (customRange) cols += 2;
            return cols;
        };

        // Calculate group colspan (products + total only if > 1 product)
        const getGroupColSpan = (productCount: number) => {
            const productCols = productCount * getMetricColSpan();
            // Only add TOTAL column if more than 1 product
            return productCount > 1 ? productCols + getTotalColSpan() : productCols;
        };

        // Excel Export Handler
        const handleExportExcel = useCallback(() => {
            const columns = [
                { header: 'ID Digipos', key: 'id_digipos', width: 15 },
                { header: 'Nama Outlet', key: 'outlet_name', width: 25 },
                { header: 'No RS', key: 'rs_number', width: 12 },
                { header: 'TAP', key: 'tap_name', width: 15 },
                { header: 'Salesforce', key: 'salesforce_name', width: 20 },
                { header: 'Kabupaten', key: 'kabupaten', width: 15 },
                { header: 'Flag', key: 'outlet_flag', width: 10 },
                { header: 'Lokasi', key: 'outlet_location', width: 10 },
            ];

            // Add product columns
            filteredProducts.forEach(product => {
                columns.push(
                    { header: `${product.name} - Target`, key: `${product.id}_target`, width: 12 },
                    { header: `${product.name} - Aktual`, key: `${product.id}_aktual`, width: 12 },
                    { header: `${product.name} - Gap`, key: `${product.id}_gap`, width: 10 }
                );
            });

            // Prepare data
            const exportData = sortedData.map(row => {
                const flatRow: Record<string, unknown> = {
                    id_digipos: row.id_digipos,
                    outlet_name: row.outlet_name,
                    rs_number: row.rs_number,
                    tap_name: row.tap_name,
                    salesforce_name: row.salesforce_name,
                    kabupaten: row.kabupaten,
                    outlet_flag: row.outlet_flag,
                    outlet_location: row.outlet_location,
                };

                // Add product data
                filteredProducts.forEach(product => {
                    const prod = row.products[product.id];
                    if (prod) {
                        flatRow[`${product.id}_target`] = prod.target.mtd;
                        flatRow[`${product.id}_aktual`] = prod.actual.mtd;
                        flatRow[`${product.id}_gap`] = prod.gap.mtd;
                    } else {
                        flatRow[`${product.id}_target`] = 0;
                        flatRow[`${product.id}_aktual`] = 0;
                        flatRow[`${product.id}_gap`] = 0;
                    }
                });

                return flatRow;
            });

            exportToExcel({
                filename: 'SalesPlan_Voucher_DetailOutlet',
                sheetName: 'Detail Outlet',
                columns,
                data: exportData
            });
        }, [sortedData, filteredProducts]);

        // Summary Table Component
        const SummaryTable = ({ data, title, icon, expanded, onToggle, showTap = false }: {
            data: SummaryRow[]; title: string; icon: React.ReactNode; expanded: boolean; onToggle: () => void; showTap?: boolean;
        }) => (
            <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-semibold text-gray-800 text-sm">{title}</span>
                        <span className="text-xs text-gray-500">({data.length} items, {productGroups.length} groups)</span>
                    </div>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {expanded && (
                    <div className="overflow-auto max-h-[400px]">
                        <table className="w-full text-[10px] text-left border-collapse whitespace-nowrap">
                            <thead>
                                {/* Level 1: Brand + Validity Groups */}
                                <tr className="bg-gray-100">
                                    {showTap && <th rowSpan={3} className="p-1 border-b border-r border-gray-300 min-w-[100px] sticky left-0 top-0 bg-gray-100 z-50 align-middle">TAP</th>}
                                    <th rowSpan={3} className={`p-1 border-b border-r border-gray-300 min-w-[120px] align-middle top-0 z-40 ${!showTap && 'sticky left-0 bg-gray-100'}`}>Name</th>
                                    <th rowSpan={3} className="p-1 border-b border-r border-gray-300 min-w-[40px] text-center align-middle sticky top-0 bg-gray-100 z-30">PJP</th>

                                    {/* Global Totals Header */}
                                    <th rowSpan={2} colSpan={getTotalColSpan()} className="p-1 border-b text-center border-l-2 border-gray-400 bg-gray-200 align-middle sticky top-0 z-30">TOTAL ALL</th>
                                    <th rowSpan={2} colSpan={getTotalColSpan()} className={`p-1 border-b text-center border-l-2 border-gray-400 align-middle sticky top-0 z-30 ${getProductHeaderBg('simpati')}`}>TOTAL SIMPATI</th>
                                    <th rowSpan={2} colSpan={getTotalColSpan()} className={`p-1 border-b text-center border-l-2 border-gray-400 align-middle sticky top-0 z-30 ${getProductHeaderBg('byu')}`}>TOTAL BYU</th>
                                    {productGroups.map(group => (
                                        <th
                                            key={group.key}
                                            colSpan={getGroupColSpan(group.products.length)}
                                            className={`p-1 border-b text-center ${productSeparator} ${getProductHeaderBg(group.brand)} sticky top-0 z-30`}
                                        >
                                            {group.label}
                                        </th>
                                    ))}
                                </tr>
                                {/* Level 2: Product Names + Total */}
                                <tr className="bg-[#3d5f85]">
                                    {productGroups.map(group => (
                                        <React.Fragment key={group.key}>
                                            {group.products.map((product, idx) => (
                                                <th
                                                    key={product.id}
                                                    colSpan={getMetricColSpan()}
                                                    className={`p-1 border-b text-center ${idx === 0 ? productSeparator : 'border-l border-gray-200'} ${getProductSubHeaderBg(group.key)} sticky top-[23px] z-20`}
                                                >
                                                    {getShortProductName(product.name)}
                                                </th>
                                            ))}
                                            {group.products.length > 1 && (
                                                <th colSpan={getTotalColSpan()} className="p-1 border-b text-center border-l-2 border-gray-500 bg-slate-200 font-bold sticky top-[23px] z-20">
                                                    TOTAL
                                                </th>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tr>
                                {/* Level 3: Metrics */}
                                <tr className="bg-white text-gray-500 sticky top-[46px] z-10">
                                    {/* Global Totals Metrics Headers */}
                                    {['bg-gray-200', 'bg-red-50', 'bg-purple-50'].map((bg, i) => (
                                        <React.Fragment key={`global-total-hdr-sum-${i}`}>
                                            <th className={`p-1 border-b min-w-[40px] text-center border-l-2 border-gray-400 ${bg} font-semibold`}>Tgt</th>
                                            <th className={`p-1 border-b min-w-[40px] text-center ${bg} font-semibold`}>Act</th>
                                            <th className={`p-1 border-b min-w-[45px] text-center ${bg} font-semibold`}>Ach%</th>
                                            <th className={`p-1 border-b min-w-[35px] text-center ${bg} font-semibold text-amber-800`}>M-1</th>
                                            <th className={`p-1 border-b min-w-[35px] text-center ${bg} font-semibold text-amber-800`}>Gwth</th>
                                            {selectedWeeks.map(w => (
                                                <React.Fragment key={`global-total-w${w}-sum-${i}`}>
                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>T.W{w}</th>
                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>A.W{w}</th>
                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>Ac%</th>
                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>G%</th>
                                                </React.Fragment>
                                            ))}
                                            {customRange && (
                                                <React.Fragment>
                                                    <th className="p-1 border-b min-w-[35px] text-center bg-green-100 text-green-800">A</th>
                                                    <th className="p-1 border-b min-w-[30px] text-center bg-green-100 text-green-800">G</th>
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    {productGroups.map(group => (
                                        <React.Fragment key={group.key}>
                                            {group.products.map((product, idx) => (
                                                <React.Fragment key={product.id}>
                                                    <th className={`p-1 border-b text-center ${idx === 0 ? 'border-l-2 border-gray-400' : 'border-l border-gray-200'}`}>Tgt</th>
                                                    <th className="p-1 border-b text-center">Act</th>
                                                    <th className="p-1 border-b text-center">Ach%</th>
                                                    <th className="p-1 border-b text-center bg-amber-50 text-amber-800">M-1</th>
                                                    <th className="p-1 border-b text-center bg-amber-50 text-amber-800">Gwth</th>
                                                    {selectedWeeks.map(w => (
                                                        <React.Fragment key={`${product.id}-w${w}`}>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>T.W{w}</th>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>A.W{w}</th>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>Ac%</th>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>G%</th>
                                                        </React.Fragment>
                                                    ))}
                                                    {customRange && (
                                                        <>
                                                            <th className="p-1 border-b text-center bg-green-100 text-green-800">A</th>
                                                            <th className="p-1 border-b text-center bg-green-100 text-green-800">G</th>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            {/* Total Headers - only if more than 1 product */}
                                            {group.products.length > 1 && (
                                                <>
                                                    <th className="p-1 border-b text-center border-l-2 border-gray-500 bg-slate-100">Tgt</th>
                                                    <th className="p-1 border-b text-center bg-slate-100">Act</th>
                                                    <th className="p-1 border-b text-center bg-slate-100">Ach%</th>
                                                    <th className="p-1 border-b text-center bg-amber-50 text-amber-800">M-1</th>
                                                    <th className="p-1 border-b text-center bg-amber-50 text-amber-800">Gwth</th>
                                                    {selectedWeeks.map(w => (
                                                        <React.Fragment key={`total-w${w}`}>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>T</th>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>A</th>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>Ac</th>
                                                            <th className={`p-1 border-b text-center ${weekHeaderBgColors[w]} text-gray-800`}>G%</th>
                                                        </React.Fragment>
                                                    ))}
                                                    {customRange && (
                                                        <>
                                                            <th className="p-1 border-b text-center bg-green-100 text-green-800">A</th>
                                                            <th className="p-1 border-b text-center bg-green-100 text-green-800">G</th>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(row => (
                                    <tr key={row.name} className="hover:bg-gray-50 border-b border-gray-100">
                                        {showTap && <td className="p-1 font-medium border-r border-gray-200 sticky left-0 bg-white z-10">{row.tap}</td>}
                                        <td className={`p-1 font-medium border-r border-gray-200 ${!showTap && 'sticky left-0 bg-white z-10'}`}>{row.name}</td>
                                        <td className="p-1 text-center border-r border-gray-200 text-gray-500">{formatNumber(row.outletCount)}</td>

                                        {/* Calculated Global Totals for Summary */}
                                        {(() => {
                                            const renderSummaryTotalColumn = (products: any[], bgClass: string) => {
                                                let tgt = 0, act = 0, m1 = 0;
                                                const weeklyActuals = [0, 0, 0, 0, 0];
                                                const weeklyGaps = [0, 0, 0, 0, 0];

                                                products.forEach(p => {
                                                    const d = row.products[p.id];
                                                    if (d) {
                                                        tgt += d.target.mtd;
                                                        act += d.actual.mtd;
                                                        m1 += (d.actual.mtd - (d.mom_growth || 0));
                                                        d.actual.weekly.forEach((v, i) => weeklyActuals[i] += v || 0);
                                                        d.gap.weekly.forEach((v, i) => weeklyGaps[i] += v || 0);
                                                    }
                                                });
                                                const ach = tgt > 0 ? (act / tgt) * 100 : 0;
                                                const growthAbs = act - m1;
                                                const growthPct = m1 !== 0 ? (growthAbs / m1) * 100 : 0;
                                                const growthColor = growthPct >= 0 ? 'text-green-600' : 'text-red-600';

                                                return (
                                                    <React.Fragment>
                                                        <td className={`p-1 text-center border-l-2 border-gray-400 border-r border-gray-300 font-semibold ${bgClass}`}>{formatNumber(tgt)}</td>
                                                        <td className={`p-1 text-center border-r border-gray-300 font-bold ${bgClass}`}>{formatNumber(act)}</td>
                                                        <td className={`p-1 text-center border-r border-gray-300 ${bgClass}`}>{Math.round(ach)}%</td>
                                                        <td className={`p-1 text-center border-r border-gray-300 ${bgClass} text-white`}>{formatNumber(m1)}</td>
                                                        <td className={`p-1 text-center border-r border-gray-300 ${bgClass} ${growthColor}`}>
                                                            {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                        </td>
                                                        {selectedWeeks.map(w => {
                                                            // Calc Weekly Target for Group for %
                                                            let wTgt = 0;
                                                            products.forEach(p => { const d = row.products[p.id]; if (d) wTgt += d.target.weekly[w - 1] || 0; });

                                                            const wAct = weeklyActuals[w - 1];
                                                            const wAchPct = wTgt > 0 ? (wAct / wTgt) * 100 : 0;

                                                            // Mock Growth
                                                            const wPrev = getPrevMonthValue(wAct);
                                                            const wGrowthPct = wPrev > 0 ? ((wAct - wPrev) / wPrev) * 100 : 0;

                                                            return (
                                                                <React.Fragment key={w}>
                                                                    <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]} text-gray-500`}>{formatNumber(wTgt)}</td>
                                                                    <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]}`}>{formatNumber(wAct)}</td>
                                                                    <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]}`}>{Math.round(wAchPct)}%</td>
                                                                    <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]} ${wGrowthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {wGrowthPct > 0 ? `+${Math.round(wGrowthPct)}%` : `${Math.round(wGrowthPct)}%`}
                                                                    </td>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                        {customRange && (
                                                            <React.Fragment>
                                                                <td className={`p-1 text-center ${bgClass}`}>-</td>
                                                                <td className={`p-1 text-center ${bgClass}`}>-</td>
                                                            </React.Fragment>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            };

                                            const allProducts = productGroups.flatMap(g => g.products);
                                            const simpatiProducts = allProducts.filter(p => p.brand === 'simpati');
                                            const byuProducts = allProducts.filter(p => p.brand === 'byu');

                                            return (
                                                <>
                                                    {renderSummaryTotalColumn(allProducts, 'bg-gray-50')}
                                                    {renderSummaryTotalColumn(simpatiProducts, 'bg-red-50')}
                                                    {renderSummaryTotalColumn(byuProducts, 'bg-purple-50')}
                                                </>
                                            );
                                        })()}

                                        {productGroups.map(group => {
                                            const total = calculateGroupTotal(group.products, row.products, selectedWeeks);
                                            return (
                                                <React.Fragment key={group.key}>
                                                    {group.products.map((product, idx) => {
                                                        const pData = row.products[product.id];
                                                        if (!pData) return <td key={product.id} colSpan={getMetricColSpan()} className="p-1 text-center text-gray-300">-</td>;
                                                        return (
                                                            <React.Fragment key={product.id}>
                                                                <td className={`p-1 text-center ${idx === 0 ? productSeparator : 'border-l border-gray-200'}`}>{formatNumber(pData.target.mtd)}</td>
                                                                <td className="p-1 text-center font-semibold">{formatNumber(pData.actual.mtd)}</td>
                                                                <td className="p-1 text-center">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span>{Math.round(pData.achievement_pct)}%</span>
                                                                        <ProgressBar value={pData.achievement_pct} />
                                                                    </div>
                                                                </td>
                                                                {/* M-1 and Growth */}
                                                                {(() => {
                                                                    const m1 = pData.actual.mtd - (pData.mom_growth || 0);
                                                                    const growthPct = m1 !== 0 ? ((pData.mom_growth || 0) / m1) * 100 : 0;
                                                                    return (
                                                                        <>
                                                                            <td className="p-1 text-center text-white">{formatNumber(m1)}</td>
                                                                            <td className={`p-1 text-center ${growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                            </td>
                                                                        </>
                                                                    )
                                                                })()}

                                                                {selectedWeeks.map(w => {
                                                                    const tgt = pData.target.weekly[w - 1] || 0;
                                                                    const act = pData.actual.weekly[w - 1] || 0;
                                                                    const achPct = tgt > 0 ? (act / tgt) * 100 : 0;

                                                                    // Mock Growth
                                                                    const prev = getPrevMonthValue(act);
                                                                    const growthPct = prev > 0 ? ((act - prev) / prev) * 100 : 0;

                                                                    return (
                                                                        <React.Fragment key={`${product.id}-w${w}-data`}>
                                                                            <td className={`p-1 text-center text-gray-500 ${weekBgColors[w]}`}>{formatNumber(tgt)}</td>
                                                                            <td className={`p-1 text-center ${weekBgColors[w]}`}>{formatNumber(act)}</td>
                                                                            <td className={`p-1 text-center ${weekBgColors[w]}`}>{Math.round(achPct)}%</td>
                                                                            <td className={`p-1 text-center ${weekBgColors[w]} ${growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                            </td>
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                {customRange && (() => {
                                                                    /* Placeholder simple calc */
                                                                    return (
                                                                        <>
                                                                            <td className="p-1 text-center bg-green-50">-</td>
                                                                            <td className="p-1 text-center bg-green-50">-</td>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    {/* Total - only if more than 1 product */}
                                                    {group.products.length > 1 && (
                                                        <>
                                                            <td className="p-1 text-center border-l-2 border-gray-500 bg-slate-50 font-semibold">{formatNumber(total.target)}</td>
                                                            <td className="p-1 text-center bg-slate-50 font-bold text-blue-700">{formatNumber(total.actual)}</td>
                                                            <td className="p-1 text-center bg-slate-50">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-semibold">{Math.round(total.achievementPct)}%</span>
                                                                    <ProgressBar value={total.achievementPct} />
                                                                </div>
                                                            </td>
                                                            <td className="p-1 text-center bg-slate-50 text-white">{formatNumber(total.m1)}</td>
                                                            {(() => {
                                                                const growthPct = total.m1 !== 0 ? (total.growth / total.m1) * 100 : 0;
                                                                return (
                                                                    <td className={`p-1 text-center bg-slate-50 ${growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                    </td>
                                                                );
                                                            })()}
                                                            {selectedWeeks.map(w => {
                                                                const gap = total.weeklyGaps[w - 1];
                                                                // We need weekly target for this group total to calc %
                                                                let wTgt = 0;
                                                                group.products.forEach(p => {
                                                                    const d = row.products[p.id];
                                                                    if (d) wTgt += d.target.weekly[w - 1] || 0;
                                                                });
                                                                const wGapPct = wTgt > 0 ? (gap / wTgt) * 100 : 0;

                                                                return (
                                                                    <React.Fragment key={`total-w${w}-data`}>
                                                                        <td className={`p-1 text-center ${weekBgColors[w]} font-semibold`}>{formatNumber(total.weeklyActuals[w - 1])}</td>
                                                                        <td className={`p-1 text-center ${weekBgColors[w]} font-semibold ${wGapPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {wGapPct > 0 ? `+${Math.round(wGapPct)}%` : `${Math.round(wGapPct)}%`}
                                                                        </td>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                            {customRange && (
                                                                <>
                                                                    <td className="p-1 text-center bg-green-50 font-semibold">-</td>
                                                                    <td className="p-1 text-center bg-green-50 font-semibold">-</td>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
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

        return (
            <div className="p-6 animate-fade-in">
                <Header title="Sales Plan Voucher Fisik" subtitle="" />

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
                    <span className="ml-4 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {filteredProducts.length} produk aktif • {productGroups.length} grup
                    </span>
                </div>

                <FilterBar
                    onFilterChange={setFilters}
                    useMonthPicker={true}
                    className="mt-4"
                    showTAP={true}
                    showSalesforce={true}
                    showKabupaten={true}
                    showFlag={true}
                    showPJPStatus={true}
                    tapOptions={tapOptions}
                    salesforceOptions={salesforceOptions}
                    kabupatenOptions={kabupatenOptions}
                    flagOptions={flagOptions}
                    pjpOptions={locationOptions}
                />

                <VoucherFilterPanel
                    onFilterChange={setFilters}
                    month={filters.month || new Date().getMonth() + 1}
                    year={filters.year || new Date().getFullYear()}
                    selectedBrand={selectedBrand}
                    onBrandChange={setSelectedBrand}
                    selectedValidities={selectedValidities}
                    onValiditiesChange={setSelectedValidities}
                    selectedWeeks={selectedWeeks}
                    onSelectedWeeksChange={setSelectedWeeks}
                    customRange={customRange}
                    onCustomRangeChange={setCustomRange}
                    showCustomDate={false}
                />

                <Card padding="none" className="mt-2">
                    <Tabs defaultValue="summary">
                        <TabList>
                            <Tab value="summary" icon={<LayoutDashboard size={16} />}>Summary</Tab>
                            <Tab value="detail" icon={<TableIcon size={16} />}>Detail Outlet</Tab>
                        </TabList>

                        <TabPanel value="summary" className="p-4">
                            <SummaryTable data={tapSummary} title="Summary per TAP" icon={<MapPin size={16} className="text-blue-600" />} expanded={tapExpanded} onToggle={() => setTapExpanded(!tapExpanded)} />
                            <SummaryTable data={sfSummary} showTap={true} title="Summary per Salesforce" icon={<User size={16} className="text-green-600" />} expanded={sfExpanded} onToggle={() => setSfExpanded(!sfExpanded)} />
                        </TabPanel>

                        <TabPanel value="detail" className="p-0">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <Input placeholder="Search Outlet, ID Digipos, or Salesforce..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search size={16} />} className="max-w-md" />
                                <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={handleExportExcel}>Export Excel</Button>
                            </div>
                            <div className="overflow-auto max-h-[600px] relative">
                                <table className="w-full text-[10px] text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gray-100 uppercase">
                                            <th rowSpan={3} onClick={() => handleSort('id_digipos')} className={`${stickyHeaderStyle} left-0 z-40 bg-gray-100 min-w-[80px] border-r border-gray-300 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">ID {getSortIcon('id_digipos')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('outlet_name')} className={`${stickyHeaderStyle} left-[80px] z-40 bg-gray-100 min-w-[120px] border-r border-gray-300 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">OUTLET {getSortIcon('outlet_name')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('rs_number')} className={`${stickyHeaderStyle} left-[200px] z-40 bg-gray-100 min-w-[80px] border-r border-gray-300 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">NO RS {getSortIcon('rs_number')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('tap_name')} className={`${stickyHeaderStyle} left-[280px] z-40 bg-gray-100 min-w-[100px] border-r border-gray-300 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">TAP {getSortIcon('tap_name')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('salesforce_name')} className={`${stickyHeaderStyle} left-[380px] z-40 bg-gray-100 min-w-[100px] border-r border-gray-300 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">SF {getSortIcon('salesforce_name')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('kabupaten')} className={`${stickyHeaderStyle} min-w-[100px] border-r border-gray-300 bg-gray-100 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">KAB {getSortIcon('kabupaten')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('outlet_flag')} className={`${stickyHeaderStyle} min-w-[80px] border-r border-gray-300 bg-gray-100 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">FLAG {getSortIcon('outlet_flag')}</div>
                                            </th>
                                            <th rowSpan={3} onClick={() => handleSort('outlet_location')} className={`${stickyHeaderStyle} min-w-[70px] border-r border-gray-300 bg-gray-100 cursor-pointer hover:bg-gray-200`}>
                                                <div className="flex items-center justify-between">LOC {getSortIcon('outlet_location')}</div>
                                            </th>

                                            {/* Global Totals Header */}
                                            <th rowSpan={2} colSpan={getTotalColSpan()} className={`${stickyHeaderStyle} text-center bg-gray-200 border-r-2 border-gray-400 align-middle`}>TOTAL ALL</th>
                                            <th rowSpan={2} colSpan={getTotalColSpan()} className={`${stickyHeaderStyle} text-center ${getProductHeaderBg('simpati')} border-r-2 border-gray-400 align-middle`}>TOTAL SIMPATI</th>
                                            <th rowSpan={2} colSpan={getTotalColSpan()} className={`${stickyHeaderStyle} text-center ${getProductHeaderBg('byu')} border-r-2 border-gray-400 align-middle`}>TOTAL BYU</th>
                                            {productGroups.map(group => (
                                                <th key={group.key} colSpan={getGroupColSpan(group.products.length)} className={`${stickyHeaderStyle} text-center ${productSeparator} ${getProductHeaderBg(group.brand)}`}>
                                                    {group.label}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr className="bg-[#3d5f85]">
                                            {/* Empty headers for locked columns are handled by rowspan */}
                                            {/* Product Headers */}
                                            {/* Global Totals Sub-headers */}
                                            {[
                                                { key: 'total_all', label: 'TOTAL ALL', bg: 'bg-slate-300' },
                                                { key: 'total_simpati', label: 'TOTAL SIMPATI', bg: getProductSubHeaderBg('simpati') },
                                                { key: 'total_byu', label: 'TOTAL BYU', bg: getProductSubHeaderBg('byu') }
                                            ].map((g, i) => (
                                                <th key={g.key} colSpan={getTotalColSpan()} className={`p-1 border-b text-center border-l-2 border-gray-400 font-semibold sticky top-[33px] z-20 ${g.bg}`}>
                                                </th>
                                            ))}

                                            {productGroups.map(group => (
                                                <React.Fragment key={group.key}>
                                                    {group.products.map((product, idx) => (
                                                        <th key={product.id} colSpan={getMetricColSpan()} className={`p-1 border-b text-center ${idx === 0 ? productSeparator : 'border-l border-gray-200'} ${getProductSubHeaderBg(group.key)} sticky top-[33px] z-20`}>
                                                            {getShortProductName(product.name)}
                                                        </th>
                                                    ))}
                                                    {group.products.length > 1 && (
                                                        <th colSpan={getTotalColSpan()} className="p-1 border-b text-center border-l-2 border-gray-500 bg-slate-200 font-bold sticky top-[33px] z-20">
                                                            TOTAL
                                                        </th>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                        <tr className="bg-white text-gray-500 text-[10px] sticky top-[66px] z-20">
                                            {/* Global Totals Metrics Headers */}
                                            {['bg-gray-200', 'bg-red-50', 'bg-purple-50'].map((bg, i) => (
                                                <React.Fragment key={`global-total-hdr-${i}`}>
                                                    <th className={`p-1 border-b min-w-[40px] text-center border-l-2 border-gray-400 ${bg} font-semibold`}>Tgt</th>
                                                    <th className={`p-1 border-b min-w-[40px] text-center ${bg} font-semibold`}>Act</th>
                                                    <th className={`p-1 border-b min-w-[45px] text-center ${bg} font-semibold`}>Ach%</th>
                                                    <th className={`p-1 border-b min-w-[35px] text-center ${bg} font-semibold text-amber-800`}>M-1</th>
                                                    <th className={`p-1 border-b min-w-[35px] text-center ${bg} font-semibold text-amber-800`}>Gwth</th>
                                                    {selectedWeeks.map(w => (
                                                        <React.Fragment key={`global-total-w${w}-${i}`}>
                                                            <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>T.W{w}</th>
                                                            <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>A.W{w}</th>
                                                            <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>Ac%</th>
                                                            <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>G%</th>
                                                        </React.Fragment>
                                                    ))}
                                                    {customRange && (
                                                        <React.Fragment>
                                                            <th className="p-1 border-b min-w-[35px] text-center bg-green-100 text-green-800">A</th>
                                                            <th className="p-1 border-b min-w-[30px] text-center bg-green-100 text-green-800">G</th>
                                                        </React.Fragment>
                                                    )}
                                                </React.Fragment>
                                            ))}

                                            {productGroups.map(group => (
                                                <React.Fragment key={group.key}>
                                                    {group.products.map((product, idx) => (
                                                        <React.Fragment key={product.id}>
                                                            <th className={`p-1 border-b min-w-[35px] text-center ${idx === 0 ? 'border-l-2 border-gray-400' : 'border-l border-gray-200'}`}>Tgt</th>
                                                            <th className="p-1 border-b min-w-[35px] text-center">Act</th>
                                                            <th className="p-1 border-b min-w-[40px] text-center">Ach%</th>
                                                            <th className="p-1 border-b min-w-[35px] text-center bg-amber-50 text-amber-800">M-1</th>
                                                            <th className="p-1 border-b min-w-[35px] text-center bg-amber-50 text-amber-800">Gwth</th>
                                                            {selectedWeeks.map(w => (
                                                                <React.Fragment key={`${product.id}-w${w}`}>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>T.W{w}</th>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>A.W{w}</th>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>Ac%</th>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>G%</th>
                                                                </React.Fragment>
                                                            ))}
                                                            {customRange && (
                                                                <>
                                                                    <th className="p-1 border-b min-w-[35px] text-center bg-green-100 text-green-800">A</th>
                                                                    <th className="p-1 border-b min-w-[30px] text-center bg-green-100 text-green-800">G</th>
                                                                </>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                    {/* Total Headers - only if more than 1 product */}
                                                    {group.products.length > 1 && (
                                                        <>
                                                            <th className="p-1 border-b min-w-[40px] text-center border-l-2 border-gray-500 bg-slate-100 font-semibold">Tgt</th>
                                                            <th className="p-1 border-b min-w-[40px] text-center bg-slate-100 font-semibold">Act</th>
                                                            <th className="p-1 border-b min-w-[45px] text-center bg-slate-100 font-semibold">Ach%</th>
                                                            <th className="p-1 border-b min-w-[35px] text-center bg-amber-50 text-amber-800">M-1</th>
                                                            <th className="p-1 border-b min-w-[35px] text-center bg-amber-50 text-amber-800">Gwth</th>
                                                            {selectedWeeks.map(w => (
                                                                <React.Fragment key={`total-w${w}-hdr`}>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>T</th>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>A</th>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>Ac</th>
                                                                    <th className={`p-1 border-b min-w-[25px] text-center ${weekHeaderBgColors[w]} text-gray-800`}>G%</th>
                                                                </React.Fragment>
                                                            ))}
                                                            {customRange && (
                                                                <>
                                                                    <th className="p-1 border-b min-w-[35px] text-center bg-green-100 text-green-800">A</th>
                                                                    <th className="p-1 border-b min-w-[30px] text-center bg-green-100 text-green-800">G</th>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedData.map(row => (
                                            <tr key={row.outlet_id} className="hover:bg-gray-50 border-b border-gray-100">
                                                <td className="sticky left-0 z-20 bg-white p-1 font-mono text-[9px] border-r border-gray-100">{row.id_digipos}</td>
                                                <td className="sticky left-[80px] z-20 bg-white p-1 font-medium border-r border-gray-100">{row.outlet_name}</td>
                                                <td className="sticky left-[200px] z-20 bg-white p-1 font-mono text-[9px] border-r border-gray-100">{formatRSNumber(row.rs_number)}</td>
                                                <td className="sticky left-[280px] z-20 bg-white p-1 text-gray-700 border-r border-gray-100">{row.tap_name}</td>
                                                <td className="sticky left-[380px] z-20 bg-white p-1 text-gray-700 border-r border-gray-100">{row.salesforce_name}</td>
                                                <td className="p-1 text-center border-r border-gray-200">{row.kabupaten || '-'}</td>
                                                <td className="p-1 text-center border-r border-gray-200">{row.outlet_flag || '-'}</td>
                                                <td className="p-1 text-center border-r border-gray-200">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${row.outlet_location === 'Ring 1' ? 'bg-green-100 text-green-700' : row.outlet_location === 'Ring 2' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {row.outlet_location || '-'}
                                                    </span>
                                                </td>

                                                {/* Global Totals Logic */}
                                                {(() => {
                                                    // Calculate Totals for All, Simpati, and byU
                                                    const allProducts = productGroups.flatMap(g => g.products);
                                                    const simpatiProducts = allProducts.filter(p => p.brand === 'simpati');
                                                    const byuProducts = allProducts.filter(p => p.brand === 'byu');

                                                    const renderTotalColumn = (products: any[], bgClass: string) => {
                                                        let tgt = 0, act = 0, m1 = 0;
                                                        const weeklyActuals = [0, 0, 0, 0, 0];
                                                        const weeklyGaps = [0, 0, 0, 0, 0];

                                                        products.forEach(p => {
                                                            const d = row.products[p.id];
                                                            if (d) {
                                                                tgt += d.target.mtd;
                                                                act += d.actual.mtd;
                                                                m1 += (d.actual.mtd - (d.mom_growth || 0)); // Approx M-1

                                                                // Weekly aggregation
                                                                for (let i = 0; i < 5; i++) {
                                                                    weeklyActuals[i] += d.actual.weekly[i] || 0;
                                                                    weeklyGaps[i] += d.gap.weekly[i] || 0;
                                                                }
                                                            }
                                                        });
                                                        const ach = tgt > 0 ? (act / tgt) * 100 : 0;
                                                        const growthAbs = act - m1;
                                                        const growthPct = m1 !== 0 ? (growthAbs / m1) * 100 : 0;
                                                        const growthColor = growthPct >= 0 ? 'text-green-600' : 'text-red-600';

                                                        return (
                                                            <React.Fragment>
                                                                <td className={`p-1 text-center border-r border-gray-300 font-semibold ${bgClass}`}>{formatNumber(tgt)}</td>
                                                                <td className={`p-1 text-center border-r border-gray-300 font-bold ${bgClass}`}>{formatNumber(act)}</td>
                                                                <td className={`p-1 text-center border-r border-gray-300 ${bgClass}`}>{Math.round(ach)}%</td>
                                                                <td className={`p-1 text-center border-r border-gray-300 ${bgClass} text-amber-800`}>{formatNumber(m1)}</td>
                                                                <td className={`p-1 text-center border-r border-gray-300 ${bgClass} ${growthColor}`}>
                                                                    {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                </td>
                                                                {/* Weekly & Custom Placeholders - Populated */}
                                                                {selectedWeeks.map(w => {
                                                                    // Calculate weekly target for Global Totals (needed for %)
                                                                    let wTgt = 0;
                                                                    products.forEach(p => {
                                                                        const d = row.products[p.id];
                                                                        if (d) wTgt += d.target.weekly[w - 1] || 0;
                                                                    });

                                                                    const wAct = weeklyActuals[w - 1];
                                                                    const wAchPct = wTgt > 0 ? (wAct / wTgt) * 100 : 0;

                                                                    // Growth %
                                                                    const wPrevAct = getPrevMonthValue(wAct);
                                                                    const wGrowthPct = wPrevAct > 0 ? ((wAct - wPrevAct) / wPrevAct) * 100 : 0;
                                                                    const wGrowthColor = wGrowthPct >= 0 ? 'text-green-600' : 'text-red-600';

                                                                    return (
                                                                        <React.Fragment key={w}>
                                                                            <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]}`}>{formatNumber(wTgt)}</td>
                                                                            <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]}`}>{formatNumber(wAct)}</td>
                                                                            <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]}`}>{Math.round(wAchPct)}%</td>
                                                                            <td className={`p-1 text-center ${bgClass} ${weekBgColors[w]} ${wGrowthColor}`}>
                                                                                {wGrowthPct > 0 ? `+${Math.round(wGrowthPct)}%` : `${Math.round(wGrowthPct)}%`}
                                                                            </td>
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                {customRange && (
                                                                    <React.Fragment>
                                                                        <td className={`p-1 text-center ${bgClass}`}>-</td>
                                                                        <td className={`p-1 text-center ${bgClass}`}>-</td>
                                                                    </React.Fragment>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    };

                                                    return (
                                                        <React.Fragment>
                                                            {renderTotalColumn(allProducts, 'bg-gray-100')}
                                                            {renderTotalColumn(simpatiProducts, 'bg-red-50')}
                                                            {renderTotalColumn(byuProducts, 'bg-purple-50')}
                                                        </React.Fragment>
                                                    );
                                                })()}

                                                {productGroups.map(group => {
                                                    const total = calculateGroupTotal(group.products, row.products, selectedWeeks);
                                                    return (
                                                        <React.Fragment key={group.key}>
                                                            {group.products.map((product, idx) => {
                                                                const pData = row.products[product.id];
                                                                if (!pData) return <td key={product.id} colSpan={getMetricColSpan()} className="p-1 text-center text-gray-300">-</td>;
                                                                return (
                                                                    <React.Fragment key={product.id}>
                                                                        <td className={`p-1 text-center ${idx === 0 ? productSeparator : 'border-l border-gray-200'} ${getProductTargetBg(group.brand)}`}>{formatNumber(pData.target.mtd)}</td>
                                                                        <td className="p-1 text-center font-semibold">{formatNumber(pData.actual.mtd)}</td>
                                                                        <td className="p-1 text-center">
                                                                            <span className={`px-1 py-0.5 rounded text-[9px] ${pData.achievement_pct >= 100 ? 'bg-green-100 text-green-700' : pData.achievement_pct >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                                                {Math.round(pData.achievement_pct)}%
                                                                            </span>
                                                                        </td>

                                                                        {
                                                                            (() => {
                                                                                const m1 = pData.actual.mtd - (pData.mom_growth || 0);
                                                                                const growthPct = m1 !== 0 ? ((pData.mom_growth || 0) / m1) * 100 : 0;
                                                                                return (
                                                                                    <>
                                                                                        <td className="p-1 text-center bg-yellow-50 text-amber-800">{formatNumber(m1)}</td>
                                                                                        <td className={`p-1 text-center bg-yellow-50 ${growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                            {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                                        </td>
                                                                                    </>
                                                                                );
                                                                            })()
                                                                        }
                                                                        {
                                                                            selectedWeeks.map(w => {
                                                                                const tgt = pData.target.weekly[w - 1] || 0;
                                                                                const act = pData.actual.weekly[w - 1] || 0;
                                                                                const achPct = tgt > 0 ? (act / tgt) * 100 : 0;

                                                                                // Growth %
                                                                                const prevAct = getPrevMonthValue(act);
                                                                                const growthPct = prevAct > 0 ? ((act - prevAct) / prevAct) * 100 : 0;
                                                                                const growthColor = growthPct >= 0 ? 'text-green-600' : 'text-red-600';

                                                                                return (
                                                                                    <React.Fragment key={`${product.id}-w${w}-data`}>
                                                                                        <td className={`p-1 text-center ${weekBgColors[w]}`}>{formatNumber(tgt)}</td>
                                                                                        <td className={`p-1 text-center ${weekBgColors[w]}`}>{formatNumber(act)}</td>
                                                                                        <td className={`p-1 text-center ${weekBgColors[w]}`}>{Math.round(achPct)}%</td>
                                                                                        <td className={`p-1 text-center ${weekBgColors[w]} ${growthColor}`}>
                                                                                            {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                                        </td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            })
                                                                        }
                                                                        {
                                                                            customRange && (() => {
                                                                                return (
                                                                                    <>
                                                                                        <td className="p-1 text-center bg-green-50">-</td>
                                                                                        <td className="p-1 text-center bg-green-50">-</td>
                                                                                    </>
                                                                                );
                                                                            })()
                                                                        }
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                            {/* Total - only if more than 1 product */}
                                                            {group.products.length > 1 && (
                                                                <>
                                                                    <td className="p-1 text-center border-l-2 border-gray-500 bg-slate-50 font-semibold">{formatNumber(total.target)}</td>
                                                                    <td className="p-1 text-center bg-slate-50 font-bold text-blue-700">{formatNumber(total.actual)}</td>
                                                                    <td className="p-1 text-center bg-slate-50">
                                                                        <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${total.achievementPct >= 100 ? 'bg-green-200 text-green-800' : total.achievementPct >= 80 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                                                            {Math.round(total.achievementPct)}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-1 text-center bg-yellow-50 text-amber-800">{formatNumber(total.m1)}</td>
                                                                    {(() => {
                                                                        const growthPct = total.m1 !== 0 ? (total.growth / total.m1) * 100 : 0;
                                                                        return (
                                                                            <td className={`p-1 text-center bg-yellow-50 ${growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                                            </td>
                                                                        );
                                                                    })()}
                                                                    {selectedWeeks.map(w => {
                                                                        // We need weekly target for this group total to calc %
                                                                        // calculateGroupTotal doesn't return weeklyTarget array, let's fix that or compute on fly.
                                                                        // Easier to compute here as we have the products list.
                                                                        let wTgt = 0;
                                                                        group.products.forEach(p => {
                                                                            const d = row.products[p.id];
                                                                            if (d) wTgt += d.target.weekly[w - 1] || 0;
                                                                        });
                                                                        const wGap = total.weeklyGaps[w - 1];
                                                                        const wGapPct = wTgt > 0 ? (wGap / wTgt) * 100 : 0;

                                                                        return (
                                                                            <React.Fragment key={`total-w${w}-outlet`}>
                                                                                <td className={`p-1 text-center ${weekBgColors[w]} font-semibold`}>{formatNumber(total.weeklyActuals[w - 1])}</td>
                                                                                <td className={`p-1 text-center ${weekBgColors[w]} font-semibold ${wGapPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {wGapPct > 0 ? `+${Math.round(wGapPct)}%` : `${Math.round(wGapPct)}%`}
                                                                                </td>
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                    {customRange && (
                                                                        <>
                                                                            <td className="p-1 text-center bg-green-50 font-semibold">-</td>
                                                                            <td className="p-1 text-center bg-green-50 font-semibold">-</td>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
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

    export default PlanVoucherPage;
