'use client'; // Menggunakan Client Component untuk fetching data di browser

import { useParams, notFound } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { fetchWithAuth } from '@/utils/api'; // Menggunakan fetcher yang sama jika rute publik

// Tipe data untuk Block
type Block = 
    | { id: string; type: 'heading'; content: string }
    | { id: string; type: 'paragraph'; content: string }
    | { id: string; type: 'image' | 'video'; url: string }
    | { id: string; type: 'youtube'; url: string };

// Tipe data untuk Post
interface PostData {
    id: string;
    title: string;
    blocks: Block[] | null;
    createdAt: string;
}

// Fetcher untuk SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (res.status === 404) {
        const error = new Error('Halaman tidak ditemukan.');
        (error as any).status = 404;
        throw error;
    }
    if (!res.ok) {
        throw new Error('Gagal mengambil data.');
    }
    return res.json();
});

// Komponen untuk me-render setiap blok konten
function BlockRenderer({ block }: { block: Block }) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Fungsi aman untuk membangun URL lengkap untuk gambar/video
    const fullUrl = (path: string) => {
        try {
            // Jika path sudah URL lengkap (dari upload sebelumnya), gunakan langsung
            if (path.startsWith('http')) return path;
            // Jika tidak (dari database), gabungkan dengan aman
            return new URL(path, baseUrl).href;
        } catch (e) {
            console.error("URL tidak valid:", path);
            return '';
        }
    };

    switch (block.type) {
        case 'heading':
            return <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 my-6">{block.content}</h1>;
        case 'paragraph':
            return <div className="prose lg:prose-xl max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />;
        case 'image':
            return <figure className="my-6"><Image src={fullUrl(block.url)} alt="Konten Gambar" width={800} height={450} className="w-full h-auto rounded-lg shadow-lg" /></figure>;
        case 'video':
            return <video src={fullUrl(block.url)} controls className="w-full my-6 rounded-lg shadow-md" />;
        case 'youtube':
            const videoId = block.url.split('v=')[1]?.split('&')[0] || block.url.split('/').pop();
            if (!videoId) return null;
            return <iframe src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allowFullScreen className="w-full aspect-video my-6 rounded-lg shadow-md"></iframe>;
        default:
            return null;
    }
}

// Komponen Halaman Utama
export default function PublicPostPage() {
    const params = useParams();
    const postId = params.postId as string;

    // Gunakan SWR untuk mengambil data di sisi klien
    const { data: post, error, isLoading } = useSWR<PostData>(
        // Hanya jalankan fetch jika postId ada
        postId ? `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}` : null,
        fetcher
    );

    // Set judul halaman secara dinamis setelah data dimuat
    useEffect(() => {
        if (post?.title) {
            document.title = `${post.title} - STISIP Syamsul Ulum`;
        }
    }, [post]);

    // Tampilkan halaman 404 jika API mengembalikan error 404
    if (error && error.status === 404) {
        notFound();
    }

    if (error) return <div className="container mx-auto text-center py-12 text-red-500">Gagal memuat konten.</div>;
    if (isLoading) return <div className="container mx-auto text-center py-12">Memuat halaman...</div>;
    if (!post) return notFound(); // Fallback jika post tidak ada

    return (
        <main className="bg-gray-50 py-8 md:py-12">
            <article className="container mx-auto max-w-4xl px-4 bg-white shadow-xl rounded-lg py-10 md:py-16">
                <div className="space-y-6">
                    {/* Render semua blok konten dari database */}
                    {post.blocks && post.blocks.map(block => (
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                </div>
                <div className="mt-10 pt-6 border-t text-sm text-gray-500">
                    Dipublikasikan pada: {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </article>
        </main>
    );
}
