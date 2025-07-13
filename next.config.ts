/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi gambar Anda yang sudah ada (TIDAK DIUBAH)
  images: {
    remotePatterns: [
      // Untuk gambar dari backend lokal Anda
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      // Untuk gambar placeholder
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Untuk gambar dari unsplash (jika ada)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // --- PENAMBAHAN KONFIGURASI REDIRECT ---
  // Ini untuk memperbaiki link breadcrumb "Users" yang error
  async redirects() {
    return [
      {
        source: '/dashboard/users',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
