import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Camera, X, Check, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Select, Button } from '../components/ui/index';
import { outlets } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const VisitFormPage: React.FC = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        outletId: '',
        notes: '',
        eventNotes: '',
        issues: [] as string[],
        newIssue: '',
    });

    const [location, setLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
        accuracy: number | null;
        loading: boolean;
        error: string | null;
    }>({
        latitude: null,
        longitude: null,
        accuracy: null,
        loading: false,
        error: null,
    });

    const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Outlet options
    const outletOptions = [
        { value: '', label: 'Select Outlet' },
        ...outlets.slice(0, 100).map(o => ({
            value: o.id,
            label: `${o.rsNumber} - ${o.name}`,
        })),
    ];

    // Issue options
    const issueOptions = [
        'Stock habis',
        'Outlet tutup sementara',
        'Masalah pembayaran',
        'Komplain pelanggan',
        'Butuh materi promo',
        'Perangkat rusak',
        'Lainnya',
    ];

    // Get current location with high precision
    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
            return;
        }

        setLocation(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    loading: false,
                    error: null,
                });
            },
            (error) => {
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: `Unable to retrieve location: ${error.message}`,
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // Auto-get location on mount
    useEffect(() => {
        getLocation();
    }, []);

    // Handle photo upload
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (photos.length >= 5) return; // Max 5 photos

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos(prev => [...prev, { file, preview: reader.result as string }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove photo
    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Add issue
    const addIssue = (issue: string) => {
        if (!formData.issues.includes(issue)) {
            setFormData(prev => ({
                ...prev,
                issues: [...prev.issues, issue],
            }));
        }
    };

    // Remove issue
    const removeIssue = (issue: string) => {
        setFormData(prev => ({
            ...prev,
            issues: prev.issues.filter(i => i !== issue),
        }));
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Visit Form Data:', {
            ...formData,
            location,
            photos: photos.map(p => p.file.name),
            userId: user?.id,
            timestamp: new Date().toISOString(),
        });

        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Reset form after success
        setTimeout(() => {
            setFormData({
                outletId: '',
                notes: '',
                eventNotes: '',
                issues: [],
                newIssue: '',
            });
            setPhotos([]);
            setSubmitSuccess(false);
        }, 2000);
    };

    // Check if user is Direct Sales (shows different fields)
    const isDirectSales = user?.role === 'direct_sales';

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Visit Form"
            />

            {submitSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card padding="lg" className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Visit Recorded!</h3>
                        <p className="text-gray-500 mt-1">Your visit has been saved successfully.</p>
                    </Card>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 max-w-3xl">
                <div className="space-y-6">
                    {/* Outlet Selection */}
                    <Card padding="md">
                        <h3 className="font-semibold text-gray-900 mb-4">Outlet Information</h3>
                        <Select
                            label="Select Outlet"
                            value={formData.outletId}
                            onChange={e => setFormData(prev => ({ ...prev, outletId: e.target.value }))}
                            options={outletOptions}
                        />

                        {formData.outletId && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                {(() => {
                                    const outlet = outlets.find(o => o.id === formData.outletId);
                                    if (!outlet) return null;
                                    return (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{outlet.name}</p>
                                            <p className="text-gray-500">{outlet.address}</p>
                                            <p className="text-gray-500">{outlet.kecamatan}, {outlet.kabupaten}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </Card>

                    {/* Location */}
                    <Card padding="md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Location</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={getLocation}
                                isLoading={location.loading}
                                leftIcon={<MapPin size={16} />}
                            >
                                {location.loading ? 'Getting Location...' : 'Refresh Location'}
                            </Button>
                        </div>

                        {location.error ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {location.error}
                            </div>
                        ) : location.latitude && location.longitude ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                                        <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                            {location.latitude.toFixed(8)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                                        <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                            {location.longitude.toFixed(8)}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Accuracy: ±{location.accuracy?.toFixed(1)}m
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Getting your location...</span>
                            </div>
                        )}
                    </Card>

                    {/* Photo Upload */}
                    <Card padding="md">
                        <h3 className="font-semibold text-gray-900 mb-4">Photos</h3>

                        <div className="flex flex-wrap gap-3 mb-4">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={photo.preview}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(idx)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {photos.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#F13B4B] hover:text-[#F13B4B] transition-colors"
                                >
                                    <Camera size={24} />
                                    <span className="text-xs mt-1">Add Photo</span>
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />

                        <p className="text-xs text-gray-500">Max 5 photos. Tap to add photos of the outlet.</p>
                    </Card>

                    {/* Notes - Role-based */}
                    <Card padding="md">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            {isDirectSales ? 'Event Notes' : 'Outlet Management Notes'}
                        </h3>

                        {isDirectSales ? (
                            // Direct Sales sees Event Notes
                            <div>
                                <textarea
                                    value={formData.eventNotes}
                                    onChange={e => setFormData(prev => ({ ...prev, eventNotes: e.target.value }))}
                                    placeholder="Describe the event, customer engagement, promotions conducted..."
                                    className="input min-h-[120px] resize-y"
                                />
                            </div>
                        ) : (
                            // Salesforce sees Outlet Management
                            <>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Notes about outlet condition, stock status, customer feedback..."
                                    className="input min-h-[120px] resize-y mb-4"
                                />

                                {/* Issues */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Issues Found</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.issues.map(issue => (
                                            <span
                                                key={issue}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm"
                                            >
                                                {issue}
                                                <button type="button" onClick={() => removeIssue(issue)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {issueOptions.filter(i => !formData.issues.includes(i)).map(issue => (
                                            <button
                                                key={issue}
                                                type="button"
                                                onClick={() => addIssue(issue)}
                                                className="px-3 py-1 bg-gray-100 text-white rounded-full text-sm hover:bg-gray-200 transition-colors"
                                            >
                                                + {issue}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline">
                            Save Draft
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            disabled={!formData.outletId || !location.latitude}
                        >
                            Submit Visit
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default VisitFormPage;
