import { Poppins } from "next/font/google";
import "./globals.css";
import type { Metadata } from 'next';
import Providers from "./Providers"; // IMPORT COMPONENT PROVIDERS

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

// Sekarang Anda bisa mengekspor metadata di sini karena ini adalah Server Component
export const metadata: Metadata = {
  title: "STISIP | SYAMSUL ULUM",
  description: "WEBSITE RESMI STISIP SYAMSUL 'ULUM SUKABUMI",
  openGraph: {
    title: "WEBSITE RESMI STISIP SYAMSUL 'ULUM SUKABUMI",
    description: "Kunjungi website resmi STISIP SYAMSUL 'ULUM untuk informasi akademik, pendaftaran mahasiswa baru, dan berita terbaru.",
    url: "https://stisipsu.ac.id/",
    siteName: "STISIP Syamsul 'Ulum",
    images: [
      {
        url: "https://stisipsu.ac.id/logo-kampus.png",
        width: 1200,
        height: 630,
        alt: "STISIP Syamsul 'Ulum",
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <body className={`${poppins.variable} flex min-h-screen flex-col font-sans`}>
        {/* Panggil komponen Providers yang berisi semua logika client-side */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}