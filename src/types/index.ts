// File: src/types/index.ts
// File ini mendefinisikan tipe data yang digunakan di seluruh aplikasi frontend.

export type UserRole = "ADMIN" | "MAHASISWA" | "DOSEN" | "public";

export type MenuType = "INTERNAL" | "EXTERNAL" | "STATIC_PATH";

// --- PERBAIKAN UTAMA DI SINI ---
// Definisikan satu tipe data untuk informasi post yang terhubung ke menu.
export interface PostInfo {
  id: string;
  slug: string | null; // Tambahkan properti 'slug' di sini
}

export interface SubMenuItem {
  id: string;
  name: string;
  order: number;
  type: MenuType;
  href: string | null;
  icon: string | null;
  post: PostInfo | null; // Gunakan tipe PostInfo yang baru
  postId: string | null;
  menuItemId: string;
}

export interface NavItem {
  id: string;
  name: string;
  order: number;
  type: MenuType;
  href: string | null;
  icon: string | null;
  post: PostInfo | null; // Gunakan tipe PostInfo yang baru
  postId: string | null;
  submenus: SubMenuItem[];
}

// --- Tipe data lain di bawah ini tidak perlu diubah ---

export interface FileItem {
  id: string;
  alias: string;
  fileName: string;
  fileUrl: string;
  downloads?: number;
}

// Tipe ini digunakan untuk halaman list dan card di repository publik
export interface RepositoryItem {
  id: string;
  title: string;
  author: string | { name: string };
  year?: number;
  studyProgram?: string;
  showDownloadsToPublic?: boolean;
  createdAt: string;
  publishedAt?: string;
  visibility?: "PUBLISHED" | "PRIVATE";
  uploader?: { name: string };
  views?: number;
  abstract?: string;
}

// Tipe ini digunakan untuk halaman detail repository
export interface RepositoryDetail extends RepositoryItem {
  abstract?: string | null;
  keywords?: string | null;
  files: FileItem[];
  publishedAt: string | null;
  advisor?: { name: string } | null;
  secondAdvisor?: { name: string } | null;
}
