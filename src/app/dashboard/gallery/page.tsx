"use client";

import { useState, useEffect, useRef, ChangeEvent, Suspense } from "react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import { ImageUp, Trash2, Save, Image as ImageIcon, Loader2 } from "lucide-react";

// Menghapus import terkait DND-Kit
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   rectSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  order: number;
}

const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Gagal mengambil data");
    return res.json();
  });

function buildImageUrl(baseUrl: string, imageUrl: string) {
  return `${baseUrl.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
}

// Mengubah komponen SortableImageCard menjadi ImageCard biasa
function ImageCard({
  image,
  mutateList,
  onDelete,
}: {
  image: GalleryImage;
  mutateList: () => void;
  onDelete: (img: GalleryImage) => void;
}) {
  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(image.title);
    setDescription(image.description || "");
  }, [image]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuth(
  `${process.env.NEXT_PUBLIC_API_URL}api/gallery/${image.id}`,
  {
    method: "PUT",
    body: JSON.stringify({ title, description }),
  }
);
      if (!response.ok) throw new Error();
      toast.success("Gambar diperbarui!");
      mutateList();
    } catch {
      toast.error("Gagal memperbarui.");
    } finally {
      setIsSaving(false);
    }
  };

const onInputChange = (handler: (val: string) => void, val: string) => {
  handler(val);
};

  return (
    <div
      // ref={setNodeRef} // Menghapus ref DND-Kit
      // style={style} // Menghapus style DND-Kit
      className="bg-white rounded-xl shadow group flex flex-col overflow-hidden relative"
    >
      <div className="relative h-48">
        <img
          src={buildImageUrl(
            process.env.NEXT_PUBLIC_API_URL || "",
            image.imageUrl
          )}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition duration-200" />
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onDelete(image)}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <Trash2 size={16} />
          </button>
          {/* Menghapus handle drag: <div {...attributes} {...listeners}>...</div> */}
        </div>
        {isSaving && (
          <div className="absolute top-2 left-2 p-2 bg-sky-600 text-white rounded-full">
            <Spinner size="sm" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => onInputChange(setTitle, e.target.value)}
          className="text-base font-semibold border-b border-gray-200 focus:border-sky-500 focus:outline-none p-1"
          placeholder="Judul Gambar"
        />
        <textarea
          value={description}
          onChange={(e) => onInputChange(setDescription, e.target.value)}
          rows={2}
          className="text-sm text-gray-600 border-b border-gray-100 focus:border-sky-500 focus:outline-none p-1 resize-none"
          placeholder="Deskripsi"
        />
<button
    onClick={handleUpdate}
    disabled={isSaving}
    className="self-end mt-2 px-3 py-1.5 bg-sky-600 text-white text-sm font-medium rounded hover:bg-sky-700 disabled:opacity-50 flex items-center gap-1"
  >
    {isSaving ? <Spinner size="sm" /> : <Save size={16} />}
    Simpan
  </button>
      </div>
    </div>
  );
}
function GalleryContent() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/gallery`;
  const {
    data: images = [],
    isLoading,
    error,
    mutate,
  } = useSWR<GalleryImage[]>(apiUrl, fetcher);

  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null); // ? Tambahin ini
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ? Tambahin ini


  useEffect(() => {
    if (images.length > 0) {
      // Kita tetap mengurutkan berdasarkan 'order' untuk konsistensi tampilan awal
      // meskipun fitur drag-and-drop dihilangkan.
      setGalleryItems([...images].sort((a, b) => a.order - b.order));
      // setHasOrderChanged(false); // Menghapus ini
    } else {
      setGalleryItems([]); // Jika tidak ada gambar, set ke array kosong
    }
  }, [images]);


  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("galleryImages", f));
    const toastId = toast.loading("Mengunggah gambar...");

    try {
      const res = await fetchWithAuth(`${apiUrl}/upload`, {
  method: "POST",
  body: formData,
});
      if (!res.ok) throw new Error();
      toast.success("Upload berhasil!", { id: toastId });
      mutate();
    } catch {
      toast.error("Upload gagal.", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  const confirmDelete = (img: GalleryImage) => {
    setSelectedImage(img);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!selectedImage) return;
    try {
      const res = await fetchWithAuth(`${apiUrl}/${selectedImage.id}`, {
  method: "DELETE",
});
      if (!res.ok) throw new Error();
      toast.success("Gambar dihapus!");
      mutate();
    } catch {
      toast.error("Gagal menghapus.");
    } finally {
      setShowDeleteModal(false);
      setSelectedImage(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">Gagal memuat data</div>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          {/* header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-sky-700">Kelola Galeri</h1>
              <p className="text-gray-500 mt-1">
                Unggah, dan beri keterangan pada gambar Anda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Menghapus tombol Simpan Urutan */}
              {/* <button
                onClick={handleSaveOrder}
                disabled={!hasOrderChanged || isSavingOrder}
                className={flex items-center justify-center gap-2 px-2 py-2 font-semibold rounded-lg transition ${
                  hasOrderChanged
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }}
              >
                {isSavingOrder ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Simpan Urutan
              </button> */}

              <label className="flex items-center justify-center gap-2 px-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 cursor-pointer">
                <ImageUp size={16} />
                <span>Unggah Gambar</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleUpload}
                />
              </label>

            </div>
          </div>

          {/* content */}
          {isLoading ? (
            <div className="text-center p-16">
              <Spinner size="lg" />
            </div>
          ) : (
            // Menghapus DndContext
            // <DndContext
            //   sensors={sensors}
            //   collisionDetection={closestCenter}
            //   onDragEnd={handleDragEnd}
            // >
            // Menghapus SortableContext
            // <SortableContext
            //   items={galleryItems.map((item) => item.id)}
            //   strategy={rectSortingStrategy}
            // >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryItems.length > 0 ? (
                galleryItems.map((img) => (
                  <ImageCard // Menggunakan ImageCard bukan SortableImageCard
                    key={img.id}
                    image={img}
                    mutateList={mutate}
                    onDelete={confirmDelete}
                  />
                ))
              ) : (
                <div className="col-span-full text-center p-16">
                  <ImageIcon
                    size={64}
                    className="text-sky-300 mb-4 mx-auto"
                  />
                  <h3 className="text-xl font-semibold text-sky-800">
                    Galeri Masih Kosong
                  </h3>
                  <p className="text-sky-700 mt-2">
                    Klik "Unggah Gambar" untuk menambahkan foto pertama Anda.
                  </p>
                </div>
              )}
            </div>
            // </SortableContext>
            // </DndContext>
          )}
        </div>

        {/* modal delete */}
        {showDeleteModal && selectedImage && (
          <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-semibold text-red-600 mb-2">
                Hapus Gambar
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Yakin ingin menghapus gambar{" "}
                <strong>{selectedImage.title}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded border text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <GalleryContent />
    </Suspense>
  );
}