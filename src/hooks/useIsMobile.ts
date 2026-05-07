/**
 * useIsMobile — deteksi perangkat mobile secara reaktif.
 *
 * Menggunakan matchMedia agar reaktif terhadap resize (tidak perlu polling),
 * dan menggunakan user agent sebagai fallback awal untuk mencegah flash.
 */
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024; // lg breakpoint Tailwind

/** Deteksi awal sebelum hydration (cegah layout flash) */
function getInitialIsMobile(): boolean {
    if (typeof window === 'undefined') return false;
    // Cek jika sudah ada preferensi user agent
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    if (isMobileUA) return true;
    return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(getInitialIsMobile);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mql.matches);

        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isMobile;
}
