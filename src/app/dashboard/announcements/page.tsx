"use client";

import React, { useState, FormEvent, useRef } from "react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  ImageUp,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { createPortal } from "react-dom";

// Type
interface Announcement {
  id: string;
  title: string;
  type: "TEXT" | "IMAGE";
  content?: string | null;
  imageUrl?: string | null;
  targetAudiences: "PUBLIC"[];
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

// ✅ Fetcher
const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data pengumuman");
    return res.json();
  });

// ✅ Confirm Modal
const ConfirmDeleteModal = ({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) =>
  createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Hapus Pengumuman
        </h3>
        <p className="text-gray-700 mb-4">
          Yakin ingin menghapus pengumuman <strong>{title}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm border"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

// ✅ Modal Form
const AnnouncementModal = ({
  announcement,
  onClose,
  mutate,
}: {
  announcement: Partial<Announcement> | null;
  onClose: () => void;
  mutate: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    type: "TEXT",
    content: "",
    imageUrl: "",
    targetAudiences: ["PUBLIC"],
    isActive: false,
    expiresAt: "",
    ...announcement,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("upload", file);

    const promise = fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}api/upload`,
      {
        method: "POST",
        body: data,
      }
    ).then((res) => {
      if (!res.ok) throw new Error("Gagal unggah file.");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Mengunggah...",
      success: (res) => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: res.url,
        }));
        return "Berhasil diunggah";
      },
      error: "Gagal upload",
    });
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${process.env.NEXT_PUBLIC_API_URL}api/announcements/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}api/announcements`;

    const dataToSubmit = {
      ...formData,
      expiresAt: formData.expiresAt || null,
      targetAudiences: ["PUBLIC"],
    };

    const promise = fetchWithAuth(url, {
      method,
      body: JSON.stringify(dataToSubmit),
    });

    toast.promise(promise, {
      loading: "Menyimpan...",
      success: () => {
        mutate();
        onClose();
        return "Berhasil disimpan";
      },
      error: "Gagal menyimpan",
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {formData.id ? "Edit" : "Tambah"} Pengumuman
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Judul (untuk referensi internal)"
            className="w-full p-3 border rounded"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          >
            <option value="TEXT">Teks</option>
            <option value="IMAGE">Gambar</option>
          </select>

          {formData.type === "TEXT" ? (
            <textarea
              name="content"
              value={formData.content || ""}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border rounded"
              placeholder="Isi pengumuman..."
            />
          ) : formData.imageUrl ? (
            <div className="relative h-60 border-dashed border-2 rounded flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${formData.imageUrl}`}
                alt="preview"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer p-6 border-2 border-dashed rounded-lg h-60 flex flex-col items-center justify-center">
              <ImageUp size={48} className="text-gray-400 mb-2" />
              <span className="text-sm">Klik untuk unggah gambar</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          <input
            type="date"
            name="expiresAt"
            value={
              formData.expiresAt
                ? new Date(formData.expiresAt).toISOString().slice(0, 10)
                : ""
            }
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="isActive"
              checked={!!formData.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Tampilkan kepada pengunjung (Aktif)
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-sky-600 text-white px-4 py-2 rounded font-semibold hover:bg-sky-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ✅ Page
export default function AnnouncementManagementPage() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/announcements`;
  const {
    data = [],
    isLoading,
    mutate,
  } = useSWR<Announcement[]>(apiUrl, fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Partial<Announcement> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Announcement | null>(null);

  const openModal = (item: Partial<Announcement> | null = null) => {
    setSelectedAnnouncement(item);
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const promise = fetchWithAuth(`${apiUrl}/${confirmDelete.id}`, {
      method: "DELETE",
    });
    toast.promise(promise, {
      loading: "Menghapus...",
      success: () => {
        mutate();
        setConfirmDelete(null);
        return "Berhasil dihapus";
      },
      error: "Gagal menghapus",
    });
  };

  return (
    <>
      {isModalOpen && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setIsModalOpen(false)}
          mutate={mutate}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          title={confirmDelete.title}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-sky-700">
                  Kelola Pengumuman
                </h1>
                <p className="text-sm text-gray-500">
                  Atur konten pop-up untuk pengunjung publik
                </p>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded font-semibold hover:bg-sky-700"
              >
                <PlusCircle size={18} /> Tambah
              </button>
            </div>

            <div className="w-full overflow-x-auto rounded">
              <table className="min-w-[640px] w-full text-sm text-left border border-gray-200">
                <thead className="bg-gray-50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Kedaluwarsa</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {item.title}
                        </td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              item.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.isActive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.expiresAt
                            ? new Date(item.expiresAt).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 flex justify-center gap-4">
                          <button
                            onClick={() => openModal(item)}
                            className="text-sky-600 hover:text-sky-800 transition"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(item)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-gray-400 flex flex-col items-center"
                      >
                        <AlertTriangle className="mb-3" size={36} />
                        Belum ada pengumuman
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
