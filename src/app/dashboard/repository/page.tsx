'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Pagination from '@/components/ui/Pagination';
import { Edit, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

// Tipe data dari API admin
interface RepoItemAdmin {
  id: string;
  title: string;
  author: string;
  year: number;
  status: 'PUBLISHED' | 'PRIVATE';
  showDownloadsToPublic: boolean;
  uploader: { name: string };
}

interface ApiResponse {
    items: RepoItemAdmin[];
    currentPage: number;
    totalPages: number;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json());

export default function RepositoryManagementPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    // Debounce untuk search
    useEffect(() => {
        const timer = setTimeout(() => { setSearchQuery(inputValue); setCurrentPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);
    
    const apiUrl = useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/repository-items/admin/all`);
        url.searchParams.append('page', String(currentPage));
        url.searchParams.append('limit', '10'); // Mengambil 10 item per halaman
        if (searchQuery) url.searchParams.append('search', searchQuery);
        return url.toString();
    }, [currentPage, searchQuery]);

    const { data, error, isLoading, mutate } = useSWR<ApiResponse>(apiUrl, fetcher);
    
    const handleDelete = async (id: string) => {
        if (!window.confirm('Yakin ingin menghapus item ini?')) return;
        try {
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${id}`, { method: 'DELETE' });
            alert('Item berhasil dihapus.');
            mutate(); // Refresh data
        } catch (err) { alert('Gagal menghapus item.'); }
    };

    const handleToggle = async (id: string, field: 'status' | 'showDownloadsToPublic', currentValue: any) => {
        const newValue = field === 'status' 
            ? (currentValue === 'PUBLISHED' ? 'PRIVATE' : 'PUBLISHED')
            : !currentValue;
        
        try {
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ [field]: newValue }),
            });
            mutate(); // Refresh data
        } catch (err) { alert('Gagal mengubah status.'); }
    };

    if (error) return <div className="text-center py-12 text-red-500">Gagal memuat data.</div>;
    if (isLoading && !data) return <div className="text-center py-12">Memuat data...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Repositori</h1>
                {/* Tombol Tambah Baru sudah dihapus dari sini */}
                <input 
                    type="text" 
                    placeholder="Cari judul..." 
                    className="px-3 py-2 border rounded-md w-1/3"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-gray-50"><tr className="text-gray-600">
                        <th className="px-6 py-4 font-medium">Judul</th>
                        <th className="px-6 py-4 font-medium">Author</th>
                        <th className="px-6 py-4 font-medium text-center">Status</th>
                        <th className="px-6 py-4 font-medium text-center">Unduhan Publik</th>
                        <th className="px-6 py-4 font-medium text-center">Aksi</th>
                    </tr></thead>
                    <tbody>
                        {data?.items.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold">{item.title}</td>
                                <td className="px-6 py-4 text-gray-600">{item.author} ({item.year})</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleToggle(item.id, 'status', item.status)} className={`flex items-center gap-2 text-xs font-bold py-1 px-3 rounded-full ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {item.status === 'PUBLISHED' ? <ToggleRight/> : <ToggleLeft/>} {item.status}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                     <button onClick={() => handleToggle(item.id, 'showDownloadsToPublic', item.showDownloadsToPublic)} className={`flex items-center gap-2 text-xs font-bold py-1 px-3 rounded-full ${item.showDownloadsToPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {item.showDownloadsToPublic ? <Eye/> : <EyeOff/>} {item.showDownloadsToPublic ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </td>
                                <td className="px-6 py-4"><div className="flex justify-center gap-2">
                                    <Link href={`/dashboard/repository/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><Edit size={16} /></Link>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus"><Trash2 size={16} /></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!data || data.items.length === 0) && (
                    <div className="text-center p-16 text-gray-500"><h3 className="text-lg font-semibold">Tidak Ada Data</h3><p className="mt-2 text-sm">Belum ada item repositori yang dibuat.</p></div>
                )}
            </div>

            <Pagination currentPage={data?.currentPage || 1} totalPages={data?.totalPages || 1} onPageChange={(page) => setCurrentPage(page)} />
        </div>
    );
}
