import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

// Mock notifications data
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'success',
        title: 'Target Tercapai',
        message: 'Selamat! Target penjualan bulan ini sudah tercapai 100%',
        time: '5 menit lalu',
        read: false,
    },
    {
        id: '2',
        type: 'warning',
        title: 'Stok Menipis',
        message: 'Stok Perdana Tri 5GB hampir habis di gudang utama',
        time: '1 jam lalu',
        read: false,
    },
    {
        id: '3',
        type: 'info',
        title: 'Update Sistem',
        message: 'Sistem akan maintenance pada Minggu, 22 Des 2024 pukul 02:00',
        time: '2 jam lalu',
        read: false,
    },
    {
        id: '4',
        type: 'info',
        title: 'Kunjungan Baru',
        message: 'Ada 5 outlet yang perlu dikunjungi hari ini',
        time: '3 jam lalu',
        read: true,
    },
    {
        id: '5',
        type: 'success',
        title: 'Laporan Dikirim',
        message: 'Laporan mingguan berhasil dikirim ke manager',
        time: 'Kemarin',
        read: true,
    },
];

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error':
                return <X size={16} className="text-red-500" />;
            default:
                return <Info size={16} className="text-blue-500" />;
        }
    };

    const getBgColor = (type: Notification['type'], read: boolean) => {
        if (read) return 'bg-white';
        switch (type) {
            case 'success':
                return 'bg-green-50';
            case 'warning':
                return 'bg-amber-50';
            case 'error':
                return 'bg-red-50';
            default:
                return 'bg-blue-50';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-[#F13B4B] hover:underline font-medium"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${getBgColor(notification.type, notification.read)}`}
                                >
                                    <div className="mt-0.5">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                {notification.title}
                                            </p>
                                            <button
                                                onClick={() => removeNotification(notification.id)}
                                                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-400">{notification.time}</span>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs text-[#F13B4B] hover:underline flex items-center gap-1"
                                                >
                                                    <Check size={12} />
                                                    Tandai dibaca
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <button className="w-full text-center text-sm text-[#F13B4B] hover:underline font-medium py-1">
                                Lihat Semua Notifikasi
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
