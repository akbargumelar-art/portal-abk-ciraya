/**
 * ImageDropzone Component
 * 
 * A drag-and-drop image upload component with preview functionality.
 * Used by POP forms for uploading reference and proof photos.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageDropzoneProps {
    onImageSelect: (file: File, previewUrl: string) => void;
    onImageClear?: () => void;
    currentPreview?: string;
    label?: string;
    helperText?: string;
    error?: string;
    maxSizeMB?: number;
    acceptedTypes?: string[];
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({
    onImageSelect,
    onImageClear,
    currentPreview,
    label = 'Upload Foto',
    helperText = 'Drag & drop atau klik untuk upload',
    error,
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): boolean => {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            setLocalError(`Format tidak didukung. Gunakan: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`);
            return false;
        }

        // Check file size
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            setLocalError(`Ukuran file maksimal ${maxSizeMB}MB`);
            return false;
        }

        setLocalError(null);
        return true;
    }, [acceptedTypes, maxSizeMB]);

    const handleFile = useCallback((file: File) => {
        if (validateFile(file)) {
            const previewUrl = URL.createObjectURL(file);
            onImageSelect(file, previewUrl);
        }
    }, [validateFile, onImageSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setLocalError(null);
        onImageClear?.();
    };

    const displayError = error || localError;

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : displayError
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(',')}
                    onChange={handleInputChange}
                    className="hidden"
                />

                {currentPreview ? (
                    <div className="relative">
                        <img
                            src={currentPreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full 
                                     hover:bg-red-600 shadow-lg transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className={`
                            w-14 h-14 mx-auto rounded-full flex items-center justify-center
                            ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
                        `}>
                            {isDragging ? (
                                <Upload size={28} />
                            ) : (
                                <ImageIcon size={28} />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{helperText}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Format: JPG, PNG, WebP (maks. {maxSizeMB}MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {displayError && (
                <p className="text-xs text-red-500 mt-1">{displayError}</p>
            )}
        </div>
    );
};

export default ImageDropzone;
