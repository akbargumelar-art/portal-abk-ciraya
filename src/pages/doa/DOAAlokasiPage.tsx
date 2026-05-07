/**
 * DOA Alokasi Page
 * 
 * Displays allocation data with: Tanggal, Minggu, Tahap, Produk, Kuantiti, HPP, Nominal
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Package, Clock, Filter, TrendingUp, DollarSign, Boxes, Download } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui/index';

// ===========================================
// TYPES
// ===========================================
interface AlokasiData {
    id: number;
    tanggal: string;
    minggu: 'Minggu 1' | 'Minggu 2' | 'Minggu 3' | 'Minggu 4' | 'Minggu 5';
    tahap: 'I' | 'II' | 'I - Tambahan' | 'II - Tambahan';
    produk: string;
    kuantiti: number;
    hpp: number;
    nominal: number;
}

// ===========================================
// MOCK DATA
// ===========================================
const mockAlokasiData: AlokasiData[] = [
    // ========== NOVEMBER 2024 ==========
    // Minggu 1 - Tahap I
    { id: 101, tanggal: '2024-11-04', minggu: 'Minggu 1', tahap: 'I', produk: 'Simpati 10K', kuantiti: 480, hpp: 8500, nominal: 4080000 },
    { id: 102, tanggal: '2024-11-04', minggu: 'Minggu 1', tahap: 'I', produk: 'Simpati 25K', kuantiti: 280, hpp: 21500, nominal: 6020000 },
    { id: 103, tanggal: '2024-11-05', minggu: 'Minggu 1', tahap: 'I', produk: 'byU Lite', kuantiti: 380, hpp: 12000, nominal: 4560000 },
    { id: 104, tanggal: '2024-11-05', minggu: 'Minggu 1', tahap: 'II', produk: 'byU Max', kuantiti: 200, hpp: 28000, nominal: 5600000 },

    // Minggu 2 - November
    { id: 105, tanggal: '2024-11-11', minggu: 'Minggu 2', tahap: 'I', produk: 'Simpati 50K', kuantiti: 160, hpp: 43000, nominal: 6880000 },
    { id: 106, tanggal: '2024-11-12', minggu: 'Minggu 2', tahap: 'I', produk: 'Simpati 10K', kuantiti: 420, hpp: 8500, nominal: 3570000 },
    { id: 107, tanggal: '2024-11-13', minggu: 'Minggu 2', tahap: 'II', produk: 'byU Lite', kuantiti: 300, hpp: 12000, nominal: 3600000 },

    // Minggu 3 - November
    { id: 108, tanggal: '2024-11-18', minggu: 'Minggu 3', tahap: 'I', produk: 'Simpati 25K', kuantiti: 320, hpp: 21500, nominal: 6880000 },
    { id: 109, tanggal: '2024-11-19', minggu: 'Minggu 3', tahap: 'I', produk: 'byU Max', kuantiti: 260, hpp: 28000, nominal: 7280000 },
    { id: 110, tanggal: '2024-11-20', minggu: 'Minggu 3', tahap: 'II', produk: 'Simpati 10K', kuantiti: 350, hpp: 8500, nominal: 2975000 },

    // Minggu 4 - November
    { id: 111, tanggal: '2024-11-25', minggu: 'Minggu 4', tahap: 'I', produk: 'Simpati 50K', kuantiti: 200, hpp: 43000, nominal: 8600000 },
    { id: 112, tanggal: '2024-11-26', minggu: 'Minggu 4', tahap: 'I', produk: 'byU Lite', kuantiti: 400, hpp: 12000, nominal: 4800000 },
    { id: 113, tanggal: '2024-11-27', minggu: 'Minggu 4', tahap: 'II', produk: 'Simpati 25K', kuantiti: 280, hpp: 21500, nominal: 6020000 },
    { id: 114, tanggal: '2024-11-28', minggu: 'Minggu 4', tahap: 'I - Tambahan', produk: 'byU Max', kuantiti: 150, hpp: 28000, nominal: 4200000 },

    // ========== DESEMBER 2024 ==========
    // Minggu 1 - Tahap I
    { id: 1, tanggal: '2024-12-02', minggu: 'Minggu 1', tahap: 'I', produk: 'Simpati 10K', kuantiti: 500, hpp: 8500, nominal: 4250000 },
    { id: 2, tanggal: '2024-12-02', minggu: 'Minggu 1', tahap: 'I', produk: 'Simpati 25K', kuantiti: 300, hpp: 21500, nominal: 6450000 },
    { id: 3, tanggal: '2024-12-02', minggu: 'Minggu 1', tahap: 'I', produk: 'byU Lite', kuantiti: 400, hpp: 12000, nominal: 4800000 },
    { id: 4, tanggal: '2024-12-03', minggu: 'Minggu 1', tahap: 'I', produk: 'Simpati 50K', kuantiti: 200, hpp: 43000, nominal: 8600000 },
    { id: 5, tanggal: '2024-12-03', minggu: 'Minggu 1', tahap: 'I', produk: 'byU Max', kuantiti: 250, hpp: 28000, nominal: 7000000 },

    // Minggu 1 - Tahap II
    { id: 6, tanggal: '2024-12-05', minggu: 'Minggu 1', tahap: 'II', produk: 'Simpati 10K', kuantiti: 300, hpp: 8500, nominal: 2550000 },
    { id: 7, tanggal: '2024-12-05', minggu: 'Minggu 1', tahap: 'II', produk: 'Simpati 25K', kuantiti: 150, hpp: 21500, nominal: 3225000 },

    // Minggu 2 - Tahap I
    { id: 8, tanggal: '2024-12-09', minggu: 'Minggu 2', tahap: 'I', produk: 'Simpati 10K', kuantiti: 450, hpp: 8500, nominal: 3825000 },
    { id: 9, tanggal: '2024-12-09', minggu: 'Minggu 2', tahap: 'I', produk: 'byU Lite', kuantiti: 350, hpp: 12000, nominal: 4200000 },
    { id: 10, tanggal: '2024-12-10', minggu: 'Minggu 2', tahap: 'I', produk: 'Simpati 50K', kuantiti: 180, hpp: 43000, nominal: 7740000 },
    { id: 11, tanggal: '2024-12-10', minggu: 'Minggu 2', tahap: 'I', produk: 'byU Max', kuantiti: 220, hpp: 28000, nominal: 6160000 },

    // Minggu 2 - Tahap II
    { id: 12, tanggal: '2024-12-12', minggu: 'Minggu 2', tahap: 'II', produk: 'Simpati 25K', kuantiti: 280, hpp: 21500, nominal: 6020000 },
    { id: 13, tanggal: '2024-12-12', minggu: 'Minggu 2', tahap: 'II', produk: 'byU Lite', kuantiti: 200, hpp: 12000, nominal: 2400000 },

    // Minggu 2 - Tambahan
    { id: 14, tanggal: '2024-12-14', minggu: 'Minggu 2', tahap: 'I - Tambahan', produk: 'Simpati 10K', kuantiti: 150, hpp: 8500, nominal: 1275000 },
    { id: 15, tanggal: '2024-12-14', minggu: 'Minggu 2', tahap: 'II - Tambahan', produk: 'byU Max', kuantiti: 100, hpp: 28000, nominal: 2800000 },

    // Minggu 3 - Tahap I
    { id: 16, tanggal: '2024-12-16', minggu: 'Minggu 3', tahap: 'I', produk: 'Simpati 10K', kuantiti: 600, hpp: 8500, nominal: 5100000 },
    { id: 17, tanggal: '2024-12-16', minggu: 'Minggu 3', tahap: 'I', produk: 'Simpati 25K', kuantiti: 350, hpp: 21500, nominal: 7525000 },
    { id: 18, tanggal: '2024-12-17', minggu: 'Minggu 3', tahap: 'I', produk: 'byU Lite', kuantiti: 450, hpp: 12000, nominal: 5400000 },
    { id: 19, tanggal: '2024-12-17', minggu: 'Minggu 3', tahap: 'I', produk: 'Simpati 50K', kuantiti: 250, hpp: 43000, nominal: 10750000 },

    // Minggu 3 - Tahap II
    { id: 20, tanggal: '2024-12-19', minggu: 'Minggu 3', tahap: 'II', produk: 'byU Max', kuantiti: 300, hpp: 28000, nominal: 8400000 },
    { id: 21, tanggal: '2024-12-19', minggu: 'Minggu 3', tahap: 'II', produk: 'Simpati 10K', kuantiti: 400, hpp: 8500, nominal: 3400000 },

    // Minggu 4 - Tahap I
    { id: 22, tanggal: '2024-12-23', minggu: 'Minggu 4', tahap: 'I', produk: 'Simpati 25K', kuantiti: 400, hpp: 21500, nominal: 8600000 },
    { id: 23, tanggal: '2024-12-23', minggu: 'Minggu 4', tahap: 'I', produk: 'byU Lite', kuantiti: 500, hpp: 12000, nominal: 6000000 },
    { id: 24, tanggal: '2024-12-24', minggu: 'Minggu 4', tahap: 'I', produk: 'byU Max', kuantiti: 350, hpp: 28000, nominal: 9800000 },

    // Minggu 4 - Tahap II
    { id: 25, tanggal: '2024-12-26', minggu: 'Minggu 4', tahap: 'II', produk: 'Simpati 50K', kuantiti: 220, hpp: 43000, nominal: 9460000 },
    { id: 26, tanggal: '2024-12-26', minggu: 'Minggu 4', tahap: 'II', produk: 'Simpati 10K', kuantiti: 350, hpp: 8500, nominal: 2975000 },

    // Minggu 4 - Tambahan
    { id: 27, tanggal: '2024-12-27', minggu: 'Minggu 4', tahap: 'I - Tambahan', produk: 'byU Lite', kuantiti: 200, hpp: 12000, nominal: 2400000 },
    { id: 28, tanggal: '2024-12-28', minggu: 'Minggu 4', tahap: 'II - Tambahan', produk: 'Simpati 25K', kuantiti: 180, hpp: 21500, nominal: 3870000 },
];

// Month options
const bulanOptions = [
    { value: 11, label: 'November 2024' },
    { value: 12, label: 'Desember 2024' },
];

// ===========================================
// HELPERS
// ===========================================
const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)} Jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
    return value.toLocaleString('id-ID');
};

const formatNumber = (value: number): string => value.toLocaleString('id-ID');

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getTahapColor = (tahap: string): string => {
    switch (tahap) {
        case 'I': return 'bg-blue-100 text-blue-700';
        case 'II': return 'bg-green-100 text-green-700';
        case 'I - Tambahan': return 'bg-amber-100 text-amber-700';
        case 'II - Tambahan': return 'bg-purple-100 text-purple-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getMingguColor = (minggu: string): string => {
    switch (minggu) {
        case 'Minggu 1': return 'bg-red-50 text-red-700';
        case 'Minggu 2': return 'bg-orange-50 text-orange-700';
        case 'Minggu 3': return 'bg-yellow-50 text-yellow-700';
        case 'Minggu 4': return 'bg-lime-50 text-lime-700';
        case 'Minggu 5': return 'bg-cyan-50 text-cyan-700';
        default: return 'bg-gray-50 text-gray-700';
    }
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const DOAAlokasiPage: React.FC = () => {
    const [filterBulan, setFilterBulan] = useState<number>(12); // Default Desember
    const [filterMinggu, setFilterMinggu] = useState<string>('ALL');
    const [filterTahap, setFilterTahap] = useState<string>('ALL');
    const [filterProduk, setFilterProduk] = useState<string>('ALL');

    // Get unique values for filters (based on selected month)
    const dataByMonth = useMemo(() => {
        return mockAlokasiData.filter(d => {
            const month = new Date(d.tanggal).getMonth() + 1;
            return month === filterBulan;
        });
    }, [filterBulan]);

    const mingguOptions = useMemo(() => [...new Set(dataByMonth.map(d => d.minggu))], [dataByMonth]);
    const tahapOptions = useMemo(() => [...new Set(dataByMonth.map(d => d.tahap))], [dataByMonth]);
    const produkOptions = useMemo(() => [...new Set(dataByMonth.map(d => d.produk))], [dataByMonth]);

    // Filtered data
    const filteredData = useMemo(() => {
        return dataByMonth.filter(d => {
            if (filterMinggu !== 'ALL' && d.minggu !== filterMinggu) return false;
            if (filterTahap !== 'ALL' && d.tahap !== filterTahap) return false;
            if (filterProduk !== 'ALL' && d.produk !== filterProduk) return false;
            return true;
        });
    }, [dataByMonth, filterMinggu, filterTahap, filterProduk]);

    // Summary calculations
    const summary = useMemo(() => {
        const totalKuantiti = filteredData.reduce((sum, d) => sum + d.kuantiti, 0);
        const totalNominal = filteredData.reduce((sum, d) => sum + d.nominal, 0);
        const avgHpp = filteredData.length > 0
            ? filteredData.reduce((sum, d) => sum + d.hpp, 0) / filteredData.length
            : 0;

        // Summary per minggu
        const perMinggu = mingguOptions.map(minggu => {
            const data = filteredData.filter(d => d.minggu === minggu);
            return {
                minggu,
                kuantiti: data.reduce((sum, d) => sum + d.kuantiti, 0),
                nominal: data.reduce((sum, d) => sum + d.nominal, 0),
            };
        }).filter(d => d.kuantiti > 0);

        // Summary per tahap with average per product
        const perTahap = tahapOptions.map(tahap => {
            const data = filteredData.filter(d => d.tahap === tahap);
            const uniqueProducts = new Set(data.map(d => d.produk)).size;
            const totalQty = data.reduce((sum, d) => sum + d.kuantiti, 0);
            const totalNominal = data.reduce((sum, d) => sum + d.nominal, 0);
            return {
                tahap,
                kuantiti: totalQty,
                nominal: totalNominal,
                avgQtyPerProduct: uniqueProducts > 0 ? Math.round(totalQty / uniqueProducts) : 0,
                avgNominalPerProduct: uniqueProducts > 0 ? Math.round(totalNominal / uniqueProducts) : 0,
                productCount: uniqueProducts,
            };
        }).filter(d => d.kuantiti > 0);

        // Summary per produk with averages
        const perProduk = produkOptions.map(produk => {
            const data = filteredData.filter(d => d.produk === produk);
            const alokCount = data.length; // jumlah alokasi
            const totalQty = data.reduce((sum, d) => sum + d.kuantiti, 0);
            const totalNominal = data.reduce((sum, d) => sum + d.nominal, 0);
            return {
                produk,
                kuantiti: totalQty,
                nominal: totalNominal,
                alokCount,
                avgQtyPerAlok: alokCount > 0 ? Math.round(totalQty / alokCount) : 0,
                avgNominalPerAlok: alokCount > 0 ? Math.round(totalNominal / alokCount) : 0,
            };
        }).filter(d => d.kuantiti > 0);

        return { totalKuantiti, totalNominal, avgHpp, perMinggu, perTahap, perProduk };
    }, [filteredData, mingguOptions, tahapOptions, produkOptions]);

    // Export to Excel (CSV format)
    const handleExportExcel = useCallback(() => {
        const bulanName = bulanOptions.find(b => b.value === filterBulan)?.label || '';
        const headers = ['No', 'Tanggal', 'Minggu', 'Tahap', 'Produk', 'Kuantiti', 'HPP', 'Nominal'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map((row, idx) => [
                idx + 1,
                formatDate(row.tanggal),
                row.minggu,
                row.tahap,
                row.produk,
                row.kuantiti,
                row.hpp,
                row.nominal
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DOA_Alokasi_${bulanName.replace(/\s+/g, '_')}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [filteredData, filterBulan]);

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="p-6 animate-fade-in">
            <Header title="DOA - Alokasi" subtitle="Data Alokasi Produk Per Minggu & Tahap" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Boxes size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-blue-600 font-medium">Total Kuantiti</div>
                            <div className="text-xl font-bold text-blue-800">{formatNumber(summary.totalKuantiti)}</div>
                            <div className="text-[10px] text-blue-500">unit</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 font-medium">Total Nominal</div>
                            <div className="text-xl font-bold text-green-800">{formatCurrency(summary.totalNominal)}</div>
                            <div className="text-[10px] text-green-500">rupiah</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-purple-600 font-medium">Rata-rata HPP</div>
                            <div className="text-xl font-bold text-purple-800">{formatCurrency(summary.avgHpp)}</div>
                            <div className="text-[10px] text-purple-500">per unit</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg">
                            <Package size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-amber-600 font-medium">Jumlah Alokasi</div>
                            <div className="text-xl font-bold text-amber-800">{filteredData.length}</div>
                            <div className="text-[10px] text-amber-500">transaksi</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-700 text-sm">Filter Data</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-700">Bulan:</label>
                        <select
                            value={filterBulan}
                            onChange={(e) => {
                                setFilterBulan(parseInt(e.target.value));
                                setFilterMinggu('ALL');
                                setFilterTahap('ALL');
                                setFilterProduk('ALL');
                            }}
                            className="px-3 py-1.5 text-sm border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                        >
                            {bulanOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                        </select>
                    </div>
                    <div className="border-l border-gray-300 h-6" />
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-700">Minggu:</label>
                        <select
                            value={filterMinggu}
                            onChange={(e) => setFilterMinggu(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Minggu</option>
                            {mingguOptions.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-700">Tahap:</label>
                        <select
                            value={filterTahap}
                            onChange={(e) => setFilterTahap(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Tahap</option>
                            {tahapOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-700">Produk:</label>
                        <select
                            value={filterProduk}
                            onChange={(e) => setFilterProduk(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Produk</option>
                            {produkOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                {/* Per Minggu */}
                <Card>
                    <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        Summary per Minggu
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="data-table data-table-compact">
                            <thead className="bg-[#2c4a6a]">
                                <tr className="text-white">
                                    <th className="p-2 border border-gray-600 text-left font-semibold">Minggu</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Qty</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.perMinggu.map((row, idx) => (
                                    <tr key={row.minggu} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-2 border">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getMingguColor(row.minggu)}`}>
                                                {row.minggu}
                                            </span>
                                        </td>
                                        <td className="p-2 border text-right font-medium">{formatNumber(row.kuantiti)}</td>
                                        <td className="p-2 border text-right text-green-600 font-medium">{formatCurrency(row.nominal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Per Tahap - dengan rata-rata per produk */}
                <Card>
                    <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                        <TrendingUp size={14} className="text-green-500" />
                        Summary per Tahap (Rata-rata per Produk)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="data-table data-table-compact">
                            <thead className="bg-[#2c4a6a]">
                                <tr className="text-white">
                                    <th className="p-2 border border-gray-600 text-left font-semibold">Tahap</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Total Qty</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Produk</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Avg Qty/Produk</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Avg Nominal/Produk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.perTahap.map((row, idx) => (
                                    <tr key={row.tahap} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-2 border">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getTahapColor(row.tahap)}`}>
                                                {row.tahap}
                                            </span>
                                        </td>
                                        <td className="p-2 border text-right font-medium">{formatNumber(row.kuantiti)}</td>
                                        <td className="p-2 border text-right text-blue-600 font-medium">{row.productCount}</td>
                                        <td className="p-2 border text-right text-purple-600 font-medium">{formatNumber(row.avgQtyPerProduct)}</td>
                                        <td className="p-2 border text-right text-green-600 font-medium">{formatCurrency(row.avgNominalPerProduct)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Per Produk - dengan rata-rata per alokasi */}
                <Card>
                    <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                        <Package size={14} className="text-purple-500" />
                        Summary per Produk (Rata-rata per Alokasi)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="data-table data-table-compact">
                            <thead className="bg-[#2c4a6a]">
                                <tr className="text-white">
                                    <th className="p-2 border border-gray-600 text-left font-semibold">Produk</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Total Qty</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Alokasi</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Avg Qty/Alok</th>
                                    <th className="p-2 border border-gray-600 text-right font-semibold">Avg Nom/Alok</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.perProduk.map((row, idx) => (
                                    <tr key={row.produk} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-2 border font-medium text-gray-700">{row.produk}</td>
                                        <td className="p-2 border text-right font-medium">{formatNumber(row.kuantiti)}</td>
                                        <td className="p-2 border text-right text-blue-600 font-medium">{row.alokCount}x</td>
                                        <td className="p-2 border text-right text-purple-600 font-medium">{formatNumber(row.avgQtyPerAlok)}</td>
                                        <td className="p-2 border text-right text-green-600 font-medium">{formatCurrency(row.avgNominalPerAlok)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Detail Table */}
            <Card className="mt-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm">Detail Alokasi ({filteredData.length} data)</h3>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={14} />
                        Export Excel
                    </button>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                    <table className="data-table data-table-compact">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                            <tr>
                                <th className="p-2 border text-center font-semibold min-w-[50px]">No</th>
                                <th className="p-2 border text-center font-semibold min-w-[100px]">Tanggal</th>
                                <th className="p-2 border text-center font-semibold min-w-[90px]">Minggu</th>
                                <th className="p-2 border text-center font-semibold min-w-[100px]">Tahap</th>
                                <th className="p-2 border text-left font-semibold min-w-[120px]">Produk</th>
                                <th className="p-2 border text-right font-semibold min-w-[80px]">Kuantiti</th>
                                <th className="p-2 border text-right font-semibold min-w-[100px]">HPP</th>
                                <th className="p-2 border text-right font-semibold min-w-[120px]">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, idx) => (
                                <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                    <td className="p-2 border text-center text-gray-500">{idx + 1}</td>
                                    <td className="p-2 border text-center">{formatDate(row.tanggal)}</td>
                                    <td className="p-2 border text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getMingguColor(row.minggu)}`}>
                                            {row.minggu}
                                        </span>
                                    </td>
                                    <td className="p-2 border text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getTahapColor(row.tahap)}`}>
                                            {row.tahap}
                                        </span>
                                    </td>
                                    <td className="p-2 border font-medium text-gray-700">{row.produk}</td>
                                    <td className="p-2 border text-right font-semibold text-blue-700">{formatNumber(row.kuantiti)}</td>
                                    <td className="p-2 border text-right text-gray-600">Rp {formatNumber(row.hpp)}</td>
                                    <td className="p-2 border text-right font-semibold text-green-600">Rp {formatNumber(row.nominal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-slate-100 font-bold">
                            <tr>
                                <td colSpan={5} className="p-2 border text-right">TOTAL</td>
                                <td className="p-2 border text-right text-blue-700">{formatNumber(summary.totalKuantiti)}</td>
                                <td className="p-2 border text-right text-gray-600">-</td>
                                <td className="p-2 border text-right text-green-700">Rp {formatNumber(summary.totalNominal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DOAAlokasiPage;
