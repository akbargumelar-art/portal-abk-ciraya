/**
 * MobileDashboard — Versi mobile dari Dashboard.
 *
 * Layout bergaya app mobile:
 * - Greeting card dengan gradient
 * - KPI cards horizontal scroll (swipeable)
 * - Status ringkas (PJP ratio, Digipos)
 * - Quick action menu
 * - Mini chart (line)
 * - Outlet stats cards
 */
import React, { useMemo, useState } from 'react';
import {
    DollarSign, Store, Smartphone, ShoppingCart,
    TrendingUp, Package, CreditCard, ChevronRight,
    Calendar, ArrowUp, ArrowDown, Minus,
    BarChart2, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    LineElement, PointElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { outlets as mockOutlets, transactions as mockTransactions } from '../../data/mockData';
import { buildDashboardViewModel } from '../../utils/dashboardFilterMock';
import { createDefaultFilterState } from '../../components/common/FilterBar';
import type { FilterState } from '../../components/common/FilterBar';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend);

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
    { label: 'Stok Perdana', icon: <Package size={22} className="text-[#F13B4B]" />, path: '/stock/perdana', bg: 'bg-red-50' },
    { label: 'Stok Voucher', icon: <CreditCard size={22} className="text-blue-600" />, path: '/stock/voucher', bg: 'bg-blue-50' },
    { label: 'Omzet Outlet', icon: <TrendingUp size={22} className="text-green-600" />, path: '/omzet', bg: 'bg-green-50' },
    { label: 'Register Outlet', icon: <Store size={22} className="text-purple-600" />, path: '/outlets', bg: 'bg-purple-50' },
    { label: 'ST Nota', icon: <ShoppingCart size={22} className="text-orange-600" />, path: '/sell-thru/nota', bg: 'bg-orange-50' },
    { label: 'Monitoring Visit', icon: <Activity size={22} className="text-teal-600" />, path: '/docs/visit', bg: 'bg-teal-50' },
    { label: 'KPI Cluster', icon: <BarChart2 size={22} className="text-indigo-600" />, path: '/kpi/cluster', bg: 'bg-indigo-50' },
    { label: 'Top Line', icon: <TrendingUp size={22} className="text-cyan-600" />, path: '/performance/topline', bg: 'bg-cyan-50' },
];

// ─── Greeting ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
}

// ─── Mini Growth Chip ─────────────────────────────────────────────────────────

const GrowthChip: React.FC<{ value: number }> = ({ value }) => {
    const isPos = value > 0, isNeg = value < 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isPos ? 'bg-green-100 text-green-700' : isNeg ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            {isPos ? <ArrowUp size={10} /> : isNeg ? <ArrowDown size={10} /> : <Minus size={10} />}
            {Math.abs(value).toFixed(1)}%
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MobileDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filters] = useState<FilterState>(() => createDefaultFilterState());

    const view = useMemo(
        () => buildDashboardViewModel(mockOutlets, mockTransactions, filters),
        [filters]
    );

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Mini line chart data
    const lineData = {
        labels: view.salesTrend.map(d => d.month),
        datasets: [
            {
                label: 'Perdana',
                data: view.salesTrend.map(d => d.perdana),
                borderColor: '#F13B4B',
                backgroundColor: 'rgba(241,59,75,0.12)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'Voucher',
                data: view.salesTrend.map(d => d.voucher),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59,130,246,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: { boxWidth: 10, font: { size: 10 } },
            },
            tooltip: { mode: 'index' as const, intersect: false },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
        },
    };

    return (
        <div className="mobile-page pb-4">

            {/* ── Greeting Banner ── */}
            <div className="relative overflow-hidden rounded-2xl mx-4 mt-4 p-5"
                style={{ background: 'linear-gradient(135deg, #F13B4B 0%, #D92939 60%, #1E3A5F 100%)' }}>
                <div className="relative z-10">
                    <p className="text-white/80 text-xs font-medium mb-0.5">{getGreeting()},</p>
                    <h2 className="text-white text-xl font-bold leading-tight">{user?.name?.split(' ')[0] ?? 'User'}</h2>
                    <p className="text-white/60 text-[11px] mt-1 flex items-center gap-1">
                        <Calendar size={11} />{dateStr}
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -right-2 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
            </div>

            {/* ── KPI Cards (horizontal scroll) ── */}
            <div className="mt-5 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Ringkasan KPI</h3>
                    <span className="text-[10px] text-gray-400">Bulan ini</span>
                </div>
            </div>
            <div className="flex gap-3 px-4 overflow-x-auto pb-1 scroll-snap-x-mandatory scrollbar-hide">
                {[
                    {
                        title: 'Total Sales', value: formatCurrency(view.kpiSummary.totalSales),
                        growth: view.kpiSummary.totalSalesGrowth,
                        icon: <DollarSign size={18} />, color: '#F13B4B', bg: 'from-red-500 to-red-600',
                    },
                    {
                        title: 'Outlet Aktif', value: view.kpiSummary.activeOutlets.toLocaleString(),
                        growth: view.kpiSummary.activeOutletsGrowth,
                        icon: <Store size={18} />, color: '#10B981', bg: 'from-emerald-500 to-emerald-600',
                    },
                    {
                        title: 'Trx Digipos', value: view.kpiSummary.digiposTrx.toLocaleString(),
                        growth: view.kpiSummary.digiposTrxGrowth,
                        icon: <Smartphone size={18} />, color: '#3B82F6', bg: 'from-blue-500 to-blue-600',
                    },
                    {
                        title: 'Sell-out Qty', value: view.kpiSummary.sellOutQty.toLocaleString(),
                        growth: view.kpiSummary.sellOutQtyGrowth,
                        icon: <ShoppingCart size={18} />, color: '#F59E0B', bg: 'from-amber-500 to-amber-600',
                    },
                ].map((kpi, i) => (
                    <div
                        key={i}
                        className={`flex-shrink-0 w-40 snap-start rounded-2xl bg-gradient-to-br ${kpi.bg} p-4 text-white shadow-lg`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 bg-white/20 rounded-lg">{kpi.icon}</div>
                            <GrowthChip value={kpi.growth} />
                        </div>
                        <p className="text-white/80 text-[11px] font-medium">{kpi.title}</p>
                        <p className="text-white text-xl font-bold mt-0.5 leading-tight">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Status Ringkas (PJP, Digipos) ── */}
            <div className="mx-4 mt-5 grid grid-cols-3 gap-2">
                {[
                    { label: 'Total PJP', value: mockOutlets.filter(o => o.pjpStatus === 'PJP').length, sub: 'Outlet PJP' },
                    { label: 'Non PJP', value: mockOutlets.filter(o => o.pjpStatus !== 'PJP').length, sub: 'Outlet' },
                    {
                        label: 'Rasio PJP',
                        value: ((mockOutlets.filter(o => o.pjpStatus === 'PJP').length / mockOutlets.length) * 100).toFixed(1) + '%',
                        sub: 'dari total'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-[11px] font-semibold text-gray-700 leading-tight">{stat.label}</p>
                        <p className="text-[10px] text-gray-400">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Quick Actions ── */}
            <div className="mt-5 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Menu Cepat</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {QUICK_ACTIONS.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}>
                                {action.icon}
                            </div>
                            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tren Sales Chart ── */}
            <div className="mx-4 mt-5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Tren Sales 6 Bulan</h3>
                    <span className="text-[10px] text-gray-400">Perdana & Voucher</span>
                </div>
                <div style={{ height: 160 }}>
                    <Line data={lineData} options={chartOptions} />
                </div>
            </div>

            {/* ── Outlet Distribution ── */}
            <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Distribusi Outlet per TAP</h3>
                <div className="space-y-2.5">
                    {view.outletDistribution.slice(0, 6).map((d, i) => {
                        const maxVal = Math.max(...view.outletDistribution.map(x => x.value));
                        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
                        return (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-700 font-medium truncate max-w-[150px]">{d.label}</span>
                                    <span className="text-xs font-bold text-gray-900">{d.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#F13B4B] to-[#FF6B78] rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Outlet Status ── */}
            <div className="mx-4 mt-4 mb-2">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Status PJP & Digipos</h3>
                    <button
                        onClick={() => navigate('/outlets')}
                        className="text-[11px] text-[#F13B4B] font-semibold flex items-center gap-0.5"
                    >
                        Lihat semua <ChevronRight size={12} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            title: 'Status PJP',
                            items: [
                                { label: 'PJP', value: mockOutlets.filter(o => o.pjpStatus === 'PJP').length, color: 'bg-green-500' },
                                { label: 'Non PJP', value: mockOutlets.filter(o => o.pjpStatus !== 'PJP').length, color: 'bg-gray-300' },
                            ],
                        },
                        {
                            title: 'Status Digipos',
                            items: [
                                { label: 'Aktif', value: mockOutlets.filter(o => o.digiposStatus === 'active').length, color: 'bg-blue-500' },
                                { label: 'Tidak Aktif', value: mockOutlets.filter(o => o.digiposStatus !== 'active').length, color: 'bg-gray-300' },
                            ],
                        },
                    ].map((section, si) => (
                        <div key={si} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
                            <p className="text-[11px] font-semibold text-gray-600 mb-2.5">{section.title}</p>
                            {section.items.map((item, ii) => (
                                <div key={ii} className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                        <span className="text-xs text-gray-600">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileDashboard;
