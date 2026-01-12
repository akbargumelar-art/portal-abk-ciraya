/**
 * Performance Page - Dynamic EAV Pattern
 * 
 * Uses dynamic KPI parameters that mimic a database-driven structure.
 * KPIs can be changed monthly by modifying performanceData.ts without code changes.
 */

import React, { useState, useMemo } from 'react';
import {
    Target,
    TrendingUp,
    TrendingDown,
    Award,
    Download,
    ChevronDown,
    ChevronRight,
    BarChart3,
    MapPin,
    Minus
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Select, Badge } from '../components/ui/index';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';

// Import dynamic types and data
import type { KPICategory, PerformanceTableRow } from '../types/performance';
import {
    getAchievementColor,
    getAchievementVariant,
    formatKPIValue
} from '../types/performance';
import {
    tapMaster,
    kpiValues,
    getParametersByCategory,
    getActiveParameters,
    getParameterByCode,
    buildPerformanceTableRows,
    calculateKPISummaries,
} from '../services/mock/performanceData';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TrendIndicatorProps {
    value: number;
    suffix?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, suffix = '%' }) => {
    if (value > 0) {
        return (
            <span className="flex items-center text-green-600 text-xs">
                <TrendingUp size={12} className="mr-0.5" />
                +{value.toFixed(1)}{suffix}
            </span>
        );
    }
    if (value < 0) {
        return (
            <span className="flex items-center text-red-600 text-xs">
                <TrendingDown size={12} className="mr-0.5" />
                {value.toFixed(1)}{suffix}
            </span>
        );
    }
    return (
        <span className="flex items-center text-gray-400 text-xs">
            <Minus size={12} className="mr-0.5" />
            0{suffix}
        </span>
    );
};

// ============================================================================
// DYNAMIC TABLE COMPONENT
// ============================================================================

interface DynamicPerformanceTableProps {
    category: KPICategory;
    rows: PerformanceTableRow[];
    expanded: boolean;
    onToggle: () => void;
}

const DynamicPerformanceTable: React.FC<DynamicPerformanceTableProps> = ({
    category,
    rows,
    expanded,
    onToggle,
}) => {
    const parameters = getParametersByCategory(category);
    const categoryLabel = category === 'TOP_LINE' ? 'Top Line KPIs' : 'Bottom Line KPIs';
    const categoryIcon = category === 'TOP_LINE'
        ? <TrendingUp size={18} className="text-blue-600" />
        : <BarChart3 size={18} className="text-purple-600" />;

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            {/* Collapsible Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {categoryIcon}
                    <span className="font-semibold text-gray-800">{categoryLabel}</span>
                    <span className="text-sm text-gray-500">
                        ({parameters.length} KPIs × {rows.length} TAPs)
                    </span>
                </div>
                {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Table Content */}
            {expanded && (
                <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
                    <table className="w-full text-xs border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                            {/* Level 1: KPI Names */}
                            <tr className="border-b">
                                <th className="p-2 text-left font-semibold text-white min-w-[120px] border-r border-gray-200 sticky left-0 bg-gray-100 z-20">
                                    TAP
                                </th>
                                {parameters.map(param => (
                                    <th
                                        key={param.code}
                                        colSpan={4}
                                        className={`p-2 text-center font-semibold border-l-2 border-gray-300 ${param.code.includes('byu') || param.code.includes('BYU')
                                                ? 'bg-sky-100'
                                                : 'bg-gray-100'
                                            }`}
                                    >
                                        {param.label}
                                    </th>
                                ))}
                            </tr>
                            {/* Level 2: Sub-columns */}
                            <tr className="border-b bg-gray-50 text-gray-500">
                                <th className="p-1.5 border-r border-gray-200 sticky left-0 bg-gray-50 z-20"></th>
                                {parameters.map(param => (
                                    <React.Fragment key={`${param.code}-sub`}>
                                        <th className="p-1.5 text-center border-l-2 border-gray-300">Target</th>
                                        <th className="p-1.5 text-center">Actual</th>
                                        <th className="p-1.5 text-center">Ach%</th>
                                        <th className="p-1.5 text-center">MoM</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.tap.id} className="hover:bg-gray-50 border-b border-gray-100">
                                    <td className="p-2 font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} className="text-gray-400" />
                                            {row.tap.name}
                                        </div>
                                    </td>
                                    {parameters.map(param => {
                                        const metrics = row.metrics[param.code];
                                        if (!metrics) {
                                            return (
                                                <React.Fragment key={`${row.tap.id}-${param.code}`}>
                                                    <td className="p-2 text-center text-gray-400 border-l-2 border-gray-300">-</td>
                                                    <td className="p-2 text-center text-gray-400">-</td>
                                                    <td className="p-2 text-center text-gray-400">-</td>
                                                    <td className="p-2 text-center text-gray-400">-</td>
                                                </React.Fragment>
                                            );
                                        }

                                        return (
                                            <React.Fragment key={`${row.tap.id}-${param.code}`}>
                                                <td className="p-2 text-center text-gray-500 border-l-2 border-gray-300">
                                                    {formatKPIValue(metrics.target, param.format, param.unit)}
                                                </td>
                                                <td className="p-2 text-center font-semibold">
                                                    {formatKPIValue(metrics.actual, param.format, param.unit)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge
                                                        variant={getAchievementVariant(metrics.achievement_pct)}
                                                        className="text-[10px]"
                                                    >
                                                        {metrics.achievement_pct.toFixed(0)}%
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <TrendIndicator value={metrics.mom_growth} />
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                            {/* Summary Row */}
                            <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                                <td className="p-2 text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-100 z-10">
                                    TOTAL
                                </td>
                                {parameters.map(param => {
                                    const summaries = calculateKPISummaries(kpiValues);
                                    const summary = summaries.find(s => s.param_code === param.code);
                                    if (!summary) {
                                        return (
                                            <React.Fragment key={`total-${param.code}`}>
                                                <td className="p-2 text-center border-l-2 border-gray-300">-</td>
                                                <td className="p-2 text-center">-</td>
                                                <td className="p-2 text-center">-</td>
                                                <td className="p-2 text-center">-</td>
                                            </React.Fragment>
                                        );
                                    }

                                    return (
                                        <React.Fragment key={`total-${param.code}`}>
                                            <td className="p-2 text-center text-white border-l-2 border-gray-300">
                                                {formatKPIValue(summary.total_target, param.format, param.unit)}
                                            </td>
                                            <td className="p-2 text-center text-gray-900">
                                                {formatKPIValue(summary.total_actual, param.format, param.unit)}
                                            </td>
                                            <td className="p-2 text-center">
                                                <Badge
                                                    variant={getAchievementVariant(summary.achievement_pct)}
                                                    className="text-[10px]"
                                                >
                                                    {summary.achievement_pct.toFixed(0)}%
                                                </Badge>
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
        </div>
    );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const PerformancePage: React.FC = () => {
    const [period, setPeriod] = useState('2024-12');
    const [selectedTap, setSelectedTap] = useState('');
    const [topLineExpanded, setTopLineExpanded] = useState(true);
    const [bottomLineExpanded, setBottomLineExpanded] = useState(true);

    // Build table rows from dynamic data
    const tableRows = useMemo(() => {
        let taps = tapMaster;
        if (selectedTap) {
            taps = tapMaster.filter(t => t.id === selectedTap);
        }
        return buildPerformanceTableRows(kpiValues, taps);
    }, [selectedTap]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const summaries = calculateKPISummaries(kpiValues);
        const activeParams = getActiveParameters();

        const totalTarget = summaries.reduce((sum, s) => sum + s.total_target, 0);
        const totalActual = summaries.reduce((sum, s) => sum + s.total_actual, 0);
        const avgAchievement = summaries.length > 0
            ? summaries.reduce((sum, s) => sum + s.achievement_pct, 0) / summaries.length
            : 0;

        return {
            totalKPIs: activeParams.length,
            totalTAPs: tapMaster.length,
            avgAchievement,
            aboveTarget: summaries.filter(s => s.achievement_pct >= 100).length,
            belowTarget: summaries.filter(s => s.achievement_pct < 80).length,
        };
    }, []);

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Performansi - Dynamic KPI" />

            {/* Info Banner */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                <span className="text-sm text-blue-700">
                    <strong>Dynamic EAV Pattern:</strong> KPI parameters are loaded from configuration.
                    Add/remove KPIs by modifying <code className="bg-blue-100 px-1 rounded">performanceData.ts</code>
                </span>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active KPIs</p>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.totalKPIs}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Target size={20} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total TAPs</p>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.totalTAPs}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin size={20} className="text-purple-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg Achievement</p>
                            <p className={`text-2xl font-bold ${getAchievementColor(summaryStats.avgAchievement)}`}>
                                {summaryStats.avgAchievement.toFixed(1)}%
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Award size={20} className="text-green-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Above Target</p>
                            <p className="text-2xl font-bold text-green-600">
                                {summaryStats.aboveTarget}/{summaryStats.totalKPIs}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
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
                            ...tapMaster.map(t => ({ value: t.id, label: t.name }))
                        ]}
                    />
                </div>
                <Button variant="outline" leftIcon={<Download size={16} />}>
                    Export Report
                </Button>
            </div>

            {/* Performance Tables */}
            <Card padding="none" className="mt-6">
                <Tabs defaultValue="tables">
                    <TabList>
                        <Tab value="tables" icon={<BarChart3 size={16} />}>
                            KPI Tables
                        </Tab>
                    </TabList>

                    <TabPanel value="tables" className="p-4">
                        {/* Top Line KPIs */}
                        <DynamicPerformanceTable
                            category="TOP_LINE"
                            rows={tableRows}
                            expanded={topLineExpanded}
                            onToggle={() => setTopLineExpanded(!topLineExpanded)}
                        />

                        {/* Bottom Line KPIs */}
                        <DynamicPerformanceTable
                            category="BOTTOM_LINE"
                            rows={tableRows}
                            expanded={bottomLineExpanded}
                            onToggle={() => setBottomLineExpanded(!bottomLineExpanded)}
                        />
                    </TabPanel>
                </Tabs>
            </Card>

            {/* Configuration Reference */}
            <Card className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Active KPI Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-blue-600 mb-2">Top Line</h4>
                        <div className="space-y-1">
                            {getParametersByCategory('TOP_LINE').map(p => (
                                <div key={p.code} className="text-xs text-white flex items-center gap-2">
                                    <span className="font-mono bg-gray-100 px-1 rounded">{p.code}</span>
                                    <span>{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-purple-600 mb-2">Bottom Line</h4>
                        <div className="space-y-1">
                            {getParametersByCategory('BOTTOM_LINE').map(p => (
                                <div key={p.code} className="text-xs text-white flex items-center gap-2">
                                    <span className="font-mono bg-gray-100 px-1 rounded">{p.code}</span>
                                    <span>{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PerformancePage;
