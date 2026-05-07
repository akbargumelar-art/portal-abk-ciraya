/**
 * POP Monitoring Page (Enhanced)
 * 
 * Complete POP module with:
 * - Tab 1: Monitoring - Installation records with evidence photos
 * - Tab 2: Katalog POP - Item gallery with reference photos
 * - Tab 3: Transaksi - Transaction history
 */

import React, { useState, useMemo } from 'react';
import {
    Search,
    Eye,
    Plus,
    Package,
    ArrowDownUp,
    Settings,
    Edit2,
    Trash2,
    Save,
    X,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Input, Select, Badge } from '../components/ui/index';
import EvidenceThumbnail from '../components/pop/EvidenceThumbnail';
import POPCatalog from '../components/pop/POPCatalog';
import POPItemForm from '../components/pop/POPItemForm';
import POPInstallationForm from '../components/pop/POPInstallationForm';
import {
    getPOPRecords,
    getPOPTransactions,
    CATEGORY_OPTIONS,
    STATUS_OPTIONS,
} from '../services/mock/popData';
import {
    getStatusDisplayName,
    getStatusBadgeVariant,
    getCategoryDisplayName,
    getTransactionTypeDisplayName,
} from '../types/pop';
import type { POPItem, POPItemFormData, POPInstallationFormData } from '../types/pop';

// ============================================================================
// TAB COMPONENT
// ============================================================================

interface TabProps {
    tabs: { id: string; label: string; icon: React.ReactNode }[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onChange }) => (
    <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                    border-b-2 transition-colors
                    ${activeTab === tab.id
                        ? 'border-[#F13B4B] text-[#F13B4B]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                `}
            >
                {tab.icon}
                {tab.label}
            </button>
        ))}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const POPMonitoringPage: React.FC = () => {
    // Active tab
    const [activeTab, setActiveTab] = useState('monitoring');

    // Filters
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showItemForm, setShowItemForm] = useState(false);
    const [showInstallationForm, setShowInstallationForm] = useState(false);
    const [editItem, setEditItem] = useState<POPItem | undefined>(undefined);

    // Category Management State
    const [categories, setCategories] = useState(() =>
        CATEGORY_OPTIONS.filter(c => c.value !== '').map((c, idx) => ({
            id: `CAT-${String(idx + 1).padStart(3, '0')}`,
            code: c.value,
            name: c.label,
            description: `Kategori ${c.label}`,
            isActive: true,
        }))
    );
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ code: '', name: '', description: '' });
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [editCategoryData, setEditCategoryData] = useState({ code: '', name: '', description: '' });

    // Data
    const records = getPOPRecords();
    const transactions = getPOPTransactions();

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const matchCategory = !filterCategory || record.itemCategory === filterCategory;
            const matchStatus = !filterStatus || record.status === filterStatus;
            const matchSearch = !searchTerm ||
                record.outletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.itemName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCategory && matchStatus && matchSearch;
        });
    }, [records, filterCategory, filterStatus, searchTerm]);

    // Stats
    const stats = useMemo(() => ({
        total: records.length,
        installed: records.filter(r => r.status === 'installed').length,
        damaged: records.filter(r => r.status === 'damaged').length,
        missing: records.filter(r => r.status === 'missing').length,
        pending: records.filter(r => r.status === 'pending').length,
    }), [records]);

    // Handlers
    const handleAddItem = () => {
        setEditItem(undefined);
        setShowItemForm(true);
    };

    const handleEditItem = (item: POPItem) => {
        setEditItem(item);
        setShowItemForm(true);
    };

    const handleItemFormSubmit = (data: POPItemFormData) => {
        console.log('Item form submitted:', data);
        // In real app, would call API here
        alert(editItem ? 'Item berhasil diperbarui!' : 'Item baru berhasil ditambahkan!');
    };

    const handleInstallationSubmit = (data: POPInstallationFormData) => {
        console.log('Installation submitted:', data);
        // In real app, would call API here
        alert('Pemasangan berhasil dicatat!');
    };

    // Tab configuration
    const tabConfig = [
        { id: 'monitoring', label: 'Monitoring', icon: <Eye size={16} /> },
        { id: 'catalog', label: 'Katalog POP', icon: <Package size={16} /> },
        { id: 'transactions', label: 'Transaksi', icon: <ArrowDownUp size={16} /> },
        { id: 'categories', label: 'Kategori', icon: <Settings size={16} /> },
    ];

    // Category handlers
    const handleAddCategory = () => {
        if (!newCategory.code || !newCategory.name) return;
        const id = `CAT-${String(categories.length + 1).padStart(3, '0')}`;
        setCategories([...categories, { ...newCategory, id, isActive: true }]);
        setNewCategory({ code: '', name: '', description: '' });
        setShowAddCategory(false);
    };

    const handleEditCategory = (id: string) => {
        const cat = categories.find(c => c.id === id);
        if (cat) {
            setEditCategoryData({ code: cat.code, name: cat.name, description: cat.description });
            setEditingCategory(id);
        }
    };

    const handleSaveCategory = (id: string) => {
        setCategories(categories.map(c => c.id === id ? { ...c, ...editCategoryData } : c));
        setEditingCategory(null);
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm('Hapus kategori ini?')) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    const handleToggleCategory = (id: string) => {
        setCategories(categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Monitoring POP"
            />

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total POP</p>
                </Card>
                <Card className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.installed}</p>
                    <p className="text-sm text-gray-500">Terpasang</p>
                </Card>
                <Card className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.damaged}</p>
                    <p className="text-sm text-gray-500">Rusak</p>
                </Card>
                <Card className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.missing}</p>
                    <p className="text-sm text-gray-500">Hilang</p>
                </Card>
                <Card className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                </Card>
            </div>

            {/* Tabs */}
            <Card className="mt-6" padding="none">
                <Tabs tabs={tabConfig} activeTab={activeTab} onChange={setActiveTab} />

                <div className="p-6">
                    {/* === TAB: MONITORING === */}
                    {activeTab === 'monitoring' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <Input
                                        placeholder="Cari outlet atau item..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        leftIcon={<Search size={18} className="text-gray-400" />}
                                    />
                                </div>
                                <Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    options={CATEGORY_OPTIONS}
                                />
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    options={STATUS_OPTIONS}
                                />
                                <Button
                                    variant="primary"
                                    leftIcon={<Plus size={16} />}
                                    onClick={() => setShowInstallationForm(true)}
                                >
                                    Catat Pemasangan
                                </Button>
                            </div>

                            {/* Records Table */}
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left p-4 text-sm font-semibold text-white">Bukti</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Tanggal</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Outlet</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Item POP</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Status</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Salesforce</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                                    Tidak ada data POP
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRecords.map(record => (
                                                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <EvidenceThumbnail
                                                            src={record.proofPhotoUrl}
                                                            alt={`Bukti ${record.itemName} di ${record.outletName}`}
                                                            title={`${record.itemName} - ${record.outletName}`}
                                                            size="md"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">{record.date}</td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{record.outletName}</p>
                                                            <p className="text-xs text-gray-500">{record.outletAddress}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {record.referencePhotoUrl && (
                                                                <img
                                                                    src={record.referencePhotoUrl}
                                                                    alt={record.itemName}
                                                                    className="w-8 h-8 rounded object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">{record.itemName}</p>
                                                                <Badge variant="neutral" className="text-xs">
                                                                    {getCategoryDisplayName(record.itemCategory)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={getStatusBadgeVariant(record.status)}>
                                                            {getStatusDisplayName(record.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">
                                                        {record.salesforceName || '-'}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {record.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* === TAB: CATALOG === */}
                    {activeTab === 'catalog' && (
                        <POPCatalog
                            onAddItem={handleAddItem}
                            onEditItem={handleEditItem}
                        />
                    )}

                    {/* === TAB: TRANSACTIONS === */}
                    {activeTab === 'transactions' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {transactions.length} transaksi tercatat
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left p-4 text-sm font-semibold text-white">Bukti</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">ID</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Tanggal</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Tipe</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Item</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Qty</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Tujuan</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(trx => (
                                            <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-4">
                                                    <EvidenceThumbnail
                                                        src={trx.proofPhotoUrl}
                                                        alt={`Bukti ${trx.type}`}
                                                        title={`${getTransactionTypeDisplayName(trx.type)} - ${trx.itemName}`}
                                                        size="md"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-sm text-gray-700">{trx.id}</span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{trx.date}</td>
                                                <td className="p-4">
                                                    <Badge variant={
                                                        trx.type === 'inbound' ? 'info' :
                                                            trx.type === 'transfer' ? 'warning' :
                                                                'success'
                                                    }>
                                                        {getTransactionTypeDisplayName(trx.type)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{trx.itemName}</td>
                                                <td className="p-4 text-sm text-gray-600">{trx.quantity}</td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {trx.toOutletName || trx.fromLocation || '-'}
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {trx.notes || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* === TAB: CATEGORIES === */}
                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {categories.length} kategori POP
                                </p>
                                <Button
                                    variant="primary"
                                    leftIcon={<Plus size={16} />}
                                    onClick={() => setShowAddCategory(true)}
                                >
                                    Tambah Kategori
                                </Button>
                            </div>

                            {/* Add Category Form */}
                            {showAddCategory && (
                                <Card className="bg-green-50 border-green-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Plus size={18} className="text-green-600" />
                                        <span className="font-semibold text-green-800">Tambah Kategori Baru</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            placeholder="Kode (e.g., neon_box)"
                                            value={newCategory.code}
                                            onChange={e => setNewCategory({ ...newCategory, code: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Nama Kategori"
                                            value={newCategory.name}
                                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Deskripsi"
                                            value={newCategory.description}
                                            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="primary" leftIcon={<Save size={16} />} onClick={handleAddCategory}>
                                            Simpan
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                                            Batal
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Categories Table */}
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left p-4 text-sm font-semibold text-white">ID</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Kode</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Nama</th>
                                            <th className="text-left p-4 text-sm font-semibold text-white">Deskripsi</th>
                                            <th className="text-center p-4 text-sm font-semibold text-white">Status</th>
                                            <th className="text-center p-4 text-sm font-semibold text-white">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-4 font-mono text-sm text-gray-700">{cat.id}</td>
                                                <td className="p-4">
                                                    {editingCategory === cat.id ? (
                                                        <Input
                                                            value={editCategoryData.code}
                                                            onChange={e => setEditCategoryData({ ...editCategoryData, code: e.target.value })}
                                                            className="w-32"
                                                        />
                                                    ) : (
                                                        <Badge variant="neutral">{cat.code}</Badge>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {editingCategory === cat.id ? (
                                                        <Input
                                                            value={editCategoryData.name}
                                                            onChange={e => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                                                            className="w-40"
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900">{cat.name}</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {editingCategory === cat.id ? (
                                                        <Input
                                                            value={editCategoryData.description}
                                                            onChange={e => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
                                                            className="w-60"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-500">{cat.description}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleCategory(cat.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${cat.isActive
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {cat.isActive ? 'Aktif' : 'Nonaktif'}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {editingCategory === cat.id ? (
                                                            <>
                                                                <Button size="sm" variant="primary" onClick={() => handleSaveCategory(cat.id)}>
                                                                    <Save size={14} />
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                                                                    <X size={14} />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat.id)}>
                                                                    <Edit2 size={14} />
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteCategory(cat.id)}>
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Modals */}
            <POPItemForm
                isOpen={showItemForm}
                onClose={() => setShowItemForm(false)}
                onSubmit={handleItemFormSubmit}
                editItem={editItem}
            />

            <POPInstallationForm
                isOpen={showInstallationForm}
                onClose={() => setShowInstallationForm(false)}
                onSubmit={handleInstallationSubmit}
            />
        </div>
    );
};

export default POPMonitoringPage;
