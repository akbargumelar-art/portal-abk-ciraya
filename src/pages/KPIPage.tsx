import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Select, Badge } from '../components/ui/index';
import { Line } from 'react-chartjs-2';

interface KPIData {
    name: string;
    target: number;
    actual: number;
    unit: string;
    status: 'achieved' | 'on_track' | 'at_risk' | 'behind';
}

const mockKPIs: KPIData[] = [
    { name: 'Revenue', target: 500, actual: 485, unit: 'Juta', status: 'on_track' },
    { name: 'Outlet Aktif', target: 50, actual: 48, unit: 'Outlet', status: 'on_track' },
    { name: 'Kunjungan', target: 200, actual: 210, unit: 'Visit', status: 'achieved' },
    { name: 'Sell Out Perdana', target: 3000, actual: 3250, unit: 'Unit', status: 'achieved' },
    { name: 'Sell Out Voucher', target: 5000, actual: 4200, unit: 'Unit', status: 'at_risk' },
    { name: 'New Outlet', target: 10, actual: 5, unit: 'Outlet', status: 'behind' },
];

const KPIPage: React.FC = () => {
    const [period, setPeriod] = useState('monthly');

    const getStatusBadge = (status: KPIData['status']) => {
        switch (status) {
            case 'achieved':
                return <Badge variant="success">Tercapai</Badge>;
            case 'on_track':
                return <Badge variant="info">On Track</Badge>;
            case 'at_risk':
                return <Badge variant="warning">At Risk</Badge>;
            case 'behind':
                return <Badge variant="error">Behind</Badge>;
        }
    };

    const getProgressColor = (status: KPIData['status']) => {
        switch (status) {
            case 'achieved': return 'bg-green-500';
            case 'on_track': return 'bg-blue-500';
            case 'at_risk': return 'bg-yellow-500';
            case 'behind': return 'bg-red-500';
        }
    };

    const trendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Target',
                data: [400, 420, 440, 460, 480, 500, 500, 500, 500, 500, 500, 500],
                borderColor: '#E5E7EB',
                borderDash: [5, 5],
                tension: 0,
                fill: false,
            },
            {
                label: 'Actual',
                data: [380, 410, 430, 455, 470, 485, null, null, null, null, null, null],
                borderColor: '#F13B4B',
                backgroundColor: 'rgba(241, 59, 75, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const summaryStats = {
        achieved: mockKPIs.filter(k => k.status === 'achieved').length,
        onTrack: mockKPIs.filter(k => k.status === 'on_track').length,
        atRisk: mockKPIs.filter(k => k.status === 'at_risk').length,
        behind: mockKPIs.filter(k => k.status === 'behind').length,
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="KPI Dashboard"
                subtitle="Key Performance Indicators tracking"
            />

            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3">
                        <CheckCircle size={24} className="text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.achieved}</p>
                            <p className="text-sm text-gray-500">Tercapai</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={24} className="text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.onTrack}</p>
                            <p className="text-sm text-gray-500">On Track</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.atRisk}</p>
                            <p className="text-sm text-gray-500">At Risk</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3">
                        <Target size={24} className="text-red-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.behind}</p>
                            <p className="text-sm text-gray-500">Behind</p>
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
                            { value: 'monthly', label: 'Bulanan' },
                            { value: 'quarterly', label: 'Kuartalan' },
                            { value: 'yearly', label: 'Tahunan' },
                        ]}
                    />
                </div>
                <Button variant="outline" leftIcon={<Download size={16} />}>
                    Export KPI
                </Button>
            </div>

            {/* Trend Chart */}
            <Card className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (Juta Rupiah)</h3>
                <div className="h-80">
                    <Line
                        data={trendData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top' as const } },
                            scales: { y: { beginAtZero: true } }
                        }}
                    />
                </div>
            </Card>

            {/* KPI Cards Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockKPIs.map((kpi, idx) => {
                    const progress = Math.min(100, Math.round((kpi.actual / kpi.target) * 100));
                    return (
                        <Card key={idx}>
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                                {getStatusBadge(kpi.status)}
                            </div>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-3xl font-bold text-gray-900">{kpi.actual.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 mb-1">/ {kpi.target.toLocaleString()} {kpi.unit}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${getProgressColor(kpi.status)}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{progress}% dari target</p>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default KPIPage;
