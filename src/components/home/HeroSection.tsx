import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-white">
      <div className="container grid grid-cols-1 items-center gap-16 py-16 lg:grid-cols-2 lg:py-24">
        {/* Kolom Teks */}
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter text-brand-blue-dark md:text-5xl lg:text-6xl">
            Buka Pintu Masa Depanmu Bersama STISIP Sukabumi
          </h1>
          <p className="max-w-[700px] text-lg text-text-light sm:text-xl">
            Temukan program studi terbaik, nilai-nilai keilmuan sosial & politik, serta proses pendaftaran yang mudah dalam satu platform.
          </p>
          {/* Tombol Aksi */}
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
            <Link href="/tentang" className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-6 py-3 font-medium ring-1 ring-inset ring-border transition-colors hover:bg-gray-200 sm:w-auto">
              <User className="h-4 w-4" /> About Us
            </Link>
            <Link href="/register" className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue-dark px-6 py-3 font-medium text-white transition-colors hover:bg-brand-blue-dark/90 sm:w-auto">
              Daftar Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Statistik Mahasiswa */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-4">
              <Image className="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar Mahasiswa 1" width={48} height={48} />
              <Image className="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar Mahasiswa 2" width={48} height={48} />
              <Image className="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="Avatar Mahasiswa 3" width={48} height={48} />
            </div>
            <div>
              <p className="font-bold text-text">5000+ Active</p>
              <p className="text-sm text-text-light">Student</p>
            </div>
          </div>
        </div>
        {/* Kolom Gambar */}
        <div className="flex items-center justify-center">
          <Image
            src="https://placehold.co/600x500/E0E7FF/312E81?text=Mahasiswa+STISIP" 
            alt="Mahasiswa STISIP Syamsul Ulum"
            width={600}
            height={500}
            className="overflow-hidden rounded-lg object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}