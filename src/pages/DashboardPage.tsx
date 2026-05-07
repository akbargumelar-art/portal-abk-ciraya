import React, { useMemo, useState, useCallback } from 'react';
import {
    DollarSign,
    Store,
    Smartphone,
    ShoppingCart,
    TrendingUp,
    Users,
    Calendar
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import KPICard from '../components/ui/KPICard';
import { Card } from '../components/ui/index';
import { PageShell } from '../components/layout/Page';
import FilterBar, { createDefaultFilterState } from '../components/common/FilterBar';
import type { FilterState } from '../components/common/FilterBar';
import { outlets as mockOutlets, transactions as mockTransactions } from '../data/mockData';
import { buildDashboardViewModel } from '../utils/dashboardFilterMock';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileDashboard from './mobile/MobileDashboard';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState());

    // Mobile: render native mobile dashboard
    if (isMobile) return <MobileDashboard />;

    const handleFilterChange = useCallback((next: FilterState) => {
        setFilters(next);
    }, []);

    const view = useMemo(
        () => buildDashboardViewModel(mockOutlets, mockTransactions, filters),
        [filters],
    );

    // KPI Cards data
    const kpiCards = useMemo(() => [
        {
            title: 'Total Sales',
            value: view.kpiSummary.totalSales,
            growth: view.kpiSummary.totalSalesGrowth,
            icon: <DollarSign size={24} className="text-[#F13B4B]" />,
            iconBgColor: 'bg-[#F13B4B]/10',
            prefix: 'Rp ',
        },
        {
            title: 'Outlet Aktif',
            value: view.kpiSummary.activeOutlets,
            growth: view.kpiSummary.activeOutletsGrowth,
            icon: <Store size={24} className="text-[#10B981]" />,
            iconBgColor: 'bg-[#10B981]/10',
        },
        {
            title: 'Transaksi Digipos',
            value: view.kpiSummary.digiposTrx,
            growth: view.kpiSummary.digiposTrxGrowth,
            icon: <Smartphone size={24} className="text-[#3B82F6]" />,
            iconBgColor: 'bg-[#3B82F6]/10',
        },
        {
            title: 'Sell-out Qty',
            value: view.kpiSummary.sellOutQty,
            growth: view.kpiSummary.sellOutQtyGrowth,
            icon: <ShoppingCart size={24} className="text-[#F59E0B]" />,
            iconBgColor: 'bg-[#F59E0B]/10',
        },
    ], [view.kpiSummary]);

    // Bar chart for outlet distribution
    const barChartData = {
        labels: view.outletDistribution.map(d => d.label.split(' ')[0]),
        datasets: [
            {
                label: 'Outlet',
                data: view.outletDistribution.map(d => d.value),
                backgroundColor: 'rgba(241, 59, 75, 0.8)',
                borderColor: '#F13B4B',
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 32,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E3A5F',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' as const },
                bodyFont: { size: 12 },
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11 },
                    color: '#64748B',
                },
            },
            y: {
                grid: { color: '#E2E8F0' },
                ticks: {
                    font: { size: 11 },
                    color: '#64748B',
                },
            },
        },
    };

    // Line chart for sales trend
    const lineChartData = {
        labels: view.salesTrend.map(d => d.month),
        datasets: [
            {
                label: 'Perdana',
                data: view.salesTrend.map(d => d.perdana),
                borderColor: '#F13B4B',
                backgroundColor: 'rgba(241, 59, 75, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#F13B4B',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Voucher',
                data: view.salesTrend.map(d => d.voucher),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Digipos',
                data: view.salesTrend.map(d => d.digipos),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { size: 12 },
                    color: '#64748B',
                },
            },
            tooltip: {
                backgroundColor: '#1E3A5F',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' as const },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11 },
                    color: '#64748B',
                },
            },
            y: {
                grid: { color: '#E2E8F0' },
                ticks: {
                    font: { size: 11 },
                    color: '#64748B',
                    callback: (value: number | string) => {
                        if (typeof value === 'number') {
                            return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value;
                        }
                        return value;
                    },
                },
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
    };

    // Quick stats
    const quickStats = [
        {
            label: 'Total Outlet',
            value: view.filteredOutlets.length.toLocaleString(),
            icon: <Store size={16} className="text-gray-400" />,
        },
        {
            label: 'PJP Aktif',
            value: view.filteredOutlets.filter(o => o.pjpStatus === 'PJP').length.toLocaleString(),
            icon: <Users size={16} className="text-gray-400" />,
        },
        {
            label: 'Bulan Ini',
            value: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
            icon: <Calendar size={16} className="text-gray-400" />,
        },
    ];

    return (
        <PageShell
            title="Dashboard"
            subtitle={`Selamat datang, ${user?.name?.split(' ')[0] || 'User'}!`}
        >

            {/* Filter Bar */}
            <FilterBar
                onFilterChange={handleFilterChange}
                className="mt-0"
            />

            {/* Quick Stats Bar */}
            <div className="flex flex-wrap items-center gap-6 mt-6 mb-6">
                {quickStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-sm text-gray-500">{stat.label}:</span>
                        <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
                {kpiCards.map((card, idx) => (
                    <KPICard key={idx} {...card} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card padding="md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">Distribusi Outlet per PJP</h3>
                            <p className="text-sm text-gray-500">Top 10 Salesforce berdasarkan jumlah outlet</p>
                        </div>
                        <TrendingUp size={20} className="text-gray-400" />
                    </div>
                    <div className="h-80">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </Card>

                {/* Line Chart */}
                <Card padding="md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">Tren Sales 6 Bulan</h3>
                            <p className="text-sm text-gray-500">Performa Perdana, Voucher, dan Digipos</p>
                        </div>
                        <TrendingUp size={20} className="text-gray-400" />
                    </div>
                    <div className="h-80">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                <Card padding="md">
                    <h4 className="font-medium text-gray-900 mb-3">Status Outlet</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Fisik</span>
                            <span className="text-sm font-semibold text-green-600">
                                {view.filteredOutlets.filter(o => o.physicalStatus === 'Fisik').length.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Non Fisik</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {view.filteredOutlets.filter(o => o.physicalStatus === 'Non Fisik').length.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Rasio Fisik</span>
                            <span className="text-sm font-semibold text-blue-600">
                                {view.filteredOutlets.length === 0
                                    ? '0.0'
                                    : ((view.filteredOutlets.filter(o => o.physicalStatus === 'Fisik').length / view.filteredOutlets.length) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card padding="md">
                    <h4 className="font-medium text-gray-900 mb-3">Status PJP</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">PJP</span>
                            <span className="text-sm font-semibold text-green-600">
                                {view.filteredOutlets.filter(o => o.pjpStatus === 'PJP').length.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Non PJP</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {view.filteredOutlets.filter(o => o.pjpStatus === 'Non PJP').length.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Rasio PJP</span>
                            <span className="text-sm font-semibold text-blue-600">
                                {view.filteredOutlets.length === 0
                                    ? '0.0'
                                    : ((view.filteredOutlets.filter(o => o.pjpStatus === 'PJP').length / view.filteredOutlets.length) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card padding="md">
                    <h4 className="font-medium text-gray-900 mb-3">Status Digipos</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Aktif</span>
                            <span className="text-sm font-semibold text-green-600">
                                {view.filteredOutlets.filter(o => o.digiposStatus === 'active').length.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Tidak Aktif</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {view.filteredOutlets.filter(o => o.digiposStatus === 'inactive').length.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Rasio Aktivasi</span>
                            <span className="text-sm font-semibold text-blue-600">
                                {view.filteredOutlets.length === 0
                                    ? '0.0'
                                    : ((view.filteredOutlets.filter(o => o.digiposStatus === 'active').length / view.filteredOutlets.length) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </PageShell>
    );
};

export default DashboardPage;
