/**
 * 5S & 4R Performance Page - Single Page View
 * 
 * High-density data tables with summary cards (no tabs)
 */

import React, { useMemo, memo } from 'react';
import {
    Clock, Calendar, TrendingUp, TrendingDown, Target, Award, AlertCircle,
    BarChart3, Users, DollarSign, Store, ChevronDown, ChevronUp
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui';
import { fiveSData, fourRData } from '../../services/mock/fives4rData';
import type { FiveSData, FourRData } from '../../types/fives4r';
import { useState } from 'react';

// ===========================================
// HELPERS
// ===========================================
const getMonthName = (month: number): string => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1] || '';
};

const formatNum = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
};

const formatPct = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    return `${value}%`;
};

const formatBn = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    return value.toFixed(2);
};

const getMoMColor = (value: number): string =>
    value >= 0 ? 'text-green-600' : 'text-red-600';

const getAchColor = (value: number): string =>
    value >= 100 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600';

const getAchBgColor = (value: number): string =>
    value >= 100 ? 'bg-green-50' : value >= 90 ? 'bg-yellow-50' : 'bg-red-50';

// ===========================================
// SUMMARY CARDS COMPONENT
// ===========================================
const SummaryCards: React.FC<{ data5S: FiveSData[], data4R: FourRData[] }> = memo(({ data5S, data4R }) => {
    const stats = useMemo(() => {
        // Find CLUSTER TOTAL row
        const total5S = data5S.find(d => d.tap_name === 'CLUSTER TOTAL') || data5S[0];
        const total4R = data4R.find(d => d.tap_name === 'CLUSTER TOTAL') || data4R[0];

        // Find best/worst performers (exclude CLUSTER TOTAL)
        const tapData5S = data5S.filter(d => d.tap_name !== 'CLUSTER TOTAL');
        const tapData4R = data4R.filter(d => d.tap_name !== 'CLUSTER TOTAL');

        let bestSO = { name: '', ach: -Infinity };
        let worstSO = { name: '', ach: Infinity };
        let bestCov = { name: '', rate: -Infinity };
        let worstCov = { name: '', rate: Infinity };

        tapData5S.forEach(t => {
            if (t.so_ach_pct > bestSO.ach) bestSO = { name: t.tap_name, ach: t.so_ach_pct };
            if (t.so_ach_pct < worstSO.ach) worstSO = { name: t.tap_name, ach: t.so_ach_pct };
        });

        tapData4R.forEach(t => {
            if (t.rate_to_register > bestCov.rate) bestCov = { name: t.tap_name, rate: t.rate_to_register };
            if (t.rate_to_register < worstCov.rate) worstCov = { name: t.tap_name, rate: t.rate_to_register };
        });

        return {
            // 5S Metrics
            soActual: total5S?.so_actual || 0,
            soTarget: total5S?.so_target || 0,
            soAchPct: total5S?.so_ach_pct || 0,
            soMoM: total5S?.so_mom_pct || 0,
            stActual: total5S?.st_actual || 0,
            saActual: total5S?.sa_actual || 0,
            totalRevenue: (total5S?.rev_ns_actual || 0) + (total5S?.rev_sa_actual || 0) + (total5S?.rev_so_actual || 0),
            revMoM: total5S?.rev_so_mom_pct || 0,
            // 4R Metrics
            totalRegister: total4R?.register || 0,
            pjpActual: total4R?.pjp_fisik_actual || 0,
            coverageRate: total4R?.rate_to_register || 0,
            covMoM: total4R?.cov_mom_pct || 0,
            oaSpActual: total4R?.oa_sp_actual || 0,
            opSpActual: total4R?.op_sp_actual || 0,
            // Best/Worst
            bestSO, worstSO, bestCov, worstCov,
        };
    }, [data5S, data4R]);

    const cards = [
        {
            title: 'Sell Out Achievement',
            icon: Target,
            iconColor: 'text-blue-500',
            value: `${stats.soAchPct}%`,
            valueColor: stats.soAchPct >= 100 ? 'text-green-600' : 'text-blue-600',
            sub1: `Actual: ${formatNum(stats.soActual)}`,
            sub2: `Target: ${formatNum(stats.soTarget)}`,
            progress: stats.soAchPct,
            progressColor: stats.soAchPct >= 100 ? 'bg-green-500' : 'bg-blue-500',
        },
        {
            title: 'SO Growth (MoM)',
            icon: stats.soMoM >= 0 ? TrendingUp : TrendingDown,
            iconColor: stats.soMoM >= 0 ? 'text-green-500' : 'text-red-500',
            value: `${stats.soMoM >= 0 ? '+' : ''}${stats.soMoM}%`,
            valueColor: stats.soMoM >= 0 ? 'text-green-600' : 'text-red-600',
            sub1: `SA: ${formatNum(stats.saActual)}`,
            sub2: `ST: ${formatNum(stats.stActual)}`,
        },
        {
            title: 'Total Revenue (Bn)',
            icon: DollarSign,
            iconColor: 'text-green-500',
            value: formatBn(stats.totalRevenue),
            valueColor: 'text-green-600',
            sub1: `MoM: ${stats.revMoM >= 0 ? '+' : ''}${stats.revMoM}%`,
            sub2: `Rev NS + SA + SO`,
        },
        {
            title: 'RS Coverage',
            icon: Store,
            iconColor: 'text-purple-500',
            value: `${stats.coverageRate}%`,
            valueColor: stats.coverageRate >= 80 ? 'text-green-600' : 'text-orange-600',
            sub1: `PJP: ${formatNum(stats.pjpActual)}`,
            sub2: `Register: ${formatNum(stats.totalRegister)}`,
            progress: stats.coverageRate,
            progressColor: stats.coverageRate >= 80 ? 'bg-green-500' : 'bg-orange-500',
        },
        {
            title: 'Outlet Active SP',
            icon: Users,
            iconColor: 'text-indigo-500',
            value: formatNum(stats.oaSpActual),
            valueColor: 'text-indigo-600',
            sub1: `OP SP: ${formatNum(stats.opSpActual)}`,
            sub2: `Rate: ${stats.oaSpActual > 0 ? Math.round((stats.opSpActual / stats.oaSpActual) * 100) : 0}%`,
        },
        {
            title: 'Top SO Performer',
            icon: Award,
            iconColor: 'text-yellow-500',
            value: stats.bestSO.name.replace('TAP ', ''),
            valueColor: 'text-gray-800',
            sub1: `Achievement: ${stats.bestSO.ach}%`,
            sub2: '',
            highlight: true,
        },
        {
            title: 'Top Coverage',
            icon: Award,
            iconColor: 'text-teal-500',
            value: stats.bestCov.name.replace('TAP ', ''),
            valueColor: 'text-gray-800',
            sub1: `Rate: ${stats.bestCov.rate}%`,
            sub2: '',
            highlight: true,
        },
        {
            title: 'Perlu Perhatian',
            icon: AlertCircle,
            iconColor: 'text-red-500',
            value: stats.worstSO.name.replace('TAP ', ''),
            valueColor: 'text-gray-800',
            sub1: `SO Ach: ${stats.worstSO.ach}%`,
            sub2: `Cov: ${stats.worstCov.rate}%`,
            warning: true,
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="bg-slate-600 px-4 py-2">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-white/80" />
                    <span className="text-white font-medium text-sm">Ringkasan Performa 5S & 4R</span>
                </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className={`rounded-lg p-2.5 border ${card.warning ? 'bg-red-50 border-red-200' : card.highlight ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-1 mb-1">
                                <Icon size={12} className={card.iconColor} />
                                <span className="text-[10px] text-gray-500 truncate">{card.title}</span>
                            </div>
                            <div className={`text-lg font-bold ${card.valueColor} truncate`}>{card.value}</div>
                            {card.progress !== undefined && (
                                <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                    <div className={`h-full ${card.progressColor}`} style={{ width: `${Math.min(card.progress, 100)}%` }} />
                                </div>
                            )}
                            <div className="text-[9px] text-gray-500 mt-1">{card.sub1}</div>
                            {card.sub2 && <div className="text-[9px] text-gray-400">{card.sub2}</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

// ===========================================
// 5S TABLE COMPONENT
// ===========================================
const FiveSTable: React.FC<{ data: FiveSData[] }> = memo(({ data }) => {
    const [expanded, setExpanded] = useState(true);

    const headerGroups = [
        { label: 'SA (Trx)', cols: 5, color: 'bg-slate-500' },
        { label: 'ST (Trx)', cols: 6, color: 'bg-slate-600' },
        { label: 'SO (Trx)', cols: 8, color: 'bg-slate-600' },
        { label: 'Ratio', cols: 4, color: 'bg-slate-500' },
        { label: 'Sales Renewal', cols: 4, color: 'bg-teal-700/80' },
        { label: 'Rev New Sales (Bn)', cols: 5, color: 'bg-emerald-700/80' },
        { label: 'Rev SA (Bn)', cols: 3, color: 'bg-cyan-700/80' },
        { label: 'Rev SO (Bn)', cols: 5, color: 'bg-rose-700/80' },
    ];

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-blue-600" />
                    <span className="font-semibold text-gray-800 text-sm">5S Performance Metrics</span>
                    <span className="text-xs text-gray-500">(SA → ST → SO → Ratio → Revenue)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto">
                    <table className="data-table data-table-compact whitespace-nowrap">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-gray-100">
                                <th className="p-1.5 border border-gray-200 min-w-[100px] sticky left-0 bg-gray-100 z-30 text-left font-semibold">TAP</th>
                                {headerGroups.map(g => (
                                    <th key={g.label} colSpan={g.cols} className={`p-1.5 border border-gray-300 text-center text-white font-semibold ${g.color}`}>{g.label}</th>
                                ))}
                            </tr>
                            <tr className="bg-gray-50 text-gray-700">
                                <th className="p-1 border border-gray-200 sticky left-0 bg-gray-50 z-30"></th>
                                {/* SA */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Target</th><th className="p-1 border text-center bg-green-50">%Ach</th>
                                {/* ST */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center">Daily</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Target</th><th className="p-1 border text-center bg-green-50">%Ach</th>
                                {/* SO */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center">Daily</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Target</th><th className="p-1 border text-center bg-green-50">%Ach</th><th className="p-1 border text-center bg-slate-100">ST/SO</th><th className="p-1 border text-center bg-slate-100">SA/SO</th>
                                {/* Ratio */}
                                <th className="p-1 border text-center">Stock</th><th className="p-1 border text-center">Days</th><th className="p-1 border text-center">Dom%</th><th className="p-1 border text-center">Healthy%</th>
                                {/* Sales Renewal */}
                                <th className="p-1 border text-center">SR%</th><th className="p-1 border text-center">SO Qty</th><th className="p-1 border text-center">Renewal</th><th className="p-1 border text-center bg-amber-50">MoM</th>
                                {/* Rev NS */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Target</th><th className="p-1 border text-center bg-green-50">%Ach</th>
                                {/* Rev SA */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th>
                                {/* Rev SO */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Target</th><th className="p-1 border text-center bg-green-50">%Ach</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => {
                                const isTotal = row.tap_name === 'CLUSTER TOTAL';
                                const rowBg = isTotal ? 'bg-slate-100 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                const stickyBg = isTotal ? 'bg-slate-100' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                return (
                                    <tr key={row.tap_name} className={`${rowBg} hover:bg-slate-50 border-b`}>
                                        <td className={`p-1.5 border sticky left-0 z-10 ${stickyBg} font-medium text-gray-800`}>{row.tap_name}</td>
                                        {/* SA */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.sa_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-blue-700">{formatNum(row.sa_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.sa_mom_pct)}`}>{formatPct(row.sa_mom_pct)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.sa_target)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getAchColor(row.sa_ach_pct)} ${getAchBgColor(row.sa_ach_pct)}`}>{formatPct(row.sa_ach_pct)}</td>
                                        {/* ST */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.st_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-indigo-700">{formatNum(row.st_actual)}</td>
                                        <td className="p-1 border text-center text-white">{formatNum(row.st_daily)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.st_mom_pct)}`}>{formatPct(row.st_mom_pct)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.st_target)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getAchColor(row.st_ach_pct)} ${getAchBgColor(row.st_ach_pct)}`}>{formatPct(row.st_ach_pct)}</td>
                                        {/* SO */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.so_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-purple-700">{formatNum(row.so_actual)}</td>
                                        <td className="p-1 border text-center text-white">{formatNum(row.so_daily)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.so_mom_pct)}`}>{formatPct(row.so_mom_pct)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.so_target)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getAchColor(row.so_ach_pct)} ${getAchBgColor(row.so_ach_pct)}`}>{formatPct(row.so_ach_pct)}</td>
                                        <td className="p-1 border text-center bg-slate-50">{formatPct(row.ratio_st_so)}</td>
                                        <td className="p-1 border text-center bg-slate-50">{formatPct(row.ratio_sa_so)}</td>
                                        {/* Ratio */}
                                        <td className="p-1 border text-center">{formatNum(row.stock_qty)}</td>
                                        <td className="p-1 border text-center">{row.stock_days}</td>
                                        <td className="p-1 border text-center">{formatPct(row.cluster_domination)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.cluster_healthy)}</td>
                                        {/* Sales Renewal */}
                                        <td className="p-1 border text-center">{formatPct(row.sr_pct)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.so_qty)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.renewal_qty)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.renewal_mom_pct)}`}>{formatPct(row.renewal_mom_pct)}</td>
                                        {/* Rev NS */}
                                        <td className="p-1 border text-center text-gray-500">{formatBn(row.rev_ns_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-green-700">{formatBn(row.rev_ns_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.rev_ns_mom_pct)}`}>{formatPct(row.rev_ns_mom_pct)}</td>
                                        <td className="p-1 border text-center">{formatBn(row.rev_ns_target)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getAchColor(row.rev_ns_ach_pct)} ${getAchBgColor(row.rev_ns_ach_pct)}`}>{formatPct(row.rev_ns_ach_pct)}</td>
                                        {/* Rev SA */}
                                        <td className="p-1 border text-center text-gray-500">{formatBn(row.rev_sa_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-cyan-700">{formatBn(row.rev_sa_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.rev_sa_mom_pct)}`}>{formatPct(row.rev_sa_mom_pct)}</td>
                                        {/* Rev SO */}
                                        <td className="p-1 border text-center text-gray-500">{formatBn(row.rev_so_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-rose-700">{formatBn(row.rev_so_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.rev_so_mom_pct)}`}>{formatPct(row.rev_so_mom_pct)}</td>
                                        <td className="p-1 border text-center">{formatBn(row.rev_so_target)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getAchColor(row.rev_so_ach_pct)} ${getAchBgColor(row.rev_so_ach_pct)}`}>{formatPct(row.rev_so_ach_pct)}</td>
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
// 4R TABLE COMPONENT
// ===========================================
const FourRTable: React.FC<{ data: FourRData[] }> = memo(({ data }) => {
    const [expanded, setExpanded] = useState(true);

    const headerGroups = [
        { label: 'RS Coverage', cols: 5, color: 'bg-slate-500' },
        { label: 'RS ST-SP (OA)', cols: 6, color: 'bg-slate-600' },
        { label: 'RS ST-SP (OP)', cols: 4, color: 'bg-slate-600' },
        { label: 'RS ST PV (OA)', cols: 6, color: 'bg-teal-700/80' },
        { label: 'RS ST PV (OP)', cols: 4, color: 'bg-cyan-700/80' },
        { label: 'RS Omset', cols: 7, color: 'bg-rose-700/80' },
    ];

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100">
                <div className="flex items-center gap-2">
                    <Store size={16} className="text-purple-600" />
                    <span className="font-semibold text-gray-800 text-sm">4R Retail Store Metrics</span>
                    <span className="text-xs text-gray-500">(Coverage → ST-SP → ST PV → Omset)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto">
                    <table className="data-table data-table-compact whitespace-nowrap">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-gray-100">
                                <th className="p-1.5 border border-gray-200 min-w-[100px] sticky left-0 bg-gray-100 z-30 text-left font-semibold">TAP</th>
                                {headerGroups.map(g => (
                                    <th key={g.label} colSpan={g.cols} className={`p-1.5 border border-gray-300 text-center text-white font-semibold ${g.color}`}>{g.label}</th>
                                ))}
                            </tr>
                            <tr className="bg-gray-50 text-gray-700">
                                <th className="p-1 border border-gray-200 sticky left-0 bg-gray-50 z-30"></th>
                                {/* RS Coverage */}
                                <th className="p-1 border text-center">Register</th><th className="p-1 border text-center">PJP M-1</th><th className="p-1 border text-center">PJP Act</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Rate%</th>
                                {/* RS ST-SP OA */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Rate%</th><th className="p-1 border text-center">Qty ST</th><th className="p-1 border text-center">Avg/O</th>
                                {/* RS ST-SP OP */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Rate%</th>
                                {/* RS ST PV OA */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Rate%</th><th className="p-1 border text-center">Qty ST</th><th className="p-1 border text-center">Avg/O</th>
                                {/* RS ST PV OP */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Rate%</th>
                                {/* RS Omset */}
                                <th className="p-1 border text-center">M-1</th><th className="p-1 border text-center">Actual</th><th className="p-1 border text-center bg-amber-50">MoM</th><th className="p-1 border text-center">Rate%</th><th className="p-1 border text-center">Rev M-1</th><th className="p-1 border text-center">Rev Act</th><th className="p-1 border text-center bg-amber-50">Rev MoM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => {
                                const isTotal = row.tap_name === 'CLUSTER TOTAL';
                                const rowBg = isTotal ? 'bg-slate-100 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                const stickyBg = isTotal ? 'bg-slate-100' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                return (
                                    <tr key={row.tap_name} className={`${rowBg} hover:bg-slate-50 border-b`}>
                                        <td className={`p-1.5 border sticky left-0 z-10 ${stickyBg} font-medium text-gray-800`}>{row.tap_name}</td>
                                        {/* RS Coverage */}
                                        <td className="p-1 border text-center">{formatNum(row.register)}</td>
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.pjp_fisik_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-blue-700">{formatNum(row.pjp_fisik_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.cov_mom_pct)}`}>{formatPct(row.cov_mom_pct)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.rate_to_register)}</td>
                                        {/* RS ST-SP OA */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.oa_sp_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-indigo-700">{formatNum(row.oa_sp_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.oa_sp_mom)}`}>{formatPct(row.oa_sp_mom)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.rate_oa_sp_pjp)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.qty_st)}</td>
                                        <td className="p-1 border text-center">{row.avg_st_outlet}</td>
                                        {/* RS ST-SP OP */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.op_sp_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-purple-700">{formatNum(row.op_sp_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.op_sp_mom)}`}>{formatPct(row.op_sp_mom)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.rate_op_sp_pjp)}</td>
                                        {/* RS ST PV OA */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.oa_pv_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-teal-700">{formatNum(row.oa_pv_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.oa_pv_mom)}`}>{formatPct(row.oa_pv_mom)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.rate_oa_pv_pjp)}</td>
                                        <td className="p-1 border text-center">{formatNum(row.qty_st_pv)}</td>
                                        <td className="p-1 border text-center">{row.avg_st_pv_outlet}</td>
                                        {/* RS ST PV OP */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.op_pv_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-cyan-700">{formatNum(row.op_pv_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.op_pv_mom)}`}>{formatPct(row.op_pv_mom)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.rate_op_pv_pjp)}</td>
                                        {/* RS Omset */}
                                        <td className="p-1 border text-center text-gray-500">{formatNum(row.omset_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-rose-700">{formatNum(row.omset_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.omset_mom)}`}>{formatPct(row.omset_mom)}</td>
                                        <td className="p-1 border text-center">{formatPct(row.rate_omset_pjp)}</td>
                                        <td className="p-1 border text-center text-gray-500">{formatBn(row.rev_m1)}</td>
                                        <td className="p-1 border text-center font-semibold text-green-700">{formatBn(row.rev_actual)}</td>
                                        <td className={`p-1 border text-center font-semibold ${getMoMColor(row.rev_mom)}`}>{formatPct(row.rev_mom)}</td>
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
// MAIN PAGE COMPONENT
// ===========================================
const FiveS4RPage: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Performansi 5S & 4R" subtitle="Sales Drivers & Retail Store Performance Metrics" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Month Filter */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Periode:</span>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>{getMonthName(m)}</option>))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                        {[2024, 2025, 2026].map(y => (<option key={y} value={y}>{y}</option>))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mt-4">
                <SummaryCards data5S={fiveSData} data4R={fourRData} />
            </div>

            {/* Both Tables on Single Page */}
            <Card padding="none" className="mt-4 p-4">
                <FiveSTable data={fiveSData} />
                <FourRTable data={fourRData} />
            </Card>
        </div>
    );
};

export default FiveS4RPage;
