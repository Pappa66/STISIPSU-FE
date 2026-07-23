"use client";

import React, { useState, useEffect, FormEvent, Suspense } from "react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import toast from "react-hot-toast";
import { Save, Info, Map, Mail, Phone } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ContactInfo {
  alamat: string;
  email: string;
  telepon: string;
  link_google_maps: string;
}

const fetcher = async (url: string): Promise<ContactInfo> => {
  const res = await fetchWithAuth(url);
  if (!res.ok) throw new Error("Gagal mengambil data kontak");
  return res.json();
};

function ContactPageContent() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/contact`;
  const { data, error, isLoading, mutate } = useSWR<ContactInfo>(
    apiUrl,
    fetcher
  );

  const [formData, setFormData] = useState<ContactInfo>({
    alamat: "",
    email: "",
    telepon: "",
    link_google_maps: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Gagal menyimpan data");

      toast.success("Informasi kontak berhasil diperbarui!");
      mutate(); // Refresh data
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
        Gagal memuat pengaturan kontak.
      </div>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-sky-700">
              Kelola Informasi Kontak
            </h1>
            <p className="text-gray-600 mt-2">
              Edit informasi yang akan tampil di halaman publik Kontak.
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 border-l-4 border-sky-600 bg-sky-50 text-sky-800 rounded-r-lg shadow-sm">
            <div className="flex gap-3">
              <Info size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Informasi</h4>
                <p className="text-sm">
                  Perubahan disimpan otomatis dan ditampilkan langsung di
                  halaman Kontak.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto space-y-6 sm:space-y-8 border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Alamat & Email */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="alamat"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                  >
                    <Map size={16} /> Alamat Lengkap
                  </label>
                  <textarea
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 border rounded-md text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                  >
                    <Mail size={16} /> Alamat Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Telepon & Maps */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="telepon"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                  >
                    <Phone size={16} /> Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    id="telepon"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="link_google_maps"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    Link Embed Google Maps
                  </label>
                  <textarea
                    id="link_google_maps"
                    name="link_google_maps"
                    value={formData.link_google_maps}
                    onChange={handleChange}
                    rows={4}
                    placeholder='<iframe src="..."></iframe>'
                    className="w-full p-3 border rounded-md text-xs font-mono shadow-sm focus:ring-sky-500 focus:border-sky-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste embed iframe dari Google Maps.
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
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

export default function ContactPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ContactPageContent />
    </Suspense>
  );
}

