"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { DynamicIcon, commonIconNames } from "@/lib/iconMap";

export default function CreateMenuModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmenu = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon?: string) => void;
  isSubmenu?: boolean;
}) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    onSubmit(name.trim(), selectedIcon || undefined);
    setName("");
    setSelectedIcon("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
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
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ikon (opsional)
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonIconNames.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setSelectedIcon(selectedIcon === iconName ? "" : iconName)}
              className={`p-2 rounded-lg border transition-all ${
                selectedIcon === iconName
                  ? "border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-200"
                  : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700"
              }`}
              title={iconName}
            >
              <DynamicIcon name={iconName} className="w-5 h-5" />
            </button>
          ))}
        </div>
        {selectedIcon && (
          <p className="text-xs text-gray-400 mb-4">
            Ikon dipilih: <span className="text-sky-600 font-mono">{selectedIcon}</span>
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
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
