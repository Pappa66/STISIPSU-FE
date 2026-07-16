"use client";

import React, { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { useAuthStore } from "@/store/authStore";
import { jwtDecode } from "jwt-decode";
import { RepositoryItem, UserRole } from "@/types";
import { Search, Calendar, Eye, X } from "lucide-react";
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

  // Filter state
  const [search, setSearch] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [category, setCategory] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const ITEMS_PER_PAGE = 8;

  // Extract unique study programs
  const studyPrograms = useMemo(() => {
    const prodi = new Set<string>();
    items.forEach((item) => { if (item.studyProgram) prodi.add(item.studyProgram); });
    return Array.from(prodi).sort();
  }, [items]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => { if (item.category) cats.add(item.category); });
    return Array.from(cats).sort();
  }, [items]);

  // Filter
  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.author?.toString().toLowerCase().includes(q) ||
          item.studyProgram?.toLowerCase().includes(q) ||
          item.abstract?.toLowerCase().includes(q)
      );
    }
    if (studyProgram) {
      result = result.filter((item) => item.studyProgram === studyProgram);
    }
    if (category) {
      result = result.filter((item) => item.category === category);
    }
    if (yearFrom) {
      result = result.filter((item) => item.year && item.year >= parseInt(yearFrom));
    }
    if (yearTo) {
      result = result.filter((item) => item.year && item.year <= parseInt(yearTo));
    }
    return result;
  }, [items, search, studyProgram, category, yearFrom, yearTo]);

  const handleLoadMore = () => {
    setShowPagination(true);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedItems = showPagination
    ? filtered.slice(startIndex, endIndex)
    : filtered.slice(0, 4);

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

  const resetFilters = () => {
    setSearch("");
    setStudyProgram("");
    setCategory("");
    setYearFrom("");
    setYearTo("");
  };

  const hasFilters = search || studyProgram || category || yearFrom || yearTo;

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
          {/* SEARCH & FILTER SECTION */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border space-y-3">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setShowPagination(false); }}
                    placeholder="Judul, penulis, abstrak..."
                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Program Studi</label>
                <select
                  value={studyProgram}
                  onChange={(e) => { setStudyProgram(e.target.value); setShowPagination(false); }}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Semua Prodi</option>
                  {studyPrograms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setShowPagination(false); }}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Dari</label>
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => { setYearFrom(e.target.value); setShowPagination(false); }}
                  placeholder="2020"
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sampai</label>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => { setYearTo(e.target.value); setShowPagination(false); }}
                  placeholder="2025"
                  className="w-24 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md hover:bg-red-50"
                >
                  <X size={14} /> Reset
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {hasFilters ? `${filtered.length} hasil ditemukan` : `${items.length} total karya ilmiah`}
            </p>
          </div>

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

          {filtered.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2 grid-cols-1">
                {paginatedItems.map((item) => (
                  <RepositoryCard key={item.id} item={item} role={userRole} />
                ))}
              </div>

              {!showPagination && filtered.length > 4 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Lihat Selengkapnya ({filtered.length - 4} lainnya)
                  </button>
                </div>
              )}

              {showPagination && (
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                  {Array.from({
                    length: Math.ceil(filtered.length / ITEMS_PER_PAGE),
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
              <h3 className="text-xl font-semibold">
                {hasFilters ? "Tidak Ada Hasil" : "Belum Ada Karya Ilmiah"}
              </h3>
              <p className="mt-2">
                {hasFilters
                  ? "Coba ubah kata kunci atau filter pencarian."
                  : "Saat ini tidak ada karya ilmiah yang dipublikasikan."}
              </p>
            </div>
          )}
        </div>
      </section>

      {!hasFilters && (
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
      )}

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
