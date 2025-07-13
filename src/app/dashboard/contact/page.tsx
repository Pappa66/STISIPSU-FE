'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';
import { Save, Info, Map, Mail, Phone } from 'lucide-react';

// Tipe data untuk informasi kontak
interface ContactInfo {
    alamat: string;
    email: string;
    telepon: string;
    link_google_maps: string;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data kontak');
    return res.json();
});

export default function ContactManagementPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/contact`;
    const { data, error, isLoading, mutate } = useSWR<ContactInfo>(apiUrl, fetcher);

    // State untuk form
    const [formData, setFormData] = useState<ContactInfo>({
        alamat: '', email: '', telepon: '', link_google_maps: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Isi form dengan data dari API saat data berhasil dimuat
    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetchWithAuth(apiUrl, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan data');
            
            alert('Informasi kontak berhasil diperbarui!');
            mutate(); // Muat ulang data untuk memastikan sinkron
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="container py-8 text-center"><Spinner size="lg" /></div>;
    if (error) return <div className="container py-8 text-center text-red-500">Gagal memuat pengaturan kontak.</div>;

    return (
        <div className="container py-8 mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Kelola Informasi Kontak</h1>
                <p className="text-gray-500 mt-1">Atur informasi yang akan ditampilkan di halaman Kontak publik.</p>
            </div>

            <div className="mb-4 p-4 border-l-4 border-sky-400 bg-sky-50 text-sky-800 rounded-r-lg">
                <div className="flex gap-3">
                    <Info size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold">Informasi</h4>
                        <p className="text-sm">Perubahan yang Anda simpan di sini akan langsung ditampilkan di halaman Kontak pada website utama.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="alamat" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Map size={16}/> Alamat Lengkap</label>
                            <textarea id="alamat" name="alamat" value={formData.alamat} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Mail size={16}/> Alamat Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                        </div>
                    </div>
                    {/* Kolom Kanan */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="telepon" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Phone size={16}/> Nomor Telepon / WhatsApp</label>
                            <input type="text" id="telepon" name="telepon" value={formData.telepon} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="link_google_maps" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">Link Embed Google Maps</label>
                            <textarea id="link_google_maps" name="link_google_maps" value={formData.link_google_maps} onChange={handleChange} rows={4} placeholder='<iframe src="..."></iframe>' className="w-full p-2 border rounded-md font-mono text-xs" />
                            <p className="text-xs text-gray-500 mt-1">Salin tempel kode `embed` dari Google Maps di sini.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 w-40 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isSubmitting ? <Spinner size="sm" /> : <><Save size={16} /> Simpan</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
