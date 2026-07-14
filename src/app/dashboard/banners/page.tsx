"use client";

import React, { useState, useRef } from "react";
import useSWR, { mutate } from "swr";
import { fetchWithAuth } from "@/utils/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Plus, Trash2, GripVertical, Eye, EyeOff, MoveUp, MoveDown } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}

const fetcher = (url: string) => fetchWithAuth(url).then((r) => r.json());
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
const imgUrl = (path: string) => path?.startsWith("http") ? path : `${baseUrl}/${path.replace(/^\//, "")}`;

function SortableBannerCard({
  banner,
  onDelete,
  onToggleActive,
  onEdit,
}: {
  banner: Banner;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (banner: Banner) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border rounded-lg p-3 shadow-sm">
      <button {...listeners} className="cursor-grab p-1 text-gray-400 hover:bg-gray-100 rounded">
        <GripVertical size={18} />
      </button>
      <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100">
        <img src={imgUrl(banner.imageUrl)} alt={banner.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{banner.title}</p>
        {banner.subtitle && <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(banner)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium">
          Edit
        </button>
        <button
          onClick={() => onToggleActive(banner.id, !banner.isActive)}
          className={`p-1.5 rounded ${banner.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
          title={banner.isActive ? "Aktif" : "Nonaktif"}
        >
          {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={() => onDelete(banner.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const { data: banners, isLoading, error } = useSWR<Banner[]>(
    `${process.env.NEXT_PUBLIC_API_URL}api/banners/admin/all`,
    fetcher
  );

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setFile(null);
    setPreview(null);
    setEditingBanner(null);
    setShowForm(false);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setLinkUrl(banner.linkUrl || "");
    setPreview(imgUrl(banner.imageUrl));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Judul wajib diisi."); return; }
    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("linkUrl", linkUrl);
    if (file) formData.append("image", file);

    try {
      if (editingBanner) {
        await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}api/banners/${editingBanner.id}`,
          { method: "PUT", body: formData }
        );
        toast.success("Banner diperbarui!");
      } else {
        await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}api/banners`,
          { method: "POST", body: formData }
        );
        toast.success("Banner ditambahkan!");
      }
      mutate(`${process.env.NEXT_PUBLIC_API_URL}api/banners/admin/all`);
      resetForm();
    } catch {
      toast.error("Gagal menyimpan banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/banners/${id}`, { method: "DELETE" });
      toast.success("Banner dihapus!");
      mutate(`${process.env.NEXT_PUBLIC_API_URL}api/banners/admin/all`);
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const formData = new FormData();
    formData.append("isActive", String(isActive));
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/banners/${id}`, { method: "PUT", body: formData });
      mutate(`${process.env.NEXT_PUBLIC_API_URL}api/banners/admin/all`);
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !banners) return;

    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(banners, oldIndex, newIndex);
    const items = reordered.map((b, i) => ({ id: b.id, order: i }));

    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/banners/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      mutate(`${process.env.NEXT_PUBLIC_API_URL}api/banners/admin/all`);
    } catch {
      toast.error("Gagal mengatur ulang.");
    }
  };

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <div className="p-8 text-red-500">Gagal memuat banner.</div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Kelola Banner</h1>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} /> Tambah Banner
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold mb-4">{editingBanner ? "Edit Banner" : "Banner Baru"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link URL (opsional)</label>
                  <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gambar {editingBanner ? "(biarkan kosong jika tidak diganti)" : "*"}</label>
                  <input type="file" ref={fileInputRef} accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                    }}
                    className="w-full text-sm" />
                  {preview && (
                    <img src={preview} alt="preview" className="mt-2 h-20 w-auto rounded object-cover" />
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  Batal
                </button>
              </div>
            </form>
          )}

          {!banners || banners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada banner. Klik "Tambah Banner" untuk mulai.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {banners.map((banner) => (
                    <SortableBannerCard
                      key={banner.id}
                      banner={banner}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onEdit={openEdit}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </main>
  );
}
