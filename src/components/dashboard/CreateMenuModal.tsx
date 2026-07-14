"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateMenuModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmenu = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isSubmenu?: boolean;
}) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    onSubmit(name.trim());
    setName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-sky-700 mb-4">
          Tambah {isSubmenu ? "Sub Menu" : "Menu Utama"}
        </h2>

        <input
          type="text"
          placeholder={`Nama ${isSubmenu ? "sub menu" : "menu utama"}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
        />

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-semibold"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
