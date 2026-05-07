/**
 * Top Line Performance Page - v3
 * 
 * Revenue metrics with separate tables for TAP/Kabupaten/Kecamatan
 * Each table has a TOTAL row + Summary per Parameter
 */

import React, { useState, useMemo, memo } from 'react';
import {
    TrendingUp, TrendingDown, Clock, ChevronDown, ChevronUp,
    MapPin, Building2, Map, Award, AlertCircle, Target, BarChart3, Calendar, Layers
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui';

// ===========================================
// TYPES
// ===========================================
interface RevenueMetric {
    target: number;
    actual: number;
    m1: number;
}

interface TopLineRow {
    id: string;
    name: string;
    kabupaten?: string; // For kecamatan rows
    metrics: {
        total_revenue: RevenueMetric;
        revenue_new_sales: RevenueMetric;
        revenue_existing: RevenueMetric;
        revenue_voice: RevenueMetric;
        revenue_sms: RevenueMetric;
        revenue_broadband: RevenueMetric;
        revenue_digital_service: RevenueMetric;
    };
    // new fields
    jml_kabupaten?: number;
    jml_kecamatan?: number;
    tap_name?: string;
}

type MetricKey = keyof TopLineRow['metrics'];

// ===========================================
// CONSTANTS
// ===========================================
const REVENUE_PARAMS: { id: MetricKey; label: string; color: string }[] = [
    { id: 'total_revenue', label: 'Total Revenue', color: 'bg-slate-500' },
    { id: 'revenue_new_sales', label: 'Rev. New Sales', color: 'bg-slate-600' },
    { id: 'revenue_existing', label: 'Rev. Existing', color: 'bg-emerald-700/80' },
    { id: 'revenue_voice', label: 'Rev. Voice', color: 'bg-slate-600' },
    { id: 'revenue_sms', label: 'Rev. SMS', color: 'bg-amber-700/80' },
    { id: 'revenue_broadband', label: 'Rev. Broadband', color: 'bg-cyan-700/80' },
    { id: 'revenue_digital_service', label: 'Rev. Digital Service', color: 'bg-rose-700/80' },
];

const TAPS = ['TAP Pemuda', 'TAP Palimanan', 'TAP Lemahabang', 'TAP Kuningan'];
const KABUPATEN = ['Kota Cirebon', 'Kab. Cirebon', 'Kab. Kuningan'];

const KECAMATAN_BY_KABUPATEN: Record<string, string[]> = {
    'Kota Cirebon': ['Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan'],
    'Kab. Cirebon': ['Arjawinangun', 'Astanajapura', 'Babakan', 'Ciledug', 'Gebang', 'Losari', 'Palimanan', 'Plered', 'Sumber', 'Weru'],
    'Kab. Kuningan': ['Kuningan', 'Cigugur', 'Cilimus', 'Ciawigebang', 'Luragung'],
};

// Mapping for Mock Data
const MAPPING = {
    'TAP Pemuda': { kabs: ['Kota Cirebon'], kecs: ['Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan'] },
    'TAP Palimanan': { kabs: ['Kab. Cirebon'], kecs: ['Arjawinangun', 'Palimanan', 'Sumber', 'Weru', 'Plered'] },
    'TAP Lemahabang': { kabs: ['Kab. Cirebon'], kecs: ['Astanajapura', 'Babakan', 'Ciledug', 'Gebang', 'Losari'] },
    'TAP Kuningan': { kabs: ['Kab. Kuningan'], kecs: ['Kuningan', 'Cigugur', 'Cilimus', 'Ciawigebang', 'Luragung'] },
};

// ===========================================
// MOCK DATA GENERATOR
// ===========================================
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateMetric = (baseValue: number): RevenueMetric => {
    const target = baseValue;
    const actual = Math.round(target * (0.75 + Math.random() * 0.5));
    const m1 = Math.round(actual * (0.85 + Math.random() * 0.3));
    return { target, actual, m1 };
};

const generateRowMetrics = (scale: number): TopLineRow['metrics'] => ({
    total_revenue: generateMetric(randomInt(800, 1500) * scale * 1_000_000),
    revenue_new_sales: generateMetric(randomInt(150, 400) * scale * 1_000_000),
    revenue_existing: generateMetric(randomInt(400, 800) * scale * 1_000_000),
    revenue_voice: generateMetric(randomInt(80, 200) * scale * 1_000_000),
    revenue_sms: generateMetric(randomInt(30, 80) * scale * 1_000_000),
    revenue_broadband: generateMetric(randomInt(100, 300) * scale * 1_000_000),
    revenue_digital_service: generateMetric(randomInt(50, 150) * scale * 1_000_000),
});

// Generate data for each level
const tapData: TopLineRow[] = TAPS.map((name, idx) => {
    const map = MAPPING[name as keyof typeof MAPPING];
    return {
        id: `tap-${idx}`,
        name,
        metrics: generateRowMetrics(10),
        jml_kabupaten: map?.kabs.length || 0,
        jml_kecamatan: map?.kecs.length || 0,
    };
});

const kabupatenData: TopLineRow[] = KABUPATEN.map((name, idx) => {
    const kecs = KECAMATAN_BY_KABUPATEN[name] || [];
    return {
        id: `kab-${idx}`,
        name,
        metrics: generateRowMetrics(8),
        jml_kecamatan: kecs.length,
    };
});

// Kecamatan data WITH kabupaten and TAP mapping
const kecamatanData: TopLineRow[] = [];
Object.entries(KECAMATAN_BY_KABUPATEN).forEach(([kab, kecs]) => {
    kecs.forEach((kecName, idx) => {
        // Find TAP
        const tap = Object.entries(MAPPING).find(([_, val]) => val.kecs.includes(kecName))?.[0] || 'Unknown';

        kecamatanData.push({
            id: `kec-${kab}-${idx}`,
            name: kecName,
            kabupaten: kab,
            tap_name: tap,
            metrics: generateRowMetrics(1),
        });
    });
});

// ===========================================
// FORMAT HELPERS
// ===========================================
const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
};

const getMonthName = (month: number): string => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1] || '';
};

// Calculate total row
const calculateTotalRow = (rows: TopLineRow[]): TopLineRow => {
    const totalMetrics: TopLineRow['metrics'] = {
        total_revenue: { target: 0, actual: 0, m1: 0 },
        revenue_new_sales: { target: 0, actual: 0, m1: 0 },
        revenue_existing: { target: 0, actual: 0, m1: 0 },
        revenue_voice: { target: 0, actual: 0, m1: 0 },
        revenue_sms: { target: 0, actual: 0, m1: 0 },
        revenue_broadband: { target: 0, actual: 0, m1: 0 },
        revenue_digital_service: { target: 0, actual: 0, m1: 0 },
    };

    rows.forEach(row => {
        REVENUE_PARAMS.forEach(param => {
            const m = row.metrics[param.id];
            totalMetrics[param.id].target += m.target;
            totalMetrics[param.id].actual += m.actual;
            totalMetrics[param.id].m1 += m.m1;
        });
    });

    return { id: 'total', name: 'TOTAL', metrics: totalMetrics };
};

// ===========================================
// PARAMETER SUMMARY CARD COMPONENT
// ===========================================
interface ParamSummary {
    id: MetricKey;
    label: string;
    color: string;
    target: number;
    actual: number;
    m1: number;
    achPct: number;
    momPct: number;
}

const ParameterSummaryCards: React.FC<{ data: TopLineRow[] }> = memo(({ data }) => {
    const summaries = useMemo((): ParamSummary[] => {
        return REVENUE_PARAMS.map(param => {
            let target = 0, actual = 0, m1 = 0;
            data.forEach(row => {
                const m = row.metrics[param.id];
                target += m.target;
                actual += m.actual;
                m1 += m.m1;
            });
            return {
                id: param.id,
                label: param.label,
                color: param.color,
                target, actual, m1,
                achPct: target > 0 ? (actual / target) * 100 : 0,
                momPct: m1 > 0 ? ((actual - m1) / m1) * 100 : 0,
            };
        });
    }, [data]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="bg-slate-500 px-4 py-2">
                <div className="flex items-center gap-2">
                    <Layers size={16} className="text-white/80" />
                    <span className="text-white font-medium text-sm">Summary per Parameter</span>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {summaries.map(s => {
                        const isAchMet = s.achPct >= 100;
                        const isPosMom = s.momPct >= 0;
                        return (
                            <div key={s.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className={`text-[10px] text-white px-2 py-0.5 rounded mb-2 inline-block ${s.color}`}>
                                    {s.label}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-gray-500">Target:</span>
                                        <span className="font-semibold text-gray-700">{formatCurrency(s.target)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-gray-500">Aktual:</span>
                                        <span className="font-bold text-blue-600">{formatCurrency(s.actual)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-gray-500">Ach%:</span>
                                        <span className={`font-bold ${isAchMet ? 'text-green-600' : 'text-red-500'}`}>
                                            {Math.round(s.achPct)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${isAchMet ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${Math.min(s.achPct, 100)}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] pt-1 border-t border-gray-200">
                                        <span className="text-gray-500">M-1:</span>
                                        <span className="text-gray-600">{formatCurrency(s.m1)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-gray-500">MoM:</span>
                                        <span className={`font-bold ${isPosMom ? 'text-green-600' : 'text-red-500'}`}>
                                            {isPosMom ? '+' : ''}{Math.round(s.momPct)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

// ===========================================
// OVERALL SUMMARY CARD
// ===========================================
const TopLineSummaryCard: React.FC<{ data: TopLineRow[] }> = memo(({ data }) => {
    const stats = useMemo(() => {
        let totalTarget = 0, totalActual = 0, totalM1 = 0;
        let bestPerf = { name: '', ach: -Infinity };
        let worstPerf = { name: '', ach: Infinity };

        data.forEach(row => {
            const rev = row.metrics.total_revenue;
            totalTarget += rev.target;
            totalActual += rev.actual;
            totalM1 += rev.m1;

            const ach = rev.target > 0 ? (rev.actual / rev.target) * 100 : 0;
            if (ach > bestPerf.ach) bestPerf = { name: row.name, ach };
            if (ach < worstPerf.ach) worstPerf = { name: row.name, ach };
        });

        return {
            totalTarget, totalActual, totalM1,
            achievementPct: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
            momGrowth: totalM1 > 0 ? ((totalActual - totalM1) / totalM1) * 100 : 0,
            bestPerformer: bestPerf.ach !== -Infinity ? bestPerf : null,
            worstPerformer: worstPerf.ach !== Infinity ? worstPerf : null,
        };
    }, [data]);

    const isTargetMet = stats.achievementPct >= 100;
    const isPositiveGrowth = stats.momGrowth >= 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="bg-slate-600 px-4 py-2">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-white/80" />
                    <span className="text-white font-medium text-sm">Ringkasan Top Line Revenue</span>
                </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                        <Target size={12} /><span>Total Revenue Achievement</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-2xl font-bold ${isTargetMet ? 'text-green-600' : 'text-blue-600'}`}>
                            {Math.round(stats.achievementPct)}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${isTargetMet ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(stats.achievementPct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                        <span>Act: <b className="text-green-600">{formatCurrency(stats.totalActual)}</b></span>
                        <span>Tgt: <b className="text-gray-600">{formatCurrency(stats.totalTarget)}</b></span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                        {isPositiveGrowth ? <TrendingUp size={12} /> : <TrendingDown size={12} />}<span>Growth vs M-1</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${isPositiveGrowth ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isPositiveGrowth ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isPositiveGrowth ? '+' : ''}{Math.round(stats.momGrowth)}%
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">M-1: {formatCurrency(stats.totalM1)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                        <Award size={12} className="text-yellow-500" /><span>Top TAP</span>
                    </div>
                    {stats.bestPerformer ? (
                        <>
                            <div className="text-sm font-bold text-gray-800 truncate">{stats.bestPerformer.name}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-green-600 font-bold text-lg">{Math.round(stats.bestPerformer.ach)}%</span>
                                <span className="text-[10px] text-gray-400">ach</span>
                            </div>
                        </>
                    ) : <div className="text-gray-400 text-sm">-</div>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                        <AlertCircle size={12} className="text-red-500" /><span>Perlu Perhatian</span>
                    </div>
                    {stats.worstPerformer ? (
                        <>
                            <div className="text-sm font-bold text-gray-800 truncate">{stats.worstPerformer.name}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-red-500 font-bold text-lg">{Math.round(stats.worstPerformer.ach)}%</span>
                                <span className="text-[10px] text-gray-400">ach</span>
                            </div>
                        </>
                    ) : <div className="text-gray-400 text-sm">-</div>}
                </div>
            </div>
        </div>
    );
});

// ===========================================
// PROGRESS BAR
// ===========================================
const ProgressBar = memo(({ value }: { value: number }) => {
    const color = value >= 100 ? 'bg-green-500' : value >= 80 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    );
});

// ===========================================
// METRIC CELL
// ===========================================
const MetricCell = memo(({ metric }: { metric: RevenueMetric }) => {
    const ach = metric.target > 0 ? (metric.actual / metric.target) * 100 : 0;
    const mom = metric.m1 > 0 ? ((metric.actual - metric.m1) / metric.m1) * 100 : 0;

    return (
        <>
            <td className="p-1 text-center text-gray-600 text-[10px]">{formatCurrency(metric.target)}</td>
            <td className="p-1 text-center font-semibold text-blue-700 text-[10px]">{formatCurrency(metric.actual)}</td>
            <td className="p-1 text-center">
                <div className="flex flex-col gap-0.5">
                    <span className={`text-[9px] font-semibold ${ach >= 100 ? 'text-green-600' : ach >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(ach)}%
                    </span>
                    <ProgressBar value={ach} />
                </div>
            </td>
            <td className="p-1 text-center text-gray-500 text-[10px]">{formatCurrency(metric.m1)}</td>
            <td className={`p-1 text-center text-[10px] font-semibold ${mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {mom > 0 ? '+' : ''}{Math.round(mom)}%
            </td>
        </>
    );
});

// ===========================================
// REUSABLE TABLE COMPONENT
// ===========================================
interface ExtraColumn {
    header: string;
    accessor: keyof TopLineRow;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface RevenueTableProps {
    title: string;
    icon: React.ReactNode;
    data: TopLineRow[];
    showKabupatenColumn?: boolean;
    extraColumns?: ExtraColumn[];
}

const RevenueTable: React.FC<RevenueTableProps> = memo(({ title, icon, data, showKabupatenColumn = false, extraColumns = [] }) => {
    const [expanded, setExpanded] = useState(true);
    const totalRow = useMemo(() => calculateTotalRow(data), [data]);

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                    <span className="text-xs text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto">
                    <table className="data-table data-table-compact whitespace-nowrap">
                        <thead className="sticky top-0 z-20 bg-[#2c4a6a]">
                            <tr>
                                {showKabupatenColumn && (
                                    <th className="p-2 border-b border-r min-w-[100px] sticky left-0 bg-gray-100 z-30 text-left">Kabupaten</th>
                                )}
                                <th className={`p-2 border-b border-r min-w-[120px] ${showKabupatenColumn ? 'sticky left-[100px]' : 'sticky left-0'} bg-gray-100 z-30 text-left`}>
                                    Nama
                                </th>
                                {extraColumns.map((col, idx) => (
                                    <th key={idx} className="p-2 border-b border-r min-w-[100px] bg-gray-100 text-center">
                                        {col.header}
                                    </th>
                                ))}
                                {REVENUE_PARAMS.map(param => (
                                    <th key={param.id} colSpan={5} className={`p-2 border-b border-l text-center text-white ${param.color}`}>
                                        {param.label}
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-gray-50 text-gray-500">
                                {showKabupatenColumn && <th className="p-1 border-b border-r sticky left-0 bg-gray-50 z-30"></th>}
                                <th className={`p-1 border-b border-r ${showKabupatenColumn ? 'sticky left-[100px]' : 'sticky left-0'} bg-gray-50 z-30`}></th>
                                {extraColumns.map((_, idx) => <th key={idx} className="p-1 border-b border-r bg-gray-50"></th>)}
                                {REVENUE_PARAMS.map((param, idx) => (
                                    <React.Fragment key={param.id}>
                                        <th className={`p-1 border-b text-center ${idx > 0 ? 'border-l' : ''}`}>Target</th>
                                        <th className="p-1 border-b text-center">Aktual</th>
                                        <th className="p-1 border-b text-center">Ach%</th>
                                        <th className="p-1 border-b text-center bg-amber-50">M-1</th>
                                        <th className="p-1 border-b text-center bg-amber-50">MoM</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 border-b">
                                    {showKabupatenColumn && (
                                        <td className="p-2 border-r sticky left-0 bg-white z-10 text-gray-700 text-[10px]">
                                            {row.kabupaten || '-'}
                                        </td>
                                    )}
                                    <td className={`p-2 font-medium border-r ${showKabupatenColumn ? 'sticky left-[100px]' : 'sticky left-0'} bg-white z-10 text-gray-800`}>
                                        {row.name}
                                    </td>
                                    {extraColumns.map((col, idx) => (
                                        <td key={idx} className={`p-2 border-r text-gray-700 text-[10px] ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                            {row[col.accessor] as React.ReactNode}
                                        </td>
                                    ))}
                                    {REVENUE_PARAMS.map(param => (
                                        <MetricCell key={param.id} metric={row.metrics[param.id]} />
                                    ))}
                                </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                                {showKabupatenColumn && <td className="p-2 border-r sticky left-0 bg-slate-100 z-10"></td>}
                                <td className={`p-2 border-r ${showKabupatenColumn ? 'sticky left-[100px]' : 'sticky left-0'} bg-slate-100 z-10 text-slate-800`}>
                                    {totalRow.name}
                                </td>
                                {extraColumns.map((_, idx) => <td key={idx} className="p-2 border-r bg-slate-100"></td>)}
                                {REVENUE_PARAMS.map(param => (
                                    <MetricCell key={param.id} metric={totalRow.metrics[param.id]} />
                                ))}
                            </tr>
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
const TopLinePage: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Top Line Performance" subtitle="Revenue metrics by TAP, Kabupaten, and Kecamatan" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Month Filter */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Periode:</span>
                    </div>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{getMonthName(m)}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Overall Summary Card */}
            <div className="mt-4">
                <TopLineSummaryCard data={tapData} />
            </div>

            {/* Parameter Summary Cards */}
            <ParameterSummaryCards data={tapData} />

            {/* Separate Tables */}
            <Card padding="none" className="mt-4 p-4">
                <RevenueTable
                    title="Summary per TAP"
                    icon={<MapPin size={16} className="text-blue-600" />}
                    data={tapData}
                    extraColumns={[
                        { header: 'Jml Kab', accessor: 'jml_kabupaten', align: 'center', width: '80px' },
                        { header: 'Jml Kec', accessor: 'jml_kecamatan', align: 'center', width: '80px' },
                    ]}
                />
                <RevenueTable
                    title="Summary per Kabupaten"
                    icon={<Building2 size={16} className="text-green-600" />}
                    data={kabupatenData}
                    extraColumns={[
                        { header: 'Jml Kec', accessor: 'jml_kecamatan', align: 'center', width: '80px' },
                    ]}
                />
                <RevenueTable
                    title="Summary per Kecamatan"
                    icon={<Map size={16} className="text-purple-600" />}
                    data={kecamatanData}
                    showKabupatenColumn={true}
                    extraColumns={[
                        { header: 'Nama TAP', accessor: 'tap_name', align: 'left', width: '120px' },
                    ]}
                />
            </Card>
        </div>
    );
};

export default TopLinePage;
