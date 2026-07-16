"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { Database, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackupPage() {
  const { token } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}api/backup/export`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stisipsu-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString('id-ID'));
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
                Ekspor seluruh data database ke file JSON.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border max-w-xl">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Data yang akan diexport:</strong>
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5">
                <li>Semua pengguna (Admin, Dosen, Mahasiswa)</li>
                <li>Semua karya ilmiah & berkas</li>
                <li>Semua halaman, berita, postingan, pengumuman</li>
                <li>Semua menu, banner, galeri, footer, kontak</li>
                <li>Semua data notifikasi & bimbingan</li>
              </ul>
            </div>

            {lastBackup && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 mb-4">
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
              {isExporting ? "Mengexport..." : "Export Database"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
