import { Calendar, User } from 'lucide-react';

// --- DATA TIRUAN (MOCK DATA) ---
// Gunakan data yang sama seperti di halaman galeri untuk konsistensi.
// Nantinya, ini akan diambil dari satu endpoint API.
const beritaData = [
    {
        id: 1,
        slug: 'seminar-nasional-kewirausahaan-2025',
        title: 'Sukses Gelar Seminar Nasional Kewirausahaan 2025',
        imageUrl: 'https://placehold.co/800x450/e2e8f0/334155?text=Seminar+Nasional',
        author: 'Tim Humas',
        publishedDate: '10 Juli 2025',
        excerpt: 'STISIP Persada Bunda berhasil menyelenggarakan Seminar Nasional Kewirausahaan yang dihadiri oleh ratusan mahasiswa dari berbagai perguruan tinggi...',
        tags: ['Seminar', 'Akademik', 'Kewirausahaan']
    },
    {
        id: 2,
        slug: 'prestasi-mahasiswa-tingkat-nasional',
        title: 'Mahasiswa STISIP Raih Juara 1 Lomba Debat Nasional',
        imageUrl: 'https://placehold.co/600x400/dbeafe/1e3a8a?text=Lomba+Debat',
        author: 'Andi Pratama',
        publishedDate: '5 Juli 2025',
        excerpt: 'Sebuah kebanggaan bagi almamater, tim debat STISIP Persada Bunda berhasil meraih Juara 1 dalam kompetisi debat tingkat nasional...',
        tags: ['Prestasi', 'Mahasiswa', 'Lomba']
    },
    {
        id: 3,
        slug: 'kegiatan-pengabdian-masyarakat-di-desa-binaan',
        title: 'Pengabdian Masyarakat: Membangun Desa Bersama Mahasiswa',
        imageUrl: 'https://placehold.co/600x400/dcfce7/15803d?text=Pengabdian',
        author: 'Dr. Siti Aminah',
        publishedDate: '1 Juli 2025',
        excerpt: 'Sebagai bagian dari Tri Dharma Perguruan Tinggi, STISIP Persada Bunda melaksanakan kegiatan pengabdian masyarakat di desa binaan...',
        tags: ['Pengabdian', 'Sosial', 'Kampus']
    },
    {
        id: 4,
        slug: 'peluncuran-laboratorium-komputer-baru',
        title: 'STISIP Resmikan Laboratorium Komputer Modern',
        imageUrl: 'https://placehold.co/600x400/fee2e2/991b1b?text=Lab+Komputer',
        author: 'Tim Humas',
        publishedDate: '28 Juni 2025',
        excerpt: 'Untuk menunjang kegiatan belajar mengajar, STISIP Persada Bunda meresmikan laboratorium komputer baru dengan fasilitas terkini...',
        tags: ['Fasilitas', 'Teknologi', 'Kampus']
    },
];
// --- AKHIR DATA TIRUAN ---

export default function BeritaPage() {
    const featuredArticle = beritaData[0];
    const otherArticles = beritaData.slice(1);

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Portal Berita Kampus</h1>
                    <p className="mt-2 text-lg text-gray-600">Informasi dan berita terkini seputar STISIP Persada Bunda.</p>
                </div>

                {/* Featured Article */}
                <div className="mb-12">
                    <a href={`/berita/${featuredArticle.slug}`} className="group block">
                        <div className="grid lg:grid-cols-2 gap-8 items-center bg-gray-50 p-8 rounded-xl shadow-lg">
                            <img
                                src={featuredArticle.imageUrl}
                                alt={featuredArticle.title}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div>
                                <span className="text-sm font-semibold text-blue-600">BERITA UTAMA</span>
                                <h2 className="mt-2 text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{featuredArticle.title}</h2>
                                <p className="mt-4 text-gray-600">{featuredArticle.excerpt}</p>
                                <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        <span>{featuredArticle.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>{featuredArticle.publishedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>

                {/* Other Articles */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">Berita Lainnya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherArticles.map((article) => (
                        <a key={article.id} href={`/berita/${article.slug}`} className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{article.title}</h4>
                                <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} />
                                        <span>{article.author}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        <span>{article.publishedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
