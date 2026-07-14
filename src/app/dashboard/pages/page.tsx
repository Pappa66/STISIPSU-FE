"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Search, Info } from "lucide-react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Page {
  id: string;
  title: string;
  author: { name: string };
  menuItem?: { name: string };
  submenuItem?: { name: string; menuItem: { name: string } };
}

interface ApiResponse {
  posts: Page[];
}

const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data Halaman");
    return res.json();
  });

export default function PageManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPageTitle, setSelectedPageTitle] = useState("");

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const apiUrl = useMemo(() => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/pages`);
    if (searchQuery) {
      url.searchParams.append("search", searchQuery);
    }
    return url.toString();
  }, [searchQuery]);

  const { data: pagesResponse, isLoading } = useSWR<ApiResponse>(
    apiUrl,
    fetcher
  );

  const pages = pagesResponse?.posts || [];

  const handleEdit = (pageId: string) => {
    router.push(`/dashboard/editor/${pageId}`);
  };

  const handleDelete = (pageTitle: string) => {
    setSelectedPageTitle(pageTitle);
    setShowDeleteModal(true);
  };

  const totalPages = Math.ceil(pages.length / pageSize);
  const paginatedPages = pages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <section className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-sky-700">
                Kelola Konten Halaman
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Edit konten untuk halaman yang terhubung ke menu navigasi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              {/* Jumlah baris */}
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">
                  Tampilkan
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-md px-2 py-1 text-sm focus:ring-sky-500 focus:border-sky-500"
                >
                  {[5, 10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">baris</span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari judul halaman..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 border border-sky-200 bg-sky-50 rounded-md text-sm text-sky-800 flex items-start gap-3">
            <Info size={20} className="mt-0.5 text-sky-600" />
            <div>
              <p className="font-semibold">Informasi</p>
              <p className="mt-1">
                Halaman di sini dibuat otomatis saat menambah item di modul{" "}
                <strong className="text-sky-700">Kelola Menu</strong>. Gunakan
                modul ini hanya untuk <strong>mengedit isi konten</strong>{" "}
                halaman yang sudah ada.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-sky-50 text-sky-700 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">
                    Judul Halaman
                  </th>
                  <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">
                    Terhubung Ke Menu
                  </th>
                  <th className="px-6 py-4 text-center font-semibold whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedPages.length > 0 ? (
                  paginatedPages.map((page) => (
                    <tr
                      key={page.id}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {page.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-1">
                        {page.menuItem && (
                          <span className="inline-block bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Menu: {page.menuItem.name}
                          </span>
                        )}
                        {page.submenuItem && (
                          <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Sub: {page.submenuItem.name} (di{" "}
                            {page.submenuItem.menuItem.name})
                          </span>
                        )}
                        {!page.menuItem && !page.submenuItem && (
                          <span className="text-gray-400 text-xs">
                            Tidak terhubung
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(page.id)}
                            className="p-2 rounded-md text-sky-600 hover:bg-sky-100 transition"
                            title="Edit Konten Halaman"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(page.title)}
                            className="p-2 rounded-md text-red-400 hover:bg-red-100 hover:text-red-600 transition"
                            title="Hapus halaman melalui modul Kelola Menu"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-500">
                      <h3 className="text-lg font-semibold">
                        Belum Ada Halaman
                      </h3>
                      <p className="mt-2 text-sm">
                        {searchQuery
                          ? "Tidak ada hasil untuk pencarian Anda."
                          : 'Buat halaman baru dari modul "Kelola Menu".'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2 text-sm text-gray-600">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-2 text-red-600">
                  Tidak Bisa Dihapus Langsung
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Untuk menjaga konsistensi data, halaman{" "}
                  <strong>{selectedPageTitle}</strong> harus dihapus melalui
                  modul <strong>"Kelola Menu"</strong>.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded border text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
