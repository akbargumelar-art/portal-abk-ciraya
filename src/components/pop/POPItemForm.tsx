/**
 * POP Item Form Component
 * 
 * Form for creating or editing a POP item in the catalog.
 */

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Modal, Input, Select, Button } from '../ui/index';
import ImageDropzone from '../ui/ImageDropzone';
import { CATEGORY_OPTIONS } from '../../services/mock/popData';
import type { POPItem, POPCategory, POPItemFormData } from '../../types/pop';

interface POPItemFormProps {
    /**
     * Whether the modal is open.
     */
    isOpen: boolean;

    /**
     * Callback to close the modal.
     */
    onClose: () => void;

    /**
     * Callback when form is submitted.
     */
    onSubmit: (data: POPItemFormData) => void;

    /**
     * Existing item for editing (optional).
     */
    editItem?: POPItem;
}

const POPItemForm: React.FC<POPItemFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editItem,
}) => {
    const [formData, setFormData] = useState<POPItemFormData>({
        name: '',
        category: 'banner',
        description: '',
        stock: 0,
        minStock: 5,
        unit: 'pcs',
    });
    const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form with edit item data
    useEffect(() => {
        if (editItem) {
            setFormData({
                name: editItem.name,
                category: editItem.category,
                description: editItem.description || '',
                stock: editItem.stock,
                minStock: editItem.minStock || 5,
                unit: editItem.unit,
            });
            setPhotoPreview(editItem.referencePhotoUrl);
        } else {
            // Reset form
            setFormData({
                name: '',
                category: 'banner',
                description: '',
                stock: 0,
                minStock: 5,
                unit: 'pcs',
            });
            setPhotoPreview(undefined);
        }
        setErrors({});
    }, [editItem, isOpen]);

    const handleChange = (field: keyof POPItemFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageSelect = (file: File, previewUrl: string) => {
        setFormData(prev => ({ ...prev, referencePhoto: file }));
        setPhotoPreview(previewUrl);
    };

    const handleImageRemove = () => {
        setFormData(prev => ({ ...prev, referencePhoto: undefined }));
        setPhotoPreview(undefined);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama item wajib diisi';
        }
        if (!formData.category) {
            newErrors.category = 'Kategori wajib dipilih';
        }
        if (formData.stock < 0) {
            newErrors.stock = 'Stock tidak boleh negatif';
        }
        if (!formData.unit.trim()) {
            newErrors.unit = 'Satuan wajib diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        onSubmit(formData);
        setIsLoading(false);
        onClose();
    };

    const unitOptions = [
        { value: 'pcs', label: 'Pcs' },
        { value: 'lembar', label: 'Lembar' },
        { value: 'unit', label: 'Unit' },
        { value: 'buah', label: 'Buah' },
        { value: 'roll', label: 'Roll' },
    ];

    const categoryOptionsFiltered = CATEGORY_OPTIONS.filter(opt => opt.value !== '');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editItem ? 'Edit Item POP' : 'Tambah Item POP Baru'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Photo Upload */}
                <ImageDropzone
                    label="Foto Referensi"
                    helperText="Upload foto item untuk katalog (max 5MB)"
                    currentPreview={photoPreview}
                    onImageSelect={handleImageSelect}
                    onImageClear={handleImageRemove}
                />

                {/* Name */}
                <Input
                    label="Nama Item"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Contoh: Banner 4G LTE Promo"
                    error={errors.name}
                    required
                />

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value as POPCategory)}
                        options={categoryOptionsFiltered}
                        className="w-full"
                    />
                    {errors.category && (
                        <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Deskripsi singkat item..."
                        rows={3}
                        className="input resize-none"
                    />
                </div>

                {/* Stock & Unit */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                        min={0}
                        error={errors.stock}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Satuan <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                            options={unitOptions}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Min Stock */}
                <Input
                    label="Minimum Stock (Alert)"
                    name="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                    min={0}
                    helperText="Notifikasi akan muncul jika stock di bawah nilai ini"
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save size={16} />}
                        isLoading={isLoading}
                    >
                        {editItem ? 'Simpan Perubahan' : 'Tambah Item'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default POPItemForm;
