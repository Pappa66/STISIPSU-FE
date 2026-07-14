"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Calendar } from "lucide-react";
import { RepositoryItem, UserRole } from "@/types";
import { mutate } from "swr";

interface RepositoryCardProps {
  item: RepositoryItem;
  role: UserRole;
}

export default function RepositoryCard({ item, role }: RepositoryCardProps) {
  const [views, setViews] = useState(item.views || 0);
  const canDownload = item.showDownloadsToPublic || role !== "public";

  const formatTanggal = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const handleViewIncrement = async () => {
    const key = `viewed_${item.id}`;
    if (typeof window === "undefined") return;

    const alreadyViewed = localStorage.getItem(key);
    if (alreadyViewed) {
      console.log("?? Sudah pernah dilihat:", item.id);
      return;
    }

    try {
      console.log("?? PATCH views untuk:", item.id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${item.id}/views`,
        { method: "PATCH" }
      );

      if (res.ok) {
        const data = await res.json();
        console.log("? View naik jadi:", data.views);
        setViews(data.views);
        localStorage.setItem(key, "1");

        // Mutate supaya data di halaman utama ikut ke-refresh
        mutate(`${process.env.NEXT_PUBLIC_API_URL}api/repository-items`);
      } else {
        console.error("? PATCH gagal:", await res.text());
      }
    } catch (err) {
      console.error("? Gagal fetch PATCH views:", err);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-sky-600 rounded-lg p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full space-y-2">
      {/* Gambar Placeholder */}
      <div className="w-full h-[160px] bg-gray-300 rounded flex items-center justify-center px-2 text-center">
        <h3 className="text-md font-bold text-sky-900 line-clamp-3 uppercase">
          {item.title}
        </h3>
      </div>

      {/* Program Studi */}
      <p className="text-xs font-medium text-blue-600 truncate">
        {item.studyProgram}
      </p>

      {/* Judul */}
      <h3 className="text-sm font-bold text-gray-800 line-clamp-2 uppercase">
        {item.title}
      </h3>

      {/* Author & Tahun */}
      <p className="text-xs text-gray-600 truncate">
        {typeof item.author === "object" ? item.author?.name : item.author} -{" "}
        {item.year}
      </p>

      {/* Tanggal & View */}
      <div className="flex items-center justify-start gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {formatTanggal(item.publishedAt || item.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={14} /> {views}
        </span>
      </div>

      {/* Tombol Baca */}
      <div className="mt-auto pt-4">
        <Link
          href={`/repository/${item.id}`}
          className="block text-center bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 rounded-md"
          onClick={handleViewIncrement}
        >
          Baca
        </Link>
      </div>
    </div>
  );
}
