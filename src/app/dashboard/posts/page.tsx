'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import useSWR from 'swr';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/utils/api';
import Pagination from '@/components/ui/Pagination';

// Definisikan tipe data Post
interface Post { 
    id: string; 
    title: string; 
    author: { name: string }; 
    menuItem?: { name: string };
    submenuItem?: { name: string, menuItem: { name: string } };
}

// Definisikan tipe data untuk respons API
interface ApiResponse {
    posts: Post[];
    currentPage: number;
    totalPages: number;
}

// Buat 'fetcher' yang akan digunakan oleh SWR
const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) {
        throw new Error('Gagal mengambil data');
    }
    return res.json();
});

export default function PostManagementPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    // Debounce effect untuk search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
            setCurrentPage(1); // Reset ke halaman 1 setiap kali search query berubah
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);
    
    // Gunakan SWR untuk data fetching
    const apiUrl = useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/posts`);
        url.searchParams.append('page', String(currentPage));
        url.searchParams.append('limit', '10');
        if (searchQuery) {
            url.searchParams.append('search', searchQuery);
        }
        return url.toString();
    }, [currentPage, searchQuery]);

    const { data: apiResponse, error, isLoading, mutate } = useSWR<ApiResponse>(apiUrl, fetcher);
    
    const posts = apiResponse?.posts || [];
    const totalPages = apiResponse?.totalPages || 0;

    const handleEdit = (postId: string) => {
        router.push(`/dashboard/editor/${postId}`);
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Yakin ingin menghapus postingan ini?')) return;
        
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}`;
            await fetchWithAuth(url, { method: 'DELETE' });
            alert('Post berhasil dihapus.');
            mutate(); // Picu re-fetch data setelah berhasil
        } catch (err) {
            alert('Gagal menghapus postingan.');
            console.error(err);
        }
    };

    // Tampilan Loading dan Error
    if (error) return <div className="text-center py-12 text-red-500">Gagal memuat data postingan.</div>;
    if (isLoading && posts.length === 0) return <div className="text-center py-12">Memuat data postingan...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Konten</h1>
                <input 
                    type="text" 
                    placeholder="Cari judul..." 
                    className="px-3 py-2 border rounded-md w-1/3"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className="text-gray-600">
                            <th className="px-6 py-4 font-medium">Judul Halaman</th>
                            <th className="px-6 py-4 font-medium">Terhubung Ke</th>
                            <th className="px-6 py-4 font-medium">Author</th>
                            <th className="px-6 py-4 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length > 0 ? posts.map((post) => (
                            <tr key={post.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-800">{post.title}</td>
                                <td className="px-6 py-4 text-xs">
                                    {post.menuItem && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{`Menu: ${post.menuItem.name}`}</span>}
                                    {post.submenuItem && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{`Sub: ${post.submenuItem.name} (di ${post.submenuItem.menuItem.name})`}</span>}
                                    {!post.menuItem && !post.submenuItem && <span className="text-gray-400">Tidak terhubung</span>}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{post.author?.name || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(post.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-16 text-gray-500">
                                    <h3 className="text-lg font-semibold">Tidak Ada Konten</h3>
                                    <p className="mt-2 text-sm">{searchQuery ? 'Tidak ada hasil untuk pencarian Anda.' : 'Belum ada postingan yang dibuat.'}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}
