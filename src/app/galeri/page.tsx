// --- DATA TIRUAN (MOCK DATA) ---
// Nantinya, data ini akan Anda ambil dari API backend CMS Anda.
const beritaData = [
    {
        id: 1,
        slug: 'seminar-nasional-kewirausahaan-2025',
        title: 'Sukses Gelar Seminar Nasional Kewirausahaan 2025',
        imageUrl: 'https://placehold.co/600x400/e2e8f0/334155?text=Seminar+Nasional',
        author: 'Tim Humas',
        publishedDate: '10 Juli 2025',
        content: '<p>STISIP Persada Bunda berhasil menyelenggarakan Seminar Nasional Kewirausahaan yang dihadiri oleh ratusan mahasiswa dari berbagai perguruan tinggi...</p>',
        tags: ['Seminar', 'Akademik', 'Kewirausahaan']
    },
    {
        id: 2,
        slug: 'prestasi-mahasiswa-tingkat-nasional',
        title: 'Mahasiswa STISIP Raih Juara 1 Lomba Debat Nasional',
        imageUrl: 'https://placehold.co/600x400/dbeafe/1e3a8a?text=Lomba+Debat',
        author: 'Andi Pratama',
        publishedDate: '5 Juli 2025',
        content: '<p>Sebuah kebanggaan bagi almamater, tim debat STISIP Persada Bunda berhasil meraih Juara 1 dalam kompetisi debat tingkat nasional yang diselenggarakan di Jakarta...</p>',
        tags: ['Prestasi', 'Mahasiswa', 'Lomba']
    },
    {
        id: 3,
        slug: 'kegiatan-pengabdian-masyarakat-di-desa-binaan',
        title: 'Pengabdian Masyarakat: Membangun Desa Bersama Mahasiswa',
        imageUrl: 'https://placehold.co/600x400/dcfce7/15803d?text=Pengabdian',
        author: 'Dr. Siti Aminah',
        publishedDate: '1 Juli 2025',
        content: '<p>Sebagai bagian dari Tri Dharma Perguruan Tinggi, STISIP Persada Bunda melaksanakan kegiatan pengabdian masyarakat di desa binaan...</p>',
        tags: ['Pengabdian', 'Sosial', 'Kampus']
    },
    {
        id: 4,
        slug: 'peluncuran-laboratorium-komputer-baru',
        title: 'STISIP Resmikan Laboratorium Komputer Modern',
        imageUrl: 'https://placehold.co/600x400/fee2e2/991b1b?text=Lab+Komputer',
        author: 'Tim Humas',
        publishedDate: '28 Juni 2025',
        content: '<p>Untuk menunjang kegiatan belajar mengajar, STISIP Persada Bunda meresmikan laboratorium komputer baru dengan fasilitas terkini...</p>',
        tags: ['Fasilitas', 'Teknologi', 'Kampus']
    },
];
// --- AKHIR DATA TIRUAN ---

export default function GaleriPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                {/* Header Halaman */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Galeri Kegiatan</h1>
                    <p className="mt-2 text-lg text-gray-600">Momen-momen berharga yang terekam dalam kegiatan kampus STISIP Persada Bunda.</p>
                </div>

                {/* Grid Galeri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {beritaData.map((item) => (
                        <a key={item.id} href={`/berita/${item.slug}`} className="group block bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="relative">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{item.title}</h3>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
