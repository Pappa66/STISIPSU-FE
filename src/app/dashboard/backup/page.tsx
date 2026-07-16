"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { Database, Download, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function BackupPage() {
  const { token } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [format, setFormat] = useState("json");
  const [includeFiles, setIncludeFiles] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("format", format);
      if (selectedYear) params.set("year", selectedYear);
      if (includeFiles) params.set("files", "true");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}api/backup/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const suffix = selectedYear ? `tahun-${selectedYear}` : new Date().toISOString().split('T')[0];
      link.setAttribute('download', `stisipsu-backup-${suffix}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setLastBackup(`${format.toUpperCase()} — ${selectedYear ? `Tahun ${selectedYear}` : "Semua data"} — ${new Date().toLocaleString('id-ID')}`);
    } catch (err) {
      alert('Gagal mengexport database.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Database className="h-8 w-8 text-sky-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Backup Database</h1>
              <p className="text-sm text-gray-500">
                Ekspor data repository ke file yang bisa diunduh.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border max-w-xl space-y-5">
            {/* Tahun */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Semua Data (lengkap)</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Format File</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "json", label: "JSON", desc: "Struktur data mentah" },
                  { value: "sql", label: "SQL", desc: "Query INSERT untuk restore" },
                  { value: "zip", label: "ZIP", desc: "JSON + SQL dalam satu file" },
                ].map((f) => (
                  <label
                    key={f.value}
                    className={`flex-1 min-w-[120px] p-3 rounded-lg border-2 cursor-pointer transition ${
                      format === f.value
                        ? "border-sky-500 bg-sky-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={f.value}
                      checked={format === f.value}
                      onChange={() => setFormat(f.value)}
                      className="sr-only"
                    />
                    <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Termasuk File */}
            {format === "zip" && (
              <label className="flex items-start gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeFiles}
                  onChange={(e) => setIncludeFiles(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Sertakan file (gambar, PDF, dll)</p>
                  <p className="text-xs text-gray-500">Unduh semua file dari Supabase storage. Proses lebih lama tergantung jumlah file.</p>
                </div>
              </label>
            )}

            {/* Detail isi per format */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 space-y-2">
              <p className="font-semibold">Detail isi backup:</p>

              {format !== "zip" && (
                <div>
                  <p className="font-medium">📄 {format.toUpperCase()} — Hanya data tabel:</p>
                  <ul className="list-disc list-inside ml-1 mt-0.5 space-y-0.5">
                    <li><strong>user</strong> — semua akun (Admin, Dosen, Mahasiswa), prodi, NPM, NPD</li>
                    <li><strong>repositoryItem + fileItem</strong> — karya ilmiah, status approval, metadata file</li>
                    <li><strong>post</strong> — halaman, berita, konten (blocks), tags, slug</li>
                    <li><strong>menuItem + subMenuItem</strong> — navigasi publik + icon</li>
                    <li><strong>banner + galleryImage</strong> — banner slider, galeri foto</li>
                    <li><strong>announcement</strong> — pengumuman pop-up</li>
                    <li><strong>bimbingan + notification</strong> — relasi dosen-mahasiswa, notifikasi</li>
                    <li><strong>setting</strong> — pengaturan kontak</li>
                  </ul>
                  <p className="mt-1 text-blue-600">❌ File asli (PDF, gambar) tidak ikut — hanya URL penyimpanannya.</p>
                </div>
              )}

              {format === "zip" && !includeFiles && (
                <div>
                  <p className="font-medium">📦 ZIP — Data tabel (JSON + SQL) dalam satu file:</p>
                  <ul className="list-disc list-inside ml-1 mt-0.5 space-y-0.5">
                    <li><strong>backup-xxxx.json</strong> — data tabel (sama seperti format JSON)</li>
                    <li><strong>backup-xxxx.sql</strong> — query INSERT untuk restore langsung ke database</li>
                  </ul>
                  <p className="mt-1 text-blue-600">❌ File asli tidak ikut. Centang <strong>"Sertakan file"</strong> untuk mengunduh file.</p>
                </div>
              )}

              {format === "zip" && includeFiles && (
                <div>
                  <p className="font-medium">📦 ZIP — Data tabel + file asli:</p>
                  <ul className="list-disc list-inside ml-1 mt-0.5 space-y-0.5">
                    <li><strong>backup-xxxx.json</strong> — data tabel</li>
                    <li><strong>backup-xxxx.sql</strong> — query INSERT</li>
                    <li><strong>file_manifest.json</strong> — daftar semua file yang berhasil/gagal diunduh</li>
                    <li><strong>files/repository/*.pdf</strong> — file karya ilmiah</li>
                    <li><strong>files/gallery/*</strong> — gambar galeri</li>
                    <li><strong>files/banners/*</strong> — gambar banner slider</li>
                    <li><strong>files/posts/*</strong> — gambar featured berita / halaman</li>
                    <li><strong>files/announcements/*</strong> — gambar pengumuman</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>Saran:</strong> Lakukan backup per tahun agar ukuran file tetap kecil. Sertakan file hanya jika benar-benar perlu (misalnya sebelum migrasi server).
              </p>
            </div>

            {lastBackup && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
                Backup terakhir: {lastBackup}
              </p>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:bg-gray-400 transition"
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              {isExporting ? "Mengexport..." : `Export ${format.toUpperCase()}${selectedYear ? ` (${selectedYear})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
