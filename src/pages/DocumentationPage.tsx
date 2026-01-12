import React, { useState } from 'react';
import { FileText, Download, Eye, Search, FolderOpen, File, BookOpen, Video, Image } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Input, Badge } from '../components/ui/index';

interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'video' | 'image' | 'spreadsheet';
    category: string;
    size: string;
    uploadedAt: string;
    description?: string;
}

const mockDocuments: Document[] = [
    { id: 'DOC001', name: 'SOP Kunjungan Outlet.pdf', type: 'pdf', category: 'SOP', size: '2.4 MB', uploadedAt: '2024-12-15', description: 'Prosedur standar kunjungan outlet' },
    { id: 'DOC002', name: 'Panduan Aplikasi Portal.pdf', type: 'pdf', category: 'Manual', size: '5.1 MB', uploadedAt: '2024-12-10', description: 'User guide aplikasi portal' },
    { id: 'DOC003', name: 'Template Laporan Harian.xlsx', type: 'spreadsheet', category: 'Template', size: '156 KB', uploadedAt: '2024-12-08' },
    { id: 'DOC004', name: 'Training Video - Digipos.mp4', type: 'video', category: 'Training', size: '125 MB', uploadedAt: '2024-12-05' },
    { id: 'DOC005', name: 'Katalog Produk 2024.pdf', type: 'pdf', category: 'Katalog', size: '8.2 MB', uploadedAt: '2024-12-01' },
    { id: 'DOC006', name: 'Form DOA Outlet.docx', type: 'doc', category: 'Form', size: '45 KB', uploadedAt: '2024-11-28' },
    { id: 'DOC007', name: 'Materi POP Guidelines.pdf', type: 'pdf', category: 'Guidelines', size: '3.8 MB', uploadedAt: '2024-11-25' },
    { id: 'DOC008', name: 'Banner Template.png', type: 'image', category: 'Template', size: '1.2 MB', uploadedAt: '2024-11-20' },
];

const categories = ['Semua', 'SOP', 'Manual', 'Template', 'Training', 'Katalog', 'Form', 'Guidelines'];

const DocumentationPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const getFileIcon = (type: Document['type']) => {
        switch (type) {
            case 'pdf':
                return <FileText size={24} className="text-red-500" />;
            case 'doc':
                return <File size={24} className="text-blue-500" />;
            case 'video':
                return <Video size={24} className="text-purple-500" />;
            case 'image':
                return <Image size={24} className="text-green-500" />;
            case 'spreadsheet':
                return <FileText size={24} className="text-emerald-500" />;
            default:
                return <File size={24} className="text-gray-500" />;
        }
    };

    const filteredDocs = mockDocuments.filter(doc => {
        const matchSearch = !searchTerm ||
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'Semua' || doc.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const groupedDocs = filteredDocs.reduce((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, Document[]>);

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="DOA & Dokumentasi"
                subtitle="Pusat dokumen, SOP, dan materi training"
            />

            {/* Search and Filter */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Cari dokumen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search size={18} className="text-gray-400" />}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat
                                    ? 'bg-[#F13B4B] text-white'
                                    : 'bg-gray-100 text-white hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderOpen size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{mockDocuments.length}</p>
                            <p className="text-sm text-gray-500">Total Dokumen</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockDocuments.filter(d => d.type === 'pdf').length}
                            </p>
                            <p className="text-sm text-gray-500">PDF</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Video size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockDocuments.filter(d => d.type === 'video').length}
                            </p>
                            <p className="text-sm text-gray-500">Video</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <BookOpen size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                            <p className="text-sm text-gray-500">Kategori</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Documents Grid */}
            <div className="mt-6">
                {selectedCategory === 'Semua' ? (
                    Object.entries(groupedDocs).map(([category, docs]) => (
                        <div key={category} className="mb-8">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FolderOpen size={18} className="text-gray-400" />
                                {category}
                                <Badge variant="neutral">{docs.length}</Badge>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {docs.map(doc => (
                                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3">
                                            {getFileIcon(doc.type)}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                                                {doc.description && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                    <span>{doc.size}</span>
                                                    <span>{doc.uploadedAt}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                            <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                                                Preview
                                            </Button>
                                            <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
                                                Download
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDocs.map(doc => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    {getFileIcon(doc.type)}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                                        {doc.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                            <span>{doc.size}</span>
                                            <span>{doc.uploadedAt}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                    <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                                        Preview
                                    </Button>
                                    <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {filteredDocs.length === 0 && (
                    <Card className="text-center py-12">
                        <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Tidak ada dokumen ditemukan</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DocumentationPage;
