import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserProfileMenu from './UserProfileMenu';
import ProfileEditModal from '../modals/ProfileEditModal';
import { useSearch } from '../../contexts/SearchContext';
import { useSidebar } from '../../contexts/SidebarContext';

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const { searchQuery, setSearchQuery, clearSearch } = useSearch();
    const { openMobileSidebar } = useSidebar();

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        onClick={openMobileSidebar}
                        aria-label="Buka menu navigasi"
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 leading-tight">{title}</h2>
                        {subtitle && <p className="text-xs lg:text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 lg:gap-3">
                    {actions && (
                        <div className="hidden sm:flex items-center gap-2">
                            {actions}
                        </div>
                    )}

                    {/* Global Search — hidden on small mobile */}
                    <div className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#F13B4B] transition-all">
                        <Search size={18} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-32 lg:w-56 placeholder-gray-400"
                            aria-label="Pencarian global"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Hapus pencarian"
                            >
                                <X size={14} className="text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* User Profile Menu */}
                    <div className="pl-2 lg:pl-3 border-l border-gray-200">
                        <UserProfileMenu onEditProfile={() => setShowProfileEdit(true)} />
                    </div>
                </div>
            </header>

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={showProfileEdit}
                onClose={() => setShowProfileEdit(false)}
            />

        </>
    );
};

export default Header;
