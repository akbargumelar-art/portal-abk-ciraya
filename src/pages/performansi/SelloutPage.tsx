/**
 * Sellout Performance Page
 * 
 * Revenue & Quantity metrics for Simpati and byU products - Sellout
 * Features: View Switcher (Revenue/Quantity), Daily Trend Chart, Kabupaten Summary
 */

import React, { useState, memo } from 'react';
import {
    Clock, Calendar, TrendingUp, TrendingDown, Target, DollarSign,
    Package, BarChart3, ChevronDown, ChevronUp, MapPin, Filter
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui';
import { aktifasiData as selloutData } from '../../services/mock/aktifasiData';
import type { AreaSummary, MetricSet, MetricMode } from '../../types/aktifasi';

// ===========================================
// HELPERS
// ===========================================
const getMonthName = (month: number): string => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1] || '';
};

const formatValue = (value: number, isRevenue: boolean): string => {
    if (isRevenue) {
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)} M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
        return value.toLocaleString();
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
};

const formatPct = (value: number): string => `${value.toFixed(1)}%`;

const calcAchPct = (actual: number, target: number): number =>
    target > 0 ? (actual / target) * 100 : 0;

const calcGrowth = (current: number, previous: number): number =>
    previous > 0 ? ((current - previous) / previous) * 100 : 0;

const getAchColor = (pct: number): string =>
    pct >= 100 ? 'text-green-600' : pct >= 90 ? 'text-yellow-600' : 'text-red-600';

const getAchBgColor = (pct: number): string =>
    pct >= 100 ? 'bg-green-100' : pct >= 90 ? 'bg-yellow-100' : 'bg-red-100';

const getGrowthColor = (pct: number): string =>
    pct >= 0 ? 'text-green-600' : 'text-red-600';

// ===========================================
// SUMMARY CARDS COMPONENT
// ===========================================
const SummaryCards: React.FC<{ data: AreaSummary[], isRevenue: boolean }> = memo(({ data, isRevenue }) => {
    const totalRow = data.find(d => d.area_name === 'TOTAL');
    if (!totalRow) return null;

    const simpatiAch = calcAchPct(totalRow.simpati.actual, totalRow.simpati.target);
    const byuAch = calcAchPct(totalRow.byu.actual, totalRow.byu.target);
    const totalAch = calcAchPct(totalRow.total.actual, totalRow.total.target);
    const totalMoM = calcGrowth(totalRow.total.actual, totalRow.total.lmsd);

    const cards = [
        {
            title: 'Total Achievement',
            icon: Target,
            iconColor: 'text-blue-500',
            value: formatPct(totalAch),
            valueColor: getAchColor(totalAch),
            sub1: `Actual: ${formatValue(totalRow.total.actual, isRevenue)}`,
            sub2: `Target: ${formatValue(totalRow.total.target, isRevenue)}`,
            bg: getAchBgColor(totalAch),
        },
        {
            title: 'Simpati Achievement',
            icon: isRevenue ? DollarSign : Package,
            iconColor: 'text-red-500',
            value: formatPct(simpatiAch),
            valueColor: getAchColor(simpatiAch),
            sub1: `Actual: ${formatValue(totalRow.simpati.actual, isRevenue)}`,
            sub2: `Target: ${formatValue(totalRow.simpati.target, isRevenue)}`,
            bg: 'bg-red-50',
        },
        {
            title: 'byU Achievement',
            icon: isRevenue ? DollarSign : Package,
            iconColor: 'text-purple-500',
            value: formatPct(byuAch),
            valueColor: getAchColor(byuAch),
            sub1: `Actual: ${formatValue(totalRow.byu.actual, isRevenue)}`,
            sub2: `Target: ${formatValue(totalRow.byu.target, isRevenue)}`,
            bg: 'bg-purple-50',
        },
        {
            title: 'MoM Growth',
            icon: totalMoM >= 0 ? TrendingUp : TrendingDown,
            iconColor: totalMoM >= 0 ? 'text-green-500' : 'text-red-500',
            value: `${totalMoM >= 0 ? '+' : ''}${formatPct(totalMoM)}`,
            valueColor: getGrowthColor(totalMoM),
            sub1: `Current: ${formatValue(totalRow.total.actual, isRevenue)}`,
            sub2: `LMSD: ${formatValue(totalRow.total.lmsd, isRevenue)}`,
            bg: totalMoM >= 0 ? 'bg-green-50' : 'bg-red-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className={`${card.bg} rounded-xl p-4 border border-gray-100`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon size={16} className={card.iconColor} />
                            <span className="text-xs text-gray-700 font-medium">{card.title}</span>
                        </div>
                        <div className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{card.sub1}</div>
                        <div className="text-[10px] text-gray-400">{card.sub2}</div>
                    </div>
                );
            })}
        </div>
    );
});

// ===========================================
// AREA SUMMARY TABLE COMPONENT
// ===========================================
const AreaSummaryTable: React.FC<{ data: AreaSummary[], isRevenue: boolean, showCommit: boolean }> = memo(({ data, isRevenue, showCommit }) => {
    const [expanded, setExpanded] = useState(true);

    const renderMetricCells = (metric: MetricSet, _label: string) => {
        const achTarget = calcAchPct(metric.actual, metric.target);
        const achCommit = calcAchPct(metric.actual, metric.target_commit);
        const momGrowth = calcGrowth(metric.actual, metric.lmsd);
        const gapTarget = metric.actual - metric.target;
        const gapCommit = metric.actual - metric.target_commit;

        return (
            <>
                <td className="p-2 border text-center">{formatValue(metric.target, isRevenue)}</td>
                <td className="p-2 border text-center font-semibold text-blue-700">{formatValue(metric.actual, isRevenue)}</td>
                <td className={`p-2 border text-center font-semibold ${getAchColor(achTarget)} ${getAchBgColor(achTarget)}`}>{formatPct(achTarget)}</td>
                <td className={`p-2 border text-center text-xs ${gapTarget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gapTarget >= 0 ? '+' : ''}{formatValue(gapTarget, isRevenue)}
                </td>
                {showCommit && (
                    <>
                        <td className="p-2 border text-center bg-amber-50/50">{formatValue(metric.target_commit, isRevenue)}</td>
                        <td className={`p-2 border text-center font-semibold bg-amber-50/50 ${getAchColor(achCommit)}`}>{formatPct(achCommit)}</td>
                        <td className={`p-2 border text-center text-xs bg-amber-50/50 ${gapCommit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gapCommit >= 0 ? '+' : ''}{formatValue(gapCommit, isRevenue)}
                        </td>
                    </>
                )}
                <td className="p-2 border text-center text-gray-500">{formatValue(metric.lmsd, isRevenue)}</td>
                <td className={`p-2 border text-center font-semibold ${getGrowthColor(momGrowth)}`}>
                    {momGrowth >= 0 ? '+' : ''}{formatPct(momGrowth)}
                </td>
            </>
        );
    };

    // Dynamic header columns based on showCommit
    const headerCols = showCommit
        ? ['Target', 'Actual', '%Ach', 'Gap', 'Commit', '%Ach C', 'Gap C', 'LMSD', 'MoM']
        : ['Target', 'Actual', '%Ach', 'Gap', 'LMSD', 'MoM'];

    const colCount = headerCols.length;

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="font-semibold text-gray-800 text-sm">Summary per Kabupaten</span>
                    <span className="text-xs text-gray-500">({data.length} kabupaten)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto">
                    <table className="data-table data-table-compact whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                            <tr>
                                <th rowSpan={2} className="p-2 border min-w-[100px] sticky left-0 bg-[#2c4a6a] z-20 font-semibold text-white">Kabupaten</th>
                                <th colSpan={colCount} className="p-2 border text-center bg-red-700 font-semibold text-white">Simpati</th>
                                <th colSpan={colCount} className="p-2 border text-center bg-purple-700 font-semibold text-white">byU</th>
                                <th colSpan={colCount} className="p-2 border text-center bg-blue-700 font-semibold text-white">Total</th>
                            </tr>
                            <tr className="bg-[#3d5f85] text-white">
                                {/* Simpati */}
                                {headerCols.map(col => <th key={`s-${col}`} className="p-1.5 border border-gray-600 text-center">{col}</th>)}
                                {/* byU */}
                                {headerCols.map(col => <th key={`b-${col}`} className="p-1.5 border border-gray-600 text-center">{col}</th>)}
                                {/* Total */}
                                {headerCols.map(col => <th key={`t-${col}`} className="p-1.5 border border-gray-600 text-center">{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => {
                                const isTotal = row.area_name === 'TOTAL';
                                const rowBg = isTotal ? 'bg-slate-100 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                const stickyBg = isTotal ? 'bg-slate-100' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                                return (
                                    <tr key={row.area_name} className={`${rowBg} hover:bg-blue-50 border-b`}>
                                        <td className={`p-2 border sticky left-0 z-10 ${stickyBg} font-medium text-gray-800`}>{row.area_name}</td>
                                        {renderMetricCells(row.simpati, 'Simpati')}
                                        {renderMetricCells(row.byu, 'byU')}
                                        {renderMetricCells(row.total, 'Total')}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

// ===========================================
// DAILY TREND CHART & TABLE COMPONENT
// ===========================================
const DailyTrendChart: React.FC<{ areaFilter: string, isRevenue: boolean }> = memo(({ areaFilter, isRevenue }) => {
    const trendData = isRevenue ? selloutData.dailyTrendRevenue : selloutData.dailyTrendQuantity;
    const data = trendData[areaFilter] || [];
    const [showTable, setShowTable] = useState(true);

    // Prepare chart data
    const chartData = data.map(d => ({
        day: d.day,
        'Simpati (Current)': d.simpati.current,
        'Simpati (M-1)': d.simpati.last_month,
        'byU (Current)': d.byu.current,
        'byU (M-1)': d.byu.last_month,
        'Total (Current)': d.total.current,
        'Total (M-1)': d.total.last_month,
    }));

    // Calculate cumulative totals for the summary row
    const cumulative = data.reduce((acc, d) => ({
        simpatiCurrent: acc.simpatiCurrent + d.simpati.current,
        simpatiM1: acc.simpatiM1 + d.simpati.last_month,
        byuCurrent: acc.byuCurrent + d.byu.current,
        byuM1: acc.byuM1 + d.byu.last_month,
        totalCurrent: acc.totalCurrent + d.total.current,
        totalM1: acc.totalM1 + d.total.last_month,
    }), { simpatiCurrent: 0, simpatiM1: 0, byuCurrent: 0, byuM1: 0, totalCurrent: 0, totalM1: 0 });

    // Calculate MoM and Gap
    const calcMoM = (current: number, m1: number) => m1 > 0 ? ((current - m1) / m1) * 100 : 0;
    const calcGap = (current: number, m1: number) => current - m1;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Pencapaian Harian - {areaFilter}</h3>
                    <p className="text-xs text-gray-500">
                        {isRevenue ? 'Revenue' : 'Quantity'}: Bulan Berjalan vs Bulan Lalu (M-1)
                    </p>
                </div>
                <button
                    onClick={() => setShowTable(!showTable)}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                    {showTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-100">
                {/* Simpati Summary */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="text-xs font-semibold text-red-700 mb-2">Simpati</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                            <div className="text-gray-500">M-1</div>
                            <div className="font-bold text-gray-700">{formatValue(cumulative.simpatiM1, isRevenue)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Current</div>
                            <div className="font-bold text-blue-700">{formatValue(cumulative.simpatiCurrent, isRevenue)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">MoM %</div>
                            <div className={`font-bold ${calcMoM(cumulative.simpatiCurrent, cumulative.simpatiM1) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calcMoM(cumulative.simpatiCurrent, cumulative.simpatiM1) >= 0 ? '+' : ''}{calcMoM(cumulative.simpatiCurrent, cumulative.simpatiM1).toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Gap</div>
                            <div className={`font-bold ${calcGap(cumulative.simpatiCurrent, cumulative.simpatiM1) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calcGap(cumulative.simpatiCurrent, cumulative.simpatiM1) >= 0 ? '+' : ''}{formatValue(calcGap(cumulative.simpatiCurrent, cumulative.simpatiM1), isRevenue)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* byU Summary */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="text-xs font-semibold text-purple-700 mb-2">byU</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                            <div className="text-gray-500">M-1</div>
                            <div className="font-bold text-gray-700">{formatValue(cumulative.byuM1, isRevenue)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Current</div>
                            <div className="font-bold text-blue-700">{formatValue(cumulative.byuCurrent, isRevenue)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">MoM %</div>
                            <div className={`font-bold ${calcMoM(cumulative.byuCurrent, cumulative.byuM1) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calcMoM(cumulative.byuCurrent, cumulative.byuM1) >= 0 ? '+' : ''}{calcMoM(cumulative.byuCurrent, cumulative.byuM1).toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Gap</div>
                            <div className={`font-bold ${calcGap(cumulative.byuCurrent, cumulative.byuM1) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calcGap(cumulative.byuCurrent, cumulative.byuM1) >= 0 ? '+' : ''}{formatValue(calcGap(cumulative.byuCurrent, cumulative.byuM1), isRevenue)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-700 mb-2">Total</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                            <div className="text-gray-500">M-1</div>
                            <div className="font-bold text-gray-700">{formatValue(cumulative.totalM1, isRevenue)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Current</div>
                            <div className="font-bold text-blue-700">{formatValue(cumulative.totalCurrent, isRevenue)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">MoM %</div>
                            <div className={`font-bold ${calcMoM(cumulative.totalCurrent, cumulative.totalM1) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calcMoM(cumulative.totalCurrent, cumulative.totalM1) >= 0 ? '+' : ''}{calcMoM(cumulative.totalCurrent, cumulative.totalM1).toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Gap</div>
                            <div className={`font-bold ${calcGap(cumulative.totalCurrent, cumulative.totalM1) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calcGap(cumulative.totalCurrent, cumulative.totalM1) >= 0 ? '+' : ''}{formatValue(calcGap(cumulative.totalCurrent, cumulative.totalM1), isRevenue)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Table */}
            {showTable && (
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="data-table data-table-compact">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                            <tr>
                                <th rowSpan={2} className="p-1.5 border text-center font-semibold min-w-[40px]">Tgl</th>
                                <th colSpan={4} className="p-1.5 border text-center bg-red-100 font-semibold">Simpati</th>
                                <th colSpan={4} className="p-1.5 border text-center bg-purple-100 font-semibold">byU</th>
                                <th colSpan={4} className="p-1.5 border text-center bg-blue-100 font-semibold">Total</th>
                            </tr>
                            <tr className="bg-[#3d5f85]">
                                <th className="p-1 border text-center bg-red-50">M-1</th>
                                <th className="p-1 border text-center bg-red-50">Curr</th>
                                <th className="p-1 border text-center bg-red-50">MoM%</th>
                                <th className="p-1 border text-center bg-red-50">Gap</th>
                                <th className="p-1 border text-center bg-purple-50">M-1</th>
                                <th className="p-1 border text-center bg-purple-50">Curr</th>
                                <th className="p-1 border text-center bg-purple-50">MoM%</th>
                                <th className="p-1 border text-center bg-purple-50">Gap</th>
                                <th className="p-1 border text-center bg-blue-50">M-1</th>
                                <th className="p-1 border text-center bg-blue-50">Curr</th>
                                <th className="p-1 border text-center bg-blue-50">MoM%</th>
                                <th className="p-1 border text-center bg-blue-50">Gap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d, idx) => {
                                // Calculate cumulative sums from day 1 to current day
                                const cumulativeData = data.slice(0, idx + 1).reduce((acc, item) => ({
                                    simpatiCurrent: acc.simpatiCurrent + item.simpati.current,
                                    simpatiM1: acc.simpatiM1 + item.simpati.last_month,
                                    byuCurrent: acc.byuCurrent + item.byu.current,
                                    byuM1: acc.byuM1 + item.byu.last_month,
                                    totalCurrent: acc.totalCurrent + item.total.current,
                                    totalM1: acc.totalM1 + item.total.last_month,
                                }), { simpatiCurrent: 0, simpatiM1: 0, byuCurrent: 0, byuM1: 0, totalCurrent: 0, totalM1: 0 });

                                const simpatiMoM = calcMoM(cumulativeData.simpatiCurrent, cumulativeData.simpatiM1);
                                const simpatiGap = calcGap(cumulativeData.simpatiCurrent, cumulativeData.simpatiM1);
                                const byuMoM = calcMoM(cumulativeData.byuCurrent, cumulativeData.byuM1);
                                const byuGap = calcGap(cumulativeData.byuCurrent, cumulativeData.byuM1);
                                const totalMoM = calcMoM(cumulativeData.totalCurrent, cumulativeData.totalM1);
                                const totalGap = calcGap(cumulativeData.totalCurrent, cumulativeData.totalM1);
                                const isFuture = d.simpati.current === 0 && d.byu.current === 0;

                                return (
                                    <tr key={d.day} className={`${isFuture ? 'bg-gray-50 text-gray-400' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50`}>
                                        <td className="p-1 border text-center font-medium">{d.day}</td>
                                        {/* Simpati - M-1 & Current per-day, MoM% & Gap cumulative */}
                                        <td className="p-1 border text-center">{formatValue(d.simpati.last_month, isRevenue)}</td>
                                        <td className="p-1 border text-center font-semibold text-blue-700">{formatValue(d.simpati.current, isRevenue)}</td>
                                        <td className={`p-1 border text-center font-semibold ${simpatiMoM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFuture ? '-' : `${simpatiMoM >= 0 ? '+' : ''}${simpatiMoM.toFixed(0)}%`}
                                        </td>
                                        <td className={`p-1 border text-center ${simpatiGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFuture ? '-' : formatValue(simpatiGap, isRevenue)}
                                        </td>
                                        {/* byU - M-1 & Current per-day, MoM% & Gap cumulative */}
                                        <td className="p-1 border text-center">{formatValue(d.byu.last_month, isRevenue)}</td>
                                        <td className="p-1 border text-center font-semibold text-blue-700">{formatValue(d.byu.current, isRevenue)}</td>
                                        <td className={`p-1 border text-center font-semibold ${byuMoM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFuture ? '-' : `${byuMoM >= 0 ? '+' : ''}${byuMoM.toFixed(0)}%`}
                                        </td>
                                        <td className={`p-1 border text-center ${byuGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFuture ? '-' : formatValue(byuGap, isRevenue)}
                                        </td>
                                        {/* Total - M-1 & Current per-day, MoM% & Gap cumulative */}
                                        <td className="p-1 border text-center">{formatValue(d.total.last_month, isRevenue)}</td>
                                        <td className="p-1 border text-center font-semibold text-blue-700">{formatValue(d.total.current, isRevenue)}</td>
                                        <td className={`p-1 border text-center font-semibold ${totalMoM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFuture ? '-' : `${totalMoM >= 0 ? '+' : ''}${totalMoM.toFixed(0)}%`}
                                        </td>
                                        <td className={`p-1 border text-center ${totalGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {isFuture ? '-' : formatValue(totalGap, isRevenue)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Chart */}
            <div className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => isRevenue ? `${(v / 1000).toFixed(0)}K` : v.toLocaleString()} />
                        <Tooltip
                            formatter={(value: number | undefined) => [value !== undefined ? (isRevenue ? formatValue(value, true) : value.toLocaleString()) : '-', '']}
                            labelFormatter={(label) => `Day ${label}`}
                            contentStyle={{ fontSize: 11 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="Total (Current)" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Total (M-1)" stroke="#93C5FD" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                        <Line type="monotone" dataKey="Simpati (Current)" stroke="#EF4444" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="byU (Current)" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

// ===========================================
// MAIN PAGE COMPONENT
// ===========================================
const SelloutPage: React.FC = () => {
    const [metricMode, setMetricMode] = useState<MetricMode>('REVENUE');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [areaFilter, setAreaFilter] = useState('TOTAL');
    const [showCommit, setShowCommit] = useState(false);

    const isRevenue = metricMode === 'REVENUE';
    const summaryData = isRevenue ? selloutData.revenue : selloutData.quantity;

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const areaOptions = ['TOTAL', 'Cirebon', 'Kota Cirebon', 'Kuningan'];

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Performansi Sellout" subtitle="Revenue & Quantity Monitoring - Simpati & byU" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Controls */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Metric Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">View:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setMetricMode('REVENUE')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${metricMode === 'REVENUE'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-white hover:text-gray-800'
                                    }`}
                            >
                                <DollarSign size={14} />
                                Revenue (Rp)
                            </button>
                            <button
                                onClick={() => setMetricMode('QUANTITY')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${metricMode === 'QUANTITY'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-white hover:text-gray-800'
                                    }`}
                            >
                                <Package size={14} />
                                Quantity (Unit)
                            </button>
                        </div>
                    </div>

                    {/* Target Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Data:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setShowCommit(false)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!showCommit
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-white hover:text-gray-800'
                                    }`}
                            >
                                Target Only
                            </button>
                            <button
                                onClick={() => setShowCommit(true)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${showCommit
                                    ? 'bg-white text-amber-600 shadow-sm'
                                    : 'text-white hover:text-gray-800'
                                    }`}
                            >
                                + Komitmen
                            </button>
                        </div>
                    </div>

                    {/* Period & Area Filter */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Periode:</span>
                        </div>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>{getMonthName(m)}</option>))}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                            {[2024, 2025, 2026].map(y => (<option key={y} value={y}>{y}</option>))}
                        </select>
                        <div className="border-l border-gray-300 h-6 mx-2" />
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Daily Area:</span>
                        </div>
                        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                            {areaOptions.map(a => (<option key={a} value={a}>{a}</option>))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mt-4">
                <SummaryCards data={summaryData} isRevenue={isRevenue} />
            </div>

            {/* Daily Trend Chart */}
            <DailyTrendChart areaFilter={areaFilter} isRevenue={isRevenue} />

            <Card padding="none" className="mt-4 p-4">
                <AreaSummaryTable data={summaryData} isRevenue={isRevenue} showCommit={showCommit} />
            </Card>
        </div>
    );
};

export default SelloutPage;
