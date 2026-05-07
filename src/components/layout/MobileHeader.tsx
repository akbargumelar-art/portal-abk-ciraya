/**
 * MobileHeader — Header bergaya aplikasi mobile native.
 * Menampilkan: menu hamburger | title | icon aksi kanan.
 */
import React, { useState } from 'react';
import { Menu, Search, Bell, X } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useSearch } from '../../contexts/SearchContext';
import { useAuth } from '../../contexts/AuthContext';

interface MobileHeaderProps {
    title: string;
    showSearch?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, showSearch = true }) => {
    const { openMobileSidebar } = useSidebar();
    const { searchQuery, setSearchQuery, clearSearch } = useSearch();
    const { user } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            <header className="mobile-header">
                {/* Kiri: Hamburger */}
                <button
                    onClick={openMobileSidebar}
                    className="mobile-header-icon-btn"
                    aria-label="Buka navigasi"
                >
                    <Menu size={22} />
                </button>

                {/* Tengah: Title */}
                {!searchOpen && (
                    <div className="flex-1 min-w-0 px-2">
                        <h1 className="text-base font-bold text-gray-900 truncate leading-tight">{title}</h1>
                        <p className="text-[10px] text-gray-400 leading-none">Portal Cirebon Raya</p>
                    </div>
                )}

                {/* Search expanded */}
                {searchOpen && showSearch && (
                    <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5 mx-2">
                        <Search size={16} className="text-gray-400 flex-shrink-0" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button onClick={clearSearch} aria-label="Hapus">
                                <X size={14} className="text-gray-400" />
                            </button>
                        )}
                    </div>
                )}

                {/* Kanan: Actions */}
                <div className="flex items-center gap-1">
                    {showSearch && !searchOpen && (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="mobile-header-icon-btn"
                            aria-label="Buka pencarian"
                        >
                            <Search size={20} />
                        </button>
                    )}
                    {searchOpen && (
                        <button
                            onClick={() => { setSearchOpen(false); clearSearch(); }}
                            className="mobile-header-icon-btn text-[#F13B4B]"
                        >
                            <X size={20} />
                        </button>
                    )}
                    {!searchOpen && (
                        <>
                            <button className="mobile-header-icon-btn relative" aria-label="Notifikasi">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F13B4B] rounded-full border-2 border-white" />
                            </button>
                            <button className="flex items-center ml-1" aria-label="Profil">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=F13B4B&color=fff&size=32`}
                                    alt={`Avatar ${user?.name}`}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#F13B4B]/20"
                                />
                            </button>
                        </>
                    )}
                </div>
            </header>
        </>
    );
};

export default MobileHeader;
