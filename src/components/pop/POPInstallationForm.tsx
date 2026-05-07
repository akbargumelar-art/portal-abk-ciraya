/**
 * POP Installation Form Component
 * 
 * Form for recording a new POP installation at an outlet.
 * Includes item selection with reference photo preview and proof photo upload.
 */

import React, { useState, useEffect } from 'react';
import { Save, Package } from 'lucide-react';
import { Modal, Select, Button, Badge } from '../ui/index';
import ImageDropzone from '../ui/ImageDropzone';
import { getPOPItems } from '../../services/mock/popData';
import { getCategoryDisplayName } from '../../types/pop';
import type { POPInstallationFormData } from '../../types/pop';

// Mock outlet options
const OUTLET_OPTIONS = [
    { value: '', label: 'Pilih Outlet' },
    { value: 'OUT-001', label: 'Toko Maju Jaya - Jl. Kartini No. 15' },
    { value: 'OUT-002', label: 'Cell Center - Jl. Siliwangi No. 88' },
    { value: 'OUT-003', label: 'Ponsel Mart - Jl. Dr. Cipto No. 45' },
    { value: 'OUT-004', label: 'Gadget Zone - Jl. Veteran No. 12' },
    { value: 'OUT-005', label: 'Phone Expert - Jl. Pemuda No. 67' },
];

interface POPInstallationFormProps {
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
    onSubmit: (data: POPInstallationFormData) => void;
}

const POPInstallationForm: React.FC<POPInstallationFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [selectedItemId, setSelectedItemId] = useState('');
    const [selectedOutletId, setSelectedOutletId] = useState('');
    const [notes, setNotes] = useState('');
    const [proofPhoto, setProofPhoto] = useState<File | null>(null);
    const [proofPhotoPreview, setProofPhotoPreview] = useState<string | undefined>(undefined);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const items = getPOPItems();
    const selectedItem = items.find(i => i.id === selectedItemId);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedItemId('');
            setSelectedOutletId('');
            setNotes('');
            setProofPhoto(null);
            setProofPhotoPreview(undefined);
            setErrors({});
        }
    }, [isOpen]);

    const handleImageSelect = (file: File, previewUrl: string) => {
        setProofPhoto(file);
        setProofPhotoPreview(previewUrl);
        if (errors.proofPhoto) {
            setErrors(prev => ({ ...prev, proofPhoto: '' }));
        }
    };

    const handleImageRemove = () => {
        setProofPhoto(null);
        setProofPhotoPreview(undefined);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!selectedItemId) {
            newErrors.item = 'Pilih item POP yang akan dipasang';
        }
        if (!selectedOutletId) {
            newErrors.outlet = 'Pilih outlet tujuan';
        }
        if (!proofPhoto) {
            newErrors.proofPhoto = 'Foto bukti pemasangan wajib diupload';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !proofPhoto) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        onSubmit({
            itemId: selectedItemId,
            outletId: selectedOutletId,
            proofPhoto,
            notes,
        });

        setIsLoading(false);
        onClose();
    };

    // Generate item options with stock info
    const itemOptions = [
        { value: '', label: 'Pilih Item POP' },
        ...items
            .filter(i => i.isActive && i.stock > 0)
            .map(i => ({
                value: i.id,
                label: `${i.name} (Stock: ${i.stock})`,
            })),
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Catat Pemasangan POP"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Outlet Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outlet Tujuan <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={selectedOutletId}
                        onChange={(e) => {
                            setSelectedOutletId(e.target.value);
                            if (errors.outlet) setErrors(prev => ({ ...prev, outlet: '' }));
                        }}
                        options={OUTLET_OPTIONS}
                        className="w-full"
                    />
                    {errors.outlet && (
                        <p className="mt-1 text-xs text-red-500">{errors.outlet}</p>
                    )}
                </div>

                {/* Item Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item POP <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={selectedItemId}
                        onChange={(e) => {
                            setSelectedItemId(e.target.value);
                            if (errors.item) setErrors(prev => ({ ...prev, item: '' }));
                        }}
                        options={itemOptions}
                        className="w-full"
                    />
                    {errors.item && (
                        <p className="mt-1 text-xs text-red-500">{errors.item}</p>
                    )}
                </div>

                {/* Selected Item Preview */}
                {selectedItem && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wider">
                            Referensi Item
                        </p>
                        <div className="flex gap-4">
                            {selectedItem.referencePhotoUrl ? (
                                <img
                                    src={selectedItem.referencePhotoUrl}
                                    alt={selectedItem.name}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package size={32} className="text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{selectedItem.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedItem.description || 'Tidak ada deskripsi'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="neutral">
                                        {getCategoryDisplayName(selectedItem.category)}
                                    </Badge>
                                    <Badge variant="success">
                                        Stock: {selectedItem.stock}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Proof Photo Upload */}
                <div>
                    <ImageDropzone
                        label="Foto Bukti Pemasangan"
                        helperText="Upload foto POP yang sudah terpasang di outlet"
                        currentPreview={proofPhotoPreview}
                        onImageSelect={handleImageSelect}
                        onImageClear={handleImageRemove}
                        error={errors.proofPhoto}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Lokasi pemasangan, kondisi, dll..."
                        rows={3}
                        className="input resize-none"
                    />
                </div>

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
                        Simpan Pemasangan
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default POPInstallationForm;
