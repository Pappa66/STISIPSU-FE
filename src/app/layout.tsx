'use client';

import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressBar from "@/components/ui/ProgressBar";
import SessionGuard from "@/components/SessionGuard";
import { usePathname } from "next/navigation"; // Impor hook yang kita butuhkan

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dapatkan path URL saat ini menggunakan hook
  const pathname = usePathname();

  // Tentukan di halaman mana saja Header dan Footer TIDAK boleh tampil
  const noHeaderFooterRoutes = ['/login']; 

  // Cek apakah path saat ini ada di dalam daftar rute yang dikecualikan
  const showHeaderFooter = !noHeaderFooterRoutes.includes(pathname);

  return (
    <html lang="id" className="light" suppressHydrationWarning>
      {/* Gunakan variabel font dari Poppins */}
      <body className={`${poppins.variable} flex min-h-screen flex-col font-sans`}>
        <ProgressBar />
        
        {/* PERBAIKAN: Render Header hanya jika showHeaderFooter adalah true */}
        {showHeaderFooter && <Header />}

        <main className="flex-grow">
          <SessionGuard>
            {children}
          </SessionGuard>
        </main>
        
        {/* PERBAIKAN: Render Footer hanya jika showHeaderFooter adalah true */}
        {showHeaderFooter && <Footer />}
      </body>
    </html>
  );
}
