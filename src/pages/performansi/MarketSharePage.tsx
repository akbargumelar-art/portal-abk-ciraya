/**
 * Market Share Performance Page
 * 
 * Dual-View Dashboard with Trend Chart and City/Kecamatan tables
 */

import React, { useState, useMemo, memo } from 'react';
import {
    Clock, Calendar, TrendingUp, TrendingDown, Award, AlertCircle,
    BarChart3, MapPin, Building2, Map, Target, ChevronDown, ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui';
import {
    marketShareCityData,
    marketShareKecData,
    trendFBData
} from '../../services/mock/marketShareData';
import type { MarketShareCity, MarketShareKecamatan, TrendFBData } from '../../types/marketshare';

// ===========================================
// HELPERS
// ===========================================
const getMonthName = (month: number): string => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1] || '';
};

const formatPct = (value: number): string => `${value.toFixed(1)}%`;
const formatDiff = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;

// Color scale for market share (higher = darker green)
const getShareColor = (share: number, isTsel: boolean = false): string => {
    if (isTsel) {
        if (share >= 45) return 'bg-red-600 text-white';
        if (share >= 40) return 'bg-red-500 text-white';
        if (share >= 35) return 'bg-red-400 text-white';
        return 'bg-red-300';
    }
    if (share >= 30) return 'bg-gray-600 text-white';
    if (share >= 25) return 'bg-gray-500 text-white';
    if (share >= 20) return 'bg-gray-400';
    return 'bg-gray-300';
};

const getDiffColor = (value: number): string =>
    value >= 0 ? 'text-green-600' : 'text-red-600';

const getWinLoseColor = (status: 'WIN' | 'LOSE'): string =>
    status === 'WIN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

// ===========================================
// SUMMARY CARDS COMPONENT
// ===========================================
const SummaryCards: React.FC<{ cityData: MarketShareCity[], kecData: MarketShareKecamatan[] }> = memo(({ cityData, kecData }) => {
    const stats = useMemo(() => {
        // Average Tsel share across cities
        const avgTselCity = cityData.reduce((sum, c) => sum + c.tsel_share, 0) / cityData.length;
        const avgWoW = cityData.reduce((sum, c) => sum + c.wow_diff.tsel, 0) / cityData.length;
        const avgMoM = cityData.reduce((sum, c) => sum + c.mom_diff.tsel, 0) / cityData.length;

        // Best/Worst city
        const sortedCities = [...cityData].sort((a, b) => b.tsel_share - a.tsel_share);
        const bestCity = sortedCities[0];
        const worstCity = sortedCities[sortedCities.length - 1];

        // Kecamatan stats
        const winCount = kecData.filter(k => k.win_lose_status === 'WIN').length;
        const loseCount = kecData.filter(k => k.win_lose_status === 'LOSE').length;
        const winRate = (winCount / kecData.length) * 100;

        // Red alert kecamatan (rank > 1 and gap < -5)
        const redAlerts = kecData.filter(k => k.rank_tsel > 1 && k.gap_to_highest < -5);

        return {
            avgTselCity: avgTselCity.toFixed(1),
            avgWoW: avgWoW.toFixed(1),
            avgMoM: avgMoM.toFixed(1),
            bestCity, worstCity,
            winCount, loseCount, winRate: winRate.toFixed(0),
            redAlertCount: redAlerts.length,
            totalKec: kecData.length,
        };
    }, [cityData, kecData]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-2">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-white/80" />
                    <span className="text-white font-medium text-sm">Ringkasan Market Share</span>
                </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Avg Tsel Share */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-1 mb-1">
                        <Target size={12} className="text-red-500" />
                        <span className="text-[10px] text-gray-500">Avg Tsel Share</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{stats.avgTselCity}%</div>
                    <div className="text-[10px] text-gray-500 mt-1">Across {cityData.length} cities</div>
                </div>

                {/* WoW Trend */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1 mb-1">
                        {parseFloat(stats.avgWoW) >= 0 ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                        <span className="text-[10px] text-gray-500">WoW Trend</span>
                    </div>
                    <div className={`text-xl font-bold ${parseFloat(stats.avgWoW) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(stats.avgWoW) >= 0 ? '+' : ''}{stats.avgWoW}%
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">MoM: {parseFloat(stats.avgMoM) >= 0 ? '+' : ''}{stats.avgMoM}%</div>
                </div>

                {/* Best City */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-1 mb-1">
                        <Award size={12} className="text-yellow-500" />
                        <span className="text-[10px] text-gray-500">Top City</span>
                    </div>
                    <div className="text-sm font-bold text-gray-800">{stats.bestCity?.city_name}</div>
                    <div className="text-lg font-bold text-green-600">{stats.bestCity?.tsel_share}%</div>
                </div>

                {/* Worst City */}
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-1 mb-1">
                        <AlertCircle size={12} className="text-orange-500" />
                        <span className="text-[10px] text-gray-500">Lowest City</span>
                    </div>
                    <div className="text-sm font-bold text-gray-800">{stats.worstCity?.city_name}</div>
                    <div className="text-lg font-bold text-orange-600">{stats.worstCity?.tsel_share}%</div>
                </div>

                {/* Win Rate */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-1 mb-1">
                        <MapPin size={12} className="text-blue-500" />
                        <span className="text-[10px] text-gray-500">Kecamatan Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{stats.winRate}%</div>
                    <div className="text-[10px] text-gray-500 mt-1">{stats.winCount} WIN / {stats.loseCount} LOSE</div>
                </div>

                {/* Red Alerts */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center gap-1 mb-1">
                        <AlertCircle size={12} className="text-red-600" />
                        <span className="text-[10px] text-gray-500">Red Alert Kec</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{stats.redAlertCount}</div>
                    <div className="text-[10px] text-gray-500 mt-1">of {stats.totalKec} kecamatan</div>
                </div>
            </div>
        </div>
    );
});

// ===========================================
// TREND CHART COMPONENT
// ===========================================
const TrendFBChart: React.FC<{ data: TrendFBData[] }> = memo(({ data }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800 text-sm">Trend Market Share (Weekly)</h3>
                <p className="text-xs text-gray-500">Perbandingan share Telkomsel vs Kompetitor per minggu</p>
            </div>
            <div className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 60]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                            labelStyle={{ fontWeight: 'bold' }}
                            contentStyle={{ fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="tsel" name="Telkomsel" stroke="#E11D48" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                        <Line type="monotone" dataKey="ioh" name="IOH" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="xl_plus" name="XL+" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

// ===========================================
// CITY TABLE COMPONENT
// ===========================================
const CityTable: React.FC<{ data: MarketShareCity[] }> = memo(({ data }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100">
                <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" />
                    <span className="font-semibold text-gray-800 text-sm">Branch / City View</span>
                    <span className="text-xs text-gray-500">({data.length} cities)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-[#2c4a6a] sticky top-0">
                            <tr>
                                <th className="p-2 border text-left font-semibold">City</th>
                                <th className="p-2 border text-center font-semibold bg-red-100">Tsel</th>
                                <th className="p-2 border text-center font-semibold">Indosat</th>
                                <th className="p-2 border text-center font-semibold">XL</th>
                                <th className="p-2 border text-center font-semibold">Three</th>
                                <th className="p-2 border text-center font-semibold">SF</th>
                                <th className="p-2 border text-center font-semibold bg-amber-50">WoW</th>
                                <th className="p-2 border text-center font-semibold bg-amber-50">MoM</th>
                                <th className="p-2 border text-center font-semibold">Rank</th>
                                <th className="p-2 border text-center font-semibold">Highest Comp</th>
                                <th className="p-2 border text-center font-semibold">Gap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={row.city_name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="p-2 border font-medium text-gray-800">{row.city_name}</td>
                                    <td className={`p-2 border text-center font-bold ${getShareColor(row.tsel_share, true)}`}>{formatPct(row.tsel_share)}</td>
                                    <td className={`p-2 border text-center ${getShareColor(row.isat_share)}`}>{formatPct(row.isat_share)}</td>
                                    <td className={`p-2 border text-center ${getShareColor(row.xl_share)}`}>{formatPct(row.xl_share)}</td>
                                    <td className={`p-2 border text-center ${getShareColor(row.three_share)}`}>{formatPct(row.three_share)}</td>
                                    <td className="p-2 border text-center text-white">{formatPct(row.sf_share)}</td>
                                    <td className={`p-2 border text-center font-semibold ${getDiffColor(row.wow_diff.tsel)}`}>{formatDiff(row.wow_diff.tsel)}</td>
                                    <td className={`p-2 border text-center font-semibold ${getDiffColor(row.mom_diff.tsel)}`}>{formatDiff(row.mom_diff.tsel)}</td>
                                    <td className="p-2 border text-center">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold">{row.rank_tsel}</span>
                                    </td>
                                    <td className="p-2 border text-center text-white">{row.highest_competitor}</td>
                                    <td className={`p-2 border text-center font-bold ${row.gap_to_highest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {row.gap_to_highest >= 0 ? '+' : ''}{row.gap_to_highest}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

// ===========================================
// KECAMATAN TABLE COMPONENT
// ===========================================
const KecamatanTable: React.FC<{ data: MarketShareKecamatan[] }> = memo(({ data }) => {
    const [expanded, setExpanded] = useState(true);
    const [sortBy, setSortBy] = useState<'tsel_share' | 'gap_to_highest'>('tsel_share');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
            return sortDir === 'desc' ? valB - valA : valA - valB;
        });
    }, [data, sortBy, sortDir]);

    const handleSort = (column: 'tsel_share' | 'gap_to_highest') => {
        if (sortBy === column) {
            setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortDir('desc');
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100">
                <div className="flex items-center gap-2">
                    <Map size={16} className="text-purple-600" />
                    <span className="font-semibold text-gray-800 text-sm">Kecamatan Detail View</span>
                    <span className="text-xs text-gray-500">({data.length} kecamatan)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-[10px] border-collapse whitespace-nowrap">
                        <thead className="bg-[#2c4a6a] sticky top-0 z-10">
                            <tr>
                                <th colSpan={3} className="p-1.5 border text-center bg-slate-200 font-semibold">Identitas</th>
                                <th colSpan={3} className="p-1.5 border text-center bg-red-100 font-semibold">Current Share (%)</th>
                                <th colSpan={2} className="p-1.5 border text-center bg-amber-100 font-semibold">Growth Tsel</th>
                                <th colSpan={3} className="p-1.5 border text-center bg-blue-100 font-semibold">Status</th>
                            </tr>
                            <tr className="bg-[#3d5f85]">
                                <th className="p-1 border text-left">TAP</th>
                                <th className="p-1 border text-left">Kab</th>
                                <th className="p-1 border text-left">Kecamatan</th>
                                <th className="p-1 border text-center cursor-pointer hover:bg-red-200" onClick={() => handleSort('tsel_share')}>
                                    Tsel {sortBy === 'tsel_share' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                                <th className="p-1 border text-center">IOH</th>
                                <th className="p-1 border text-center">XL+</th>
                                <th className="p-1 border text-center">WoW</th>
                                <th className="p-1 border text-center">MoM</th>
                                <th className="p-1 border text-center">Status</th>
                                <th className="p-1 border text-center">Rank</th>
                                <th className="p-1 border text-center cursor-pointer hover:bg-blue-200" onClick={() => handleSort('gap_to_highest')}>
                                    Gap {sortBy === 'gap_to_highest' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, idx) => {
                                const isRedAlert = row.rank_tsel > 1 && row.gap_to_highest < -5;
                                return (
                                    <tr key={`${row.kecamatan}-${idx}`} className={`${isRedAlert ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                        <td className="p-1.5 border text-white">{row.tap_name}</td>
                                        <td className="p-1.5 border text-white">{row.kabupaten}</td>
                                        <td className="p-1.5 border font-medium text-gray-800">{row.kecamatan}</td>
                                        <td className={`p-1.5 border text-center font-bold ${getShareColor(row.tsel_share, true)}`}>{formatPct(row.tsel_share)}</td>
                                        <td className="p-1.5 border text-center text-white">{formatPct(row.ioh_share)}</td>
                                        <td className="p-1.5 border text-center text-white">{formatPct(row.xl_plus_share)}</td>
                                        <td className={`p-1.5 border text-center font-semibold ${getDiffColor(row.wow_tsel_growth)}`}>{formatDiff(row.wow_tsel_growth)}</td>
                                        <td className={`p-1.5 border text-center font-semibold ${getDiffColor(row.mom_tsel_growth)}`}>{formatDiff(row.mom_tsel_growth)}</td>
                                        <td className="p-1.5 border text-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getWinLoseColor(row.win_lose_status)}`}>{row.win_lose_status}</span>
                                        </td>
                                        <td className="p-1.5 border text-center">
                                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold ${row.rank_tsel === 1 ? 'bg-green-100 text-green-700' : row.rank_tsel === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {row.rank_tsel}
                                            </span>
                                        </td>
                                        <td className={`p-1.5 border text-center font-bold ${row.gap_to_highest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {row.gap_to_highest >= 0 ? '+' : ''}{row.gap_to_highest}%
                                        </td>
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
const MarketSharePage: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Market Share Performance" subtitle="Telkomsel vs Competitors Share Analysis" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Filter */}
            <div className="mt-4 bg-slate-100 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Periode:</span>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>{getMonthName(m)}</option>))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                        {[2024, 2025, 2026].map(y => (<option key={y} value={y}>{y}</option>))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mt-4">
                <SummaryCards cityData={marketShareCityData} kecData={marketShareKecData} />
            </div>

            {/* Trend Chart */}
            <TrendFBChart data={trendFBData} />

            {/* Tables */}
            <Card padding="none" className="mt-4 p-4">
                <CityTable data={marketShareCityData} />
                <KecamatanTable data={marketShareKecData} />
            </Card>
        </div>
    );
};

export default MarketSharePage;
