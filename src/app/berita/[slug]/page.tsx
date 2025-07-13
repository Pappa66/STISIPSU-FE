'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

// --- DATA TIRUAN (MOCK DATA) ---
// Di aplikasi nyata, Anda akan melakukan fetch ke API dengan slug untuk mendapatkan data artikel ini.
// Contoh: fetch(`/api/berita/${slug}`)
const beritaData = [
    {
        id: 1,
        slug: 'seminar-nasional-kewirausahaan-2025',
        title: 'Sukses Gelar Seminar Nasional Kewirausahaan 2025',
        imageUrl: 'https://placehold.co/1200x600/e2e8f0/334155?text=Seminar+Nasional',
        author: 'Tim Humas',
        publishedDate: '10 Juli 2025',
        content: `
            <p class="mb-4">STISIP Persada Bunda kembali menunjukkan komitmennya dalam pengembangan sumber daya manusia yang unggul dengan menyelenggarakan Seminar Nasional Kewirausahaan pada tanggal 10 Juli 2025. Acara yang bertajuk "Membangun Jiwa Wirausaha di Era Digital" ini berhasil menarik antusiasme ratusan mahasiswa dari berbagai perguruan tinggi di Indonesia.</p>
            <p class="mb-4">Seminar ini menghadirkan pembicara-pembicara ahli di bidangnya, termasuk praktisi bisnis sukses dan akademisi. Mereka berbagi wawasan, strategi, dan pengalaman dalam membangun dan mengembangkan bisnis di tengah tantangan global dan kemajuan teknologi.</p>
            <h3 class="text-xl font-bold my-4">Tujuan Acara</h3>
            <ul class="list-disc list-inside mb-4 pl-4">
                <li>Meningkatkan minat dan motivasi mahasiswa untuk berwirausaha.</li>
                <li>Memberikan pemahaman praktis tentang memulai bisnis.</li>
                <li>Membuka jaringan antara mahasiswa dengan para praktisi industri.</li>
            </ul>
            <p>Ketua STISIP Persada Bunda, dalam sambutannya, menyatakan bahwa kegiatan seperti ini sangat penting untuk mencetak lulusan yang tidak hanya mencari kerja, tetapi juga mampu menciptakan lapangan kerja. "Kami berharap seminar ini menjadi pemicu lahirnya wirausahawan-wirausahawan muda yang inovatif dan berdaya saing," ujarnya.</p>
        `,
        tags: ['Seminar', 'Akademik', 'Kewirausahaan']
    },
    // ... (tambahkan data berita lainnya di sini jika perlu untuk testing)
];
// --- AKHIR DATA TIRUAN ---


export default function DetailBeritaPage() {
    const [slug, setSlug] = useState<string | null>(null);

    useEffect(() => {
      // Karena tidak bisa menggunakan useParams dari next/navigation,
      // kita ambil slug dari URL path secara manual saat komponen dimuat di client.
      if (typeof window !== 'undefined') {
        const pathParts = window.location.pathname.split('/');
        setSlug(pathParts[pathParts.length - 1]);
      }
    }, []);


    // Cari artikel berdasarkan slug.
    const article = slug ? beritaData.find(item => item.slug === slug) : null;

    // Tampilkan status loading selagi menunggu slug dari URL
    if (!slug) {
        return <div className="container mx-auto text-center py-20">Memuat...</div>;
    }

    if (!article) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold">404 - Berita Tidak Ditemukan</h1>
                <p className="text-gray-600 mt-2">Maaf, berita yang Anda cari tidak ada.</p>
                <a href="/berita" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Kembali ke Portal Berita
                </a>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <a href="/berita" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-fit mb-6">
                    <ArrowLeft size={16} />
                    Kembali ke semua berita
                </a>

                <article className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                    {/* Judul dan Meta */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{article.title}</h1>
                    <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 mb-6 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{article.publishedDate}</span>
                        </div>
                    </div>

                    {/* Gambar Utama */}
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-auto object-cover rounded-lg mb-8"
                    />

                    {/* Konten Artikel */}
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                    
                    {/* Tags */}
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Tag size={16} className="text-gray-600" />
                            {article.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
