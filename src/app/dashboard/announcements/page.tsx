'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';
import { PlusCircle, Edit, Trash2, X, AlertTriangle, Image as ImageIcon, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Tipe data sesuai dengan model Prisma
interface Announcement {
    id: string;
    title: string;
    type: 'TEXT' | 'IMAGE';
    content?: string | null;
    imageUrl?: string | null;
    targetAudiences: ('PUBLIC' | 'MAHASISWA' | 'DOSEN')[];
    isActive: boolean;
    expiresAt?: string | null;
    createdAt: string;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data pengumuman');
    return res.json();
});

// Komponen Modal untuk form Tambah/Edit
const AnnouncementModal = ({ announcement, onClose, mutate }: { announcement: Partial<Announcement> | null, onClose: () => void, mutate: () => void }) => {
    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: '',
        type: 'TEXT',
        content: '',
        imageUrl: '',
        targetAudiences: [],
        isActive: false,
        expiresAt: '',
        ...announcement
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            const currentAudiences = formData.targetAudiences || [];
            const newAudiences = checked
                ? [...currentAudiences, value]
                : currentAudiences.filter(audience => audience !== value);
            setFormData(prev => ({ ...prev, targetAudiences: newAudiences as any }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadPromise = new FormData();
        uploadPromise.append('file', file);

        const promise = fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/upload`, {
            method: 'POST',
            body: uploadPromise,
        }).then(res => res.json());

        toast.promise(promise, {
            loading: 'Mengunggah gambar...',
            success: (data) => {
                setFormData(prev => ({ ...prev, imageUrl: data.fileUrl }));
                return 'Gambar berhasil diunggah!';
            },
            error: 'Gagal mengunggah gambar.',
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = announcement?.id
            ? `${process.env.NEXT_PUBLIC_API_URL}api/announcements/${announcement.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}api/announcements`;
        
        const method = announcement?.id ? 'PUT' : 'POST';

        const promise = fetchWithAuth(url, {
            method,
            body: JSON.stringify(formData),
        });

        toast.promise(promise, {
            loading: 'Menyimpan pengumuman...',
            success: () => {
                mutate();
                onClose();
                return 'Pengumuman berhasil disimpan!';
            },
            error: 'Gagal menyimpan pengumuman.',
        });

        try {
            await promise;
        } catch (err) {
            // Error sudah di-handle oleh toast
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">{announcement?.id ? 'Edit' : 'Tambah'} Pengumuman</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium">Judul (untuk referensi admin)</label>
                        <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tipe Konten</label>
                        <select name="type" value={formData.type} onChange={handleFormChange} className="w-full p-2 border rounded-md">
                            <option value="TEXT">Teks</option>
                            <option value="IMAGE">Gambar</option>
                        </select>
                    </div>
                    {formData.type === 'TEXT' ? (
                        <div>
                            <label className="block text-sm font-medium">Isi Pengumuman (Teks)</label>
                            <textarea name="content" value={formData.content || ''} onChange={handleFormChange} rows={5} className="w-full p-2 border rounded-md" />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium">Gambar Pengumuman</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            {formData.imageUrl && <img src={`${process.env.NEXT_PUBLIC_API_URL}${formData.imageUrl}`} alt="Preview" className="mt-2 rounded-md max-h-40" />}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium">Target Audiens</label>
                        <div className="flex gap-4 mt-1">
                            {['PUBLIC', 'MAHASISWA', 'DOSEN'].map(audience => (
                                <label key={audience} className="flex items-center gap-2">
                                    <input type="checkbox" value={audience} checked={formData.targetAudiences?.includes(audience as any)} onChange={handleFormChange} />
                                    {audience.charAt(0) + audience.slice(1).toLowerCase()}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tanggal Kedaluwarsa (Opsional)</label>
                        <input type="datetime-local" name="expiresAt" value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 rounded" />
                        <label htmlFor="isActive" className="text-sm font-medium">Aktifkan Pengumuman ini</label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? <Spinner size="sm"/> : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Komponen Halaman Utama
export default function AnnouncementManagementPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/announcements`;
    const { data: announcements = [], error, isLoading, mutate } = useSWR<Announcement[]>(apiUrl, fetcher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Partial<Announcement> | null>(null);

    const handleOpenModal = (announcement: Partial<Announcement> | null = null) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAnnouncement(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Yakin ingin menghapus pengumuman ini?')) return;
        
        const promise = fetchWithAuth(`${apiUrl}/${id}`, { method: 'DELETE' });
        toast.promise(promise, {
            loading: 'Menghapus...',
            success: 'Pengumuman berhasil dihapus!',
            error: 'Gagal menghapus pengumuman.',
        });

        try {
            await promise;
            mutate();
        } catch (err) {
            // Error sudah di-handle oleh toast
        }
    };

    if (error) return <div className="container py-8 text-center text-red-500">Gagal memuat data.</div>;

    return (
        <>
            <Toaster position="top-center" />
            {isModalOpen && <AnnouncementModal announcement={selectedAnnouncement} onClose={handleCloseModal} mutate={mutate} />}
            <div className="container py-8 mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Kelola Pengumuman Pop-up</h1>
                        <p className="text-gray-500 mt-1">Buat dan atur pengumuman pop-up untuk audiens tertentu.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                        <PlusCircle size={18} />
                        Tambah Pengumuman
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr className="text-gray-600">
                                <th className="px-6 py-4 font-medium">Judul</th>
                                <th className="px-6 py-4 font-medium">Tipe</th>
                                <th className="px-6 py-4 font-medium">Target</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Kedaluwarsa</th>
                                <th className="px-6 py-4 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-16"><Spinner /></td></tr>
                            ) : announcements.length > 0 ? announcements.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{item.title}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            {item.type === 'TEXT' ? <FileText size={16} className="text-blue-500"/> : <ImageIcon size={16} className="text-green-500"/>}
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.targetAudiences.map(audience => (
                                                <span key={audience} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{audience}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {item.expiresAt ? new Date(item.expiresAt).toLocaleString('id-ID') : 'Tidak ada'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-16 text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <AlertTriangle size={48} className="text-gray-300 mb-4" />
                                            <h3 className="text-lg font-semibold">Belum Ada Pengumuman</h3>
                                            <p className="mt-2 text-sm">Klik "Tambah Pengumuman" untuk memulai.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
