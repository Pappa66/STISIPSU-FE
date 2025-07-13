'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import { ArrowLeft, Trash2, FileText, UploadCloud } from 'lucide-react';

interface FileItem { id: string; alias: string; fileUrl: string; }
interface RepoDetail {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string;
  abstract: string | null;
  keywords: string | null;
  advisor: string | null;
  files: FileItem[];
  status: 'PUBLISHED' | 'PRIVATE';
  showDownloadsToPublic: boolean;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json());

export default function EditRepositoryPage() {
    const router = useRouter();
    const params = useParams();
    const repoId = params.repoId as string;

    const [formState, setFormState] = useState<Partial<RepoDetail>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${repoId}`;
    const { data: item, error, isLoading, mutate } = useSWR<RepoDetail>(repoId ? apiUrl : null, fetcher);

    useEffect(() => {
        if (item) setFormState(item);
    }, [item]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: 'status' | 'showDownloadsToPublic') => {
        let newValue;
        if (name === 'status') {
            newValue = formState.status === 'PUBLISHED' ? 'PRIVATE' : 'PUBLISHED';
        } else {
            newValue = !formState.showDownloadsToPublic;
        }
        setFormState(prev => ({ ...prev, [name]: newValue }));
    };

    const handleFileDelete = async (fileId: string) => {
        if (!window.confirm("Yakin ingin menghapus file ini?")) return;
        try {
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/repository-items/files/${fileId}`, { method: 'DELETE' });
            mutate(); // Refresh data untuk menampilkan daftar file terbaru
        } catch (err) {
            alert('Gagal menghapus file.');
        }
    };

    const handleNewFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const formData = new FormData();
        const filesMetadata = [];
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
            filesMetadata.push({ originalName: files[i].name, alias: files[i].name });
        }
        formData.append('filesMetadata', JSON.stringify(filesMetadata));

        try {
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${repoId}/files`, { method: 'POST', body: formData });
            mutate(); // Refresh data
        } catch (err) {
            alert('Gagal menambah file baru.');
        }
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetchWithAuth(apiUrl, {
                method: 'PUT',
                body: JSON.stringify(formState),
            });
            alert('Perubahan berhasil disimpan!');
            router.push('/dashboard/repository');
        } catch (err) {
            alert('Gagal menyimpan perubahan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center py-12">Memuat...</div>;
    if (error) return <div className="text-center py-12 text-red-500">Gagal memuat data.</div>;

    return (
        <div className="container py-8 mx-auto">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Edit Karya Ilmiah</h1>
                    <Link href="/dashboard/repository" className="text-sm flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-slate-100"><ArrowLeft size={16}/> Kembali</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4 p-6 border rounded-lg bg-white">
                        <div><label className="block text-sm font-medium">Judul</label><input type="text" name="title" value={formState.title || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                        <div><label className="block text-sm font-medium">Penulis</label><input type="text" name="author" value={formState.author || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                        <div><label className="block text-sm font-medium">Tahun</label><input type="number" name="year" value={formState.year || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                        <div><label className="block text-sm font-medium">Program Studi</label><input type="text" name="studyProgram" value={formState.studyProgram || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                        <div><label className="block text-sm font-medium">Pembimbing</label><input type="text" name="advisor" value={formState.advisor || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">Kata Kunci</label><input type="text" name="keywords" value={formState.keywords || ''} onChange={handleChange} placeholder="pisahkan dengan koma" className="w-full mt-1 p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">Abstrak</label><textarea name="abstract" value={formState.abstract || ''} onChange={handleChange} rows={6} className="w-full mt-1 p-2 border rounded-md" /></div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-white space-y-3">
                            <h3 className="font-semibold">Status</h3>
                            <button type="button" onClick={() => handleToggle('status')} className={`w-full text-left p-2 rounded-md ${formState.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>Status: {formState.status}</button>
                            <button type="button" onClick={() => handleToggle('showDownloadsToPublic')} className={`w-full text-left p-2 rounded-md ${formState.showDownloadsToPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>Unduhan Publik: {formState.showDownloadsToPublic ? 'Aktif' : 'Nonaktif'}</button>
                        </div>
                        <div className="p-4 border rounded-lg bg-white space-y-3">
                            <h3 className="font-semibold">File Terlampir</h3>
                            {formState.files?.map(file => (
                                <div key={file.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-md">
                                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline truncate"><FileText size={16}/> {file.alias}</a>
                                    <button type="button" onClick={() => handleFileDelete(file.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={14}/></button>
                                </div>
                            ))}
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm mt-2 p-2 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"><UploadCloud size={16}/> Tambah File</button>
                             <input type="file" ref={fileInputRef} onChange={handleNewFilesUpload} multiple className="hidden" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end"><button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{isSubmitting ? <Spinner/> : 'Simpan Perubahan'}</button></div>
            </form>
        </div>
    );
}
