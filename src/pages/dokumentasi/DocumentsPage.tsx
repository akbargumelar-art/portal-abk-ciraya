import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import { Card, Button } from '../../components/ui/index';
import { useSearch } from '../../contexts/SearchContext';
import {
    Download,
    FileText,
    FileSpreadsheet,
    File,
    Search,
    Filter,
    Calendar,
    FolderOpen,
    ExternalLink
} from 'lucide-react';

// Document interface
interface Document {
    id: string;
    title: string;
    type: 'pdf' | 'xlsx' | 'docx' | 'pptx';
    size: string;
    category: 'SOP' | 'Manual' | 'Memo' | 'Template' | 'Katalog';
    uploadDate: string;
    description: string;
    downloadUrl: string;
}

// Mock document data
const mockDocuments: Document[] = [
    {
        id: '1',
        title: 'SOP Kunjungan Outlet Telkomsel',
        type: 'pdf',
        size: '2.4 MB',
        category: 'SOP',
        uploadDate: '2024-12-15',
        description: 'Prosedur standar untuk kunjungan ke outlet mitra',
        downloadUrl: '#',
    },
    {
        id: '2',
        title: 'SOP Handling Komplain Customer',
        type: 'pdf',
        size: '1.8 MB',
        category: 'SOP',
        uploadDate: '2024-12-10',
        description: 'Panduan penanganan keluhan pelanggan',
        downloadUrl: '#',
    },
    {
        id: '3',
        title: 'Manual Aplikasi Field Ops Mobile',
        type: 'pdf',
        size: '5.1 MB',
        category: 'Manual',
        uploadDate: '2024-12-01',
        description: 'Panduan lengkap penggunaan aplikasi lapangan',
        downloadUrl: '#',
    },
    {
        id: '4',
        title: 'Manual Sistem Inventory Outlet',
        type: 'pdf',
        size: '3.2 MB',
        category: 'Manual',
        uploadDate: '2024-11-28',
        description: 'Cara mengelola inventory perdana dan voucher',
        downloadUrl: '#',
    },
    {
        id: '5',
        title: 'Memo: Perubahan Target Q1 2025',
        type: 'docx',
        size: '456 KB',
        category: 'Memo',
        uploadDate: '2024-12-18',
        description: 'Pengumuman update target penjualan kuartal 1',
        downloadUrl: '#',
    },
    {
        id: '6',
        title: 'Memo: Kebijakan Insentif Baru',
        type: 'docx',
        size: '320 KB',
        category: 'Memo',
        uploadDate: '2024-12-12',
        description: 'Informasi skema insentif salesforce terbaru',
        downloadUrl: '#',
    },
    {
        id: '7',
        title: 'Template Report Bulanan Salesforce',
        type: 'xlsx',
        size: '156 KB',
        category: 'Template',
        uploadDate: '2024-11-20',
        description: 'Template laporan performa bulanan',
        downloadUrl: '#',
    },
    {
        id: '8',
        title: 'Template Visit Planning',
        type: 'xlsx',
        size: '98 KB',
        category: 'Template',
        uploadDate: '2024-11-15',
        description: 'Template perencanaan kunjungan mingguan',
        downloadUrl: '#',
    },
    {
        id: '9',
        title: 'Katalog Produk Telkomsel 2024',
        type: 'pdf',
        size: '8.5 MB',
        category: 'Katalog',
        uploadDate: '2024-11-01',
        description: 'Daftar lengkap produk dan paket Telkomsel',
        downloadUrl: '#',
    },
    {
        id: '10',
        title: 'Katalog Promo Desember 2024',
        type: 'pdf',
        size: '4.2 MB',
        category: 'Katalog',
        uploadDate: '2024-12-01',
        description: 'Program promosi bulan Desember',
        downloadUrl: '#',
    },
];

// Categories with colors
const categories = [
    { value: '', label: 'Semua', color: 'bg-gray-100 text-white' },
    { value: 'SOP', label: 'SOP', color: 'bg-blue-100 text-blue-700' },
    { value: 'Manual', label: 'Manual', color: 'bg-green-100 text-green-700' },
    { value: 'Memo', label: 'Memo', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Template', label: 'Template', color: 'bg-purple-100 text-purple-700' },
    { value: 'Katalog', label: 'Katalog', color: 'bg-pink-100 text-pink-700' },
];

// File icon helper
const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
            return <FileText size={24} className="text-red-500" />;
        case 'xlsx':
        case 'xls':
            return <FileSpreadsheet size={24} className="text-green-600" />;
        case 'docx':
        case 'doc':
            return <FileText size={24} className="text-blue-600" />;
        case 'pptx':
        case 'ppt':
            return <FileText size={24} className="text-orange-500" />;
        default:
            return <File size={24} className="text-gray-500" />;
    }
};

// Category badge color
const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-white';
};

const DocumentsPage: React.FC = () => {
    // Global search context
    const { searchQuery } = useSearch();

    // Local filters
    const [categoryFilter, setCategoryFilter] = useState('');
    const [localSearch, setLocalSearch] = useState('');

    // Combined search (global + local)
    const effectiveSearch = searchQuery || localSearch;

    // Filtered documents
    const filteredDocuments = useMemo(() => {
        return mockDocuments.filter(doc => {
            // Category filter
            if (categoryFilter && doc.category !== categoryFilter) return false;

            // Search filter (title, description, category)
            if (effectiveSearch) {
                const query = effectiveSearch.toLowerCase();
                const matchesTitle = doc.title.toLowerCase().includes(query);
                const matchesDesc = doc.description.toLowerCase().includes(query);
                const matchesCategory = doc.category.toLowerCase().includes(query);
                const matchesType = doc.type.toLowerCase().includes(query);

                if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesType) {
                    return false;
                }
            }

            return true;
        });
    }, [categoryFilter, effectiveSearch]);

    // Document count by category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { '': mockDocuments.length };
        mockDocuments.forEach(doc => {
            counts[doc.category] = (counts[doc.category] || 0) + 1;
        });
        return counts;
    }, []);

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Dokumen" />

            {/* Filters Section */}
            <Card padding="md" className="mt-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Local Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="Cari dokumen..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent"
                        />
                        {searchQuery && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                Global: "{searchQuery}"
                            </span>
                        )}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <Filter size={16} className="text-gray-400 flex-shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setCategoryFilter(cat.value)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${categoryFilter === cat.value
                                        ? 'bg-[#F13B4B] text-white shadow-md'
                                        : 'bg-gray-100 text-white hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                                <span className="ml-1 text-xs opacity-70">
                                    ({categoryCounts[cat.value] || 0})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Results Info */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                    <FolderOpen size={14} className="inline mr-1" />
                    {filteredDocuments.length} dokumen ditemukan
                </span>
                {effectiveSearch && (
                    <span className="text-[#F13B4B]">
                        Pencarian: "{effectiveSearch}"
                    </span>
                )}
            </div>

            {/* Documents Table */}
            <Card padding="none" className="mt-4 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#2c4a6a] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Document Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase hidden md:table-cell">Upload Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase hidden sm:table-cell">Size</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                        <FolderOpen size={40} className="mx-auto mb-2 opacity-50" />
                                        <p>Tidak ada dokumen yang cocok</p>
                                        {effectiveSearch && (
                                            <p className="text-sm mt-1">
                                                Coba kata kunci lain atau hapus filter
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredDocuments.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {getFileIcon(doc.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                                                {doc.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(doc.uploadDate).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                            <span className="text-sm text-gray-500">{doc.size}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    leftIcon={<Download size={14} />}
                                                    onClick={() => alert(`Downloading: ${doc.title}`)}
                                                >
                                                    Download
                                                </Button>
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Preview"
                                                >
                                                    <ExternalLink size={16} className="text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DocumentsPage;
