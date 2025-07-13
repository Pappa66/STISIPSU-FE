'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Search, Info } from 'lucide-react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';

// Tipe data ini bisa digunakan kembali
interface Page { 
    id: string; 
    title: string; 
    author: { name: string }; 
    menuItem?: { name: string };
    submenuItem?: { name: string, menuItem: { name: string } };
}

// Backend mengirim { posts: [...] }, jadi kita tangkap dengan interface ini
interface ApiResponse {
    posts: Page[];
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data Halaman');
    return res.json();
});

export default function PageManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(inputValue), 500);
        return () => clearTimeout(timer);
    }, [inputValue]);
    
    const apiUrl = useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/pages`);
        if (searchQuery) {
            url.searchParams.append('search', searchQuery);
        }
        return url.toString();
    }, [searchQuery]);

    const { data: pagesResponse, error, isLoading, mutate } = useSWR<ApiResponse>(apiUrl, fetcher);
    const pages = pagesResponse?.posts || [];

    const handleEdit = (pageId: string) => {
        router.push(`/dashboard/editor/${pageId}`);
    };

    const handleDelete = async (pageId: string) => {
        alert('Untuk menjaga konsistensi data, halaman harus dihapus melalui modul "Kelola Menu".');
    };

    return (
        <div className="container py-8 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Kelola Konten Halaman</h1>
                    <p className="text-gray-500 mt-1">Edit konten untuk halaman yang terhubung ke menu navigasi.</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari judul halaman..." 
                        className="px-3 py-2 pl-10 border rounded-md w-80"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-4 p-4 border-l-4 border-sky-400 bg-sky-50 text-sky-800 rounded-r-lg">
                <div className="flex gap-3">
                    <Info size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold">Informasi</h4>
                        <p className="text-sm">Halaman di sini dibuat secara otomatis saat Anda menambahkan item baru di modul **"Kelola Menu"**. Gunakan modul ini hanya untuk **mengedit isi konten** dari halaman yang sudah ada.</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className="text-gray-600">
                            <th className="px-6 py-4 font-medium">Judul Halaman</th>
                            <th className="px-6 py-4 font-medium">Terhubung Ke Menu</th>
                            <th className="px-6 py-4 font-medium">Penulis</th>
                            <th className="px-6 py-4 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center p-16"><Spinner /></td></tr>
                        ) : pages.length > 0 ? pages.map((page) => (
                            <tr key={page.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-800">{page.title}</td>
                                <td className="px-6 py-4 text-xs">
                                    {page.menuItem && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{`Menu: ${page.menuItem.name}`}</span>}
                                    {page.submenuItem && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{`Sub: ${page.submenuItem.name} (di ${page.submenuItem.menuItem.name})`}</span>}
                                    {!page.menuItem && !page.submenuItem && <span className="text-gray-400">Tidak terhubung</span>}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{page.author?.name || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(page.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit Konten Halaman"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(page.id)} className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-md" title="Hapus halaman melalui modul Kelola Menu"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-16 text-gray-500">
                                    <h3 className="text-lg font-semibold">Belum Ada Halaman</h3>
                                    <p className="mt-2 text-sm">{searchQuery ? 'Tidak ada hasil untuk pencarian Anda.' : 'Buat halaman baru dari modul "Kelola Menu".'}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
