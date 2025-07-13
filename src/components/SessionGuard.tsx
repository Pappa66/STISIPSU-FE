'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 jam

export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { token, sessionStartedAt, isAuthCheckComplete, logout } = useAuthStore();
    
    const isDashboardPage = pathname.startsWith('/dashboard');

    useEffect(() => {
        // Jangan jalankan logika apapun jika bukan halaman dasbor atau state belum siap
        if (!isDashboardPage || !isAuthCheckComplete) return;

        // Jika tidak ada token, panggil logout (yang akan redirect)
        if (!token || !sessionStartedAt) {
            logout();
            return;
        }

        const isSessionExpired = Date.now() - sessionStartedAt > SESSION_DURATION_MS;

        if (isSessionExpired) {
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
            
            // Simpan path terakhir SEBELUM logout
            localStorage.setItem('last_visited_path', pathname);
            
            // Panggil logout (yang akan me-redirect ke /login)
            logout();
        }

    }, [isDashboardPage, token, sessionStartedAt, isAuthCheckComplete, pathname, logout]);

    // Tampilan loading ini penting untuk mencegah "kedipan" halaman
    if (isDashboardPage && (!isAuthCheckComplete || !token)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Memeriksa sesi...</p>
            </div>
        );
    }

    return <>{children}</>;
}
