"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressBar from "@/components/ui/ProgressBar";
import SessionGuard from "@/components/SessionGuard";
import PopupAnnouncement from "@/components/ui/PopupAnnouncement";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const isDashboardPage = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";
  const showHeaderFooter = !isDashboardPage && !isLoginPage;

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 300);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <Toaster position="top-right" />
      <ProgressBar />

      {isNavigating && (
        <div className="fixed inset-0 z-[9999] bg-white bg-opacity-60 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {showHeaderFooter && <Header />}

      <main className="flex-grow">
        <SessionGuard>{children}</SessionGuard>
        <PopupAnnouncement />
      </main>

      {showHeaderFooter && <Footer />}
    </>
  );
}