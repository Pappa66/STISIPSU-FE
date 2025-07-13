// src/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container py-8 text-center text-sm text-text-light">
        <p>
          &copy; {new Date().getFullYear()} STISIP Syamsul Ulum. All rights reserved.
        </p>
        <p className="mt-2">
          Dibangun dengan ❤️ oleh Mahasiswa & Tim Pengembang.
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <Link href="/kebijakan-privasi" className="hover:text-brand-blue-light">
            Kebijakan Privasi
          </Link>
          <Link href="/syarat-ketentuan" className="hover:text-brand-blue-light">
            Syarat & Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}