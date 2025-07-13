'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuthStore } from '@/store/authStore';
import { PlusCircle, FileText, CheckCircle, Clock, XCircle, Edit, Info, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { formatAuthorName } from '@/utils/formatters';

// --- Tipe Data ---
interface MyRepositoryItem {
    id: string;
    title: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    updatedAt: string;
    advisor: { name: string } | null;
}
interface Prerequisites {
    studentName: string;
    studyProgram: string | null;
    advisorName: string | null;
}
interface FileToUpload {
    file: File;
    alias: string;
}

// --- Fetcher untuk SWR ---
const fetcher = (url: string, token: string | null) => 
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
         .then(res => res.data);

// --- Komponen ---
const StatusBadge = ({ status }: { status: MyRepositoryItem['approvalStatus'] }) => {
    switch(status) {
        case 'APPROVED': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"><CheckCircle size={14} /> Disetujui</span>;
        case 'REJECTED': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full"><XCircle size={14} /> Revisi</span>;
        default: return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full"><Clock size={14} /> Pending</span>;
    }
};

const UploadModal = ({ isOpen, onClose, mutateList }: { isOpen: boolean; onClose: () => void; mutateList: () => void; }) => {
    const { token } = useAuthStore();
    const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
    const [formData, setFormData] = useState({ title: '', abstract: '', keywords: '', year: new Date().getFullYear().toString(), gdriveLink: '' });
    const [files, setFiles] = useState<FileToUpload[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { data: prereqs } = useSWR<Prerequisites>(
        isOpen && token ? `${process.env.NEXT_PUBLIC_API_URL}api/users/submission-prerequisites` : null,
        (url: string) => fetcher(url, token)
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({ file, alias: file.name.split('.').slice(0, -1).join('.') || file.name }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };
    const handleAliasChange = (index: number, newAlias: string) => setFiles(prev => prev.map((item, i) => i === index ? { ...item, alias: newAlias } : item));
    const handleRemoveFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (files.length === 0 && !formData.gdriveLink) { setError('Unggah minimal satu file atau sediakan satu Link Google Drive.'); return; }
        if (!prereqs?.advisorName) { setError('Tidak dapat mengunggah: Dosen pembimbing belum ditentukan.'); return; }

        setIsLoading(true);
        setError('');
        setSuccess('');

        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('abstract', formData.abstract);
        submissionData.append('keywords', formData.keywords);
        submissionData.append('year', formData.year);
        
        const formattedName = prereqs ? formatAuthorName(prereqs.studentName) : '';
        submissionData.append('author', formattedName);
        submissionData.append('studyProgram', prereqs.studyProgram || '');
        
        if (formData.gdriveLink) {
            submissionData.append('gdriveLink', formData.gdriveLink);
        }
        
        if (files.length > 0) {
            const filesMetadata = files.map(f => ({ originalName: f.file.name, alias: f.alias }));
            submissionData.append('filesMetadata', JSON.stringify(filesMetadata));
            files.forEach(f => submissionData.append('files', f.file));
        }

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}api/my-repository`, submissionData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
            setSuccess(res.data.message);
            mutateList();
            setTimeout(() => {
                onClose();
                setFormData({ title: '', abstract: '', keywords: '', year: new Date().getFullYear().toString(), gdriveLink: '' });
                setFiles([]);
                setSuccess('');
            }, 2000);
        } catch (err) {
            if (axios.isAxiosError(err)) { setError(err.response?.data?.message || 'Gagal mengunggah.'); } 
            else { setError('Terjadi kesalahan.'); }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 text-gray-800">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Unggah Karya Ilmiah Baru</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="p-4 bg-gray-50 rounded-md border">
                        {prereqs ? (
                             <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-500">Penulis</label><p className="font-semibold">{formatAuthorName(prereqs.studentName)}</p></div>
                                    <div><label className="block text-sm font-medium text-gray-500">Program Studi</label><p className="font-semibold">{prereqs.studyProgram}</p></div>
                                    <div><label className="block text-sm font-medium text-gray-500">Dosen Pembimbing</label><p className="font-semibold">{prereqs.advisorName || '-'}</p></div>
                                </div>
                                {!prereqs.advisorName && (
                                    <div className="mt-1 flex items-start gap-2 text-sm text-red-700 p-2 bg-red-50 rounded-md">
                                        <Info size={28} className="flex-shrink-0" />
                                        <span>Dosen pembimbing belum ditentukan. Anda tidak dapat mengunggah sebelum dosen menambahkan Anda ke daftar bimbingan.</span>
                                    </div>
                                )}
                             </div>
                        ) : ( <div className="text-center">Memuat data otomatis...</div> )}
                    </div>
                    
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium">Judul Karya Ilmiah</label><input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full p-2 border rounded mt-1" /></div>
                        <div><label className="block text-sm font-medium">Tahun</label><input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required className="w-full p-2 border rounded mt-1" /></div>
                        <div><label className="block text-sm font-medium">Abstrak</label><textarea value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} rows={5} className="w-full p-2 border rounded mt-1"></textarea></div>
                        <div><label className="block text-sm font-medium">Kata Kunci</label><input value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} placeholder="Pisahkan dengan koma" className="w-full p-2 border rounded mt-1" /></div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                        <h3 className="font-semibold">Metode Unggah</h3>
                        <p className="text-xs text-gray-500">Anda dapat mengunggah file langsung dan juga menyertakan link Google Drive sebagai cadangan.</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">1. Unggah File Langsung (PDF)</label>
                            <input type="file" multiple onChange={handleFileChange} accept="application/pdf" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
                            {files.length > 0 && (
                                <div className="mt-4 space-y-3">{files.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-2 bg-gray-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        <div className="flex-grow"><label className="text-xs">Alias File</label><input type="text" value={item.alias} onChange={(e) => handleAliasChange(index, e.target.value)} className="w-full p-1 border rounded text-sm"/></div>
                                        <button type="button" onClick={() => handleRemoveFile(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={16}/></button>
                                    </div>
                                ))}</div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="gdriveLink" className="block text-sm font-medium text-gray-700">2. Link Google Drive (Cadangan)</label>
                            <div className="mt-1 mb-2 flex items-start gap-2 text-xs text-blue-700 p-2 bg-blue-50 rounded-md">
                                <Info size={24} className="flex-shrink-0" />
                                <span>Pastikan file di Google Drive sudah diatur agar 'Siapa saja yang memiliki link' dapat 'Melihat'.</span>
                            </div>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="gdriveLink" type="url" value={formData.gdriveLink} onChange={e => setFormData({...formData, gdriveLink: e.target.value})} placeholder="https://drive.google.com/..." className="w-full p-2 pl-10 border rounded" />
                            </div>
                        </div>
                    </div>
                    
                    {success && <div className="text-green-700 bg-green-100 p-3 rounded-md">{success}</div>}
                    {error && <div className="text-red-700 bg-red-100 p-3 rounded-md">{error}</div>}

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
                        <button type="submit" disabled={isLoading || !prereqs?.advisorName} className="flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Kirim untuk Direview'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function MyRepositoryPage() {
    const { token } = useAuthStore();
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    const apiUrl = token ? `${process.env.NEXT_PUBLIC_API_URL}api/my-repository` : null;
    const { data: items = [], error, isLoading, mutate } = useSWR<MyRepositoryItem[]>(apiUrl, (url: string) => fetcher(url, token));

    if (error) return <div className="container py-12 text-center text-red-500">Error: Gagal memuat data.</div>;
    if (isLoading) return <div className="container py-12 text-center">Memuat data karya ilmiah Anda...</div>;

    return (
        <>
            <div className="container py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Karya Ilmiah Saya</h1>
                    <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <PlusCircle size={18} /> Unggah Baru
                    </button>
                </div>
                <div className="space-y-4">
                    {items.length > 0 ? items.map((item) => (
                        <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        Pembimbing: {item.advisor?.name || 'Belum ada'} | Terakhir update: {new Date(item.updatedAt).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={item.approvalStatus} />
                                    {item.approvalStatus === 'REJECTED' && (
                                        <button onClick={() => alert('Fitur edit untuk item yang direvisi akan segera hadir!')} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit & Kirim Ulang">
                                            <Edit size={16}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {item.approvalStatus === 'REJECTED' && (
                                <div className="mt-3 p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-200">
                                    <strong>Catatan Revisi:</strong> {item.rejectionReason}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center p-16 bg-white rounded-lg border-dashed border-2">
                            <FileText className="mx-auto h-12 w-12 text-gray-400"/>
                            <h3 className="mt-4 text-lg font-semibold">Anda Belum Mengunggah Apapun</h3>
                            <p className="mt-1 text-gray-500">Klik tombol "Unggah Baru" untuk memulai.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} mutateList={mutate} />
        </>
    );
}
