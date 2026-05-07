import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui/index';
import { useSearch } from '../../contexts/SearchContext';
import {
    Play,
    Clock,
    Eye,
    X,
    User,
    Filter,
    Search,
    Video as VideoIcon
} from 'lucide-react';

// Video interface
interface Video {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    views: number;
    presenter: string;
    category: 'Sales Technique' | 'Product Knowledge' | 'Tutorial App' | 'Roleplay';
    description: string;
    youtubeId?: string;
}

// Mock video data
const mockVideos: Video[] = [
    {
        id: '1',
        title: 'Roleplay: Pendekatan Outlet Baru',
        thumbnail: 'https://picsum.photos/seed/vid1/400/225',
        duration: '12:45',
        views: 1250,
        presenter: 'Ahmad Fauzi',
        category: 'Roleplay',
        description: 'Teknik pendekatan pertama kali ke outlet potensial',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '2',
        title: 'Roleplay: Handling Objection Harga',
        thumbnail: 'https://picsum.photos/seed/vid2/400/225',
        duration: '8:30',
        views: 890,
        presenter: 'Siti Nurhaliza',
        category: 'Roleplay',
        description: 'Cara mengatasi keberatan harga dari outlet',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '3',
        title: 'Roleplay: Cross-Selling Produk',
        thumbnail: 'https://picsum.photos/seed/vid3/400/225',
        duration: '10:15',
        views: 720,
        presenter: 'Ahmad Fauzi',
        category: 'Roleplay',
        description: 'Teknik menawarkan produk tambahan',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '4',
        title: 'Product Knowledge: Paket Internet Terbaru',
        thumbnail: 'https://picsum.photos/seed/vid4/400/225',
        duration: '15:20',
        views: 2100,
        presenter: 'Budi Santoso',
        category: 'Product Knowledge',
        description: 'Penjelasan lengkap paket internet Desember 2024',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '5',
        title: 'Product Knowledge: Voucher Fisik vs Digital',
        thumbnail: 'https://picsum.photos/seed/vid5/400/225',
        duration: '9:45',
        views: 1580,
        presenter: 'Budi Santoso',
        category: 'Product Knowledge',
        description: 'Perbedaan dan keunggulan masing-masing jenis voucher',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '6',
        title: 'Product Knowledge: Starter Pack Premium',
        thumbnail: 'https://picsum.photos/seed/vid6/400/225',
        duration: '11:30',
        views: 980,
        presenter: 'Dewi Lestari',
        category: 'Product Knowledge',
        description: 'Fitur dan benefit starter pack premium',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '7',
        title: 'Tutorial: Input Data Kunjungan di App',
        thumbnail: 'https://picsum.photos/seed/vid7/400/225',
        duration: '6:15',
        views: 560,
        presenter: 'IT Support Team',
        category: 'Tutorial App',
        description: 'Step by step input data kunjungan outlet',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '8',
        title: 'Tutorial: Upload Foto & Bukti Transaksi',
        thumbnail: 'https://picsum.photos/seed/vid8/400/225',
        duration: '4:20',
        views: 420,
        presenter: 'IT Support Team',
        category: 'Tutorial App',
        description: 'Cara upload dokumentasi kunjungan',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '9',
        title: 'Sales Technique: Membangun Rapport',
        thumbnail: 'https://picsum.photos/seed/vid9/400/225',
        duration: '14:00',
        views: 1890,
        presenter: 'Ahmad Fauzi',
        category: 'Sales Technique',
        description: 'Teknik membangun hubungan baik dengan outlet',
        youtubeId: 'dQw4w9WgXcQ',
    },
    {
        id: '10',
        title: 'Sales Technique: Closing yang Efektif',
        thumbnail: 'https://picsum.photos/seed/vid10/400/225',
        duration: '12:30',
        views: 2340,
        presenter: 'Siti Nurhaliza',
        category: 'Sales Technique',
        description: 'Teknik closing untuk meningkatkan conversion',
        youtubeId: 'dQw4w9WgXcQ',
    },
];

// Categories
const categories = [
    { value: '', label: 'Semua Video' },
    { value: 'Roleplay', label: 'Roleplay' },
    { value: 'Sales Technique', label: 'Sales Technique' },
    { value: 'Product Knowledge', label: 'Product Knowledge' },
    { value: 'Tutorial App', label: 'Tutorial App' },
];

// Category colors
const getCategoryColor = (category: string) => {
    switch (category) {
        case 'Roleplay': return 'bg-purple-100 text-purple-700';
        case 'Sales Technique': return 'bg-blue-100 text-blue-700';
        case 'Product Knowledge': return 'bg-green-100 text-green-700';
        case 'Tutorial App': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

// Video Modal Component
const VideoModal: React.FC<{ video: Video | null; onClose: () => void }> = ({ video, onClose }) => {
    if (!video) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-lg animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Video Player */}
                <div className="relative aspect-video bg-black">
                    {video.youtubeId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                            title={video.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                                <Play size={64} className="mx-auto mb-4 opacity-50" />
                                <p>Video player placeholder</p>
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Video Info */}
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900">{video.title}</h2>
                    <p className="text-gray-600 mt-2">{video.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <User size={14} />
                            {video.presenter}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock size={14} />
                            {video.duration}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Eye size={14} />
                            {video.views.toLocaleString()} views
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                            {video.category}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoRoleplayPage: React.FC = () => {
    // Global search context
    const { searchQuery } = useSearch();

    // Local state
    const [categoryFilter, setCategoryFilter] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    // Combined search
    const effectiveSearch = searchQuery || localSearch;

    // Filtered videos
    const filteredVideos = useMemo(() => {
        return mockVideos.filter(video => {
            // Category filter
            if (categoryFilter && video.category !== categoryFilter) return false;

            // Search filter
            if (effectiveSearch) {
                const query = effectiveSearch.toLowerCase();
                const matchesTitle = video.title.toLowerCase().includes(query);
                const matchesDesc = video.description.toLowerCase().includes(query);
                const matchesPresenter = video.presenter.toLowerCase().includes(query);
                const matchesCategory = video.category.toLowerCase().includes(query);

                if (!matchesTitle && !matchesDesc && !matchesPresenter && !matchesCategory) {
                    return false;
                }
            }

            return true;
        });
    }, [categoryFilter, effectiveSearch]);

    // Stats
    const totalViews = useMemo(() =>
        mockVideos.reduce((sum, v) => sum + v.views, 0), []
    );

    return (
        <div className="p-6 animate-fade-in">
            <Header title="Video Roleplay" />

            {/* Stats Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                    <VideoIcon size={16} className="text-[#F13B4B]" />
                    <strong className="text-gray-900">{mockVideos.length}</strong> Total Video
                </span>
                <span className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-500" />
                    <strong className="text-gray-900">{totalViews.toLocaleString()}</strong> Total Views
                </span>
            </div>

            {/* Filters */}
            <Card padding="md" className="mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="Cari video..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent"
                        />
                        {searchQuery && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                Global: "{searchQuery}"
                            </span>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <Filter size={16} className="text-gray-400 flex-shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setCategoryFilter(cat.value)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${categoryFilter === cat.value
                                        ? 'bg-[#F13B4B] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Results Info */}
            {effectiveSearch && (
                <p className="mt-4 text-sm text-[#F13B4B]">
                    Menampilkan {filteredVideos.length} hasil untuk "{effectiveSearch}"
                </p>
            )}

            {/* Video Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <VideoIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Tidak ada video yang cocok</p>
                        {effectiveSearch && (
                            <p className="text-sm mt-1">Coba kata kunci lain</p>
                        )}
                    </div>
                ) : (
                    filteredVideos.map(video => (
                        <Card
                            key={video.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            {/* Thumbnail */}
                            <div className="relative">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-44 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                        <Play size={28} className="text-[#F13B4B] ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded flex items-center gap-1">
                                    <Clock size={12} />
                                    {video.duration}
                                </div>
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(video.category)}`}>
                                    {video.category}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#F13B4B] transition-colors">
                                    {video.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User size={14} />
                                        {video.presenter}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye size={14} />
                                        {video.views.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Video Modal */}
            <VideoModal
                video={selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />
        </div>
    );
};

export default VideoRoleplayPage;
