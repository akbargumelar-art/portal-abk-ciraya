/**
 * POP Catalog Component
 * 
 * Grid gallery display of available POP items with their reference photos.
 */

import React, { useState, useMemo } from 'react';
import { Search, Package, Plus } from 'lucide-react';
import { Card, Input, Select, Badge, Button } from '../ui/index';
import ImageLightbox from '../ui/ImageLightbox';
import { getPOPItems, CATEGORY_OPTIONS } from '../../services/mock/popData';
import { getCategoryDisplayName } from '../../types/pop';
import type { POPItem } from '../../types/pop';

interface POPCatalogProps {
    /**
     * Callback when "Add Item" is clicked.
     */
    onAddItem?: () => void;

    /**
     * Callback when an item is clicked for editing.
     */
    onEditItem?: (item: POPItem) => void;
}

const POPCatalog: React.FC<POPCatalogProps> = ({
    onAddItem,
    onEditItem,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

    const items = getPOPItems();

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchSearch = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCategory = !categoryFilter || item.category === categoryFilter;
            return matchSearch && matchCategory && item.isActive;
        });
    }, [items, searchTerm, categoryFilter]);

    const getStockBadgeVariant = (stock: number, minStock?: number): 'success' | 'warning' | 'error' => {
        if (minStock && stock <= minStock) return 'error';
        if (minStock && stock <= minStock * 2) return 'warning';
        return 'success';
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Cari item POP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search size={18} className="text-gray-400" />}
                    />
                </div>
                <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    options={CATEGORY_OPTIONS}
                    className="min-w-[180px]"
                />
                {onAddItem && (
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={16} />}
                        onClick={onAddItem}
                    >
                        Tambah Item
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                    <Package size={16} />
                    {filteredItems.length} item ditemukan
                </span>
            </div>

            {/* Grid */}
            {filteredItems.length === 0 ? (
                <Card className="text-center py-12">
                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Tidak ada item POP yang ditemukan</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            {/* Image */}
                            <div
                                className="relative aspect-[4/3] bg-gray-100 cursor-pointer overflow-hidden"
                                onClick={() => {
                                    if (item.referencePhotoUrl) {
                                        setLightboxImage({
                                            src: item.referencePhotoUrl,
                                            title: item.name,
                                        });
                                    }
                                }}
                            >
                                {item.referencePhotoUrl ? (
                                    <img
                                        src={item.referencePhotoUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package size={48} className="text-gray-300" />
                                    </div>
                                )}

                                {/* Overlay on hover */}
                                {item.referencePhotoUrl && (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full transition-opacity">
                                            Lihat Foto
                                        </span>
                                    </div>
                                )}

                                {/* Category Badge */}
                                <div className="absolute top-3 left-3">
                                    <Badge variant="neutral" className="bg-white/90 backdrop-blur-sm">
                                        {getCategoryDisplayName(item.category)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                    {item.name}
                                </h3>
                                {item.description && (
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}

                                {/* Stock */}
                                <div className="flex items-center justify-between">
                                    <Badge variant={getStockBadgeVariant(item.stock, item.minStock)}>
                                        Stock: {item.stock} {item.unit}
                                    </Badge>

                                    {onEditItem && (
                                        <button
                                            onClick={() => onEditItem(item)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxImage && (
                <ImageLightbox
                    src={lightboxImage.src}
                    alt={lightboxImage.title}
                    title={lightboxImage.title}
                    isOpen={true}
                    onClose={() => setLightboxImage(null)}
                />
            )}
        </div>
    );
};

export default POPCatalog;
