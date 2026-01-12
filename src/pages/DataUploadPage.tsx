import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Select, Badge } from '../components/ui/index';

interface UploadRecord {
    id: string;
    filename: string;
    type: string;
    uploadedBy: string;
    uploadedAt: string;
    status: 'processing' | 'success' | 'failed' | 'pending';
    rowsProcessed?: number;
    errors?: number;
}

const mockRecords: UploadRecord[] = [
    { id: 'UPL001', filename: 'outlet_data_dec2024.xlsx', type: 'Outlet', uploadedBy: 'Admin', uploadedAt: '2024-12-20 10:30', status: 'success', rowsProcessed: 150, errors: 0 },
    { id: 'UPL002', filename: 'stock_update_20dec.csv', type: 'Stock', uploadedBy: 'Manager', uploadedAt: '2024-12-20 09:15', status: 'success', rowsProcessed: 85, errors: 2 },
    { id: 'UPL003', filename: 'sales_target_jan2025.xlsx', type: 'Target', uploadedBy: 'Admin', uploadedAt: '2024-12-19 16:45', status: 'processing', rowsProcessed: 45 },
    { id: 'UPL004', filename: 'user_import_batch.csv', type: 'User', uploadedBy: 'Admin', uploadedAt: '2024-12-19 14:20', status: 'failed', errors: 15 },
];

const uploadTypes = [
    { value: 'outlet', label: 'Data Outlet', description: 'Import/update data outlet' },
    { value: 'stock', label: 'Stock Update', description: 'Update stok perdana/voucher' },
    { value: 'target', label: 'Sales Target', description: 'Import target penjualan' },
    { value: 'user', label: 'User Bulk', description: 'Import data user baru' },
    { value: 'transaction', label: 'Transaksi', description: 'Import data transaksi' },
];

const DataUploadPage: React.FC = () => {
    const [records, setRecords] = useState<UploadRecord[]>(mockRecords);
    const [selectedType, setSelectedType] = useState('outlet');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getStatusIcon = (status: UploadRecord['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={18} className="text-green-500" />;
            case 'failed':
                return <XCircle size={18} className="text-red-500" />;
            case 'processing':
                return <Clock size={18} className="text-blue-500 animate-spin" />;
            case 'pending':
                return <Clock size={18} className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status: UploadRecord['status']) => {
        switch (status) {
            case 'success':
                return <Badge variant="success">Sukses</Badge>;
            case 'failed':
                return <Badge variant="error">Gagal</Badge>;
            case 'processing':
                return <Badge variant="info">Processing</Badge>;
            case 'pending':
                return <Badge variant="neutral">Pending</Badge>;
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const newRecord: UploadRecord = {
            id: `UPL${String(records.length + 1).padStart(3, '0')}`,
            filename: file.name,
            type: uploadTypes.find(t => t.value === selectedType)?.label || 'Other',
            uploadedBy: 'Current User',
            uploadedAt: new Date().toLocaleString('id-ID'),
            status: 'processing',
        };
        setRecords([newRecord, ...records]);

        // Simulate processing
        setTimeout(() => {
            setRecords(prev => prev.map(r =>
                r.id === newRecord.id
                    ? { ...r, status: 'success' as const, rowsProcessed: Math.floor(Math.random() * 100) + 20, errors: 0 }
                    : r
            ));
        }, 3000);
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Data Upload Center"
                subtitle="Upload dan import data secara bulk"
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Area */}
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="font-semibold text-gray-900 mb-4">Upload File</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Data</label>
                            <Select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                options={uploadTypes.map(t => ({ value: t.value, label: t.label }))}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {uploadTypes.find(t => t.value === selectedType)?.description}
                            </p>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-[#F13B4B] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload size={40} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-white mb-2">
                                Drag & drop file disini atau
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Pilih File
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                            <p className="text-xs text-gray-400 mt-3">
                                Format: .xlsx, .xls, .csv (max 10MB)
                            </p>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                                <div className="text-xs text-yellow-700">
                                    <p className="font-medium">Perhatian:</p>
                                    <p>Pastikan format file sesuai template. Download template terlebih dahulu.</p>
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full mt-4" leftIcon={<Download size={16} />}>
                            Download Template
                        </Button>
                    </Card>
                </div>

                {/* Upload History */}
                <div className="lg:col-span-2">
                    <Card padding="none">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Riwayat Upload</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left p-4 text-sm font-semibold text-white">File</th>
                                        <th className="text-left p-4 text-sm font-semibold text-white">Tipe</th>
                                        <th className="text-left p-4 text-sm font-semibold text-white">Waktu</th>
                                        <th className="text-center p-4 text-sm font-semibold text-white">Status</th>
                                        <th className="text-center p-4 text-sm font-semibold text-white">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(record => (
                                        <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{record.filename}</p>
                                                        <p className="text-xs text-gray-500">by {record.uploadedBy}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="neutral">{record.type}</Badge>
                                            </td>
                                            <td className="p-4 text-sm text-white">{record.uploadedAt}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {getStatusIcon(record.status)}
                                                    {getStatusBadge(record.status)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-sm">
                                                {record.status === 'success' && (
                                                    <span className="text-green-600">
                                                        {record.rowsProcessed} rows
                                                        {record.errors ? `, ${record.errors} errors` : ''}
                                                    </span>
                                                )}
                                                {record.status === 'failed' && (
                                                    <span className="text-red-600">{record.errors} errors</span>
                                                )}
                                                {record.status === 'processing' && (
                                                    <span className="text-blue-600">Processing...</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DataUploadPage;
