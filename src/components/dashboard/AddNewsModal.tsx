"use client";

import React, { useState } from "react";
import { fetchWithAuth } from "@/utils/api";
import { useRouter } from "next/navigation";
import Spinner from "../ui/Spinner";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function AddNewsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Judul tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/news`,
        {
          method: "POST",
          body: JSON.stringify({ title }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat berita");

      onClose();
      router.push(`/dashboard/editor/${data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-sky-700 mb-4">
          Tambah Berita Baru
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul Berita
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul berita..."
          className="w-full px-4 py-2 border rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
        />

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              isSubmitting
                ? "bg-sky-300 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Buat Berita"}
          </button>
        </div>
      </div>
    </div>
  );
}
