"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import useSWR from "swr";
import { useAuthStore } from "@/store/authStore";
import { fetchWithAuth } from "@/utils/api";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

// Definisikan tipe data Post
interface Post {
  id: string;
  title: string;
  author: { name: string };
  menuItem?: { name: string };
  submenuItem?: { name: string; menuItem: { name: string } };
}

// Definisikan tipe data untuk respons API
interface ApiResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

// Buat 'fetcher' yang akan digunakan oleh SWR
const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) {
      throw new Error("Gagal mengambil data");
    }
    return res.json();
  });

export default function PostManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  // Debounce effect untuk search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
      setCurrentPage(1); // Reset ke halaman 1 setiap kali search query berubah
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Gunakan SWR untuk data fetching
  const apiUrl = useMemo(() => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/posts`);
    url.searchParams.append("page", String(currentPage));
    url.searchParams.append("limit", "10");
    if (searchQuery) {
      url.searchParams.append("search", searchQuery);
    }
    return url.toString();
  }, [currentPage, searchQuery]);

  const {
    data: apiResponse,
    error,
    isLoading,
    mutate,
  } = useSWR<ApiResponse>(apiUrl, fetcher);

  const posts = apiResponse?.posts || [];
  const totalPages = apiResponse?.totalPages || 0;

  const handleEdit = (postId: string) => {
    router.push(`/dashboard/editor/${postId}`);
  };

  const handleDelete = async (postId: string) => {
    const confirm = window.confirm("Yakin ingin menghapus postingan ini?");
    if (!confirm) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}`;
      await fetchWithAuth(url, { method: "DELETE" });
      toast.success("Post berhasil dihapus");
      mutate(); // Re-fetch data
    } catch (err) {
      toast.error("Gagal menghapus postingan");
      console.error(err);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const confirmDelete = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPostId) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}api/posts/${selectedPostId}`;
      await fetchWithAuth(url, { method: "DELETE" });
      toast.success("Post berhasil dihapus");
      mutate();
    } catch (err) {
      toast.error("Gagal menghapus postingan");
      console.error(err);
    }
  };

  // Tampilan Loading dan Error
  if (error)
    return (
      <div className="text-center py-12 text-red-500">
        Gagal memuat data postingan.
      </div>
    );
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-sky-700">Manajemen Konten</h1>
          <input
            type="text"
            placeholder="Cari judul halaman..."
            className="px-4 py-2 border border-sky-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 w-full md:w-1/3 transition"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-sky-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sky-700">
                  Judul Halaman
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sky-700">
                  Terhubung Ke
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sky-700">
                  Author
                </th>
                <th className="px-6 py-4 text-center font-semibold text-sky-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-sky-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      {post.menuItem && (
                        <span className="inline-block bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                          Menu: {post.menuItem.name}
                        </span>
                      )}
                      {post.submenuItem && (
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Sub: {post.submenuItem.name} (di{" "}
                          {post.submenuItem.menuItem.name})
                        </span>
                      )}
                      {!post.menuItem && !post.submenuItem && (
                        <span className="text-gray-400">Tidak terhubung</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {post.author?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="inline-flex items-center p-2 rounded-md text-sky-600 hover:bg-sky-100 transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(post.id)}
                          className="inline-flex items-center p-2 rounded-md text-red-600 hover:bg-red-100 transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-16 text-gray-500">
                    <h3 className="text-lg font-semibold">Tidak Ada Konten</h3>
                    <p className="mt-2 text-sm">
                      {searchQuery
                        ? "Tidak ada hasil untuk pencarian Anda."
                        : "Belum ada postingan yang dibuat."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Konfirmasi Penghapusan"
          description="Apakah kamu yakin ingin menghapus postingan ini?"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
