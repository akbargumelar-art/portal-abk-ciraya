import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserProfileMenu from './UserProfileMenu';
import ProfileEditModal from '../modals/ProfileEditModal';
import { useSearch } from '../../contexts/SearchContext';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const { searchQuery, setSearchQuery, clearSearch } = useSearch();

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Global Search */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#F13B4B] focus-within:bg-white transition-all">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-40 lg:w-56 placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={14} className="text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* User Profile Menu */}
                    <div className="pl-3 border-l border-gray-200">
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
