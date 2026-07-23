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

const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Data tidak ditemukan");
    return res.json();
  });

const typeDescriptions: Record<MenuType, { label: string; desc: string; hint: string }> = {
  INTERNAL: {
    label: "Halaman Internal (dari Konten)",
    desc: "Menu mengarah ke halaman dinamis yang kontennya dikelola Admin via editor blok.",
    hint: "Setelah memilih ini, buka/edit konten halaman melalui link yang muncul di bawah.",
  },
  STATIC_PATH: {
    label: "Path Halaman Statis",
    desc: "Menu mengarah ke halaman bawaan website, seperti /, /berita, /repository, /galeri, /kontak, /kalender.",
    hint: "Isi path diawali /, contoh: /berita. Tidak boleh berupa URL lengkap.",
  },
  EXTERNAL: {
    label: "Link Eksternal",
    desc: "Menu mengarah ke situs luar, seperti website PMB, Google Drive, atau media sosial.",
    hint: "Isi URL lengkap dengan https://, contoh: https://pmb.stisipsukabumi.ac.id",
  },
};

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.menuId as string;
  const { refreshMenus } = useAuthStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<MenuType>("INTERNAL");
  const [href, setHref] = useState("");
  const [icon, setIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/menu-items/${menuId}`;
  const {
    data: menuItem,
    error,
    isLoading,
  } = useSWR<NavItem | SubMenuItem>(apiUrl, fetcher);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setType(menuItem.type || "INTERNAL");
      setHref(menuItem.href || "");
      setIcon((menuItem as any).icon || "");
    }
  }, [menuItem]);

  const hasSubmenus = "submenus" in (menuItem || {}) && (menuItem as NavItem).submenus?.length > 0;

  const validate = (): string | null => {
    if (type === "STATIC_PATH") {
      if (!href.startsWith("/")) return "Path statis harus diawali dengan / (contoh: /berita)";
      if (href.includes("://")) return "Path statis tidak boleh berisi URL lengkap. Gunakan path seperti /berita";
    }
    if (type === "EXTERNAL") {
      if (!href.startsWith("http://") && !href.startsWith("https://"))
        return "URL eksternal harus diawali http:// atau https://";
      if (href.startsWith("/")) return "URL eksternal tidak boleh diawali /. Gunakan URL lengkap seperti https://contoh.com";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    const isSubmenu = "menuItemId" in menuItem;
    const payload: any = {
      name,
      type,
      href: type === "EXTERNAL" || type === "STATIC_PATH" ? href : null,
      icon: icon || null,
    };

    if (type === "INTERNAL" && !hasSubmenus) {
      const currentPostId = (menuItem as any).post?.id || null;
      if (currentPostId) payload.postId = currentPostId;
    }

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

  const currentDesc = typeDescriptions[type];

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
              {hasSubmenus ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Jenis Menu</label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">Induk</span>
                      <span className="text-sm font-semibold text-gray-800">Menu Induk (Kategori)</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Menu ini memiliki {(menuItem as NavItem).submenus?.length || 0} sub menu, sehingga berfungsi sebagai kategori/induk.
                      Menu induk tidak memiliki link — klik pada nama menu di navigasi akan membuka sub menu pertama.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Nama dan ikon bisa diubah. Untuk mengubah jenis atau link, hapus semua sub menu terlebih dahulu.
                    </p>
                  </div>
                </div>
              ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Link</label>
                <fieldset className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${type === "INTERNAL" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                    <input
                      type="radio"
                      name="type"
                      value="INTERNAL"
                      checked={type === "INTERNAL"}
                      onChange={() => setType("INTERNAL")}
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">
                        {typeDescriptions.INTERNAL.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {typeDescriptions.INTERNAL.desc}
                      </p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${type === "STATIC_PATH" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                    <input
                      type="radio"
                      name="type"
                      value="STATIC_PATH"
                      checked={type === "STATIC_PATH"}
                      onChange={() => setType("STATIC_PATH")}
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">{typeDescriptions.STATIC_PATH.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{typeDescriptions.STATIC_PATH.desc}</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${type === "EXTERNAL" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                    <input
                      type="radio"
                      name="type"
                      value="EXTERNAL"
                      checked={type === "EXTERNAL"}
                      onChange={() => setType("EXTERNAL")}
                      className="h-4 w-4 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">{typeDescriptions.EXTERNAL.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{typeDescriptions.EXTERNAL.desc}</p>
                    </div>
                  </label>
                </fieldset>
                <p className="text-xs text-gray-400 mt-2">{currentDesc.hint}</p>
              </div>

              {type === "INTERNAL" && !hasSubmenus && menuItem.post?.id && (
                <div>
                  <label className="block text-sm font-medium">
                    Konten Halaman
                  </label>
                  <Link
                    href={`/dashboard/editor/${menuItem.post.id}`}
                    className="mt-1 text-sm text-blue-600 hover:underline block"
                  >
                    Klik di sini untuk mengedit konten halaman ini
                  </Link>
                </div>
              )}
              {type === "INTERNAL" && !hasSubmenus && !menuItem.post?.id && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  Menu ini belum memiliki halaman. Setelah disimpan, halaman akan otomatis dibuat dan link edit akan muncul di sini.
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
                  <p className="text-xs text-gray-400 mt-1">Harus diawali /, contoh: /berita, /repository, /galeri</p>
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
                  <p className="text-xs text-gray-400 mt-1">Harus URL lengkap dengan https://, contoh: https://pmb.stisipsukabumi.ac.id</p>
                </div>
              )}
              {type === "INTERNAL" && !hasSubmenus && (
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
