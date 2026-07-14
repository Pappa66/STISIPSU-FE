// D:\STISIP\STISIPWEB\frontend\src\app\repository\page.tsx

"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useAuthStore } from "@/store/authStore";
import { jwtDecode } from "jwt-decode";
import { RepositoryItem, UserRole } from "@/types";
import { Search, Calendar, Eye } from "lucide-react";
import RepositoryCard from "@/components/repository/RepositoryCard";

type StatsResponse = {
  totalRepositories: number;
  totalAuthors: number;
  totalUsers: number;
  totalFiles: number;
};

const fetcher = async (url: string): Promise<RepositoryItem[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data");
  return res.json();
};

const fetcherStats = async (url: string): Promise<StatsResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data statistik");
  return res.json();
};

export default function RepositoryListPage() {
  const { token } = useAuthStore();
  let userRole: UserRole = "public";

  if (token) {
    try {
      const decoded: { role: UserRole } = jwtDecode(token);
      userRole = decoded.role;
    } catch (e) {
      console.error("Token tidak valid");
    }
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/repository-items`;
  const {
    data: items = [],
    error,
    isLoading,
  } = useSWR<RepositoryItem[]>(apiUrl, fetcher);

  const [showPagination, setShowPagination] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const INITIAL_VISIBLE_COUNT = 4;
  const ITEMS_PER_PAGE = 8;

  const handleLoadMore = () => {
    setShowPagination(true);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedItems = showPagination
    ? items.slice(startIndex, endIndex)
    : items.slice(0, INITIAL_VISIBLE_COUNT);

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/stats`,
    fetcherStats
  );

  const formatTanggal = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div
        className="relative bg-cover bg-center bg-no-repeat text-white py-20"
        style={{ backgroundImage: "url('/images/gedung-satu.png')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto z-10 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase">
            Syamsul Ulum Repository
          </h2>
        </div>
      </div>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Kiriman terbaru
          </h3>

          {error && (
            <div className="text-center py-16 text-red-500">
              <h3 className="text-xl font-semibold">Terjadi Kesalahan</h3>
              <p className="mt-2">
                Tidak dapat terhubung ke server repositori.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16 text-gray-500">
              <h3 className="text-xl font-semibold">Memuat Data...</h3>
            </div>
          )}

          {items && items.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2 grid-cols-1">
                {paginatedItems.map((item) => (
                  <RepositoryCard key={item.id} item={item} role={userRole} />
                ))}
              </div>

              {!showPagination && items.length > INITIAL_VISIBLE_COUNT && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Lihat Selengkapnya
                  </button>
                </div>
              )}

              {showPagination && (
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                  {Array.from({
                    length: Math.ceil(items.length / ITEMS_PER_PAGE),
                  }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        currentPage === idx + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 mt-16 border-t pt-10">
              <h3 className="text-xl font-semibold">Belum Ada Karya Ilmiah</h3>
              <p className="mt-2">
                Saat ini tidak ada karya ilmiah yang dipublikasikan.
              </p>
            </div>
          )}
        </div>
      </section>

      <div
        className="bg-cover bg-center bg-no-repeat text-white py-12"
        style={{ backgroundImage: `url(/images/perpus-bg.png)` }}
      >
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {stats?.totalRepositories?.toLocaleString("id-ID") ?? "-"}
            </h3>
            <p className="text-sm">Repository</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {stats?.totalAuthors?.toLocaleString("id-ID") ?? "-"}
            </h3>
            <p className="text-sm">Penulis</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {stats?.totalUsers?.toLocaleString("id-ID") ?? "-"}
            </h3>
            <p className="text-sm">Pengguna</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {stats?.totalFiles?.toLocaleString("id-ID") ?? "-"}
            </h3>
            <p className="text-sm">Files</p>
          </div>
        </div>
      </div>

      {/* KIRIMAN TERBARU & POPULER */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* KIRI */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Kiriman terbaru
              </h3>

              {items && items.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-gray-100 p-3 rounded-md shadow-sm"
                    >
                      <div className="w-20 h-20 bg-gray-300 rounded flex items-center justify-center text-center p-1">
                        <p className="text-xs font-semibold text-blue-700 line-clamp-3">
                          {item.title}
                        </p>
                      </div>

                      <div className="flex flex-col justify-between flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-blue-700 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {formatTanggal(item.publishedAt || item.createdAt)}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Eye size={14} /> {item.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 mt-10">
                  <p>Belum Ada Karya Ilmiah</p>
                </div>
              )}
            </div>

            {/* KANAN */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Populer</h3>
              <div className="flex flex-col gap-4 bg-sky-600 p-4">
                {items &&
                  [...items]
                    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
                    .slice(0, 4)
                    .map((item) => (
                      <div key={item.id}>
                        <div className="flex gap-3 items-start bg-white rounded-sm p-4">
                          <div className="flex flex-col items-center bg-sky-700 text-white rounded p-3 min-w-[90px]">
                            <span className="text-lg font-bold">
                              {new Date(item.publishedAt || item.createdAt)
                                .getDate()
                                .toString()
                                .padStart(2, "0")}
                            </span>
                            <span className="text-xs">
                              {new Date(
                                item.publishedAt || item.createdAt
                              ).toLocaleDateString("id-ID", {
                                month: "long",
                              })}
                            </span>
                            <span className="bg-orange-400 rounded-md w-full text-center text-xs font-medium mt-1">
                              {new Date(
                                item.publishedAt || item.createdAt
                              ).getFullYear()}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-800 mb-2 border-b-2 border-sky-600 pb-1 line-clamp-4">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-700 opacity-80 mb-1 line-clamp-2">
                              {item.abstract || "Tidak ada ringkasan."}
                            </p>

                            <p className="text-xs text-gray-600 italic mb-1">
                              {item.studyProgram}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatTanggal(
                                  item.publishedAt || item.createdAt
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye size={14} /> {item.views || 0} View
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
