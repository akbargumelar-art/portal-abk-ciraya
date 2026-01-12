import React, { useState, useMemo, memo } from 'react';
import { Clock, Users, ChevronDown, ChevronUp, MapPin, User, Download, TrendingUp, TrendingDown, Award, AlertCircle, Target, DollarSign, BarChart3 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui';
import FilterBar, { type FilterState } from '../../components/common/FilterBar';
import { d2cTAPSummary, d2cSFSummary, d2cSalesforceData } from '../../services/mock/sellThruData';
import { D2C_PRODUCTS, type D2CSummaryRow, type D2CMetric } from '../../types/sellthru';
import { exportD2CSummary } from '../../utils/excelExport';

// ===========================================
// FORMAT HELPERS
// ===========================================
const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
};

// ===========================================
// D2C SUMMARY CARD COMPONENT
// ===========================================
interface D2CSummaryCardProps {
    data: D2CSummaryRow[];
}

const D2CSummaryCard: React.FC<D2CSummaryCardProps> = memo(({ data }) => {
    const stats = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalQtyTarget: 0,
                totalQtyActual: 0,
                qtyAchPct: 0,
                totalRevTarget: 0,
                totalRevActual: 0,
                revAchPct: 0,
                qtyGrowth: 0,
                totalPrevMonth: 0,
                bestPerformer: null as { name: string; ach: number } | null,
                worstPerformer: null as { name: string; ach: number } | null,
            };
        }

        let totalQtyTarget = 0;
        let totalQtyActual = 0;
        let totalRevTarget = 0;
        let totalRevActual = 0;
        let totalPrevMonth = 0;
        let bestPerf = { name: '', ach: -Infinity };
        let worstPerf = { name: '', ach: Infinity };

        data.forEach(row => {
            let rowTarget = 0;
            let rowActual = 0;

            D2C_PRODUCTS.forEach(p => {
                const m = row.products[p.id];
                if (m) {
                    totalQtyTarget += m.target;
                    totalQtyActual += m.actual;
                    totalRevTarget += m.revenue_target;
                    totalRevActual += m.revenue_actual;
                    totalPrevMonth += m.prev_month;
                    rowTarget += m.target;
                    rowActual += m.actual;
                }
            });

            const rowAch = rowTarget > 0 ? (rowActual / rowTarget) * 100 : 0;
            if (rowTarget > 0) {
                if (rowAch > bestPerf.ach) bestPerf = { name: row.name, ach: rowAch };
                if (rowAch < worstPerf.ach) worstPerf = { name: row.name, ach: rowAch };
            }
        });

        return {
            totalQtyTarget,
            totalQtyActual,
            qtyAchPct: totalQtyTarget > 0 ? (totalQtyActual / totalQtyTarget) * 100 : 0,
            totalRevTarget,
            totalRevActual,
            revAchPct: totalRevTarget > 0 ? (totalRevActual / totalRevTarget) * 100 : 0,
            qtyGrowth: totalPrevMonth > 0 ? ((totalQtyActual - totalPrevMonth) / totalPrevMonth) * 100 : 0,
            totalPrevMonth,
            bestPerformer: bestPerf.ach !== -Infinity ? bestPerf : null,
            worstPerformer: worstPerf.ach !== Infinity ? worstPerf : null,
        };
    }, [data]);

    const isQtyMet = stats.qtyAchPct >= 100;
    const isRevMet = stats.revAchPct >= 100;
    const isPositiveGrowth = stats.qtyGrowth >= 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-white/80" />
                    <span className="text-white font-medium text-sm">Ringkasan Penjualan D2C</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded text-xs text-white">
                    <Users size={12} />
                    <span>{data.length} entity</span>
                </div>
            </div>

            {/* Content Grid */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    {/* Qty Achievement */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <Target size={12} />
                            <span>Qty Achievement</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className={`text-2xl font-bold ${isQtyMet ? 'text-green-600' : 'text-blue-600'}`}>
                                {Math.round(stats.qtyAchPct)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isQtyMet ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`}
                                style={{ width: `${Math.min(stats.qtyAchPct, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                            <span>Act: <b className="text-white">{stats.totalQtyActual.toLocaleString()}</b></span>
                            <span>Tgt: <b className="text-white">{stats.totalQtyTarget.toLocaleString()}</b></span>
                        </div>
                    </div>

                    {/* Revenue Achievement */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <DollarSign size={12} />
                            <span>Revenue Achievement</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className={`text-2xl font-bold ${isRevMet ? 'text-green-600' : 'text-orange-600'}`}>
                                {Math.round(stats.revAchPct)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isRevMet ? 'bg-green-500' : 'bg-orange-500'} transition-all duration-500`}
                                style={{ width: `${Math.min(stats.revAchPct, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                            <span>Act: <b className="text-green-600">{formatCurrency(stats.totalRevActual)}</b></span>
                            <span>Tgt: <b className="text-white">{formatCurrency(stats.totalRevTarget)}</b></span>
                        </div>
                    </div>

                    {/* Growth */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            {isPositiveGrowth ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>Growth vs M-1</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${isPositiveGrowth ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isPositiveGrowth ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {isPositiveGrowth ? '+' : ''}{Math.round(stats.qtyGrowth)}%
                            </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-2">
                            M-1: {stats.totalPrevMonth.toLocaleString()} unit
                        </div>
                    </div>

                    {/* Top Performer */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <Award size={12} className="text-yellow-500" />
                            <span>Top Performer</span>
                        </div>
                        {stats.bestPerformer ? (
                            <>
                                <div className="text-sm font-bold text-gray-800 truncate" title={stats.bestPerformer.name}>
                                    {stats.bestPerformer.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-green-600 font-bold text-lg">
                                        {Math.round(stats.bestPerformer.ach)}%
                                    </span>
                                    <span className="text-[10px] text-gray-400">ach</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400 text-sm">-</div>
                        )}
                    </div>

                    {/* Needs Attention */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <AlertCircle size={12} className="text-red-500" />
                            <span>Perlu Perhatian</span>
                        </div>
                        {stats.worstPerformer ? (
                            <>
                                <div className="text-sm font-bold text-gray-800 truncate" title={stats.worstPerformer.name}>
                                    {stats.worstPerformer.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-red-500 font-bold text-lg">
                                        {Math.round(stats.worstPerformer.ach)}%
                                    </span>
                                    <span className="text-[10px] text-gray-400">ach</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400 text-sm">-</div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
});

// ===========================================
// PROGRESS BAR COMPONENT
// ===========================================
const ProgressBar = memo(({ value }: { value: number }) => {
    const color = value >= 100 ? 'bg-green-500' : value >= 80 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    );
});

// ===========================================
// METRIC CELL COMPONENT
// ===========================================
const MetricCell = memo(({ metric }: { metric: D2CMetric }) => {
    if (!metric) return <td className="p-1 text-center text-gray-300" colSpan={9}>-</td>;

    return (
        <>
            {/* Qty Metrics */}
            <td className="p-1 text-center text-white">{metric.target}</td>
            <td className="p-1 text-center font-semibold text-blue-700">{metric.actual}</td>
            <td className="p-1 text-center">
                <div className="flex flex-col gap-0.5">
                    <span className={`text-[9px] font-semibold ${metric.achievement_pct >= 100 ? 'text-green-600' : metric.achievement_pct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(metric.achievement_pct)}%
                    </span>
                    <ProgressBar value={metric.achievement_pct} />
                </div>
            </td>
            <td className={`p-1 text-center ${metric.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.gap > 0 ? '+' : ''}{metric.gap}
            </td>
            <td className="p-1 text-center text-gray-500">{metric.prev_month}</td>
            <td className={`p-1 text-center ${metric.mom_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.mom_growth > 0 ? '+' : ''}{Math.round(metric.mom_growth)}%
            </td>
            <td className={`p-1 text-center ${metric.gap_mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.gap_mom > 0 ? '+' : ''}{metric.gap_mom}
            </td>
            {/* Revenue */}
            <td className="p-1 text-center text-green-700 font-semibold">{formatCurrency(metric.revenue_actual)}</td>
            <td className="p-1 text-center">
                <span className={`text-[9px] font-semibold ${metric.revenue_ach_pct >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.round(metric.revenue_ach_pct)}%
                </span>
            </td>
        </>
    );
});

// ===========================================
// D2C SUMMARY TABLE COMPONENT
// ===========================================
interface D2CSummaryTableProps {
    data: D2CSummaryRow[];
    title: string;
    icon: React.ReactNode;
}

const D2CSummaryTable: React.FC<D2CSummaryTableProps> = ({ data, title, icon }) => {
    const [expanded, setExpanded] = useState(true);

    const calculateTotal = (row: D2CSummaryRow): D2CMetric => {
        const metrics = D2C_PRODUCTS.map(p => row.products[p.id]).filter(Boolean);
        const target = metrics.reduce((sum, m) => sum + m.target, 0);
        const actual = metrics.reduce((sum, m) => sum + m.actual, 0);
        const prev = metrics.reduce((sum, m) => sum + m.prev_month, 0);
        const revTarget = metrics.reduce((sum, m) => sum + m.revenue_target, 0);
        const revActual = metrics.reduce((sum, m) => sum + m.revenue_actual, 0);
        return {
            target, actual,
            achievement_pct: target > 0 ? (actual / target) * 100 : 0,
            gap: actual - target, prev_month: prev,
            mom_growth: prev > 0 ? ((actual - prev) / prev) * 100 : 0,
            gap_mom: actual - prev,
            revenue_target: revTarget, revenue_actual: revActual,
            revenue_ach_pct: revTarget > 0 ? (revActual / revTarget) * 100 : 0,
        };
    };

    const metricColSpan = 9; // Tgt, Act, Ach%, Gap, M-1, MoM, GapMoM, Rev, RevAch%
    const isSalesforceTable = title.includes('Salesforce');

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                    <span className="text-xs text-gray-500">({data.length} items)</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); exportD2CSummary(data as unknown as Record<string, unknown>[], D2C_PRODUCTS.map(p => ({ id: p.id, name: p.name })), title.includes('TAP') ? 'TAP' : 'SF'); }}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                        <Download size={12} />
                        Export
                    </button>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {expanded && (
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-[10px] border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-20 bg-[#2c4a6a]">
                            {/* Level 1: Product Groups */}
                            <tr>
                                <th className="p-2 border-b border-r min-w-[150px] sticky left-0 bg-gray-100 z-30">Nama</th>
                                {!isSalesforceTable && <th className="p-2 border-b border-r text-center">SF</th>}
                                <th colSpan={metricColSpan} className="p-2 border-b border-l-2 text-center bg-slate-200 border-gray-400">TOTAL</th>
                                {D2C_PRODUCTS.map(product => {
                                    const category = (product as any).category || 'd2c';
                                    const colorClass =
                                        category === 'perdana' ? 'bg-red-100 text-red-800 border-red-300' :
                                            category === 'voucher' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                product.id === 'orbit' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                    product.id === 'nomor_special' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                                        'bg-teal-100 text-teal-800 border-teal-300';
                                    return (
                                        <th key={product.id} colSpan={metricColSpan}
                                            className={`p-2 border-b border-l-2 text-center ${colorClass}`}>
                                            {product.name}
                                        </th>
                                    );
                                })}
                            </tr>
                            {/* Level 2: Metric Headers */}
                            <tr className="bg-gray-50 text-gray-500">
                                <th className="p-1 border-b border-r sticky left-0 bg-gray-50 z-30"></th>
                                {!isSalesforceTable && <th className="p-1 border-b border-r"></th>}
                                {['total', ...D2C_PRODUCTS.map(p => p.id)].map((productId, idx) => (
                                    <React.Fragment key={productId}>
                                        <th className={`p-1 border-b text-center ${idx === 0 ? 'border-l-2' : 'border-l'}`}>Tgt</th>
                                        <th className="p-1 border-b text-center">Act</th>
                                        <th className="p-1 border-b text-center">Ach%</th>
                                        <th className="p-1 border-b text-center">Gap</th>
                                        <th className="p-1 border-b text-center bg-amber-50">M-1</th>
                                        <th className="p-1 border-b text-center bg-amber-50">MoM</th>
                                        <th className="p-1 border-b text-center bg-amber-50">G.MoM</th>
                                        <th className="p-1 border-b text-center bg-green-50">Rev</th>
                                        <th className="p-1 border-b text-center bg-green-50">R.Ach%</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(row => {
                                const total = calculateTotal(row);
                                return (
                                    <tr key={row.name} className="hover:bg-gray-50 border-b">
                                        <td className="p-2 font-medium border-r sticky left-0 bg-white z-10">{row.name}</td>
                                        {!isSalesforceTable && <td className="p-2 text-center border-r text-gray-500">{row.sf_count || '-'}</td>}
                                        <MetricCell metric={total} />
                                        {D2C_PRODUCTS.map(product => (
                                            <MetricCell key={product.id} metric={row.products[product.id]} />
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ===========================================
// MAIN PAGE COMPONENT
// ===========================================
const PenjualanD2CPage: React.FC = () => {
    const [filters, setFilters] = useState<FilterState>({
        date: { start: '', end: '' }, month: new Date().getMonth() + 1, year: new Date().getFullYear(), tap: [], salesforce: [], kabupaten: [], flag: []
    });

    const dataUpdateTime = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Dynamic TAP options from actual data
    const availableTapOptions = useMemo(() => {
        const taps = new Set<string>();
        d2cTAPSummary.forEach(t => taps.add(t.name));
        return Array.from(taps).sort().map(t => ({ value: t, label: t }));
    }, []);

    // Dynamic SF options from actual data (cascading based on TAP filter)
    const availableSfOptions = useMemo(() => {
        let sfData = d2cSalesforceData;
        if (filters.tap && filters.tap.length > 0) {
            sfData = sfData.filter(sf => filters.tap.includes(sf.tap_name));
        }
        const sfs = new Set<string>();
        sfData.forEach(sf => sfs.add(sf.salesforce_name));
        return Array.from(sfs).sort().map(sf => ({ value: sf, label: sf }));
    }, [filters.tap]);

    const filteredTAPSummary = useMemo(() => {
        if (!filters.tap || filters.tap.length === 0) return d2cTAPSummary;
        return d2cTAPSummary.filter(t => filters.tap!.includes(t.name));
    }, [filters.tap]);

    const filteredSFSummary = useMemo(() => {
        let result = d2cSFSummary;

        // Filter by TAP (need to match SF to TAP via d2cSalesforceData)
        if (filters.tap && filters.tap.length > 0) {
            const sfsInTap = new Set(
                d2cSalesforceData.filter(sf => filters.tap.includes(sf.tap_name)).map(sf => sf.salesforce_name)
            );
            result = result.filter(s => sfsInTap.has(s.name));
        }

        // Filter by SF directly
        if (filters.salesforce && filters.salesforce.length > 0) {
            result = result.filter(s => filters.salesforce!.includes(s.name));
        }

        return result;
    }, [filters.tap, filters.salesforce]);

    // Summary card data - use filtered data when SF is selected, else TAP summary
    const summaryCardData = useMemo(() => {
        if (filters.salesforce && filters.salesforce.length > 0) {
            return filteredSFSummary;
        }
        return filteredTAPSummary;
    }, [filteredTAPSummary, filteredSFSummary, filters.salesforce]);

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Penjualan D2C" subtitle="Direct to Consumer Sales - Tanpa outlet fisik" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
                <span className="ml-4 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                    <Users size={12} />
                    Direct Sales
                </span>
            </div>

            <FilterBar
                onFilterChange={setFilters}
                useMonthPicker={true}
                className="mt-4"
                tapOptions={availableTapOptions}
                salesforceOptions={availableSfOptions}
            />

            {/* D2C Summary Card */}
            <D2CSummaryCard data={summaryCardData} />

            <Card padding="none" className="mt-4 p-4">
                <D2CSummaryTable data={filteredTAPSummary} title="Summary per TAP" icon={<MapPin size={16} className="text-blue-600" />} />
                <D2CSummaryTable data={filteredSFSummary} title="Summary per Salesforce" icon={<User size={16} className="text-green-600" />} />
            </Card>
        </div>
    );
};

export default PenjualanD2CPage;
