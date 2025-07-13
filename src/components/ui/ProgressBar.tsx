'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Impor CSS untuk styling

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false }); // Nonaktifkan spinner bawaan

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    // Panggil handleStop setiap kali path berubah
    handleStop();

    // Ini adalah cara yang lebih sederhana untuk memicu start/stop,
    // meskipun kita memanggil stop di awal, transisi akan terasa mulus.
    // Untuk kontrol yang lebih presisi, Anda bisa menggunakan event dari Next.js Router.

  }, [pathname, searchParams]);

  // Komponen ini tidak me-render apa pun, hanya mengontrol progress bar.
  return null;
}