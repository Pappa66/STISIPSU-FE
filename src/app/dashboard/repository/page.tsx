"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import Pagination from "@/components/ui/Pagination";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// ? Interface lengkap agar tidak error di komponen lain
interface RepoItemAdmin {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string; // ? Ditambahkan agar valid di RepositoryCard
  visibility: "PUBLISHED" | "PRIVATE";
  showDownloadsToPublic: boolean;
  uploader: { name: string };
  publishedAt?: string;
  createdAt: string;
}

interface ApiResponse {
  items: RepoItemAdmin[];
  currentPage: number;
  totalPages: number;
}

const fetcher = (url: string) => fetchWithAuth(url).then((res) => res.json());

export default function RepositoryManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const apiUrl = useMemo(() => {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/admin/all`
    );
    url.searchParams.append("page", String(currentPage));
    url.searchParams.append("limit", "10");
    if (searchQuery) url.searchParams.append("search", searchQuery);
    return url.toString();
  }, [currentPage, searchQuery]);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    apiUrl,
    fetcher
  );

  const handleToggle = async (
    id: string,
    field: "visibility" | "showDownloadsToPublic",
    currentValue: any
  ) => {
    const newValue =
      field === "visibility"
        ? currentValue === "PUBLISHED"
          ? "PRIVATE"
          : "PUBLISHED"
        : !currentValue;

    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ [field]: newValue }),
        }
      );
      mutate();
      toast.success("Status berhasil diperbarui.");
    } catch (err) {
      toast.error("Gagal mengubah status.");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${deleteId}`,
        { method: "DELETE" }
      );
      toast.success("Item berhasil dihapus.");
      mutate();
    } catch (err) {
      toast.error("Gagal menghapus item.");
    } finally {
      setShowModal(false);
      setDeleteId(null);
    }
  };

  if (error)
    return (
      <div className="text-center py-12 text-red-500">Gagal memuat data.</div>
    );

  if (isLoading && !data)
    return <div className="text-center py-12">Memuat data...</div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-sky-700 mb-6">
            Manajemen Repositori
          </h1>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari judul..."
              className="px-3 py-2 border rounded-md w-full max-w-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Unduhan Publik</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-sky-800 break-words max-w-[200px]">{item.title}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.author} ({item.year})</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(item.id, "visibility", item.visibility)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition ${
                          item.visibility === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-800"
                        }`}>
                        {item.visibility === "PUBLISHED" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {item.visibility === "PUBLISHED" ? "Diterbitkan" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(item.id, "showDownloadsToPublic", item.showDownloadsToPublic)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition ${
                          item.showDownloadsToPublic ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-800"
                        }`}>
                        {item.showDownloadsToPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        {item.showDownloadsToPublic ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/dashboard/repository/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><Edit size={16} /></Link>
                        <button onClick={() => confirmDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data || data.items.length === 0) && (
              <div className="text-center p-16 text-gray-500">
                <h3 className="text-lg font-semibold">Tidak Ada Data</h3>
                <p className="mt-1 text-sm">Belum ada item repositori yang dibuat.</p>
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data?.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sky-800 text-sm leading-snug break-words">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.author} ({item.year})</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/dashboard/repository/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><Edit size={16} /></Link>
                    <button onClick={() => confirmDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleToggle(item.id, "visibility", item.visibility)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition ${
                      item.visibility === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-800"
                    }`}>
                    {item.visibility === "PUBLISHED" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {item.visibility === "PUBLISHED" ? "Terbit" : "Draft"}
                  </button>
                  <button onClick={() => handleToggle(item.id, "showDownloadsToPublic", item.showDownloadsToPublic)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition ${
                      item.showDownloadsToPublic ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-800"
                    }`}>
                    {item.showDownloadsToPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                    Unduh: {item.showDownloadsToPublic ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
              </div>
            ))}
            {(!data || data.items.length === 0) && (
              <div className="text-center py-16 text-gray-500">
                <h3 className="text-lg font-semibold">Tidak Ada Data</h3>
                <p className="mt-1 text-sm">Belum ada item repositori yang dibuat.</p>
              </div>
            )}
          </div>

          <Pagination
            currentPage={data?.currentPage || 1}
            totalPages={data?.totalPages || 1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Konfirmasi Hapus
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
