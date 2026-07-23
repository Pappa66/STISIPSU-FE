"use client";

import React, { useState, useRef, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { fetchWithAuth } from "@/utils/api";
import { useAuthStore } from "@/store/authStore";
import { useBackgroundUpload, UploadTask } from "@/hooks/useBackgroundUpload";
import { UploadProgressBadge, UploadProgressBar } from "@/components/common/UploadProgress";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoadingButton from "@/components/common/LoadingButton";
import { Plus, Trash2, GripVertical, Eye, EyeOff, MoveUp, MoveDown, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}

interface OptimisticBanner extends Banner {
  _optimistic?: boolean;
  _taskId?: string;
}

const fetcher = (url: string) => fetchWithAuth(url).then((r) => r.json());
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
const imgUrl = (path: string) => path?.startsWith("http") ? path : `${baseUrl}/${path.replace(/^\//, "")}`;

function SortableBannerCard({
  banner,
  task,
  onDelete,
  onToggleActive,
  onEdit,
}: {
  banner: OptimisticBanner;
  task?: UploadTask;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (banner: Banner) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isUploading = task && task.status !== "done";
  const isError = task?.status === "error";

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 sm:gap-3 bg-white border rounded-lg p-3 shadow-sm ${isUploading ? (isError ? "border-red-300 bg-red-50" : "border-blue-300 bg-blue-50") : ""}`}>
      <button {...listeners} className="cursor-grab p-1 text-gray-400 hover:bg-gray-100 rounded shrink-0">
        <GripVertical size={18} />
      </button>
      <div className="relative w-20 h-14 sm:w-32 sm:h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100">
        {isUploading && !isError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        ) : (
          <img src={imgUrl(banner.imageUrl)} alt={banner.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm truncate">{banner.title}</p>
          {task && <UploadProgressBadge task={task} />}
        </div>
        {banner.subtitle && <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>}
        {task && <UploadProgressBar task={task} />}
      </div>
      <div className="flex items-center gap-1">
        {!isUploading && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default function BannersPage() {
  const { data: banners, isLoading, error, mutate: refreshBanners } = useSWR<Banner[]>(
    `${process.env.NEXT_PUBLIC_API_URL}api/banners/admin/all`,
    fetcher
  );
  const { token } = useAuthStore();
  const { uploads, startUpload } = useBackgroundUpload();
  const [optimisticBanners, setOptimisticBanners] = useState<OptimisticBanner[]>([]);

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
    if (!file && !editingBanner) { toast.error("Gambar wajib dipilih."); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("linkUrl", linkUrl);
    if (file) formData.append("image", file);

    if (editingBanner) {
      setSubmitting(true);
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}api/banners/${editingBanner.id}`,
          { method: "PUT", body: formData }
        );
        if (!res.ok) throw new Error("Gagal");
        toast.success("Banner diperbarui!");
        refreshBanners();
      } catch { toast.error("Gagal memperbarui banner."); }
      finally { setSubmitting(false); }
      resetForm();
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimistic: OptimisticBanner = {
      id: tempId,
      title,
      subtitle: subtitle || null,
      imageUrl: preview || "",
      linkUrl: linkUrl || null,
      order: banners?.length || 0,
      isActive: true,
      _optimistic: true,
      _taskId: tempId,
    };

    setOptimisticBanners((prev) => [optimistic, ...prev]);
    resetForm();

    startUpload(
      tempId,
      `${process.env.NEXT_PUBLIC_API_URL}api/banners`,
      formData,
      "POST",
      token
    )
      .then(() => {
        setOptimisticBanners((prev) => prev.filter((b) => b.id !== tempId));
        refreshBanners();
      })
      .catch(() => {
        toast.error("Gagal mengunggah banner.");
      });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/banners/${id}`, { method: "DELETE" });
      toast.success("Banner dihapus!");
      refreshBanners();
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const formData = new FormData();
    formData.append("isActive", String(isActive));
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/banners/${id}`, { method: "PUT", body: formData });
      refreshBanners();
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
      refreshBanners();
    } catch {
      toast.error("Gagal mengatur ulang.");
    }
  };

  const allBanners = [...optimisticBanners, ...(banners || [])];

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <div className="p-8 text-red-500">Gagal memuat banner.</div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold">Kelola Banner</h1>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <p className="text-xs text-gray-400 mt-1">Jika diisi, pengunjung akan diarahkan ke link ini saat banner diklik.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gambar {editingBanner ? "(biarkan kosong jika tidak diganti)" : "*"}</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const f = e.dataTransfer.files?.[0];
                      if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                      }} />
                    {preview ? (
                      <img src={preview} alt="preview" className="mx-auto h-24 w-auto max-w-full rounded object-cover" />
                    ) : (
                      <div className="text-gray-500">
                        <svg className="mx-auto h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-sm">Seret & lepas gambar di sini, atau klik untuk memilih</p>
                        <p className="text-xs mt-1 text-gray-400">JPG, PNG, WebP (maks. 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <LoadingButton type="submit" loading={submitting}>Simpan</LoadingButton>
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition active:scale-[0.97]">
                  Batal
                </button>
              </div>
            </form>
          )}

          {allBanners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada banner. Klik "Tambah Banner" untuk mulai.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={allBanners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {allBanners.map((banner: OptimisticBanner) => (
                    <SortableBannerCard
                      key={banner.id}
                      banner={banner}
                      task={banner._taskId ? uploads[banner._taskId] : undefined}
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
