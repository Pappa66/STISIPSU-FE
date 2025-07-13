'use client';

import { useParams, notFound } from 'next/navigation';
import useSWR from 'swr';
import { Download, UserCircle, Calendar, Tag, FileText, Bookmark, Eye } from 'lucide-react';
import { useEffect } from 'react';
import { RepositoryDetail } from '@/types'; // Impor tipe detail

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Data tidak ditemukan');
    return res.json();
});

export default function RepositoryDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${id}`;
    const { data: item, error, isLoading } = useSWR<RepositoryDetail>(id ? apiUrl : null, fetcher);

    useEffect(() => {
        if (item?.title) {
            document.title = `${item.title} | Repositori STISIP`;
        }
    }, [item]);

    const createSafeUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        return `${baseUrl.replace(/\/api$/, '')}/${path.replace(/^\//, '')}`;
    };

    if (error) return notFound();
    if (isLoading) return <div className="text-center py-12">Memuat...</div>;
    if (!item) return notFound();

    return (
        <div className="bg-white">
            <div className="h-48 bg-indigo-700 flex items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bold text-white max-w-4xl">{item.title}</h1>
            </div>
            <div className="container mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 flex-wrap">
                        <span>Oleh: {typeof item.author === 'object' ? item.author.name : item.author}</span><span className="hidden sm:inline">•</span>
                        <span>Tahun: {item.year}</span><span className="hidden sm:inline">•</span>
                        <span className="font-semibold text-indigo-700">{item.studyProgram}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Abstrak</h2>
                    <div className="prose max-w-none text-gray-600 leading-relaxed">
                        <p>{item.abstract || "Abstrak tidak tersedia."}</p>
                    </div>
                    {item.showDownloadsToPublic && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">File Terlampir</h2>
                            <div className="border rounded-lg overflow-hidden">
                                {item.files.map((file) => (
                                    <a key={file.id} href={createSafeUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-indigo-600" /><span className="font-medium text-gray-700">{file.alias}</span></div>
                                        {file.fileUrl.startsWith('http') ? <Eye className="h-5 w-5 text-gray-400" /> : <Download className="h-5 w-5 text-gray-400" />}
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <aside className="space-y-6">
                    <div className="p-6 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Detail Dokumen</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3"><UserCircle className="h-5 w-5 text-gray-500" /> <div><strong className="block text-gray-700">Penulis:</strong>{typeof item.author === 'object' ? item.author.name : item.author}</div></li>
                            <li className="flex gap-3"><UserCircle className="h-5 w-5 text-gray-500" /> <div><strong className="block text-gray-700">Pembimbing:</strong>{item.advisor?.name || '-'}</div></li>
                            <li className="flex gap-3"><Calendar className="h-5 w-5 text-gray-500" /> <div><strong className="block text-gray-700">Tanggal Terbit:</strong>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div></li>
                            <li className="flex gap-3"><Bookmark className="h-5 w-5 text-gray-500" /> <div><strong className="block text-gray-700">Program Studi:</strong>{item.studyProgram}</div></li>
                            <li className="flex gap-3"><Tag className="h-5 w-5 text-gray-500" /> <div><strong className="block text-gray-700">Kata Kunci:</strong>{item.keywords || '-'}</div></li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
