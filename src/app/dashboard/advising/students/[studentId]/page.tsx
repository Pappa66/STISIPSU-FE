'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, ArrowLeft, Check, X, Eye, MessageSquare, Info, ChevronDown, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

// --- Tipe Data ---
interface FileItem { id: string; alias: string; fileUrl: string; }
interface SubmissionItem {
    id: string; title: string; author: string; year: number; abstract: string | null;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    visibility: 'PUBLISHED' | 'PRIVATE';
    showDownloadsToPublic: boolean;
    rejectionReason: string | null;
    files: FileItem[];
}

// --- Fetcher untuk SWR ---
const fetcher = (url: string, token: string | null) => 
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
         .then(res => res.data);

// --- Komponen ---
const getStatusBadge = (status: SubmissionItem['approvalStatus']) => {
    switch(status) {
        case 'APPROVED': return <span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Disetujui</span>;
        case 'REJECTED': return <span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Revisi</span>;
        default: return <span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
    }
};

const SubmissionCard = ({ item, onReview }: { item: SubmissionItem; onReview: (id: string, payload: any) => Promise<void>; }) => {
    const [rejectionReason, setRejectionReason] = useState(item.rejectionReason || '');
    const [visibility, setVisibility] = useState(item.visibility);
    const [showDownloads, setShowDownloads] = useState(item.showDownloadsToPublic);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReviewClick = async (action: 'APPROVED' | 'REJECTED') => {
        if (action === 'REJECTED' && !rejectionReason.trim()) {
            alert('Alasan penolakan (revisi) wajib diisi.');
            return;
        }
        
        setIsSubmitting(true);
        const payload = action === 'APPROVED' 
            ? { approvalStatus: 'APPROVED', visibility, showDownloadsToPublic: showDownloads }
            : { approvalStatus: 'REJECTED', rejectionReason };
        
        await onReview(item.id, payload);
        setIsSubmitting(false);
    };
    
    const renderFileLink = (file: FileItem) => {
        const isExternal = file.fileUrl.startsWith('http');
        const url = isExternal ? file.fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${file.fileUrl}`;
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Eye size={14} /> Lihat
            </a>
        );
    };

    return (
        <div className="bg-white p-6 border-t">
            <p className="text-gray-700 my-4 text-sm">{item.abstract || 'Tidak ada abstrak.'}</p>
            
            <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Berkas Terlampir:</h4>
                <ul className="space-y-2">
                    {item.files.map(file => (
                        <li key={file.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-md">
                            <span>{file.alias}</span>
                            {renderFileLink(file)}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm mb-3">Tindakan Review</h4>
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-sm text-green-900">Publikasikan Karya Ilmiah?</label>
                            <button onClick={() => setVisibility(visibility === 'PUBLISHED' ? 'PRIVATE' : 'PUBLISHED')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${visibility === 'PUBLISHED' ? 'bg-green-600' : 'bg-gray-200'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visibility === 'PUBLISHED' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                         <div className="flex items-center justify-between">
                            <label className="font-medium text-sm text-green-900">Izinkan Unduh Publik?</label>
                            <button onClick={() => setShowDownloads(!showDownloads)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showDownloads ? 'bg-green-600' : 'bg-gray-200'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDownloads ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button onClick={() => handleReviewClick('APPROVED')} disabled={isSubmitting} className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm font-semibold disabled:bg-gray-400">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={16} />}
                            {isSubmitting ? 'Memproses...' : 'Setujui & Simpan Pengaturan'}
                        </button>
                    </div>
                    <div className="p-4 bg-red-50 rounded-md border border-red-200">
                         <label className="font-medium text-sm text-red-900 flex items-center gap-2 mb-2"><MessageSquare size={16} /> Catatan Revisi / Alasan Penolakan</label>
                         <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} className="w-full p-2 border rounded-md text-sm" placeholder="Contoh: Abstrak perlu diperbaiki, tambahkan kata kunci..."></textarea>
                         <button onClick={() => handleReviewClick('REJECTED')} disabled={isSubmitting} className="w-full mt-2 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 text-sm font-semibold disabled:bg-gray-400">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <X size={16} />}
                            {isSubmitting ? 'Memproses...' : 'Kirim Catatan Revisi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function StudentSubmissionsPage() {
    const { token } = useAuthStore();
    const params = useParams();
    const studentId = params.studentId as string;
    const [openSubmissionId, setOpenSubmissionId] = useState<string | null>(null);

    const apiUrl = token ? `${process.env.NEXT_PUBLIC_API_URL}api/advisor/students/${studentId}/items` : null;
    const { data: items, error, isLoading, mutate } = useSWR<SubmissionItem[]>(apiUrl, (url: string) => fetcher(url, token));

    const handleToggleSubmission = (itemId: string) => {
        setOpenSubmissionId(prevId => (prevId === itemId ? null : itemId));
    };

    const handleReview = async (itemId: string, payload: any) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}api/advisor/items/${itemId}/review`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            mutate();
        } catch (err) {
            console.error("Gagal mengirim review:", err);
            alert("Gagal mengirim review.");
        }
    };

    if (isLoading) return <div className="container py-12 text-center">Memuat data kiriman...</div>;
    if (error) return <div className="container py-12 text-center text-red-500">Gagal memuat data.</div>;

    return (
        <div className="container py-8">
            <div className="mb-8">
                <Link href="/dashboard/advising" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-fit mb-4">
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Mahasiswa
                </Link>
                <h1 className="text-3xl font-bold">Daftar Kiriman</h1>
                <p className="text-gray-500">Review semua karya ilmiah yang diunggah oleh mahasiswa ini.</p>
            </div>

            <div className="space-y-3">
                {items && items.length > 0 ? (
                    items.map(item => (
                        <div key={item.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            <button onClick={() => handleToggleSubmission(item.id)} className="w-full flex justify-between items-center p-4 text-left">
                                <div className="flex items-center gap-4">
                                    {openSubmissionId === item.id 
                                        ? <ChevronDown className="h-5 w-5 text-gray-500" /> 
                                        : <ChevronRight className="h-5 w-5 text-gray-500" />
                                    }
                                    <span className="font-bold text-gray-800">{item.title}</span>
                                </div>
                                {/* PERBAIKAN: Status badge sekarang ditampilkan di sini */}
                                {getStatusBadge(item.approvalStatus)}
                            </button>
                            {openSubmissionId === item.id && (
                                <SubmissionCard item={item} onReview={handleReview} />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-16 bg-white rounded-lg border-dashed border-2">
                        <Info className="mx-auto h-12 w-12 text-gray-400"/>
                        <h3 className="mt-4 text-lg font-semibold">Belum Ada Kiriman</h3>
                        <p className="mt-1 text-gray-500">Mahasiswa ini belum mengunggah karya ilmiah apa pun.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
