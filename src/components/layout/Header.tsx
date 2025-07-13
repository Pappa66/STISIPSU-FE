'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { NavItem as NavItemType, SubMenuItem as SubMenuItemType } from '@/types';
import { ChevronDown, LogOut, LayoutDashboard, LogIn, ExternalLink } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter(); // Inisialisasi useRouter
    const { token, logout, menuVersion } = useAuthStore();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [navigationData, setNavigationData] = useState<NavItemType[]>([]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                // Pastikan endpoint ini sesuai dengan API Anda
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/menu-items`);
                if (!res.ok) throw new Error('Failed to fetch menu');
                const data = await res.json();
                setNavigationData(data);
            } catch (error) {
                console.error("Gagal mengambil data menu:", error);
            }
        };
        fetchMenuData();
    }, [menuVersion]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const renderLink = (item: NavItemType | SubMenuItemType) => {
        const isSubmenu = 'menuItemId' in item;
        const commonClasses = isSubmenu 
            ? "block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted"
            : "flex h-full items-center gap-2 text-sm font-semibold transition-colors hover:text-primary";
        
        const hasSubmenus = 'submenus' in item && item.submenus && item.submenus.length > 0;
        const isExternalUrl = typeof item.href === 'string' && (item.href.startsWith('http://') || item.href.startsWith('https://'));

        if (isExternalUrl) {
            return (
                <a href={item.href!} target="_blank" rel="noopener noreferrer" className={`${commonClasses} flex items-center justify-between`}>
                    {item.name}
                    <ExternalLink size={14} className="ml-1" />
                </a>
            );
        }
        
        let linkHref: string;
        
        // --- KLARIFIKASI LOGIKA ---
        // Kode ini mengharapkan `item.post` memiliki struktur: { id: string, slug: string | null }
        // Pastikan backend (menuController.js) mengirimkan data ini dan file types.ts Anda sudah diperbarui.
        if (item.type === 'INTERNAL' && item.post?.slug) {
            linkHref = `/halaman/${item.post.slug}`; // Menggunakan slug
        } else if (item.type === 'INTERNAL' && item.post?.id) {
            linkHref = `/page/${item.post.id}`; // Fallback ke ID jika slug tidak ada
        } else {
            linkHref = typeof item.href === 'string' ? item.href : '#';
        }

        return (
            <Link href={linkHref} className={clsx(commonClasses)}>
                {item.name}
                {hasSubmenus && <ChevronDown size={16} />}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-50 shadow-md bg-white">
            <div className="bg-primary text-primary-foreground">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo-stisip.png" alt="Logo STISIP" width={40} height={40}/>
                        <span className="hidden text-lg font-bold sm:inline-block">STISIP SYAMSUL ULUM</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isClient && (
                            token ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
                                        <LogOut className="h-4 w-4" /> Logout
                                    </button>
                                </div>
                            ) : (
                                pathname !== '/login' && (
                                    <Link href="/login" className="flex items-center gap-1 rounded-md border border-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                                        <LogIn className="h-4 w-4" /> Login
                                    </Link>
                                )
                            )
                        )}
                    </div>
                </div>
            </div>
            
            {!pathname.startsWith('/dashboard') && (
                <nav className="bg-secondary text-secondary-foreground">
                    <div className="container flex h-12 items-center justify-center">
                        <ul className="flex h-full items-center gap-8">
                            {navigationData.map((item) => (
                                <li key={item.id} className="relative h-full" onMouseEnter={() => item.submenus && item.submenus.length > 0 && setOpenMenu(item.id)} onMouseLeave={() => item.submenus && setOpenMenu(null)}>
                                    {renderLink(item)}
                                    {item.submenus && item.submenus.length > 0 && openMenu === item.id && (
                                        <ul className="absolute left-0 top-full w-56 origin-top-left rounded-md bg-background py-2 text-foreground shadow-lg ring-1 ring-black ring-opacity-5">
                                            {item.submenus.map((submenu) => (
                                                <li key={submenu.id} onClick={() => setOpenMenu(null)}>
                                                    {renderLink(submenu)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            )}
        </header>
    );
}
