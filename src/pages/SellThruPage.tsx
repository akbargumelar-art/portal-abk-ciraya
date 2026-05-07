import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Select, Badge } from '../components/ui/index';
import { Bar } from 'react-chartjs-2';

interface SellThruData {
    product: string;
    category: string;
    stockIn: number;
    stockOut: number;
    sellThruRate: number;
    trend: 'up' | 'down' | 'stable';
}

const mockData: SellThruData[] = [
    { product: 'SP Halo 10GB', category: 'Perdana', stockIn: 500, stockOut: 420, sellThruRate: 84, trend: 'up' },
    { product: 'Tri Happy 5GB', category: 'Perdana', stockIn: 300, stockOut: 180, sellThruRate: 60, trend: 'down' },
    { product: 'XL Xtra 8GB', category: 'Perdana', stockIn: 400, stockOut: 340, sellThruRate: 85, trend: 'up' },
    { product: 'Voucher 25K', category: 'Voucher', stockIn: 1000, stockOut: 890, sellThruRate: 89, trend: 'up' },
    { product: 'Voucher 50K', category: 'Voucher', stockIn: 800, stockOut: 560, sellThruRate: 70, trend: 'stable' },
    { product: 'Voucher 100K', category: 'Voucher', stockIn: 500, stockOut: 320, sellThruRate: 64, trend: 'down' },
];

const SellThruPage: React.FC = () => {
    const [period, setPeriod] = useState('current');
    const [category, setCategory] = useState('');

    const filteredData = category
        ? mockData.filter(d => d.category === category)
        : mockData;

    const avgSellThru = Math.round(
        filteredData.reduce((sum, d) => sum + d.sellThruRate, 0) / filteredData.length
    );

    const chartData = {
        labels: filteredData.map(d => d.product),
        datasets: [
            {
                label: 'Stock In',
                data: filteredData.map(d => d.stockIn),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
            {
                label: 'Stock Out',
                data: filteredData.map(d => d.stockOut),
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Sell Thru"
            />

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Rata-rata Sell Thru</p>
                            <p className="text-2xl font-bold text-gray-900">{avgSellThru}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BarChart3 size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Stock In</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredData.reduce((sum, d) => sum + d.stockIn, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-purple-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Stock Out</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredData.reduce((sum, d) => sum + d.stockOut, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <TrendingDown size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Produk Trending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredData.filter(d => d.trend === 'up').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-emerald-600" />
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
                            { value: 'current', label: 'Bulan Ini' },
                            { value: 'last', label: 'Bulan Lalu' },
                            { value: 'quarter', label: 'Kuartal Ini' },
                        ]}
                    />
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={[
                            { value: '', label: 'Semua Kategori' },
                            { value: 'Perdana', label: 'Perdana' },
                            { value: 'Voucher', label: 'Voucher' },
                        ]}
                    />
                </div>
                <Button variant="outline" leftIcon={<Download size={16} />}>
                    Export
                </Button>
            </div>

            {/* Chart */}
            <Card className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Perbandingan Stock In vs Stock Out</h3>
                <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </Card>

            {/* Table */}
            <Card className="mt-6" padding="none">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Detail Sell Thru per Produk</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left p-4 text-sm font-semibold text-white">Produk</th>
                                <th className="text-left p-4 text-sm font-semibold text-white">Kategori</th>
                                <th className="text-right p-4 text-sm font-semibold text-white">Stock In</th>
                                <th className="text-right p-4 text-sm font-semibold text-white">Stock Out</th>
                                <th className="text-right p-4 text-sm font-semibold text-white">Sell Thru Rate</th>
                                <th className="text-center p-4 text-sm font-semibold text-white">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{row.product}</td>
                                    <td className="p-4">
                                        <Badge variant="neutral">{row.category}</Badge>
                                    </td>
                                    <td className="p-4 text-right">{row.stockIn.toLocaleString()}</td>
                                    <td className="p-4 text-right">{row.stockOut.toLocaleString()}</td>
                                    <td className="p-4 text-right">
                                        <span className={`font-semibold ${row.sellThruRate >= 80 ? 'text-green-600' :
                                            row.sellThruRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {row.sellThruRate}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {row.trend === 'up' && <TrendingUp size={18} className="inline text-green-500" />}
                                        {row.trend === 'down' && <TrendingDown size={18} className="inline text-red-500" />}
                                        {row.trend === 'stable' && <span className="text-gray-400">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SellThruPage;
