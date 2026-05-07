/**
 * DynamicKPITable Component - Reusable EAV Pattern Table
 * 
 * Used by all Performansi submenu pages to render dynamic KPI columns.
 */

import React, { useMemo, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronDown,
    ChevronRight,
    MapPin,
    Download,
    Calendar,
} from 'lucide-react';
import Header from '../layout/Header';
import { Card, Button, Select, Badge } from '../ui/index';

import type {
    KPIParameterConfig,
    KPIValue,
    TAPMaster,
    PerformanceTableRow
} from '../../types/performance';
import {
    calculateMetrics,
    getAchievementVariant,
    formatKPIValue
} from '../../types/performance';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface DynamicKPITableProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    kpis: KPIParameterConfig[];
    values: KPIValue[];
    taps: TAPMaster[];
    showFilters?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TrendIndicator: React.FC<{ value: number }> = ({ value }) => {
    if (value > 0) {
        return (
            <span className="flex items-center text-green-600 text-[10px]">
                <TrendingUp size={10} className="mr-0.5" />
                +{value.toFixed(1)}%
            </span>
        );
    }
    if (value < 0) {
        return (
            <span className="flex items-center text-red-600 text-[10px]">
                <TrendingDown size={10} className="mr-0.5" />
                {value.toFixed(1)}%
            </span>
        );
    }
    return (
        <span className="flex items-center text-gray-400 text-[10px]">
            <Minus size={10} className="mr-0.5" />
            0%
        </span>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DynamicKPITable: React.FC<DynamicKPITableProps> = ({
    title,
    subtitle,
    icon,
    kpis,
    values,
    taps,
    showFilters = true,
}) => {
    const [expanded, setExpanded] = useState(true);
    const [selectedTap, setSelectedTap] = useState('');
    const [period, setPeriod] = useState('2024-12');

    // Filter taps
    const filteredTaps = useMemo(() => {
        if (!selectedTap) return taps;
        return taps.filter(t => t.id === selectedTap);
    }, [taps, selectedTap]);

    // Build table rows
    const tableRows: PerformanceTableRow[] = useMemo(() => {
        return filteredTaps.map(tap => {
            const tapValues = values.filter(v => v.tap_id === tap.id);
            const metrics: Record<string, ReturnType<typeof calculateMetrics>> = {};

            tapValues.forEach(value => {
                metrics[value.param_code] = calculateMetrics(value);
            });

            return { tap, metrics };
        });
    }, [filteredTaps, values]);

    // Calculate summaries
    const summaries = useMemo(() => {
        const result: Record<string, {
            total_target: number;
            total_actual: number;
            total_lmsd: number;
            achievement_pct: number;
            mom_growth: number;
        }> = {};

        kpis.forEach(kpi => {
            const kpiValues = values.filter(v => v.param_code === kpi.code);
            const total_target = kpiValues.reduce((sum, v) => sum + v.target, 0);
            const total_actual = kpiValues.reduce((sum, v) => sum + v.actual, 0);
            const total_lmsd = kpiValues.reduce((sum, v) => sum + v.lmsd, 0);

            result[kpi.code] = {
                total_target,
                total_actual,
                total_lmsd,
                achievement_pct: total_target > 0 ? (total_actual / total_target) * 100 : 0,
                mom_growth: total_lmsd > 0 ? ((total_actual - total_lmsd) / total_lmsd) * 100 : 0,
            };
        });

        return result;
    }, [kpis, values]);

    return (
        <div className="p-6 animate-fade-in">
            <Header title={title} subtitle={subtitle} />

            {/* Filters */}
            {showFilters && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={16} />
                            <span>Periode:</span>
                        </div>
                        <Select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            options={[
                                { value: '2024-12', label: 'Desember 2024' },
                                { value: '2024-11', label: 'November 2024' },
                                { value: '2024-10', label: 'Oktober 2024' },
                            ]}
                        />
                        <Select
                            value={selectedTap}
                            onChange={(e) => setSelectedTap(e.target.value)}
                            options={[
                                { value: '', label: 'Semua TAP' },
                                ...taps.map(t => ({ value: t.id, label: t.name }))
                            ]}
                        />
                    </div>
                    <Button variant="outline" leftIcon={<Download size={16} />}>
                        Export
                    </Button>
                </div>
            )}

            {/* Table Card */}
            <Card padding="none" className="mt-6">
                {/* Collapsible Header */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {icon || <TrendingUp size={18} className="text-blue-600" />}
                        <span className="font-semibold text-gray-800">{title}</span>
                        <span className="text-sm text-gray-500">
                            ({kpis.length} KPIs × {filteredTaps.length} TAPs)
                        </span>
                    </div>
                    {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {/* Table Content */}
                {expanded && (
                    <div className="table-scroll" style={{ maxHeight: '600px' }}>
                        <table className="data-table data-table-compact whitespace-nowrap">
                            <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                                {/* Level 1: KPI Names */}
                                <tr className="border-b border-gray-700">
                                    <th className="p-2 text-left font-semibold text-white min-w-[120px] border-r border-gray-700 sticky left-0 bg-[#2c4a6a] z-20">
                                        TAP
                                    </th>
                                    {kpis.map(kpi => (
                                        <th
                                            key={kpi.code}
                                            colSpan={5}
                                            className={`p-2 text-center font-semibold text-white border-l-2 border-gray-700 ${kpi.code.toLowerCase().includes('byu')
                                                ? 'bg-[#3d5f85]'
                                                : 'bg-[#2c4a6a]'
                                                }`}
                                        >
                                            {kpi.label}
                                        </th>
                                    ))}
                                </tr>
                                {/* Level 2: Sub-columns */}
                                <tr className="border-b border-gray-700 bg-[#3d5f85] text-white/90">
                                    <th className="p-1.5 border-r border-gray-700 sticky left-0 bg-[#3d5f85] z-20"></th>
                                    {kpis.map(kpi => (
                                        <React.Fragment key={`${kpi.code}-sub`}>
                                            <th className="p-1.5 text-center border-l-2 border-gray-700">Target</th>
                                            <th className="p-1.5 text-center">Actual</th>
                                            <th className="p-1.5 text-center">Ach%</th>
                                            <th className="p-1.5 text-center">M-1</th>
                                            <th className="p-1.5 text-center">MoM</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map(row => (
                                    <tr key={row.tap.id} className="hover:bg-gray-50 border-b border-gray-100">
                                        <td className="p-2 font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} className="text-gray-400" />
                                                {row.tap.name}
                                            </div>
                                        </td>
                                        {kpis.map(kpi => {
                                            const metrics = row.metrics[kpi.code];
                                            if (!metrics) {
                                                return (
                                                    <React.Fragment key={`${row.tap.id}-${kpi.code}`}>
                                                        <td className="p-2 text-center text-gray-400 border-l-2 border-gray-300">-</td>
                                                        <td className="p-2 text-center text-gray-400">-</td>
                                                        <td className="p-2 text-center text-gray-400">-</td>
                                                        <td className="p-2 text-center text-gray-400">-</td>
                                                        <td className="p-2 text-center text-gray-400">-</td>
                                                    </React.Fragment>
                                                );
                                            }

                                            return (
                                                <React.Fragment key={`${row.tap.id}-${kpi.code}`}>
                                                    <td className="p-2 text-center text-gray-500 border-l-2 border-gray-300">
                                                        {formatKPIValue(metrics.target, kpi.format, kpi.unit)}
                                                    </td>
                                                    <td className="p-2 text-center font-semibold">
                                                        {formatKPIValue(metrics.actual, kpi.format, kpi.unit)}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <Badge
                                                            variant={getAchievementVariant(metrics.achievement_pct)}
                                                            className="text-[9px]"
                                                        >
                                                            {metrics.achievement_pct.toFixed(0)}%
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2 text-center text-purple-600 font-medium">
                                                        {formatKPIValue(metrics.lmsd, kpi.format, kpi.unit)}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <TrendIndicator value={metrics.mom_growth} />
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {/* TOTAL Row */}
                                <tr className="table-total-row">
                                    <td className="p-2 text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-100 z-10">
                                        TOTAL
                                    </td>
                                    {kpis.map(kpi => {
                                        const summary = summaries[kpi.code];
                                        if (!summary) {
                                            return (
                                                <React.Fragment key={`total-${kpi.code}`}>
                                                    <td className="p-2 text-center border-l-2 border-gray-300">-</td>
                                                    <td className="p-2 text-center">-</td>
                                                    <td className="p-2 text-center">-</td>
                                                    <td className="p-2 text-center">-</td>
                                                    <td className="p-2 text-center">-</td>
                                                </React.Fragment>
                                            );
                                        }

                                        return (
                                            <React.Fragment key={`total-${kpi.code}`}>
                                                <td className="p-2 text-center text-gray-600 border-l-2 border-gray-300">
                                                    {formatKPIValue(summary.total_target, kpi.format, kpi.unit)}
                                                </td>
                                                <td className="p-2 text-center text-gray-900">
                                                    {formatKPIValue(summary.total_actual, kpi.format, kpi.unit)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge
                                                        variant={getAchievementVariant(summary.achievement_pct)}
                                                        className="text-[9px]"
                                                    >
                                                        {summary.achievement_pct.toFixed(0)}%
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center text-purple-600 font-medium">
                                                    {formatKPIValue(summary.total_lmsd, kpi.format, kpi.unit)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <TrendIndicator value={summary.mom_growth} />
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* KPI Reference */}
            <Card className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Active KPI Parameters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {kpis.map(kpi => (
                        <div key={kpi.code} className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="font-mono bg-gray-100 px-1 rounded text-[10px]">{kpi.code}</span>
                            <span>{kpi.label}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default DynamicKPITable;
