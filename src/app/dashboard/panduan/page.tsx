"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
  ChevronDown, ChevronRight, BookOpen, Users, GraduationCap, Shield, FileText,
  Newspaper, Image, Speaker, LayoutDashboard, PhoneCall, Link2, UploadCloud,
  User, Briefcase, Search, BookCopy, Menu, Megaphone, ExternalLink, Save,
  Trash2, Edit, CheckCircle, XCircle, Clock, Eye, EyeOff, Download,
  GalleryVertical, Home, ArrowLeft, Globe, Lock, UserCheck, FileUp,
  Ruler, Quote, Lightbulb, FileImage, ChevronRight as ChevronRightIcon,
  Calendar, Plus,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "Sekilas Sistem",
    icon: BookOpen,
    content: [
      "Aplikasi ini adalah sistem manajemen konten dan repository untuk STISIP Syamsul Ulum Sukabumi.",
      "Terdapat 3 level pengguna: Admin (pengelola penuh), Dosen (pembimbing & reviewer), dan Mahasiswa (pengunggah karya ilmiah).",
      "Setiap level memiliki akses dan menu yang berbeda di sidebar setelah login.",
    ],
  },
  {
    id: "roles",
    title: "Hak Akses Berdasarkan Peran",
    icon: Users,
    children: [
      {
        title: "Admin",
        icon: Shield,
        color: "text-red-600",
        desc: "Akses penuh ke seluruh fitur: kelola pengguna, konten, banner, galeri, menu, repository, pengumuman, footer, dan pengaturan lainnya.",
      },
      {
        title: "Dosen",
        icon: GraduationCap,
        color: "text-indigo-600",
        desc: "Bertindak sebagai pembimbing akademik dan reviewer repository mahasiswa. Dapat menambah mahasiswa bimbingan, melihat kiriman, menyetujui atau merevisi karya ilmiah.",
      },
      {
        title: "Mahasiswa",
        icon: User,
        color: "text-sky-600",
        desc: "Mengunggah dan mengelola karya ilmiah sendiri. Melihat status pengajuan (pending/disetujui/revisi) dan mengedit jika diminta revisi.",
      },
    ],
  },
  {
    id: "admin",
    title: "Menu Admin",
    icon: Shield,
    children: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        desc: "Halaman utama setelah login. Menampilkan statistik: jumlah pengguna, berita terbit, repository, galeri. Juga grafik submission 6 bulan, ringkasan status repository, dan aktivitas terbaru.",
      },
      {
        title: "Mahasiswa — Kelola Mahasiswa",
        icon: Users,
        desc: "Manajemen data mahasiswa. Fitur: tambah manual, import Excel, export data, edit, reset password, hapus. Filter berdasarkan program studi dan tahun masuk.",
        actions: [
          "Tambah Baru: isi form nama, email, password, prodi, NPM, tahun masuk",
          "Import: upload file Excel dengan template yang sudah disediakan",
          "Export: unduh data mahasiswa terfilter",
          "Edit: ubah data mahasiswa",
          "Reset Password: set password baru",
          "Hapus: hapus akun mahasiswa",
        ],
      },
      {
        title: "Dosen — Kelola Dosen",
        icon: GraduationCap,
        desc: "Manajemen data dosen. Sama seperti mahasiswa, dengan field NPD/NIDN sebagai pengganti NPM/prodi/tahun.",
        actions: [
          "Tambah, import, export, edit, reset password, hapus",
          "Pastikan setiap dosen memiliki NPD/NIDN yang valid",
        ],
      },
      {
        title: "Admin — Kelola Admin",
        icon: Shield,
        desc: "Manajemen akun admin. Admin memiliki hak akses tertinggi.",
      },
      {
        title: "Halaman — Kelola Halaman Statis",
        icon: FileText,
        desc: "Mengedit konten halaman yang terhubung ke menu navigasi. Halaman dibuat otomatis dari menu. Klik tombol Edit untuk membuka editor blok.",
      },
      {
        title: "Berita — Kelola Berita & Artikel",
        icon: Newspaper,
        desc: "Membuat, mengedit, dan mempublikasikan berita atau artikel.",
        actions: [
          "Tambah Berita: buka modal untuk membuat berita baru",
          "Toggle Terbit/Draf: nyalakan/matikan publikasi",
          "Edit: buka editor blok untuk edit konten",
          "Hapus: hapus berita permanen",
          "Cari: filter berdasarkan judul",
        ],
        details: [
          "Featured Image: gambar utama berita. Di halaman detail, gambar ditampilkan tanpa crop paksa — landscape & portrait ditampilkan proporsional dengan batas tinggi maksimal 70% layar.",
          "Galeri Gambar: jika berita mengandung beberapa gambar (featured + inline), semua gambar bisa dijelajahi dengan tombol panah kiri/kanan dan indikator titik di bagian atas halaman detail.",
          "Klik gambar untuk membuka lightbox layar penuh. Navigasi dengan panah atau klik titik indikator.",
        ],
      },
      {
        title: "Banner — Kelola Banner Slider",
        icon: Image,
        desc: "Mengatur banner slider yang tampil di halaman depan website.",
        actions: [
          "Tambah: judul, subtitle, link URL (opsional), upload gambar",
          "Drag & drop: urutkan banner dengan seret",
          "Toggle aktif/nonaktif: tampilkan/sembunyikan banner",
          "Edit & Hapus",
        ],
      },
      {
        title: "Hero — Area Pendaftaran di Bawah Banner",
        icon: LayoutDashboard,
        desc: "Mengatur konten area promosi pendaftaran mahasiswa baru yang tampil di bawah banner slider.",
        fields: [
          "Judul, Subjudul, Deskripsi — teks promosi",
          "Gambar — upload gambar atau gunakan URL",
          "Link & Teks Tombol — tautan ke PMB eksternal",
          "Toggle Aktif: tampilkan/sembunyikan section ini",
        ],
      },
      {
        title: "Galeri — Kelola Galeri Foto",
        icon: GalleryVertical,
        desc: "Mengelola koleksi foto kegiatan kampus.",
        actions: [
          "Unggah Gambar: pilih satu atau banyak file",
          "Edit judul & deskripsi inline, klik Simpan",
          "Hapus: konfirmasi lalu hapus",
        ],
      },
      {
        title: "Pengumuman — Kelola Pop-up Pengumuman",
        icon: Megaphone,
        desc: "Mengatur pop-up pengumuman yang muncul di website publik. Tersedia 2 tipe: TEKS (konten tulisan) dan GAMBAR (upload gambar).",
        actions: [
          "Tambah: judul, pilih tipe (Teks/Gambar), isi konten, atur tanggal kedaluwarsa, aktifkan",
          "Edit & Hapus",
        ],
      },
      {
        title: "Menu — Manajemen Navigasi",
        icon: Menu,
        desc: "Mengatur struktur menu navigasi website. Menu bisa memiliki sub-menu (anak).",
        actions: [
          "Tambah Menu Utama: buat item navigasi baru",
          "Tambah Sub Menu: tambah item anak di bawah menu utama",
          "Drag & drop: urutkan menu dan sub-menu",
          "Edit: ubah properti menu (nama, link ke halaman, URL kustom, ikon)",
          "Hapus: hapus menu beserta sub-menunya",
        ],
      },
      {
        title: "Kontak — Informasi Kontak",
        icon: PhoneCall,
        desc: "Mengatur informasi kontak kampus yang tampil di halaman publik /kontak dan footer.",
        fields: ["Alamat Lengkap", "Email", "Telepon/WhatsApp", "Link Google Maps (embed iframe)"],
      },
      {
        title: "Footer — Tautan Footer",
        icon: Link2,
        desc: "Mengatur seluruh tautan dan section yang tampil di footer website. Bisa menambah/menghapus section (kolom) dan link di dalamnya.",
        actions: [
          "Tambah Section: buat kolom baru di footer (misal: Program Studi, Lembaga, dll)",
          "Tambah Link: tambah tautan di dalam section",
          "Toggle Eksternal: centang jika link membuka tab baru",
          "Hapus Section/Link",
          "Simpan: semua perubahan langsung tampil di publik",
        ],
      },
      {
        title: "Repository — Manajemen Repository",
        icon: BookCopy,
        desc: "Mengelola seluruh karya ilmiah yang diunggah. Admin bisa melihat, mencari, mengedit, menghapus, serta mengatur visibilitas dan unduhan publik.",
        actions: [
          "Search: cari berdasarkan judul",
          "Toggle Terbit/Draft: atur visibilitas (PUBLISHED/PRIVATE)",
          "Toggle Unduhan: izinkan/tolak unduhan publik",
          "Edit: buka halaman edit repository",
          "Hapus: hapus item beserta file-nya",
        ],
      },
    ],
  },
  {
    id: "mahasiswa",
    title: "Menu Mahasiswa",
    icon: User,
    children: [
      {
        title: "Repository Saya",
        icon: UploadCloud,
        desc: "Mengunggah dan mengelola karya ilmiah sendiri.",
        flow: [
          "Pastikan sudah memiliki Dosen Pembimbing (hubungi admin jika belum)",
          "Klik 'Unggah Baru'",
          "Isi: Judul, Tahun, Abstrak, Kata Kunci",
          "Upload file PDF (bisa lebih dari satu, beri nama setiap file)",
          "Atau beri link Google Drive sebagai cadangan",
          "Kirim — status otomatis 'Pending' menunggu review dosen",
        ],
        statuses: [
          { label: "Pending", icon: Clock, color: "text-yellow-600", desc: "Menunggu review dosen pembimbing" },
          { label: "Disetujui", icon: CheckCircle, color: "text-green-600", desc: "Karya sudah disetujui dan bisa tampil di publik" },
          { label: "Revisi", icon: XCircle, color: "text-red-600", desc: "Dosen meminta revisi. Lihat catatan revisi, edit, dan kirim ulang" },
        ],
      },
      {
        title: "Profil",
        icon: User,
        desc: "Melihat informasi akun dan mengganti password. Untuk perubahan nama/email, hubungi admin.",
      },
    ],
  },
  {
    id: "dosen",
    title: "Menu Dosen",
    icon: GraduationCap,
    children: [
      {
        title: "Bimbingan",
        icon: Briefcase,
        desc: "Mereview dan menyetujui karya ilmiah mahasiswa bimbingan.",
        flow: [
          "Lihat daftar mahasiswa bimbingan dengan jumlah item pending",
          "Klik mahasiswa untuk melihat semua kiriman",
          "Klik kiriman untuk melihat detail: abstrak, file, status",
          "Setujui: atur visibilitas (Publik/Private) dan izin unduhan publik",
          "Revisi: beri catatan revisi, mahasiswa akan melihat dan memperbaiki",
        ],
        actions: [
          "Tambah Mahasiswa: tambah bimbingan satu per satu (via kode pengguna) atau massal (via Excel)",
        ],
        statuses: [
          { label: "Pending", icon: Clock, color: "text-yellow-600", desc: "Belum direview" },
          { label: "Setujui", icon: CheckCircle, color: "text-green-600", desc: "Terima karya, atur visibilitas dan unduhan" },
          { label: "Revisi", icon: XCircle, color: "text-red-600", desc: "Tolak dengan catatan perbaikan" },
        ],
      },
      {
        title: "Profil",
        icon: User,
        desc: "Melihat informasi akun dan mengganti password.",
      },
    ],
  },
  {
    id: "repository",
    title: "Alur Repository (Lengkap)",
    icon: BookCopy,
    isLarge: true,
    content: [
      "Repository adalah fitur utama aplikasi ini. Berikut alur lengkap dari hulu ke hilir:",
    ],
    steps: [
      {
        step: 1,
        title: "Admin Mendaftarkan Pengguna",
        desc: "Admin membuat akun Mahasiswa dan Dosen melalui menu Mahasiswa/Dosen. Pastikan data NPM, program studi, dan tahun masuk benar.",
      },
      {
        step: 2,
        title: "Admin/Dosen Menambahkan Bimbingan",
        desc: "Dosen membuka menu Bimbingan → Tambah Mahasiswa. Bisa input satu per satu via kode pengguna (contoh: MHS-IP-123-2021) atau upload file Excel untuk massal.",
        note: "Mahasiswa tidak bisa mengunggah karya sebelum memiliki dosen pembimbing!",
      },
      {
        step: 3,
        title: "Mahasiswa Mengunggah Karya",
        desc: "Mahasiswa login, buka Repository Saya → Unggah Baru. Isi judul, tahun, abstrak, kata kunci. Upload file PDF (bisa beberapa file) atau link Google Drive.",
      },
      {
        step: 4,
        title: "Status: Pending",
        desc: "Setelah diunggah, karya masuk status Pending. Mahasiswa bisa melihatnya di Repository Saya. Karya belum tampil di publik.",
        status: "Pending",
      },
      {
        step: 5,
        title: "Dosen Mereview",
        desc: "Dosen login, buka Bimbingan → pilih mahasiswa. Lihat semua kiriman, klik untuk detail. Baca abstrak, lihat file.",
      },
      {
        step: 6,
        title: "Dosen Menyetujui atau Merevisi",
        desc: "Dua opsi:",
        options: [
          "Setujui: karya diterima. Atur visibilitas (Publik/Private) dan izin unduhan publik. Status jadi APPROVED.",
          "Revisi: karya ditolak sementara. Tulis catatan revisi. Status jadi REJECTED, mahasiswa bisa edit dan kirim ulang.",
        ],
      },
      {
        step: 7,
        title: "Mahasiswa Tindak Lanjut (Jika Revisi)",
        desc: "Jika kena revisi, mahasiswa lihat catatan, klik Edit, perbaiki, upload ulang file. Status kembali ke Pending.",
      },
      {
        step: 8,
        title: "Karya Tampil di Publik",
        desc: "Jika disetujui DAN visibilitas diatur ke PUBLISHED, karya muncul di halaman /repository website publik. Pengunjung bisa melihat, mencari, dan (jika diizinkan) mengunduh file.",
      },
    ],
    badges: [
      { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
      { label: "Disetujui", icon: CheckCircle, color: "bg-green-100 text-green-700" },
      { label: "Revisi", icon: XCircle, color: "bg-red-100 text-red-700" },
    ],
  },
  {
    id: "public",
    title: "Halaman Publik",
    icon: Globe,
    children: [
      { title: "Beranda", icon: Home, desc: "Halaman depan website. Menampilkan banner slider, highlight berita terbaru (3 item), highlight galeri, dan section PMB." },
      { title: "Berita", icon: Newspaper, desc: "Daftar semua berita yang telah diterbitkan. Ada pencarian dan pagination." },
      { title: "Repository", icon: BookCopy, desc: "Koleksi karya ilmiah yang sudah disetujui dan dipublikasikan. Bisa dicari, difilter tahun/prodi, dan diunduh." },
      { title: "Galeri", icon: GalleryVertical, desc: "Galeri foto kegiatan kampus." },
      { title: "Kontak", icon: PhoneCall, desc: "Informasi alamat, email, telepon, dan peta lokasi kampus." },
      { title: "Dosen", icon: GraduationCap, desc: "Direktori dosen dengan informasi kontak." },
      { title: "Pencarian", icon: Search, desc: "Pencarian global di seluruh konten website (berita, halaman, repository, galeri)." },
    ],
  },
  {
    id: "media",
    title: "Panduan Ukuran Media",
    icon: Ruler,
    children: [
      {
        title: "Banner Slider",
        icon: Image,
        desc: "Ukuran ideal: 1920 × 600 px. Rasio 3:1. Format JPG atau WebP. Maksimal 500 KB. Pastikan teks penting berada di area aman (center). Gunakan gambar dengan kontras tinggi agar teks overlay mudah dibaca.",
      },
      {
        title: "Featured Image Berita",
        icon: Newspaper,
        desc: "Ukuran ideal: 1200 × 630 px (landscape) atau 600 × 800 px (portrait). Format JPG/PNG/WebP. Maksimal 500 KB. Di halaman detail, gambar ditampilkan tanpa crop — landscape lebar penuh & portrait dibatasi tinggi 70% layar. Semua gambar dalam berita bisa dijelajahi via galeri/lightbox.",
      },
      {
        title: "Galeri Foto",
        icon: GalleryVertical,
        desc: "Ukuran ideal: 800 × 600 px (atau 4:3). Minimal 600 × 450 px. Format JPG/WebP. Maksimal 400 KB per gambar. Hindari ukuran terlalu besar karena akan memperlambat loading halaman galeri.",
      },
      {
        title: "Pengumuman (Gambar)",
        icon: Megaphone,
        desc: "Ukuran ideal: 600 × 400 px. Rasio 3:2. Format JPG/WebP. Maksimal 200 KB. Gambar akan tampil di pop-up pengumuman.",
      },
      {
        title: "Logo / Ikon",
        icon: FileImage,
        desc: "Ukuran: 200 × 200 px (minimal). Format PNG dengan background transparan. Ukuran file maksimal 100 KB.",
      },
    ],
  },
  {
    id: "citation",
    title: "APA & BibTeX (Sitasi Karya Ilmiah)",
    icon: Quote,
    children: [
      {
        title: "Apa itu APA?",
        icon: BookOpen,
        desc: "APA (American Psychological Association) adalah gaya penulisan sitasi yang banyak digunakan di dunia akademik, terutama untuk bidang ilmu sosial. Aplikasi ini menggunakan format APA edisi ke-7.",
        note: "Contoh format APA: Penulis, (Tahun). Judul Karya. Nama Institusi. URL",
        details: [
          "Gaya APA digunakan untuk sitasi dalam teks (in-text citation) dan daftar pustaka (references).",
          "Format buku: Nama Belakang, A. (Tahun). Judul. Penerbit.",
          "Format skripsi/tesis: Nama Belakang, A. (Tahun). Judul [Skripsi/Tesis]. Nama Universitas.",
          "Aplikasi akan otomatis menghasilkan sitasi APA berdasarkan data yang diisi di form repository.",
        ],
      },
      {
        title: "Apa itu BibTeX?",
        icon: FileText,
        desc: "BibTeX adalah format file referensi yang digunakan bersama LaTeX untuk mengelola daftar pustaka. Format ini menyimpan metadata referensi (penulis, judul, tahun, dll) dalam format teks terstruktur.",
        note: "Contoh entry BibTeX: @article{key, author = {Nama}, title = {Judul}, year = {2024} }",
        details: [
          "BibTeX banyak digunakan di dunia akademik untuk penulisan makalah, jurnal, dan disertasi.",
          "Format @article untuk jurnal, @book untuk buku, @mastersthesis untuk tesis/skripsi.",
          "Aplikasi menyediakan tombol 'Salin BibTeX' di halaman detail repository.",
          "Dosen dan mahasiswa bisa langsung menggunakan output BibTeX untuk referensi di dokumen LaTeX.",
        ],
      },
      {
        title: "Cara Menggunakan Fitur Sitasi",
        icon: Download,
        desc: "Fitur sitasi tersedia di halaman detail repository publik. Klik tombol 'Salin Sitasi APA' atau 'Salin BibTeX' untuk menyalih format ke clipboard. Paste langsung ke dokumen Anda.",
      },
    ],
  },
  {
    id: "kalender",
    title: "Kalender Pendidikan",
    icon: Calendar,
    children: [
      {
        title: "Akses Kalender",
        icon: Eye,
        desc: "Semua pengguna (Admin, Dosen, Mahasiswa) dapat melihat kalender pendidikan melalui menu sidebar 'Kalender'. Admin dapat menambah, mengedit, dan menghapus event.",
      },
      {
        title: "Tipe Event",
        icon: BookOpen,
        desc: "Terdapat 5 tipe event: Akademik (biru), Libur (merah), Ujian (oranye), Pendaftaran (hijau), dan Lainnya (abu-abu). Warna membantu membedakan jenis kegiatan secara visual.",
      },
      {
        title: "Cara Menambah Event (Admin)",
        icon: Plus,
        desc: "Klik 'Tambah Event', isi judul, pilih tanggal, tipe event, dan warna. Jika event berlangsung beberapa hari, isi tanggal selesai. Event akan langsung tampil di halaman publik /kalender.",
      },
      {
        title: "Tampilan Publik",
        icon: Globe,
        desc: "Halaman /kalender menampilkan grid bulanan dengan navigasi antar bulan. Klik tanggal tertentu untuk melihat detail event pada hari itu.",
      },
    ],
  },
  {
    id: "recommendations",
    title: "Rekomendasi & Rencana Pengembangan",
    icon: Lightbulb,
    children: [
      {
        title: "⏳ Rencana Pengembangan Selanjutnya",
        icon: Clock,
        desc: "Fitur-fitur berikut direncanakan untuk pengembangan ke depan:",
        items: [
          "Notifikasi In-App — Mahasiswa mendapat notifikasi (bell icon) saat karya direview, tanpa perlu SMTP/API eksternal. Alternatif gratis jika butuh email: Gmail SMTP (App Password), SendGrid (100/hari), Brevo (300/hari), atau Resend (100/hari).",
          "Multiple Reviewer — Dosen pembimbing + penguji untuk proses review dua tahap.",
          "Plagiarism Checker — Integrasi API pengecekan plagiarisme (bisa pakai PlagiarismChecker.net atau Turnitin API).",
          "Backup Database Otomatis — Cron job mingguan ke cloud storage (Google Drive, Dropbox, atau S3).",
        ],
      },
    ],
  },
];

function CollapsibleCard({ title, icon: Icon, defaultOpen = false, children }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-sky-600 shrink-0" />}
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronDown size={18} className="text-gray-400 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function GuideSection({ section }: any) {
  const [open, setOpen] = useState(false);

  if (section.steps) {
    return (
      <CollapsibleCard title={section.title} icon={section.icon} defaultOpen>
        <div className="space-y-4 mt-4">
          {section.content?.map((p: string, i: number) => (
            <p key={i} className="text-gray-600 text-sm leading-relaxed">{p}</p>
          ))}

          <div className="flex flex-wrap gap-3 mt-2">
            {section.badges?.map((b: any, i: number) => {
              const Icon = b.icon;
              return (
                <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${b.color}`}>
                  <Icon size={14} /> {b.label}
                </span>
              );
            })}
          </div>

          <div className="relative ml-4 pl-8 border-l-2 border-sky-200 space-y-6">
            {section.steps.map((step: any, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -left-[2.15rem] top-0 w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow">
                  {step.step}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{step.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{step.desc}</p>
                  {step.note && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                      ⚠️ {step.note}
                    </div>
                  )}
                  {step.options && (
                    <ul className="mt-2 space-y-2">
                      {step.options.map((o: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.status && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={12} /> {step.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleCard>
    );
  }

  if (section.children) {
    return (
      <CollapsibleCard title={section.title} icon={section.icon}>
        <div className="space-y-3 mt-4">
          {section.children.map((child: any, i: number) => (
            <CollapsibleCard key={i} title={child.title} icon={child.icon}>
              <div className="text-sm text-gray-600 space-y-3 mt-3">
                <p className="leading-relaxed">{child.desc}</p>

                {child.fields && (
                  <div>
                    <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Field:</p>
                    <ul className="space-y-1">
                      {child.fields.map((f: string, j: number) => (
                        <li key={j} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {child.actions && (
                  <div>
                    <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Aksi:</p>
                    <ul className="space-y-1">
                      {child.actions.map((a: string, j: number) => (
                        <li key={j} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {child.items && (
                  <div>
                    <ul className="space-y-2">
                      {child.items.map((item: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {child.details && (
                  <div>
                    <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Detail Teknis:</p>
                    <ul className="space-y-1">
                      {child.details.map((d: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {child.flow && (
                  <div>
                    <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Alur:</p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {child.flow.map((f: string, j: number) => (
                        <li key={j} className="text-sm text-gray-600">{f}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {child.statuses && (
                  <div>
                    <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-2">Status:</p>
                    <div className="space-y-2">
                      {child.statuses.map((s: any, j: number) => {
                        const Icon = s.icon;
                        return (
                          <div key={j} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Icon size={18} className={`${s.color} shrink-0 mt-0.5`} />
                            <div>
                              <span className={`font-semibold text-sm ${s.color}`}>{s.label}</span>
                              <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          ))}
        </div>
      </CollapsibleCard>
    );
  }

  return (
    <CollapsibleCard title={section.title} icon={section.icon}>
      <div className="space-y-2 mt-4">
        {section.content?.map((p: string, i: number) => (
          <p key={i} className="text-gray-600 text-sm leading-relaxed">{p}</p>
        ))}
      </div>
    </CollapsibleCard>
  );
}

export default function PanduanPage() {
  const { token } = useAuthStore();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ADMIN");

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setRole(decoded.role || "ADMIN");
    } catch {}
  }, [token]);

  const roleSectionMap: Record<string, string[]> = {
    ADMIN: sections.map((s) => s.id),
    MAHASISWA: ["overview", "mahasiswa", "repository", "public", "kalender", "citation"],
    DOSEN: ["overview", "dosen", "repository", "public", "kalender", "citation"],
  };

  const visibleIds = roleSectionMap[role] || roleSectionMap.ADMIN;

  const filtered = sections
    .filter((s) => visibleIds.includes(s.id))
    .filter((s) =>
      search ? JSON.stringify(s).toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
            <Link href="/dashboard" className="hover:text-sky-600 transition-colors">Dashboard</Link>
            <ChevronRightIcon size={14} />
            <span className="text-gray-600 font-medium">Panduan</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-sky-700">Panduan Penggunaan Aplikasi</h1>
              <p className="text-gray-500 mt-1">
                Penjelasan fungsi setiap menu, tombol, dan alur fitur.
              </p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari panduan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 pl-10 border rounded-lg text-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="space-y-4">
            {filtered.map((section) => (
              <GuideSection key={section.id} section={section} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Tidak ada hasil untuk "{search}"
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
