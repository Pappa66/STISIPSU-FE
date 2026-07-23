"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressBar from "@/components/ui/ProgressBar";
import SessionGuard from "@/components/SessionGuard";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Sidebar from "@/components/layout/Sidebar"; // ✅ import sidebar

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
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const isDashboardPage = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";
  const showHeaderFooter = !isDashboardPage && !isLoginPage;

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 300);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <body
        className={`${poppins.variable} flex min-h-screen flex-col font-sans`}
      >
        <Toaster position="top-right" />
        <ProgressBar />

        {isNavigating && (
          <div className="fixed inset-0 z-[9999] bg-white bg-opacity-60 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {showHeaderFooter && <Header />}

        <main className="flex-grow">
          <SessionGuard>
            {isDashboardPage ? (
              // ✅ Layout khusus dashboard: Sidebar + konten utama
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 p-4 sm:p-6 pt-14 md:pt-6 relative min-w-0 max-w-full overflow-x-hidden">
                  {children}
                </div>
              </div>
            ) : (
              // ✅ Layout biasa
              <>
                {children}
              </>
            )}
          </SessionGuard>
        </main>

        {showHeaderFooter && <Footer />}
      </body>
    </html>
  );
}
