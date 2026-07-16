"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Search, PlusCircle, Newspaper } from "lucide-react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import Spinner from "@/components/ui/Spinner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import toast, { Toaster } from "react-hot-toast";
import AddNewsModal from "@/components/dashboard/AddNewsModal";

interface NewsItem {
  id: string;
  title: string;
  author: { name: string };
  createdAt: string;
  isPublished: boolean;
}

interface ApiResponse {
  news: NewsItem[];
}

const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data Berita");
    return res.json();
  });

export default function NewsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedNewsTitle, setSelectedNewsTitle] = useState("");

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const apiUrl = useMemo(() => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/news`);
    if (searchQuery) url.searchParams.append("search", searchQuery);
    return url.toString();
  }, [searchQuery]);

  const {
    data: apiResponse,
    isLoading,
    mutate,
  } = useSWR<ApiResponse>(apiUrl, fetcher);

  const newsItems = apiResponse?.news || [];

  const handleEdit = (postId: string) => {
    router.push(`/dashboard/editor/${postId}?returnTo=/dashboard/news`);
  };

  const confirmDelete = (id: string, title: string) => {
    setSelectedNewsId(id);
    setSelectedNewsTitle(title);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedNewsId) return;
    setLoadingId(selectedNewsId);
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/news/${selectedNewsId}`,
        {
          method: "DELETE",
        }
      );
      toast.success("Berita berhasil dihapus.");
      mutate();
    } catch {
      toast.error("Gagal menghapus berita.");
    } finally {
      setLoadingId(null);
      setShowDeleteModal(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/news/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ isPublished: !currentStatus }),
        }
      );

      if (!res.ok) throw new Error();

      mutate();

      toast.success(
        !currentStatus
          ? "Berita berhasil dipublikasikan 🎉"
          : "Berita dipindahkan ke draf."
      );
    } catch {
      toast.error("Gagal mengubah status publikasi.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <section className="max-w-screen-xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-sky-700">
                  Kelola Berita & Artikel
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Publikasikan pengumuman, berita, dan artikel untuk umum.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari judul berita..."
                    className="w-full px-3 py-2 pl-10 border rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition w-full sm:w-auto"
                >
                  <PlusCircle size={18} /> Tambah Berita
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-sky-50 text-sky-700 text-left uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-4 font-semibold w-[45%]">Judul</th>
                    <th className="px-4 py-4 font-semibold w-[20%]">Tanggal</th>
                    <th className="px-4 py-4 font-semibold w-[20%]">Status</th>
                    <th className="px-4 py-4 font-semibold text-center w-[15%]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center p-16">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : newsItems.length > 0 ? (
                    newsItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 font-medium text-gray-900 max-w-0">
                          <span className="block truncate" title={item.title}>
                            {item.title}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-sm">
                          {new Date(item.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <label className="inline-flex items-center cursor-pointer gap-1.5">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.isPublished}
                              disabled={loadingId === item.id}
                              onChange={() =>
                                togglePublish(item.id, item.isPublished)
                              }
                            />
                            <div className="w-9 h-5 bg-gray-300 peer-checked:bg-green-500 rounded-full transition shrink-0" />
                            <span className={`text-xs font-medium ${item.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                              {item.isPublished ? "Terbit" : "Draf"}
                            </span>
                          </label>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-md transition-colors"
                              title="Edit Berita"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => confirmDelete(item.id, item.title)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                              title="Hapus Berita"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center p-16 text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Newspaper size={48} className="text-gray-300 mb-4" />
                          <h3 className="text-lg font-semibold">
                            Belum Ada Berita
                          </h3>
                          <p className="mt-2 text-sm">
                            {searchQuery
                              ? "Tidak ada berita yang cocok dengan pencarian Anda."
                              : 'Klik "Tambah Berita" untuk memulai.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Tambah Berita */}
      <AddNewsModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Konfirmasi Hapus
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Apakah Anda yakin ingin menghapus berita{" "}
              <strong>{selectedNewsTitle}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded border text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loadingId === selectedNewsId}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                {loadingId === selectedNewsId ? <Spinner size="sm" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
