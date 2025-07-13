'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Search, PlusCircle, Newspaper } from 'lucide-react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';

// Tipe data untuk item berita
interface NewsItem { 
    id: string; 
    title: string; 
    author: { name: string }; 
    createdAt: string;
    isPublished: boolean;
}

// Tipe data untuk respons API
interface ApiResponse {
    news: NewsItem[];
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data Berita');
    return res.json();
});

export default function NewsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(inputValue), 500);
        return () => clearTimeout(timer);
    }, [inputValue]);
    
    const apiUrl = useMemo(() => {
        // Panggil endpoint baru yang khusus untuk Berita
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/news`);
        if (searchQuery) {
            url.searchParams.append('search', searchQuery);
        }
        return url.toString();
    }, [searchQuery]);

    const { data: apiResponse, error, isLoading, mutate } = useSWR<ApiResponse>(apiUrl, fetcher);
    const newsItems = apiResponse?.news || [];

    const handleAddNewNews = async () => {
        const title = prompt('Masukkan judul untuk berita baru:');
        if (!title || title.trim() === '') {
            alert('Judul tidak boleh kosong.');
            return;
        }
        try {
            // Panggil endpoint POST ke /api/news
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/news`, {
                method: 'POST',
                body: JSON.stringify({ title }),
            });
            const newNewsPost = await res.json();
            if (!res.ok) throw new Error(newNewsPost.message || 'Gagal membuat berita');
            
            // Langsung arahkan ke editor untuk berita yang baru dibuat
            router.push(`/dashboard/editor/${newNewsPost.id}`);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEdit = (postId: string) => {
        router.push(`/dashboard/editor/${postId}`);
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Yakin ingin menghapus berita ini?')) return;
        try {
            // Endpoint delete tetap sama karena berdasarkan ID
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/news/${postId}`, { method: 'DELETE' });
            alert('Berita berhasil dihapus.');
            mutate(); // Muat ulang data setelah hapus
        } catch (err) {
            alert('Gagal menghapus berita.');
        }
    };

    return (
        <div className="container py-8 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Kelola Berita & Artikel</h1>
                    <p className="text-gray-500 mt-1">Publikasikan pengumuman, berita, dan artikel untuk umum.</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari judul berita..." 
                            className="px-3 py-2 pl-10 border rounded-md w-80"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                     </div>
                    <button onClick={handleAddNewNews} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                        <PlusCircle size={18} />
                        Tambah Berita Baru
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className="text-gray-600">
                            <th className="px-6 py-4 font-medium">Judul Berita</th>
                            <th className="px-6 py-4 font-medium">Penulis</th>
                            <th className="px-6 py-4 font-medium">Tanggal Dibuat</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-16"><Spinner /></td></tr>
                        ) : newsItems.length > 0 ? newsItems.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-800">{item.title}</td>
                                <td className="px-6 py-4 text-gray-600">{item.author?.name || 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {item.isPublished ? 'Diterbitkan' : 'Draf'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(item.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit Berita"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus Berita"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center p-16 text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Newspaper size={48} className="text-gray-300 mb-4" />
                                        <h3 className="text-lg font-semibold">Belum Ada Berita</h3>
                                        <p className="mt-2 text-sm">{searchQuery ? 'Tidak ada berita yang cocok dengan pencarian Anda.' : 'Klik "Tambah Berita Baru" untuk memulai.'}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
