import React, { useState } from 'react';
import { DollarSign, Calculator, TrendingUp, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Select, Badge } from '../components/ui/index';

interface FeeData {
    id: string;
    name: string;
    role: string;
    region: string;
    period: string;
    salesAmount: number;
    feeRate: number;
    feeAmount: number;
    status: 'pending' | 'approved' | 'paid';
}

const mockFees: FeeData[] = [
    { id: 'FEE001', name: 'Ahmad Sudrajat', role: 'Salesforce', region: 'Cirebon Kota', period: 'Nov 2024', salesAmount: 52500000, feeRate: 2.5, feeAmount: 1312500, status: 'paid' },
    { id: 'FEE002', name: 'Budi Santoso', role: 'Salesforce', region: 'Kuningan', period: 'Nov 2024', salesAmount: 43200000, feeRate: 2.5, feeAmount: 1080000, status: 'paid' },
    { id: 'FEE003', name: 'Citra Dewi', role: 'Salesforce', region: 'Majalengka', period: 'Nov 2024', salesAmount: 38000000, feeRate: 2.5, feeAmount: 950000, status: 'approved' },
    { id: 'FEE004', name: 'Dedi Kurniawan', role: 'Salesforce', region: 'Indramayu', period: 'Nov 2024', salesAmount: 49500000, feeRate: 2.5, feeAmount: 1237500, status: 'approved' },
    { id: 'FEE005', name: 'Eka Pratama', role: 'Direct Sales', region: 'Cirebon Barat', period: 'Nov 2024', salesAmount: 28000000, feeRate: 3.0, feeAmount: 840000, status: 'pending' },
    { id: 'FEE006', name: 'Ahmad Sudrajat', role: 'Salesforce', region: 'Cirebon Kota', period: 'Des 2024', salesAmount: 35000000, feeRate: 2.5, feeAmount: 875000, status: 'pending' },
];

const FeePage: React.FC = () => {
    const [period, setPeriod] = useState('Nov 2024');
    const [status, setStatus] = useState('');

    const filteredFees = mockFees.filter(fee => {
        const matchPeriod = fee.period === period;
        const matchStatus = !status || fee.status === status;
        return matchPeriod && matchStatus;
    });

    const totals = {
        sales: filteredFees.reduce((sum, f) => sum + f.salesAmount, 0),
        fee: filteredFees.reduce((sum, f) => sum + f.feeAmount, 0),
        pending: filteredFees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.feeAmount, 0),
        paid: filteredFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.feeAmount, 0),
    };

    const getStatusBadge = (status: FeeData['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
            case 'approved':
                return <Badge variant="info">Approved</Badge>;
            case 'paid':
                return <Badge variant="success">Paid</Badge>;
        }
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Fee / Komisi"
            />

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Sales</p>
                            <p className="text-xl font-bold text-gray-900">
                                Rp {(totals.sales / 1000000).toFixed(1)}M
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Fee</p>
                            <p className="text-xl font-bold text-purple-600">
                                Rp {totals.fee.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calculator size={20} className="text-purple-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-yellow-600">
                                Rp {totals.pending.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <DollarSign size={20} className="text-yellow-600" />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Paid</p>
                            <p className="text-xl font-bold text-green-600">
                                Rp {totals.paid.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign size={20} className="text-green-600" />
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
                            { value: 'Des 2024', label: 'Desember 2024' },
                            { value: 'Nov 2024', label: 'November 2024' },
                            { value: 'Okt 2024', label: 'Oktober 2024' },
                        ]}
                    />
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'paid', label: 'Paid' },
                        ]}
                    />
                </div>
                <Button variant="outline" leftIcon={<Download size={16} />}>
                    Export
                </Button>
            </div>

            {/* Fee Table */}
            <Card className="mt-6" padding="none">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Detail Fee - {period}</h3>
                </div>
                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left p-4 text-sm font-semibold text-white">ID</th>
                                <th className="text-left p-4 text-sm font-semibold text-white">Nama</th>
                                <th className="text-left p-4 text-sm font-semibold text-white">Role</th>
                                <th className="text-left p-4 text-sm font-semibold text-white">Region</th>
                                <th className="text-right p-4 text-sm font-semibold text-white">Sales</th>
                                <th className="text-right p-4 text-sm font-semibold text-white">Rate</th>
                                <th className="text-right p-4 text-sm font-semibold text-white">Fee Amount</th>
                                <th className="text-center p-4 text-sm font-semibold text-white">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFees.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        Tidak ada data fee untuk periode ini
                                    </td>
                                </tr>
                            ) : (
                                filteredFees.map(fee => (
                                    <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4">
                                            <span className="font-mono text-sm text-gray-700">{fee.id}</span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{fee.name}</td>
                                        <td className="p-4">
                                            <Badge variant="neutral">{fee.role}</Badge>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{fee.region}</td>
                                        <td className="p-4 text-right text-sm">
                                            Rp {fee.salesAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right text-sm">{fee.feeRate}%</td>
                                        <td className="p-4 text-right font-semibold text-green-600">
                                            Rp {fee.feeAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {getStatusBadge(fee.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 font-semibold">
                                <td colSpan={4} className="p-4 text-right">Total</td>
                                <td className="p-4 text-right">Rp {totals.sales.toLocaleString()}</td>
                                <td className="p-4"></td>
                                <td className="p-4 text-right text-green-600">Rp {totals.fee.toLocaleString()}</td>
                                <td className="p-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FeePage;
