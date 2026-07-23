"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { NavItem, SubMenuItem, MenuType } from "@/types";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import toast from "react-hot-toast";
import { DynamicIcon, commonIconNames } from "@/lib/iconMap";

// Fetcher untuk SWR
const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Data tidak ditemukan");
    return res.json();
  });

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.menuId as string;
  const { token, refreshMenus } = useAuthStore();

  // State untuk form
  const [name, setName] = useState("");
  const [type, setType] = useState<MenuType>("INTERNAL");
  const [href, setHref] = useState("");
  const [icon, setIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gunakan SWR untuk mengambil data awal
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/menu-items/${menuId}`;
  const {
    data: menuItem,
    error,
    isLoading,
  } = useSWR<NavItem | SubMenuItem>(apiUrl, fetcher);

  // useEffect untuk mengisi form setelah data dari SWR tersedia
  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setType(menuItem.type || "INTERNAL");
      setHref(menuItem.href || "");
      setIcon((menuItem as any).icon || "");
    }
  }, [menuItem]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;

    setIsSubmitting(true);
    const isSubmenu = "menuItemId" in menuItem;
    const payload = {
      name,
      type,
      href: type === "EXTERNAL" || type === "STATIC_PATH" ? href : null,
      postId: type === "INTERNAL" ? (menuItem as any).post?.id || null : undefined,
      icon: icon || null,
    };

    // Perbaikan URL API
    const updateUrl = `${process.env.NEXT_PUBLIC_API_URL}api/${
      isSubmenu ? "submenus" : "menu-items"
    }/${menuId}`;

    try {
      const res = await fetchWithAuth(updateUrl, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Update gagal.");
      }
      refreshMenus();
      toast.success("Menu berhasil diperbarui!");
      router.push("/dashboard/menu");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error)
    return (
      <div className="text-center py-12 text-red-500">
        Gagal memuat data. Pastikan ID menu valid.
      </div>
    );
  if (isLoading || !menuItem)
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Edit Menu</h1>
              <Link
                href="/dashboard/menu"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
              >
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </div>

            <div className="p-6 space-y-6 border rounded-lg bg-card text-card-foreground">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Jenis Link</label>
                <fieldset className="mt-2 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="INTERNAL"
                      checked={type === "INTERNAL"}
                      onChange={() => setType("INTERNAL")}
                      className="h-4 w-4"
                    />
                    <span className="ml-3 text-sm">
                      Halaman Internal (dari Konten)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="STATIC_PATH"
                      checked={type === "STATIC_PATH"}
                      onChange={() => setType("STATIC_PATH")}
                      className="h-4 w-4"
                    />
                    <span className="ml-3 text-sm">Path Halaman Statis</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="EXTERNAL"
                      checked={type === "EXTERNAL"}
                      onChange={() => setType("EXTERNAL")}
                      className="h-4 w-4"
                    />
                    <span className="ml-3 text-sm">Link Eksternal</span>
                  </label>
                </fieldset>
              </div>

              {type === "INTERNAL" && menuItem.post?.id && (
                <div>
                  <label className="block text-sm font-medium">
                    Konten Halaman
                  </label>
                  <Link
                    href={`/dashboard/editor/${menuItem.post.id}`}
                    className="mt-1 text-sm text-blue-600 hover:underline block"
                  >
                    Klik di sini untuk mengedit
                  </Link>
                </div>
              )}
              {type === "STATIC_PATH" && (
                <div>
                  <label className="block text-sm font-medium">
                    Path Internal
                  </label>
                  <input
                    type="text"
                    placeholder="/repository"
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              )}
              {type === "EXTERNAL" && (
                <div>
                  <label className="block text-sm font-medium">
                    URL Eksternal
                  </label>
                  <input
                    type="url"
                    placeholder="https://contoh.com"
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              )}
              {type === "INTERNAL" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ikon Menu (opsional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonIconNames.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(icon === iconName ? "" : iconName)}
                        className={`p-2 rounded-lg border transition-all ${
                          icon === iconName
                            ? "border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-200"
                            : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700"
                        }`}
                        title={iconName}
                      >
                        <DynamicIcon name={iconName} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                  {icon && (
                    <p className="text-xs text-gray-400 mt-2">
                      Ikon: <span className="text-sky-600 font-mono">{icon}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center w-36 px-4 py-2 rounded-md border bg-blue-600 text-white disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Spinner /> : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
