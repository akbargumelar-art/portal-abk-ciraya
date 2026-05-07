import React, { useMemo, useState } from 'react';
import { Filter, X, AlertCircle, ChevronDown, ChevronRight, MapPin, User } from 'lucide-react';
import Header from '../components/layout/Header';
import DataTable from '../components/table/DataTable';
import { Card, Select } from '../components/ui/index';
import { useRoleBasedOutlets, useUserFilterContext } from '../hooks/useRoleBasedData';
import { formatRSNumber } from '../utils/formatters';
import type { Outlet, TableColumn } from '../types';

// ===========================================
// SUMMARY ROW INTERFACES
// ===========================================
interface SummaryRow {
    tap: string;
    salesforce?: string;
    totalOutlets: number;
    pjpCount: number;
    pjpRatio: number;
    // Lokasi Outlet breakdown
    ring1Count: number;
    ring1Rate: number;
    ring2Count: number;
    ring2Rate: number;
    ring3Count: number;
    ring3Rate: number;
    // Flag Outlet breakdown
    retailCount: number;
    retailRate: number;
    paretoRetailCount: number;
    paretoRetailRate: number;
    bigParetoCount: number;
    bigParetoRate: number;
}

// ===========================================
// MAIN COMPONENT
// ===========================================
const OutletRegisterPage: React.FC = () => {
    // Get role-filtered outlets
    const outlets = useRoleBasedOutlets();
    const filterContext = useUserFilterContext();

    // Unified filter state
    const [tapFilter, setTapFilter] = useState('');
    const [salesforceFilter, setSalesforceFilter] = useState('');
    const [kabupatenFilter, setKabupatenFilter] = useState('');
    const [physicalStatusFilter, setPhysicalStatusFilter] = useState('');
    const [pjpStatusFilter, setPjpStatusFilter] = useState('');

    // Collapsible state for summary tables
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // ===========================================
    // Bi-directional Filter Logic
    // Each filter's options are derived from data filtered by OTHER filters
    // ===========================================

    // TAP options: filtered by SF, Kabupaten, Physical, PJP
    const tapOptions = useMemo(() => {
        const subset = outlets.filter(o => {
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (physicalStatusFilter && o.physicalStatus !== physicalStatusFilter) return false;
            if (pjpStatusFilter && o.pjpStatus !== pjpStatusFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.tap))].sort();
        return [{ value: '', label: 'Semua TAP' }, ...unique.map(t => ({ value: t, label: t }))];
    }, [outlets, salesforceFilter, kabupatenFilter, physicalStatusFilter, pjpStatusFilter]);

    // Salesforce options: filtered by TAP, Kabupaten, Physical, PJP
    const salesforceOptions = useMemo(() => {
        const subset = outlets.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (physicalStatusFilter && o.physicalStatus !== physicalStatusFilter) return false;
            if (pjpStatusFilter && o.pjpStatus !== pjpStatusFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.salesforceName))].sort();
        return [{ value: '', label: 'Semua Salesforce' }, ...unique.map(s => ({ value: s, label: s }))];
    }, [outlets, tapFilter, kabupatenFilter, physicalStatusFilter, pjpStatusFilter]);

    // Kabupaten options: filtered by TAP, SF, Physical, PJP
    const kabupatenOptions = useMemo(() => {
        const subset = outlets.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (physicalStatusFilter && o.physicalStatus !== physicalStatusFilter) return false;
            if (pjpStatusFilter && o.pjpStatus !== pjpStatusFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.kabupaten))].sort();
        return [{ value: '', label: 'Semua Kabupaten' }, ...unique.map(k => ({ value: k, label: k }))];
    }, [outlets, tapFilter, salesforceFilter, physicalStatusFilter, pjpStatusFilter]);

    // Physical Status options (static)
    const physicalStatusOptions = [
        { value: '', label: 'Semua Status Fisik' },
        { value: 'Fisik', label: 'Fisik' },
        { value: 'Non Fisik', label: 'Non Fisik' },
    ];

    // PJP Status options (static)
    const pjpStatusOptions = [
        { value: '', label: 'Semua PJP' },
        { value: 'PJP', label: 'PJP' },
        { value: 'Non PJP', label: 'Non PJP' },
    ];

    // Clear if current selection not in options
    React.useEffect(() => {
        if (tapFilter && !tapOptions.some(o => o.value === tapFilter)) setTapFilter('');
    }, [tapOptions, tapFilter]);

    React.useEffect(() => {
        if (salesforceFilter && !salesforceOptions.some(o => o.value === salesforceFilter)) setSalesforceFilter('');
    }, [salesforceOptions, salesforceFilter]);

    React.useEffect(() => {
        if (kabupatenFilter && !kabupatenOptions.some(o => o.value === kabupatenFilter)) setKabupatenFilter('');
    }, [kabupatenOptions, kabupatenFilter]);

    // Check if any filter is active
    const hasActiveFilters = tapFilter || salesforceFilter || kabupatenFilter || physicalStatusFilter || pjpStatusFilter;

    // Clear all filters
    const clearAllFilters = () => {
        setTapFilter('');
        setSalesforceFilter('');
        setKabupatenFilter('');
        setPhysicalStatusFilter('');
        setPjpStatusFilter('');
    };

    // ===========================================
    // Filter data based on all filters
    // ===========================================
    const filteredData = useMemo(() => {
        return outlets.filter(outlet => {
            if (tapFilter && outlet.tap !== tapFilter) return false;
            if (salesforceFilter && outlet.salesforceName !== salesforceFilter) return false;
            if (kabupatenFilter && outlet.kabupaten !== kabupatenFilter) return false;
            if (physicalStatusFilter && outlet.physicalStatus !== physicalStatusFilter) return false;
            if (pjpStatusFilter && outlet.pjpStatus !== pjpStatusFilter) return false;
            return true;
        });
    }, [outlets, tapFilter, salesforceFilter, kabupatenFilter, physicalStatusFilter, pjpStatusFilter]);

    // ===========================================
    // Summary Stats
    // ===========================================
    const summary = useMemo(() => {
        const total = filteredData.length;
        const activePjp = filteredData.filter(o => o.pjpStatus === 'PJP').length;
        const fisik = filteredData.filter(o => o.physicalStatus === 'Fisik').length;

        return {
            total,
            activePjp,
            pjpRatio: total > 0 ? ((activePjp / total) * 100).toFixed(1) : '0',
            fisik,
            fisikRatio: total > 0 ? ((fisik / total) * 100).toFixed(1) : '0',
        };
    }, [filteredData]);

    // ===========================================
    // Calculate Summary Rows Helper
    // ===========================================
    const calculateSummaryRow = (tapName: string, sfName: string | undefined, outletList: Outlet[]): SummaryRow => {
        const total = outletList.length;
        const pjpCount = outletList.filter(o => o.pjpStatus === 'PJP').length;

        // Lokasi breakdown (rate = count / PJP * 100)
        const ring1 = outletList.filter(o => o.lokasiOutlet === 'Ring 1').length;
        const ring2 = outletList.filter(o => o.lokasiOutlet === 'Ring 2').length;
        const ring3 = outletList.filter(o => o.lokasiOutlet === 'Ring 3').length;

        // Flag breakdown (rate = count / PJP * 100)
        const retail = outletList.filter(o => o.flag === 'Retail').length;
        const paretoRetail = outletList.filter(o => o.flag === 'Pareto Retail').length;
        const bigPareto = outletList.filter(o => o.flag === 'Big Pareto').length;

        return {
            tap: tapName,
            salesforce: sfName,
            totalOutlets: total,
            pjpCount,
            pjpRatio: total > 0 ? (pjpCount / total) * 100 : 0,
            ring1Count: ring1,
            ring1Rate: pjpCount > 0 ? (ring1 / pjpCount) * 100 : 0,
            ring2Count: ring2,
            ring2Rate: pjpCount > 0 ? (ring2 / pjpCount) * 100 : 0,
            ring3Count: ring3,
            ring3Rate: pjpCount > 0 ? (ring3 / pjpCount) * 100 : 0,
            retailCount: retail,
            retailRate: pjpCount > 0 ? (retail / pjpCount) * 100 : 0,
            paretoRetailCount: paretoRetail,
            paretoRetailRate: pjpCount > 0 ? (paretoRetail / pjpCount) * 100 : 0,
            bigParetoCount: bigPareto,
            bigParetoRate: pjpCount > 0 ? (bigPareto / pjpCount) * 100 : 0,
        };
    };

    // ===========================================
    // Summary per TAP
    // ===========================================
    const tapSummary: SummaryRow[] = useMemo(() => {
        const tapMap = new Map<string, Outlet[]>();
        filteredData.forEach(outlet => {
            if (!tapMap.has(outlet.tap)) tapMap.set(outlet.tap, []);
            tapMap.get(outlet.tap)!.push(outlet);
        });

        return Array.from(tapMap.entries())
            .map(([tap, outletList]) => calculateSummaryRow(tap, undefined, outletList))
            .sort((a, b) => a.tap.localeCompare(b.tap));
    }, [filteredData]);

    // ===========================================
    // Summary per Salesforce
    // ===========================================
    const sfSummary: SummaryRow[] = useMemo(() => {
        const sfMap = new Map<string, { tap: string; outlets: Outlet[] }>();
        filteredData.forEach(outlet => {
            if (!sfMap.has(outlet.salesforceName)) {
                sfMap.set(outlet.salesforceName, { tap: outlet.tap, outlets: [] });
            }
            sfMap.get(outlet.salesforceName)!.outlets.push(outlet);
        });

        return Array.from(sfMap.entries())
            .map(([sf, data]) => calculateSummaryRow(data.tap, sf, data.outlets))
            .sort((a, b) => (a.tap || '').localeCompare(b.tap || '') || (a.salesforce || '').localeCompare(b.salesforce || ''));
    }, [filteredData]);

    // ===========================================
    // Rate Badge Component
    // ===========================================
    const RateBadge = ({ value }: { value: number }) => {
        const color = value >= 80 ? 'bg-green-100 text-green-700'
            : value >= 50 ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700';
        return (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${color}`}>
                {Math.round(value)}%
            </span>
        );
    };

    // ===========================================
    // Summary Table Component
    // ===========================================
    const SummaryTable = ({
        data,
        title,
        icon,
        expanded,
        onToggle,
        showSalesforce = false
    }: {
        data: SummaryRow[];
        title: string;
        icon: React.ReactNode;
        expanded: boolean;
        onToggle: () => void;
        showSalesforce?: boolean;
    }) => (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                    <span className="text-xs text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {expanded && (
                <div className="table-scroll max-h-[400px]">
                    <table className="data-table data-table-compact whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                            {/* Header Row 1: Main Groups */}
                            <tr>
                                <th className="p-2 border-b border-gray-700 text-left font-semibold text-white" rowSpan={2}>
                                    {showSalesforce ? 'TAP' : 'Nama TAP'}
                                </th>
                                {showSalesforce && (
                                    <th className="p-2 border-b border-gray-700 text-left font-semibold text-white" rowSpan={2}>Salesforce</th>
                                )}
                                <th className="p-2 border-b border-gray-700 text-center font-semibold text-white" rowSpan={2}>Total</th>
                                <th className="p-2 border-b border-gray-700 text-center font-semibold text-white" rowSpan={2}>PJP</th>
                                <th className="p-2 border-b border-gray-700 text-center font-semibold text-white" rowSpan={2}>PJP %</th>
                                <th className="p-2 border-b border-l-2 border-gray-700 text-center font-semibold text-white bg-[#3d5f85]" colSpan={6}>
                                    Lokasi Outlet
                                </th>
                                <th className="p-2 border-b border-l-2 border-gray-700 text-center font-semibold text-white bg-[#3d5f85]" colSpan={6}>
                                    Flag Outlet
                                </th>
                            </tr>
                            {/* Header Row 2: Sub columns */}
                            <tr className="bg-[#3d5f85] text-white/90">
                                {/* Lokasi Outlet */}
                                <th className="p-1.5 border-b border-l-2 border-gray-700 text-center">R1</th>
                                <th className="p-1.5 border-b text-center">R1%</th>
                                <th className="p-1.5 border-b text-center">R2</th>
                                <th className="p-1.5 border-b text-center">R2%</th>
                                <th className="p-1.5 border-b text-center">R3</th>
                                <th className="p-1.5 border-b text-center">R3%</th>
                                {/* Flag Outlet */}
                                <th className="p-1.5 border-b border-l-2 border-gray-700 text-center">Ret</th>
                                <th className="p-1.5 border-b text-center">Ret%</th>
                                <th className="p-1.5 border-b text-center">PR</th>
                                <th className="p-1.5 border-b text-center">PR%</th>
                                <th className="p-1.5 border-b text-center">BP</th>
                                <th className="p-1.5 border-b text-center">BP%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                                    <td className="p-2 font-medium">{row.tap}</td>
                                    {showSalesforce && <td className="p-2 text-gray-700">{row.salesforce}</td>}
                                    <td className="p-2 text-center font-semibold text-blue-700">{row.totalOutlets}</td>
                                    <td className="p-2 text-center text-green-600">{row.pjpCount}</td>
                                    <td className="p-2 text-center"><RateBadge value={row.pjpRatio} /></td>
                                    {/* Lokasi */}
                                    <td className="p-2 text-center border-l-2 border-blue-200 bg-blue-50/30">{row.ring1Count}</td>
                                    <td className="p-2 text-center bg-blue-50/30"><RateBadge value={row.ring1Rate} /></td>
                                    <td className="p-2 text-center bg-blue-50/30">{row.ring2Count}</td>
                                    <td className="p-2 text-center bg-blue-50/30"><RateBadge value={row.ring2Rate} /></td>
                                    <td className="p-2 text-center bg-blue-50/30">{row.ring3Count}</td>
                                    <td className="p-2 text-center bg-blue-50/30"><RateBadge value={row.ring3Rate} /></td>
                                    {/* Flag */}
                                    <td className="p-2 text-center border-l-2 border-purple-200 bg-purple-50/30">{row.retailCount}</td>
                                    <td className="p-2 text-center bg-purple-50/30"><RateBadge value={row.retailRate} /></td>
                                    <td className="p-2 text-center bg-purple-50/30">{row.paretoRetailCount}</td>
                                    <td className="p-2 text-center bg-purple-50/30"><RateBadge value={row.paretoRetailRate} /></td>
                                    <td className="p-2 text-center bg-purple-50/30">{row.bigParetoCount}</td>
                                    <td className="p-2 text-center bg-purple-50/30"><RateBadge value={row.bigParetoRate} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // ===========================================
    // Table Columns - 15 columns in required order
    // ===========================================
    const columns: TableColumn<Outlet>[] = [
        {
            key: 'createdAt',
            header: 'Created At',
            sortable: true,
            render: (value) => <span className="text-xs text-gray-900">{value}</span>
        },
        {
            key: 'idDigipos',
            header: 'ID Digipos',
            sortable: true,
            render: (value) => <span className="font-mono text-xs">{value}</span>
        },
        {
            key: 'rsNumber',
            header: 'No RS',
            sortable: true,
            render: (value) => (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{formatRSNumber(value as string)}</span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Outlet',
            sortable: true,
            render: (value) => <span className="font-medium text-gray-900">{value}</span>
        },
        {
            key: 'salesforceName',
            header: 'Salesforce',
            sortable: true,
        },
        {
            key: 'tap',
            header: 'TAP',
            sortable: true,
            render: (value) => (
                <span className="text-xs font-medium text-[#1E3A5F] bg-blue-50 px-2 py-1 rounded">
                    {value}
                </span>
            ),
        },
        {
            key: 'kabupaten',
            header: 'Kabupaten',
            sortable: true,
        },
        {
            key: 'kecamatan',
            header: 'Kecamatan',
            sortable: true,
        },
        {
            key: 'kelurahan',
            header: 'Kelurahan',
            sortable: true,
        },
        {
            key: 'pjpStatus',
            header: 'PJP',
            sortable: true,
            align: 'center',
            render: (value) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === 'PJP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {value}
                </span>
            ),
        },
        {
            key: 'physicalStatus',
            header: 'Fisik',
            sortable: true,
            align: 'center',
            render: (value) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === 'Fisik' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {value}
                </span>
            ),
        },
        {
            key: 'hariPJP',
            header: 'Hari PJP',
            sortable: true,
        },
        {
            key: 'lokasiOutlet',
            header: 'Lokasi',
            sortable: true,
            align: 'center',
            render: (value) => {
                const colors: Record<string, string> = {
                    'Ring 1': 'bg-green-100 text-green-700',
                    'Ring 2': 'bg-yellow-100 text-yellow-700',
                    'Ring 3': 'bg-orange-100 text-orange-700',
                };
                return (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[value as string] || 'bg-gray-100 text-gray-500'}`}>
                        {value || '-'}
                    </span>
                );
            },
        },
        {
            key: 'flag',
            header: 'Flag',
            sortable: true,
            align: 'center',
            render: (value) => {
                const colors: Record<string, string> = {
                    'Retail': 'bg-blue-100 text-blue-700',
                    'Pareto Retail': 'bg-purple-100 text-purple-700',
                    'Big Pareto': 'bg-orange-100 text-orange-700',
                    'Office': 'bg-gray-100 text-gray-700',
                };
                return (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[value as string] || 'bg-gray-100 text-gray-500'}`}>
                        {value || '-'}
                    </span>
                );
            },
        },
        {
            key: 'latitude',
            header: 'Long-Lat',
            render: (_, row) => (
                <span className="font-mono text-xs text-gray-500">
                    {row.longitude?.toFixed(4)}, {row.latitude?.toFixed(4)}
                </span>
            ),
        },
    ];

    // ===========================================
    // RENDER
    // ===========================================
    return (
        <div className="p-6 animate-fade-in">
            <Header title="Outlet Register" />

            {/* Role-filtered data banner */}
            {filterContext && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-500" />
                    <span className="text-sm text-blue-700">
                        Menampilkan data untuk <strong>{filterContext.label}: {filterContext.value}</strong>
                    </span>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6">
                <Card padding="md">
                    <p className="text-sm text-gray-500">Total Outlets</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total.toLocaleString()}</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm text-gray-500">PJP Ratio</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{summary.pjpRatio}%</p>
                    <p className="text-xs text-gray-400">{summary.activePjp} outlets</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm text-gray-500">Fisik Ratio</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{summary.fisikRatio}%</p>
                    <p className="text-xs text-gray-400">{summary.fisik} outlets</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm text-gray-500">Filtered</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{filteredData.length.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">dari {outlets.length} total</p>
                </Card>
            </div>

            {/* Unified Filter Bar */}
            <Card padding="md" className="mb-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                            <X size={14} />
                            Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Select
                        label="TAP"
                        value={tapFilter}
                        onChange={e => setTapFilter(e.target.value)}
                        options={tapOptions}
                    />
                    <Select
                        label="Salesforce"
                        value={salesforceFilter}
                        onChange={e => setSalesforceFilter(e.target.value)}
                        options={salesforceOptions}
                    />
                    <Select
                        label="Kabupaten"
                        value={kabupatenFilter}
                        onChange={e => setKabupatenFilter(e.target.value)}
                        options={kabupatenOptions}
                    />
                    <Select
                        label="Status Fisik"
                        value={physicalStatusFilter}
                        onChange={e => setPhysicalStatusFilter(e.target.value)}
                        options={physicalStatusOptions}
                    />
                    <Select
                        label="Status PJP"
                        value={pjpStatusFilter}
                        onChange={e => setPjpStatusFilter(e.target.value)}
                        options={pjpStatusOptions}
                    />
                </div>
            </Card>

            {/* Summary Tables */}
            <Card padding="md" className="mb-6">
                <SummaryTable
                    data={tapSummary}
                    title="Summary per TAP"
                    icon={<MapPin size={16} className="text-blue-600" />}
                    expanded={tapExpanded}
                    onToggle={() => setTapExpanded(!tapExpanded)}
                />
                <SummaryTable
                    data={sfSummary}
                    title="Summary per Salesforce"
                    icon={<User size={16} className="text-green-600" />}
                    expanded={sfExpanded}
                    onToggle={() => setSfExpanded(!sfExpanded)}
                    showSalesforce={true}
                />
            </Card>

            {/* Data Table */}
            <DataTable
                data={filteredData}
                columns={columns}
                title={`Outlet List (${filteredData.length.toLocaleString()} outlets)`}
                pageSize={15}
            />
        </div>
    );
};

export default OutletRegisterPage;
