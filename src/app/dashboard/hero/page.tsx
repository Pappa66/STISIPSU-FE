"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import toast from "react-hot-toast";
import { Save, Image, Link, Upload } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoadingButton from "@/components/common/LoadingButton";

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  isActive: boolean;
}

const fetcher = async (url: string): Promise<HeroData> => {
  const res = await fetchWithAuth(url);
  if (!res.ok) throw new Error("Gagal mengambil data hero");
  return res.json();
};

export default function HeroPage() {
  const baseApi = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
  const apiUrl = `${baseApi}/api/hero`;
  const { data, error, isLoading, mutate } = useSWR<HeroData>(apiUrl, fetcher);

  const [form, setForm] = useState<HeroData>({
    title: "", subtitle: "", description: "", imageUrl: "", linkUrl: "", linkLabel: "", isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("upload", file);
      const res = await fetchWithAuth(`${baseApi}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal upload");
      setForm(prev => ({ ...prev, imageUrl: result.url }));
      toast.success("Gambar berhasil diupload!");
    } catch (err: any) {
      toast.error(err.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Gagal menyimpan");
      toast.success("Hero section berhasil diperbarui!");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Gagal memuat data hero.</div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-sky-700">Hero Section</h1>
            <p className="text-gray-600 mt-2">
              Kelola konten area pendaftaran mahasiswa baru di bawah banner.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full p-3 border rounded-md text-sm" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
              <input type="text" value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})}
                className="w-full p-3 border rounded-md text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full p-3 border rounded-md text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="text" value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                      placeholder="/images/logo-kampus.png atau uploads/..." className="flex-1 p-3 border rounded-md text-sm" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition">
                      {uploading ? "..." : <><Upload size={16} /> Upload</>}
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>
                {form.imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border flex-shrink-0 bg-gray-50">
                    <img src={form.imageUrl.startsWith("http") ? form.imageUrl : `${baseApi}/${form.imageUrl.replace(/^\//, "")}`}
                      alt="preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Link size={14} className="inline mr-1" /> Link Tombol
                </label>
                <input type="url" value={form.linkUrl} onChange={(e) => setForm({...form, linkUrl: e.target.value})}
                  placeholder="https://pmb.stisipsu.ac.id" className="w-full p-3 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                <input type="text" value={form.linkLabel} onChange={(e) => setForm({...form, linkLabel: e.target.value})}
                  placeholder="Daftar Sekarang" className="w-full p-3 border rounded-md text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-sky-600" />
              <span className="text-sm text-gray-700">Tampilkan di halaman utama</span>
            </label>

            <div className="flex justify-end pt-4 border-t">
              <LoadingButton type="submit" loading={submitting}>
                <Save size={16} /> Simpan
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
