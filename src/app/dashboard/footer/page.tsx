"use client";

import React, { useState, useEffect, FormEvent } from "react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import toast from "react-hot-toast";
import {
  Save,
  Info,
  Plus,
  Trash2,
  ExternalLink,
  GripVertical,
  Link2,
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface FooterLink {
  label: string;
  url: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterData {
  sections: FooterSection[];
}

const fetcher = async (url: string): Promise<FooterData> => {
  const res = await fetchWithAuth(url);
  if (!res.ok) throw new Error("Gagal mengambil data footer");
  return res.json();
};

function FooterPageContent() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/footer-links`;
  const { data, error, isLoading, mutate } = useSWR<FooterData>(
    apiUrl,
    fetcher
  );

  const [sections, setSections] = useState<FooterSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data?.sections) {
      setSections(data.sections);
    }
  }, [data]);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { title: "", links: [{ label: "", url: "", isExternal: true }] },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, title: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, title } : s))
    );
  };

  const addLink = (secIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, links: [...s.links, { label: "", url: "", isExternal: true }] }
          : s
      )
    );
  };

  const removeLink = (secIdx: number, linkIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, links: s.links.filter((_, j) => j !== linkIdx) }
          : s
      )
    );
  };

  const updateLink = (
    secIdx: number,
    linkIdx: number,
    field: keyof FooterLink,
    value: string | boolean
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? {
              ...s,
              links: s.links.map((l, j) =>
                j === linkIdx ? { ...l, [field]: value } : l
              ),
            }
          : s
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Gagal menyimpan data");
      toast.success("Footer links berhasil diperbarui!");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 text-center text-red-500">
        Gagal memuat pengaturan footer.
      </div>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-700">
                Kelola Footer Links
              </h1>
              <p className="text-gray-600 mt-2">
                Atur tautan dan section yang tampil di footer website.
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Tambah Section
            </button>
          </div>

          <div className="mb-6 p-4 border-l-4 border-sky-600 bg-sky-50 text-sky-800 rounded-r-lg shadow-sm">
            <div className="flex gap-3">
              <Info size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Informasi</h4>
                <p className="text-sm">
                  Setiap <strong>Section</strong> adalah satu kolom di footer.
                  Di dalamnya bisa ditambah/hapus <strong>Link</strong>.
                  Section dan link yang kosong akan otomatis tampil di publik.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {sections.length === 0 && (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                <Link2 size={48} className="mx-auto mb-3 opacity-50" />
                <p>Belum ada section.</p>
                <p className="text-sm">Klik "Tambah Section" untuk memulai.</p>
              </div>
            )}

            {sections.map((section, secIdx) => (
              <div
                key={secIdx}
                className="border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b">
                  <GripVertical
                    size={18}
                    className="text-gray-400 cursor-grab"
                  />
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(secIdx, e.target.value)}
                    placeholder="Judul Section (contoh: Tautan Lainnya)"
                    className="flex-1 bg-transparent font-semibold text-gray-800 border-none focus:outline-none focus:ring-0 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(secIdx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <div
                      key={linkIdx}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) =>
                              updateLink(secIdx, linkIdx, "label", e.target.value)
                            }
                            placeholder="Nama link"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) =>
                              updateLink(secIdx, linkIdx, "url", e.target.value)
                            }
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.isExternal || false}
                              onChange={(e) =>
                                updateLink(
                                  secIdx,
                                  linkIdx,
                                  "isExternal",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <ExternalLink size={14} />
                            Eksternal
                          </label>
                          <button
                            type="button"
                            onClick={() => removeLink(secIdx, linkIdx)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                            title="Hapus link"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLink(secIdx)}
                    className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 font-medium transition-colors"
                  >
                    <Plus size={14} /> Tambah Link
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-2 w-full sm:w-auto rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:bg-gray-400 transition-all"
              >
                {isSubmitting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Save size={16} /> Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function FooterPage() {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <FooterPageContent />
    </React.Suspense>
  );
}
