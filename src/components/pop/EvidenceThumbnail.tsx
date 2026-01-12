/**
 * Evidence Thumbnail Component
 * 
 * Small thumbnail for displaying proof/evidence photos in tables.
 * Clicking opens the lightbox for full view.
 */

import React, { useState } from 'react';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';
import ImageLightbox from '../ui/ImageLightbox';

interface EvidenceThumbnailProps {
    /**
     * Photo URL to display.
     */
    src?: string;

    /**
     * Alt text for the image.
     */
    alt?: string;

    /**
     * Title for the lightbox.
     */
    title?: string;

    /**
     * Size of the thumbnail.
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Custom className.
     */
    className?: string;
}

const EvidenceThumbnail: React.FC<EvidenceThumbnailProps> = ({
    src,
    alt = 'Evidence',
    title,
    size = 'md',
    className = '',
}) => {
    const [showLightbox, setShowLightbox] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 20,
    };

    if (!src) {
        // Placeholder when no image
        return (
            <div
                className={`
                    ${sizeClasses[size]} 
                    bg-gray-100 rounded-lg 
                    flex items-center justify-center
                    ${className}
                `}
                title="Tidak ada foto"
            >
                <ImageIcon size={iconSizes[size]} className="text-gray-300" />
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowLightbox(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    ${sizeClasses[size]} 
                    relative rounded-lg overflow-hidden
                    ring-2 ring-transparent hover:ring-blue-400
                    transition-all duration-200
                    group
                    ${className}
                `}
                title="Klik untuk memperbesar"
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />

                {/* Hover overlay */}
                <div className={`
                    absolute inset-0 bg-black/40 
                    flex items-center justify-center
                    transition-opacity duration-200
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                    <ZoomIn size={iconSizes[size]} className="text-white" />
                </div>
            </button>

            {/* Lightbox */}
            <ImageLightbox
                src={src}
                alt={alt}
                title={title}
                isOpen={showLightbox}
                onClose={() => setShowLightbox(false)}
            />
        </>
    );
};

export default EvidenceThumbnail;
