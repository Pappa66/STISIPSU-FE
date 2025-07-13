'use client';

import React from 'react';
import useSWR from 'swr';
import { useAuthStore } from '@/store/authStore';
import { jwtDecode } from 'jwt-decode';
import { RepositoryItem, UserRole } from '@/types';
import RepositoryCard from '@/components/repository/RepositoryCard'; // Impor komponen Card
import { Book } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data');
    return res.json();
});

export default function RepositoryListPage() {
    const { token } = useAuthStore();
    let userRole: UserRole = 'public';

    if (token) {
        try {
            const decoded: { role: UserRole } = jwtDecode(token);
            userRole = decoded.role;
        } catch (e) {
            console.error("Token tidak valid");
        }
    }
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/repository-items`;
    const { data: items, error, isLoading } = useSWR<RepositoryItem[]>(apiUrl, fetcher);

    if (error) return (
        <div className="text-center py-16 text-red-500">
            <h3 className="text-xl font-semibold">Terjadi Kesalahan</h3>
            <p className="mt-2">Tidak dapat terhubung ke server repositori.</p>
        </div>
    );
    if (isLoading) return (
        <div className="text-center py-16 text-gray-500">
            <h3 className="text-xl font-semibold">Memuat Data...</h3>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800">Repositori Karya Ilmiah</h1>
                    <p className="mt-2 text-lg text-gray-600">Jelajahi koleksi skripsi dan penelitian dari civitas akademika STISIP Syamsul Ulum.</p>
                </div>
                
                {items && items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item) => (
                           <RepositoryCard key={item.id} item={item} role={userRole} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-16 border-t pt-10">
                        <h3 className="text-xl font-semibold">Belum Ada Karya Ilmiah</h3>
                        <p className="mt-2">Saat ini tidak ada karya ilmiah yang dipublikasikan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
