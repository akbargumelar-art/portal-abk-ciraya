/**
 * ImageLightbox Component
 * 
 * A modal lightbox for displaying images in full screen with zoom capabilities.
 * Used by POP components for viewing reference photos and evidence.
 */

import React, { useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    title?: string;
    alt?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
    isOpen,
    onClose,
    src,
    title,
    alt = 'Lightbox image',
}) => {
    const [scale, setScale] = React.useState(1);
    const [rotation, setRotation] = React.useState(0);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setRotation(0);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + 0.25, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    }, []);

    const handleRotate = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
                {title && (
                    <h3 className="text-white text-lg font-medium truncate max-w-[50%]">
                        {title}
                    </h3>
                )}
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <span className="text-white text-sm min-w-[50px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={handleRotate}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Rotate"
                    >
                        <RotateCw size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors ml-2"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Image Container */}
            <div className="overflow-auto max-w-full max-h-full p-8">
                <img
                    src={src}
                    alt={alt}
                    className="max-w-none transition-transform duration-200"
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                    }}
                />
            </div>
        </div>
    );
};

export default ImageLightbox;
