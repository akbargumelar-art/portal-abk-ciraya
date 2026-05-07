import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
            <div
                className="max-w-md rounded-lg bg-white border border-gray-200 shadow-sm p-8"
                role="status"
                aria-live="polite"
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F13B4B]/10 text-[#F13B4B]">
                    <Search size={28} aria-hidden />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Halaman tidak ditemukan</h1>
                <p className="mt-2 text-sm text-gray-600">
                    URL yang Anda buka tidak cocok dengan menu apa pun di portal. Periksa ejaan path atau gunakan menu
                    samping.
                </p>
                <Link
                    to="/dashboard"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#F13B4B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#d92f42] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F13B4B] focus-visible:ring-offset-2"
                >
                    <Home size={18} aria-hidden />
                    Kembali ke dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
