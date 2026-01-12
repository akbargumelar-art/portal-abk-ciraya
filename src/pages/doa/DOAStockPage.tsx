/**
 * DOA Stock Page
 * 
 * Stock management with drill-down to individual Serial Numbers
 * Features: Global SN Finder, Detail Modal, Aggregated Summary
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    Clock, Search, Filter, Package, MapPin, Calendar, Eye, Download,
    Boxes, AlertTriangle, CheckCircle, Database, Hash
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui/index';
import StockDetailModal from '../../components/doa/StockDetailModal';

// ===========================================
// TYPES
// ===========================================
interface StockGroup {
    id: string;
    product_code: string;
    product_name: string;
    location: string;
    total_qty: number;
    expiry_date: string;
    sn_prefix: string;
    status: 'active' | 'expiring' | 'expired';
}

interface SNSearchResult {
    found: boolean;
    sn: string;
    product_name?: string;
    location?: string;
    expiry_date?: string;
}

// ===========================================
// MOCK DATA
// ===========================================
const mockStockData: StockGroup[] = [
    { id: '1', product_code: 'SP10K', product_name: 'Simpati 10K', location: 'Gudang Cirebon', total_qty: 5000, expiry_date: '2025-06-30', sn_prefix: '62811', status: 'active' },
    { id: '2', product_code: 'SP10K', product_name: 'Simpati 10K', location: 'Gudang Kuningan', total_qty: 3500, expiry_date: '2025-05-15', sn_prefix: '62811', status: 'active' },
    { id: '3', product_code: 'SP10K', product_name: 'Simpati 10K', location: 'Gudang Majalengka', total_qty: 2800, expiry_date: '2025-01-20', sn_prefix: '62811', status: 'expiring' },

    { id: '4', product_code: 'SP25K', product_name: 'Simpati 25K', location: 'Gudang Cirebon', total_qty: 4200, expiry_date: '2025-07-31', sn_prefix: '62812', status: 'active' },
    { id: '5', product_code: 'SP25K', product_name: 'Simpati 25K', location: 'Gudang Kuningan', total_qty: 2100, expiry_date: '2025-08-15', sn_prefix: '62812', status: 'active' },

    { id: '6', product_code: 'SP50K', product_name: 'Simpati 50K', location: 'Gudang Cirebon', total_qty: 1800, expiry_date: '2025-04-30', sn_prefix: '62815', status: 'active' },
    { id: '7', product_code: 'SP50K', product_name: 'Simpati 50K', location: 'Gudang Majalengka', total_qty: 1500, expiry_date: '2024-12-31', sn_prefix: '62815', status: 'expired' },

    { id: '8', product_code: 'BYUL', product_name: 'byU Lite', location: 'Gudang Cirebon', total_qty: 6500, expiry_date: '2025-09-30', sn_prefix: '62814', status: 'active' },
    { id: '9', product_code: 'BYUL', product_name: 'byU Lite', location: 'Gudang Kuningan', total_qty: 4000, expiry_date: '2025-08-31', sn_prefix: '62814', status: 'active' },
    { id: '10', product_code: 'BYUL', product_name: 'byU Lite', location: 'Gudang Majalengka', total_qty: 3200, expiry_date: '2025-01-10', sn_prefix: '62814', status: 'expiring' },

    { id: '11', product_code: 'BYUM', product_name: 'byU Max', location: 'Gudang Cirebon', total_qty: 4800, expiry_date: '2025-10-31', sn_prefix: '62816', status: 'active' },
    { id: '12', product_code: 'BYUM', product_name: 'byU Max', location: 'Gudang Kuningan', total_qty: 3600, expiry_date: '2025-07-15', sn_prefix: '62816', status: 'active' },
];

// Simulate SN search in entire dataset
const searchSNInDataset = (sn: string): SNSearchResult => {
    // Extract numeric part for matching
    const snNum = sn.replace(/\D/g, '');
    if (snNum.length < 8) return { found: false, sn };

    // Check each group's SN range
    for (const group of mockStockData) {
        const baseNum = parseInt(group.id) * 100000;
        const snBase = parseInt(snNum.slice(-10));

        // Check if SN is in this group's range
        if (snBase >= baseNum && snBase < baseNum + group.total_qty) {
            return {
                found: true,
                sn,
                product_name: group.product_name,
                location: group.location,
                expiry_date: group.expiry_date,
            };
        }
    }

    return { found: false, sn };
};

// ===========================================
// HELPERS
// ===========================================
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatNumber = (value: number): string => value.toLocaleString('id-ID');

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700';
        case 'expiring': return 'bg-amber-100 text-amber-700';
        case 'expired': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getStatusText = (status: string): string => {
    switch (status) {
        case 'active': return 'Active';
        case 'expiring': return 'Segera Expire';
        case 'expired': return 'Expired';
        default: return status;
    }
};

const getProductColor = (code: string): string => {
    const colors: Record<string, string> = {
        'SP10K': 'bg-red-50 text-red-700 border-red-200',
        'SP25K': 'bg-orange-50 text-orange-700 border-orange-200',
        'SP50K': 'bg-amber-50 text-amber-700 border-amber-200',
        'BYUL': 'bg-purple-50 text-purple-700 border-purple-200',
        'BYUM': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[code] || 'bg-gray-50 text-gray-700 border-gray-200';
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const DOAStockPage: React.FC = () => {
    // States
    const [filterProduct, setFilterProduct] = useState('ALL');
    const [filterLocation, setFilterLocation] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedGroup, setSelectedGroup] = useState<StockGroup | null>(null);

    // Global SN Finder states
    const [globalSNSearch, setGlobalSNSearch] = useState('');
    const [snSearchResult, setSNSearchResult] = useState<SNSearchResult | null>(null);

    // Filter options
    const productOptions = useMemo(() => [...new Set(mockStockData.map(d => d.product_code))], []);
    const locationOptions = useMemo(() => [...new Set(mockStockData.map(d => d.location))], []);

    // Filtered data
    const filteredData = useMemo(() => {
        return mockStockData.filter(d => {
            if (filterProduct !== 'ALL' && d.product_code !== filterProduct) return false;
            if (filterLocation !== 'ALL' && d.location !== filterLocation) return false;
            if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
            return true;
        });
    }, [filterProduct, filterLocation, filterStatus]);

    // Summary
    const summary = useMemo(() => {
        const totalQty = filteredData.reduce((sum, d) => sum + d.total_qty, 0);
        const totalGroups = filteredData.length;
        const activeCount = filteredData.filter(d => d.status === 'active').length;
        const expiringCount = filteredData.filter(d => d.status === 'expiring' || d.status === 'expired').length;

        return { totalQty, totalGroups, activeCount, expiringCount };
    }, [filteredData]);

    // Handle Global SN Search
    const handleGlobalSNSearch = useCallback(() => {
        if (globalSNSearch.length >= 8) {
            const result = searchSNInDataset(globalSNSearch);
            setSNSearchResult(result);
        } else {
            setSNSearchResult(null);
        }
    }, [globalSNSearch]);

    // Export
    const handleExport = useCallback(() => {
        const headers = ['Kode Produk', 'Nama Produk', 'Lokasi', 'Total Qty', 'Expiry Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => [
                row.product_code,
                `"${row.product_name}"`,
                `"${row.location}"`,
                row.total_qty,
                formatDate(row.expiry_date),
                getStatusText(row.status)
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DOA_Stock_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [filteredData]);

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <Header title="DOA - Stock" subtitle="Stok Serial Number per Lokasi Gudang" />
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download size={16} />
                    Export Excel
                </button>
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Global SN Finder */}
            <Card className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                    <Hash size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-800 text-sm">Cari Posisi SN</h3>
                    <span className="text-xs text-blue-500">(Temukan lokasi serial number tertentu)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Masukkan Serial Number (min 8 digit)..."
                            value={globalSNSearch}
                            onChange={(e) => setGlobalSNSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGlobalSNSearch()}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <button
                        onClick={handleGlobalSNSearch}
                        className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Cari SN
                    </button>
                </div>

                {/* Search Result */}
                {snSearchResult && (
                    <div className={`mt-3 p-3 rounded-lg ${snSearchResult.found ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                        {snSearchResult.found ? (
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-800">SN Ditemukan!</p>
                                    <p className="text-sm text-green-700">
                                        Posisi: <strong>{snSearchResult.location}</strong>,
                                        Produk: <strong>{snSearchResult.product_name}</strong>,
                                        Expired: <strong>{formatDate(snSearchResult.expiry_date || '')}</strong>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="text-red-600" />
                                <div>
                                    <p className="font-semibold text-red-800">SN Tidak Ditemukan</p>
                                    <p className="text-sm text-red-700">Serial Number "{snSearchResult.sn}" tidak ada dalam database.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Boxes size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-blue-600 font-medium">Total Stok SN</div>
                            <div className="text-xl font-bold text-blue-800">{formatNumber(summary.totalQty)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <Database size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-purple-600 font-medium">Total Grup</div>
                            <div className="text-xl font-bold text-purple-800">{summary.totalGroups}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 font-medium">Grup Active</div>
                            <div className="text-xl font-bold text-green-800">{summary.activeCount}</div>
                        </div>
                    </div>
                </Card>
                <Card className={`bg-gradient-to-br ${summary.expiringCount > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-gray-50 to-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${summary.expiringCount > 0 ? 'bg-red-500' : 'bg-gray-400'} rounded-lg`}>
                            <AlertTriangle size={20} className="text-white" />
                        </div>
                        <div>
                            <div className={`text-xs font-medium ${summary.expiringCount > 0 ? 'text-red-600' : 'text-white'}`}>Perlu Perhatian</div>
                            <div className={`text-xl font-bold ${summary.expiringCount > 0 ? 'text-red-800' : 'text-gray-800'}`}>{summary.expiringCount}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-700 text-sm">Filter</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Produk</label>
                        <select
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Produk</option>
                            {productOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Lokasi</label>
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Lokasi</option>
                            {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="active">Active</option>
                            <option value="expiring">Segera Expire</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Stock Table */}
            <Card className="mt-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">
                    Stok per Grup ({filteredData.length} grup)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border text-center font-semibold">No</th>
                                <th className="p-2 border text-left font-semibold">Kode</th>
                                <th className="p-2 border text-left font-semibold">Produk</th>
                                <th className="p-2 border text-left font-semibold">Lokasi</th>
                                <th className="p-2 border text-right font-semibold">Total Qty</th>
                                <th className="p-2 border text-center font-semibold">Expiry</th>
                                <th className="p-2 border text-center font-semibold">Status</th>
                                <th className="p-2 border text-center font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, idx) => (
                                <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                    <td className="p-2 border text-center text-gray-500">{idx + 1}</td>
                                    <td className="p-2 border">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getProductColor(row.product_code)}`}>
                                            {row.product_code}
                                        </span>
                                    </td>
                                    <td className="p-2 border font-medium text-gray-700">{row.product_name}</td>
                                    <td className="p-2 border text-white flex items-center gap-1">
                                        <MapPin size={12} className="text-gray-400" />
                                        {row.location}
                                    </td>
                                    <td className="p-2 border text-right font-bold text-blue-700">{formatNumber(row.total_qty)}</td>
                                    <td className="p-2 border text-center">{formatDate(row.expiry_date)}</td>
                                    <td className="p-2 border text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(row.status)}`}>
                                            {getStatusText(row.status)}
                                        </span>
                                    </td>
                                    <td className="p-2 border text-center">
                                        <button
                                            onClick={() => setSelectedGroup(row)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors mx-auto"
                                        >
                                            <Eye size={12} />
                                            Lihat Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail Modal */}
            {selectedGroup && (
                <StockDetailModal
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                />
            )}
        </div>
    );
};

export default DOAStockPage;
