import React, { useMemo, useState, useCallback } from 'react';
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
import { cvmSalesData } from '../../services/mock/cvmSalesData';
import type { MultiSelectOption } from '../../components/ui/MultiSelect';
import { CVM_PRODUCTS } from '../../types/cvm';
import type { OutletCVMData, CVMMetric } from '../../types/cvm';
import { exportToExcel } from '../../utils/excelExport';
import { formatRSNumber } from '../../utils/formatters';

// Number formatter
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
};

// Summary row type

// Summary row type
interface SummaryRow {
    name: string;
    tap?: string; // Add TAP for sfSummary
    outletCount: number;
    products: { [key: string]: CVMMetric };
}

const PlanCVMPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        date: { start: '', end: '' },
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        tap: [],
        salesforce: [],
        kabupaten: [],
        flag: [],
        pjpStatus: [], // Used for 'Lokasi Outlet' (Ring 1, etc)
    });

    // Collapsible states
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // Derived Options for Filters
    const tapOptions: MultiSelectOption[] = useMemo(() => {
        const taps = Array.from(new Set(cvmSalesData.map(d => d.tap_name))).sort();
        return taps.map(t => ({ value: t, label: t }));
    }, []);

    const salesforceOptions: MultiSelectOption[] = useMemo(() => {
        // Cascade: Filter SFs by selected TAP(s)
        let filtered = cvmSalesData;
        if (filters.tap.length > 0) {
            filtered = filtered.filter(d => filters.tap.includes(d.tap_name));
        }
        const sfs = Array.from(new Set(filtered.map(d => d.salesforce_name))).sort();
        return sfs.map(s => ({ value: s, label: s }));
    }, [filters.tap]);

    const kabupatenOptions: MultiSelectOption[] = useMemo(() => {
        const kabs = Array.from(new Set(cvmSalesData.map(d => d.kabupaten))).filter(Boolean).sort();
        return kabs.map(k => ({ value: k, label: k }));
    }, []);

    const flagOptions: MultiSelectOption[] = useMemo(() => {
        const flags = Array.from(new Set(cvmSalesData.map(d => d.outlet_flag))).filter(Boolean).sort();
        return flags.map(f => ({ value: f, label: f }));
    }, []);

    const pjpOptions: MultiSelectOption[] = useMemo(() => {
        // Map 'pjpStatus' filter to 'outlet_location' (Ring 1 etc) as per user intent for "Lokasi Outlet"
        const locs = Array.from(new Set(cvmSalesData.map(d => d.outlet_location))).filter(Boolean).sort();
        return locs.map(l => ({ value: l, label: l }));
    }, []);

    // Data update timestamp
    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Filter outlet data
    const filteredData = useMemo(() => {
        return cvmSalesData.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                item.outlet_name.toLowerCase().includes(searchLower) ||
                item.id_digipos.toLowerCase().includes(searchLower) ||
                item.salesforce_name.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;

            if (filters.tap && filters.tap.length > 0) {
                if (!filters.tap.includes(item.tap_name)) return false;
            }
            if (filters.salesforce && filters.salesforce.length > 0) {
                if (!filters.salesforce.includes(item.salesforce_name)) return false;
            }
            if (filters.kabupaten && filters.kabupaten.length > 0) {
                if (!filters.kabupaten.includes(item.kabupaten)) return false;
            }
            if (filters.flag && filters.flag.length > 0) {
                if (!filters.flag.includes(item.outlet_flag)) return false;
            }
            // Filter by 'Lokasi Outlet' (stored in pjpStatus filter)
            if (filters.pjpStatus && filters.pjpStatus.length > 0) {
                if (!filters.pjpStatus.includes(item.outlet_location)) return false;
            }

            return true;
        });
    }, [searchQuery, filters]);

    // Aggregate by TAP
    const tapSummary = useMemo((): SummaryRow[] => {
        const tapMap = new Map<string, { outlets: OutletCVMData[] }>();
        filteredData.forEach(outlet => {
            if (!tapMap.has(outlet.tap_name)) tapMap.set(outlet.tap_name, { outlets: [] });
            tapMap.get(outlet.tap_name)!.outlets.push(outlet);
        });

        return Array.from(tapMap.entries()).map(([tapName, data]) => {
            const aggregatedProducts: { [key: string]: CVMMetric } = {};
            CVM_PRODUCTS.forEach(prod => {
                const targetMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key as keyof typeof o.products]?.target_mtd || 0), 0);
                const actualMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key as keyof typeof o.products]?.actual_mtd || 0), 0);
                const lastMonthActual = data.outlets.reduce((sum, o) => sum + (o.products[prod.key as keyof typeof o.products]?.last_month_actual || 0), 0);

                aggregatedProducts[prod.key] = {
                    target_mtd: targetMtd,
                    actual_mtd: actualMtd,
                    last_month_actual: lastMonthActual
                };
            });
            return { name: tapName, outletCount: data.outlets.length, products: aggregatedProducts };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);

    // Aggregate by Salesforce
    const sfSummary = useMemo((): SummaryRow[] => {
        const sfMap = new Map<string, { outlets: OutletCVMData[] }>();
        filteredData.forEach(outlet => {
            if (!sfMap.has(outlet.salesforce_name)) sfMap.set(outlet.salesforce_name, { outlets: [] });
            sfMap.get(outlet.salesforce_name)!.outlets.push(outlet);
        });

        return Array.from(sfMap.entries()).map(([sfName, data]) => {
            const aggregatedProducts: { [key: string]: CVMMetric } = {};
            CVM_PRODUCTS.forEach(prod => {
                const targetMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key as keyof typeof o.products]?.target_mtd || 0), 0);
                const actualMtd = data.outlets.reduce((sum, o) => sum + (o.products[prod.key as keyof typeof o.products]?.actual_mtd || 0), 0);
                const lastMonthActual = data.outlets.reduce((sum, o) => sum + (o.products[prod.key as keyof typeof o.products]?.last_month_actual || 0), 0);

                aggregatedProducts[prod.key] = {
                    target_mtd: targetMtd,
                    actual_mtd: actualMtd,
                    last_month_actual: lastMonthActual
                };
            });
            return {
                name: sfName,
                tap: data.outlets[0]?.tap_name || '', // Helper to get TAP name
                outletCount: data.outlets.length,
                products: aggregatedProducts
            };
        }).sort((a, b) => {
            // Sort by TAP then Name
            if (a.tap && b.tap && a.tap !== b.tap) return a.tap.localeCompare(b.tap);
            return a.name.localeCompare(b.name);
        });
    }, [filteredData]);

    // Styles
    const stickyLeftStyle = "sticky left-0 z-20 bg-white border-r border-gray-200 shadow-sm";
    const stickyHeaderStyle = "sticky top-0 z-30 bg-gray-100 font-semibold text-gray-700 uppercase p-2 border-b border-gray-200 align-middle";
    const productSeparator = "border-l-2 border-gray-400";

    // Excel Export Handler
    const handleExportExcel = useCallback(() => {
        const columns = [
            { header: 'ID Digipos', key: 'id_digipos', width: 15 },
            { header: 'No RS', key: 'rs_number', width: 12 },
            { header: 'Nama Outlet', key: 'outlet_name', width: 25 },
            { header: 'TAP', key: 'tap_name', width: 15 },
            { header: 'Salesforce', key: 'salesforce_name', width: 20 },
            { header: 'Kabupaten', key: 'kabupaten', width: 15 },
            { header: 'Lokasi', key: 'outlet_location', width: 12 },
            { header: 'Flag', key: 'outlet_flag', width: 10 },
        ];

        // Add product columns
        CVM_PRODUCTS.forEach(product => {
            columns.push(
                { header: `${product.label} - Target`, key: `${product.key}_target`, width: 12 },
                { header: `${product.label} - Aktual`, key: `${product.key}_aktual`, width: 12 },
                { header: `${product.label} - Gap`, key: `${product.key}_gap`, width: 10 }
            );
        });

        // Prepare data
        const exportData = filteredData.map(row => {
            const flatRow: Record<string, unknown> = {
                id_digipos: row.id_digipos,
                rs_number: row.rs_number,
                outlet_name: row.outlet_name,
                tap_name: row.tap_name,
                salesforce_name: row.salesforce_name,
                kabupaten: row.kabupaten,
                outlet_location: row.outlet_location,
                outlet_flag: row.outlet_flag,
            };

            // Add product data
            CVM_PRODUCTS.forEach(product => {
                const prod = row.products[product.key as keyof typeof row.products];
                if (prod) {
                    flatRow[`${product.key}_target`] = prod.target_mtd;
                    flatRow[`${product.key}_aktual`] = prod.actual_mtd;
                    flatRow[`${product.key}_gap`] = prod.actual_mtd - prod.target_mtd;
                } else {
                    flatRow[`${product.key}_target`] = 0;
                    flatRow[`${product.key}_aktual`] = 0;
                    flatRow[`${product.key}_gap`] = 0;
                }
            });

            return flatRow;
        });

        exportToExcel({
            filename: 'SalesPlan_CVM_DetailOutlet',
            sheetName: 'Detail Outlet',
            columns,
            data: exportData
        });
    }, [filteredData]);

    // Summary Table Component
    const SummaryTable = ({ data, title, icon, expanded, onToggle, showTap = false }: {
        data: SummaryRow[]; title: string; icon: React.ReactNode; expanded: boolean; onToggle: () => void; showTap?: boolean;
    }) => (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-gray-800">{title}</span>
                    <span className="text-sm text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>

            {expanded && (
                <div className="overflow-auto max-h-[400px]">
                    <table className="data-table data-table-compact text-left">
                        <thead>
                            <tr>
                                {showTap && <th className="sticky top-0 z-10 p-1 bg-gray-100 border-b border-r min-w-[100px]" rowSpan={2}>TAP</th>}
                                <th className="sticky top-0 z-10 p-1 bg-gray-100 border-b border-r min-w-[150px]" rowSpan={2}>Name</th>
                                <th className="sticky top-0 z-10 p-1 bg-gray-100 border-b border-r text-center" rowSpan={2}>Outlets</th>
                                {CVM_PRODUCTS.map(group => (
                                    <th key={group.key} colSpan={6} className={`sticky top-0 z-10 p-1 bg-gray-100 border-b text-center ${productSeparator}`}>
                                        {group.label}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {CVM_PRODUCTS.map(group => (
                                    <React.Fragment key={group.key}>
                                        <th className={`sticky top-[23px] z-10 p-1 bg-blue-50 border-b min-w-[70px] text-center ${productSeparator}`}>Tgt</th>
                                        <th className="sticky top-[23px] z-10 p-1 bg-blue-50 border-b min-w-[70px] text-center">Act</th>
                                        <th className="sticky top-[23px] z-10 p-1 bg-blue-50 border-b min-w-[60px] text-center">Ach%</th>
                                        <th className="sticky top-[23px] z-10 p-1 bg-blue-50 border-b min-w-[70px] text-center">Gap</th>
                                        <th className="sticky top-[23px] z-10 p-1 bg-amber-50 border-b min-w-[70px] text-center">Prev</th>
                                        <th className="sticky top-[23px] z-10 p-1 bg-amber-50 border-b min-w-[60px] text-center">MoM</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                                    {showTap && <td className="p-2 border-r border-gray-200 font-medium">{row.tap}</td>}
                                    <td className="p-2 border-r border-gray-200 font-medium">{row.name}</td>
                                    <td className="p-2 border-r border-gray-200 text-center">{row.outletCount}</td>
                                    {CVM_PRODUCTS.map(group => {
                                        const pData = row.products[group.key];
                                        if (!pData) return <td key={group.key} colSpan={6}>-</td>;

                                        const gap = pData.actual_mtd - pData.target_mtd;
                                        const m1 = pData.last_month_actual;
                                        const growth = pData.actual_mtd - m1;
                                        const growthPct = m1 !== 0 ? (growth / m1) * 100 : 0;
                                        const ach = pData.target_mtd > 0 ? (pData.actual_mtd / pData.target_mtd) * 100 : 0;

                                        const growthColor = growthPct >= 0 ? 'text-green-600' : 'text-red-600';
                                        const gapColor = gap >= 0 ? 'text-green-600' : 'text-red-600';

                                        return (
                                            <React.Fragment key={group.key}>
                                                <td className={`p-2 border-r border-gray-200 text-right ${productSeparator}`}>{formatNumber(pData.target_mtd)}</td>
                                                <td className="p-2 border-r border-gray-200 text-right font-medium">{formatNumber(pData.actual_mtd)}</td>
                                                <td className="p-2 border-r border-gray-200 text-center">{Math.round(ach)}%</td>
                                                <td className={`p-2 border-r border-gray-200 text-right ${gapColor}`}>{formatNumber(gap)}</td>
                                                <td className="p-2 border-r border-gray-200 text-right text-gray-500">{formatNumber(m1)}</td>
                                                <td className={`p-2 border-r border-gray-200 text-center ${growthColor}`}>
                                                    {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
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

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Sales Plan CVM" subtitle="" />

            {/* Data Update Info */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
                <span className="ml-4 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    Monthly View Only
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
                showPJPStatus={true} // Labels as "Lokasi Outlet" in FilterBar
                tapOptions={tapOptions}
                salesforceOptions={salesforceOptions}
                kabupatenOptions={kabupatenOptions}
                flagOptions={flagOptions}
                pjpOptions={pjpOptions}
            />

            <Card padding="none" className="mt-4">
                <Tabs defaultValue="summary">
                    <TabList>
                        <Tab value="summary" icon={<LayoutDashboard size={16} />}>Summary</Tab>
                        <Tab value="detail" icon={<TableIcon size={16} />}>Detail Outlet</Tab>
                    </TabList>

                    {/* Tab 1: Summary */}
                    <TabPanel value="summary" className="p-4">
                        <SummaryTable data={tapSummary} title="Summary per TAP" icon={<MapPin size={18} className="text-blue-600" />} expanded={tapExpanded} onToggle={() => setTapExpanded(!tapExpanded)} />
                        <SummaryTable
                            title="Summary per-Salesforce"
                            icon={<User size={18} className="text-purple-600" />}
                            data={sfSummary}
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
                            <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={handleExportExcel}>Export Excel</Button>
                        </div>

                        <div className="overflow-auto max-h-[600px] relative">
                            <table className="data-table data-table-compact text-left whitespace-nowrap">
                                <thead>
                                    <tr>
                                        <th className={`${stickyHeaderStyle} z-40 left-0 min-w-[100px] border-r border-gray-300`} rowSpan={2}>ID Digipos</th>
                                        <th className={`${stickyHeaderStyle} z-40 left-[100px] min-w-[100px] border-r border-gray-300`} rowSpan={2}>Nomor RS</th>
                                        <th className={`${stickyHeaderStyle} z-40 left-[200px] min-w-[150px] border-r border-gray-300`} rowSpan={2}>Outlet</th>
                                        <th className={`${stickyHeaderStyle} min-w-[80px] border-r border-gray-300`} rowSpan={2}>TAP</th>
                                        <th className={`${stickyHeaderStyle} min-w-[80px] border-r border-gray-300`} rowSpan={2}>SF</th>
                                        <th className={`${stickyHeaderStyle} min-w-[100px] border-r border-gray-300`} rowSpan={2}>Kabupaten</th>
                                        <th className={`${stickyHeaderStyle} min-w-[100px] border-r border-gray-300`} rowSpan={2}>Lokasi</th>
                                        <th className={`${stickyHeaderStyle} min-w-[80px] border-r border-gray-300`} rowSpan={2}>Flag</th>
                                        {CVM_PRODUCTS.map(group => (
                                            <th key={group.key} colSpan={6} className={`${stickyHeaderStyle} text-center ${productSeparator} bg-gray-200`}>
                                                {group.label}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-50 text-gray-500">
                                        {CVM_PRODUCTS.map(group => (
                                            <React.Fragment key={group.key}>
                                                <th className={`sticky top-[23px] z-30 p-1 border-b min-w-[60px] text-center ${productSeparator} bg-blue-100`}>Target</th>
                                                <th className="sticky top-[23px] z-30 p-1 border-b min-w-[60px] text-center bg-blue-100">Actual</th>
                                                <th className="sticky top-[23px] z-30 p-1 border-b min-w-[60px] text-center bg-blue-100">Ach%</th>
                                                <th className="sticky top-[23px] z-30 p-1 border-b min-w-[60px] text-center bg-blue-100">Gap</th>
                                                <th className="sticky top-[23px] z-30 p-1 border-b min-w-[60px] text-center bg-amber-100">Prev</th>
                                                <th className="sticky top-[23px] z-30 p-1 border-b min-w-[70px] text-center bg-amber-100">MoM</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(row => (
                                        <tr key={row.outlet_id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <td className={`${stickyLeftStyle} p-2 font-mono border-r border-gray-200`}>{row.id_digipos}</td>
                                            <td className={`${stickyLeftStyle} left-[100px] p-2 font-mono border-r border-gray-200`}>{formatRSNumber(row.rs_number)}</td>
                                            <td className={`${stickyLeftStyle} left-[200px] p-2 font-medium border-r border-gray-200`}>{row.outlet_name}</td>
                                            <td className="p-2 border-r border-gray-200">{row.tap_name}</td>
                                            <td className="p-2 border-r border-gray-200">{row.salesforce_name}</td>
                                            <td className="p-2 border-r border-gray-200">{row.kabupaten}</td>
                                            <td className="p-2 border-r border-gray-200">{row.outlet_location}</td>
                                            <td className="p-2 border-r border-gray-200 text-center">{row.outlet_flag}</td>

                                            {CVM_PRODUCTS.map(group => {
                                                const metric = row.products[group.key as keyof typeof row.products];
                                                if (!metric) return <td key={group.key} colSpan={6} className={productSeparator}>-</td>;

                                                const gap = metric.actual_mtd - metric.target_mtd;
                                                const m1 = metric.last_month_actual;
                                                const growth = metric.actual_mtd - m1;
                                                const growthPct = m1 !== 0 ? (growth / m1) * 100 : 0;
                                                const ach = metric.target_mtd > 0 ? (metric.actual_mtd / metric.target_mtd) * 100 : 0;

                                                const growthColor = growthPct >= 0 ? 'text-green-600' : 'text-red-600';
                                                const gapColor = gap >= 0 ? 'text-green-600' : 'text-red-600';

                                                return (
                                                    <React.Fragment key={group.key}>
                                                        <td className={`p-2 border-r border-gray-200 text-right ${productSeparator}`}>{formatNumber(metric.target_mtd)}</td>
                                                        <td className="p-2 border-r border-gray-200 text-right font-medium">{formatNumber(metric.actual_mtd)}</td>
                                                        <td className="p-2 border-r border-gray-200 text-center">{Math.round(ach)}%</td>
                                                        <td className={`p-2 border-r border-gray-200 text-right ${gapColor}`}>{formatNumber(gap)}</td>
                                                        <td className="p-2 border-r border-gray-200 text-right text-gray-500">{formatNumber(m1)}</td>
                                                        <td className={`p-2 border-r border-gray-200 text-center ${growthColor}`}>
                                                            {growthPct > 0 ? `+${Math.round(growthPct)}%` : `${Math.round(growthPct)}%`}
                                                        </td>
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

export default PlanCVMPage;
