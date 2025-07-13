'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { RepositoryItem, UserRole } from '@/types'; // Impor tipe data yang sudah kita buat
import { Download, Edit, Trash2, Eye } from 'lucide-react';

interface RepositoryCardProps {
  item: RepositoryItem;
  role: UserRole;
}

export default function RepositoryCard({ item, role }: RepositoryCardProps) {
  
  // PERBAIKAN: Menggunakan 'ADMIN' (huruf besar) sesuai dengan tipe UserRole
  const canEdit = role === 'ADMIN';
  const canDownload = item.showDownloadsToPublic || role !== 'public';

  // Fungsi untuk menangani link unduh/lihat
  const renderLink = () => {
    // Jika tidak bisa unduh atau tidak ada file, arahkan ke halaman detail
    if (!canDownload || !item.fileUrl) {
      return (
        <Link href={`/repository/${item.id}`} className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
          <Eye className="h-4 w-4" />
          Lihat Detail
        </Link>
      );
    }
    
    // Jika bisa unduh dan ada fileUrl
    const isExternal = item.fileUrl.startsWith('http');
    const url = isExternal ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${item.fileUrl}`;
    
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
        <Download className="h-4 w-4" />
        Unduh
      </a>
    );
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex-grow">
        <p className="text-sm font-semibold text-indigo-600">{item.studyProgram}</p>
        <Link href={`/repository/${item.id}`} className="block">
            <h3 className="mt-2 text-lg font-bold text-gray-900 hover:text-indigo-700 line-clamp-2">{item.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600">
          {/* PERBAIKAN: Menangani author yang mungkin objek atau string */}
          {typeof item.author === 'object' && item.author !== null ? (item.author as { name: string }).name : item.author} - {item.year}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        {renderLink()}

        {canEdit && (
          <div className="flex gap-2">
            <button className="text-sm font-medium text-blue-600 hover:underline p-2 hover:bg-blue-50 rounded-md"><Edit className="h-4 w-4"/></button>
            <button className="text-sm font-medium text-red-600 hover:underline p-2 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
