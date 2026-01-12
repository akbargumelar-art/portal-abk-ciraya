/**
 * Links Page (Redesigned)
 * 
 * Modern, visually appealing page for important links and applications.
 * Features: Hero section, grid cards with hover effects, category tabs.
 */

import React, { useState, useMemo } from 'react';
import {
    ExternalLink,
    Plus,
    Edit2,
    Trash2,
    Link as LinkIcon,
    Globe,
    FileText,
    BarChart3,
    Smartphone,
    Youtube,
    BookOpen,
    MessageCircle,
    Users,
    Settings,
    Save,
    Search,
    Grid3X3,
    List,
} from 'lucide-react';
import { Card, Button, Modal, Input, Select, Badge } from '../components/ui/index';
import { useAuth } from '../contexts/AuthContext';

interface LinkItem {
    id: string;
    title: string;
    url: string;
    icon: string;
    color: string;
    description?: string;
    category: string;
}

const iconOptions = [
    { value: 'link', label: 'Link', icon: LinkIcon },
    { value: 'globe', label: 'Website', icon: Globe },
    { value: 'file', label: 'Document', icon: FileText },
    { value: 'chart', label: 'Report', icon: BarChart3 },
    { value: 'phone', label: 'App', icon: Smartphone },
    { value: 'youtube', label: 'Video', icon: Youtube },
    { value: 'book', label: 'Training', icon: BookOpen },
    { value: 'chat', label: 'Chat', icon: MessageCircle },
    { value: 'users', label: 'Team', icon: Users },
    { value: 'settings', label: 'Tools', icon: Settings },
];

const colorOptions = [
    { value: 'red', label: 'Red', class: 'from-red-500 to-red-600', bg: 'bg-red-500' },
    { value: 'blue', label: 'Blue', class: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'from-green-500 to-green-600', bg: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'from-purple-500 to-purple-600', bg: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'from-orange-500 to-orange-600', bg: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', class: 'from-pink-500 to-pink-600', bg: 'bg-pink-500' },
    { value: 'teal', label: 'Teal', class: 'from-teal-500 to-teal-600', bg: 'bg-teal-500' },
    { value: 'indigo', label: 'Indigo', class: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500' },
];

const categoryOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'apps', label: 'Aplikasi' },
    { value: 'reports', label: 'Reports & Dashboard' },
    { value: 'docs', label: 'Dokumen' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Lainnya' },
];

// Default links
const defaultLinks: LinkItem[] = [
    {
        id: '1',
        title: 'Field Operations App',
        url: 'https://www.appsheet.com/start/351fea6b-2c95-4005-9647-7021f54bc421',
        icon: 'phone',
        color: 'green',
        description: 'Aplikasi untuk aktivitas lapangan salesforce',
        category: 'apps',
    },
    {
        id: '2',
        title: 'Looker Studio Dashboard',
        url: 'https://lookerstudio.google.com/reporting/fe7230d7-5028-4682-bc15-b99859ceb2aa',
        icon: 'chart',
        color: 'blue',
        description: 'Dashboard analytics dan reporting real-time',
        category: 'reports',
    },
    {
        id: '3',
        title: 'WhatsApp Group Sales',
        url: 'https://chat.whatsapp.com/example',
        icon: 'chat',
        color: 'green',
        description: 'Grup koordinasi tim sales harian',
        category: 'other',
    },
    {
        id: '4',
        title: 'Training Portal',
        url: 'https://training.example.com',
        icon: 'book',
        color: 'purple',
        description: 'Materi training dan onboarding karyawan baru',
        category: 'training',
    },
    {
        id: '5',
        title: 'Google Drive Dokumen',
        url: 'https://drive.google.com',
        icon: 'file',
        color: 'orange',
        description: 'Folder dokumen tim dan template',
        category: 'docs',
    },
    {
        id: '6',
        title: 'Sales Report Weekly',
        url: 'https://reports.example.com',
        icon: 'chart',
        color: 'indigo',
        description: 'Laporan mingguan performa sales',
        category: 'reports',
    },
    {
        id: '7',
        title: 'Product Catalog',
        url: 'https://catalog.example.com',
        icon: 'globe',
        color: 'red',
        description: 'Katalog produk Telkomsel terbaru',
        category: 'docs',
    },
    {
        id: '8',
        title: 'Video Tutorial',
        url: 'https://youtube.com/@example',
        icon: 'youtube',
        color: 'red',
        description: 'Video panduan penggunaan aplikasi',
        category: 'training',
    },
];

const LinksPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin_super' || user?.role === 'admin' || user?.role === 'manager';

    const [links, setLinks] = useState<LinkItem[]>(defaultLinks);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        icon: 'link',
        color: 'blue',
        description: '',
        category: 'other',
    });

    const getIconComponent = (iconName: string, size: number = 24) => {
        const iconMap: Record<string, React.ReactNode> = {
            link: <LinkIcon size={size} />,
            globe: <Globe size={size} />,
            file: <FileText size={size} />,
            chart: <BarChart3 size={size} />,
            phone: <Smartphone size={size} />,
            youtube: <Youtube size={size} />,
            book: <BookOpen size={size} />,
            chat: <MessageCircle size={size} />,
            users: <Users size={size} />,
            settings: <Settings size={size} />,
        };
        return iconMap[iconName] || <LinkIcon size={size} />;
    };

    const getColorClass = (colorName: string) => {
        return colorOptions.find(c => c.value === colorName)?.class || 'from-gray-500 to-gray-600';
    };

    // Filter links
    const filteredLinks = useMemo(() => {
        return links.filter(link => {
            const matchSearch = !searchTerm ||
                link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCategory = activeCategory === 'all' || link.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }, [links, searchTerm, activeCategory]);

    // Count by category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: links.length };
        links.forEach(link => {
            counts[link.category] = (counts[link.category] || 0) + 1;
        });
        return counts;
    }, [links]);

    const handleAddLink = () => {
        setEditingLink(null);
        setFormData({
            title: '',
            url: '',
            icon: 'link',
            color: 'blue',
            description: '',
            category: 'other',
        });
        setShowModal(true);
    };

    const handleEditLink = (link: LinkItem) => {
        setEditingLink(link);
        setFormData({
            title: link.title,
            url: link.url,
            icon: link.icon,
            color: link.color,
            description: link.description || '',
            category: link.category,
        });
        setShowModal(true);
    };

    const handleDeleteLink = (id: string) => {
        if (confirm('Hapus link ini?')) {
            setLinks(links.filter(l => l.id !== id));
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.url) return;

        if (editingLink) {
            setLinks(links.map(l =>
                l.id === editingLink.id
                    ? { ...l, ...formData }
                    : l
            ));
        } else {
            setLinks([...links, {
                id: Date.now().toString(),
                ...formData,
            }]);
        }
        setShowModal(false);
    };

    return (
        <div className="p-6 animate-fade-in">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F13B4B] via-[#E02D3C] to-[#C41E3A] p-8 mb-8">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Link Penting</h1>
                    <p className="text-white/80 max-w-xl">
                        Akses cepat ke aplikasi, dashboard, dan dokumen yang sering digunakan oleh tim
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-1 max-w-md relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari link..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                        {isAdmin && (
                            <Button
                                variant="ghost"
                                onClick={handleAddLink}
                                leftIcon={<Plus size={18} />}
                                className="bg-white/20 text-white hover:bg-white/30 border-0"
                            >
                                Tambah Link
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Tabs & View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {categoryOptions.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${activeCategory === cat.value
                                    ? 'bg-[#F13B4B] text-white shadow-lg shadow-red-200'
                                    : 'bg-gray-100 text-white hover:bg-gray-200'
                                }
                            `}
                        >
                            {cat.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeCategory === cat.value ? 'bg-white/20' : 'bg-gray-200'
                                }`}>
                                {categoryCounts[cat.value] || 0}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-[#F13B4B]' : 'text-gray-500'
                            }`}
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-[#F13B4B]' : 'text-gray-500'
                            }`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Links Grid/List */}
            {filteredLinks.length === 0 ? (
                <Card className="text-center py-16">
                    <LinkIcon size={56} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'Link Tidak Ditemukan' : 'Belum Ada Link'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm
                            ? `Tidak ada link yang cocok dengan "${searchTerm}"`
                            : 'Tambahkan link penting untuk tim Anda'}
                    </p>
                    {isAdmin && !searchTerm && (
                        <Button variant="primary" onClick={handleAddLink} leftIcon={<Plus size={18} />}>
                            Tambah Link Pertama
                        </Button>
                    )}
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredLinks.map(link => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <div className="relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                {/* Admin Controls */}
                                {isAdmin && (
                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleEditLink(link);
                                            }}
                                            className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"
                                        >
                                            <Edit2 size={14} className="text-white" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteLink(link.id);
                                            }}
                                            className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorClass(link.color)} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    {getIconComponent(link.icon, 26)}
                                </div>

                                {/* Content */}
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-[#F13B4B] transition-colors">
                                    {link.title}
                                </h4>
                                {link.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                        {link.description}
                                    </p>
                                )}

                                {/* External Link Indicator */}
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <ExternalLink size={12} />
                                    <span className="truncate">{new URL(link.url).hostname}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-3">
                    {filteredLinks.map(link => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClass(link.color)} flex items-center justify-center text-white flex-shrink-0`}>
                                    {getIconComponent(link.icon, 22)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-[#F13B4B] transition-colors">
                                        {link.title}
                                    </h4>
                                    {link.description && (
                                        <p className="text-sm text-gray-500 truncate">
                                            {link.description}
                                        </p>
                                    )}
                                </div>

                                {/* Category Badge */}
                                <Badge variant="neutral" className="hidden sm:inline-flex">
                                    {categoryOptions.find(c => c.value === link.category)?.label || link.category}
                                </Badge>

                                {/* Admin Controls */}
                                {isAdmin && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleEditLink(link);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <Edit2 size={16} className="text-gray-500" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteLink(link.id);
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                )}

                                <ExternalLink size={18} className="text-gray-300 group-hover:text-[#F13B4B] transition-colors flex-shrink-0" />
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-600">{links.length}</p>
                    <p className="text-sm text-blue-600/70">Total Link</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-600">{categoryCounts['apps'] || 0}</p>
                    <p className="text-sm text-green-600/70">Aplikasi</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-600">{categoryCounts['reports'] || 0}</p>
                    <p className="text-sm text-purple-600/70">Reports</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-orange-600">{categoryCounts['docs'] || 0}</p>
                    <p className="text-sm text-orange-600/70">Dokumen</p>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingLink ? 'Edit Link' : 'Tambah Link Baru'}
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Judul"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Nama link"
                        required
                    />
                    <Input
                        label="URL"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://..."
                        required
                    />
                    <Input
                        label="Deskripsi (opsional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Deskripsi singkat"
                    />
                    <Select
                        label="Kategori"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={categoryOptions.filter(c => c.value !== 'all')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                            <div className="grid grid-cols-5 gap-2">
                                {iconOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: opt.value })}
                                        className={`p-2 rounded-lg border-2 transition-colors ${formData.icon === opt.value
                                            ? 'border-[#F13B4B] bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {getIconComponent(opt.value, 18)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                            <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: opt.value })}
                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.class} ${formData.color === opt.value
                                            ? 'ring-2 ring-offset-2 ring-gray-400'
                                            : ''
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                        Batal
                    </Button>
                    <Button variant="primary" onClick={handleSave} className="flex-1" leftIcon={<Save size={16} />}>
                        Simpan
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default LinksPage;
