"use client";

import React, { useState, FormEvent, useRef, useCallback } from "react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  ImageUp,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoadingButton from "@/components/common/LoadingButton";
import { createPortal } from "react-dom";

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
const imgUrl = (path: string) => path?.startsWith("http") ? path : `${baseUrl}/${path.replace(/^\//, "")}`;

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
  loading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
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
            disabled={loading}
            className="px-4 py-2 rounded text-sm border hover:bg-gray-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <LoadingButton onClick={onConfirm} variant="danger" size="sm" loading={loading}>
            Hapus
          </LoadingButton>
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
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("upload", file);

    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        setUploadProgress(-1);
        toast.success("Gambar berhasil diunggah");
      } else {
        setUploadProgress(-1);
        toast.error("Gagal upload gambar");
      }
    };
    xhr.onerror = () => {
      setUploadProgress(-1);
      toast.error("Network error");
    };
    xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}api/upload`);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(form);
  }, []);

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

    setSubmitting(true);
    try {
      const res = await fetchWithAuth(url, { method, body: JSON.stringify(dataToSubmit) });
      if (!res.ok) throw new Error("Gagal");
      mutate();
      onClose();
      toast.success("Berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
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
                src={imgUrl(formData.imageUrl)}
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
          ) : uploadProgress >= 0 ? (
            <div className="p-6 border-2 border-dashed rounded-lg h-60 flex flex-col items-center justify-center">
              <svg className="animate-spin w-10 h-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              <span className="text-sm text-gray-500 mb-2">Mengunggah {uploadProgress}%</span>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
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
              className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition active:scale-[0.97]"
            >
              Batal
            </button>
            <LoadingButton type="submit" loading={submitting}>
              Simpan
            </LoadingButton>
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
  const [deleting, setDeleting] = useState(false);

  const openModal = (item: Partial<Announcement> | null = null) => {
    setSelectedAnnouncement(item);
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${apiUrl}/${confirmDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal");
      mutate();
      setConfirmDelete(null);
      toast.success("Berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDeleting(false);
    }
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
          loading={deleting}
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

            {/* Desktop table */}
            <div className="hidden md:block w-full overflow-x-auto rounded">
              <table className="min-w-[640px] w-full text-sm text-left border border-gray-200">
                <thead className="bg-gray-50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-4 py-3">Judul</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Gambar</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Kedaluwarsa</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8"><LoadingSpinner /></td>
                    </tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold">{item.title}</td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3">
                          {item.type === "IMAGE" && item.imageUrl ? (
                            <img src={imgUrl(item.imageUrl)} alt="" className="w-16 h-12 object-cover rounded border" />
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {item.isActive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => openModal(item)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-md transition" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setConfirmDelete(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-md transition" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <AlertTriangle className="inline mb-2" size={36} />
                        <p>Belum ada pengumuman</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {isLoading ? (
                <div className="text-center py-8"><LoadingSpinner /></div>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1 break-words">{item.title}</h3>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openModal(item)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-md" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setConfirmDelete(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {item.type === "IMAGE" && item.imageUrl && (
                      <img src={imgUrl(item.imageUrl)} alt="" className="w-full h-32 object-cover rounded border" />
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                      <span>Tipe: {item.type}</span>
                      {item.expiresAt && <span>Kedaluwarsa: {new Date(item.expiresAt).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <AlertTriangle className="inline mb-2" size={36} />
                  <p>Belum ada pengumuman</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
