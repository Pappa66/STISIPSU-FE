"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  UserPlus,
  Upload,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Tipe data untuk hasil bulk import
interface BulkImportDetails {
  success: string[];
  alreadyExists: string[];
  notFound: string[];
}

// Komponen untuk menambah satu mahasiswa
const AddSingleStudent = ({ token }: { token: string | null }) => {
  const [userCode, setUserCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}api/advisor/students`,
        { userCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setUserCode("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal menambahkan mahasiswa.");
      } else {
        setError("Terjadi kesalahan yang tidak terduga.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Tambah Satuan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="userCode"
            className="block text-sm font-medium text-gray-700"
          >
            Kode Pengguna Mahasiswa
          </label>
          <input
            type="text"
            id="userCode"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder="Contoh: MHS-IP-123-2021"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <UserPlus size={16} />
          )}
          {isLoading ? "Menambahkan..." : "Tambah Mahasiswa"}
        </button>
        {message && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-md mt-4">
            <CheckCircle size={16} />
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-md mt-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

// Komponen untuk menambah mahasiswa secara massal
const AddBulkStudents = ({ token }: { token: string | null }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [details, setDetails] = useState<BulkImportDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    setIsDownloading(true);
    try {
      const workbook = XLSX.utils.book_new();
      const headers = ["KODE_PENGGUNA"];
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      worksheet["!cols"] = [{ wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template Bimbingan");
      XLSX.writeFile(workbook, "template_bimbingan.xlsx");
    } catch (err) {
      console.error("Gagal membuat template Excel:", err);
      alert("Gagal membuat template Excel.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Silakan pilih file Excel terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    setMessage("");
    setError("");
    setDetails(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}api/advisor/students/bulk`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(res.data.message);
      setDetails(res.data.details);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal mengunggah file.");
      } else {
        setError("Terjadi kesalahan yang tidak terduga.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Tambah Massal (Bulk)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md disabled:bg-gray-300"
        >
          {isDownloading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isDownloading ? "Membuat..." : "Unduh Template Excel"}
        </button>
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            Unggah File Excel
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Upload size={16} />
          )}
          {isLoading ? "Mengimpor..." : "Impor Data"}
        </button>
        {message && (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-md mt-4">
            {message}
          </div>
        )}
        {details && (
          <div className="text-sm space-y-2 mt-4">
            {details.success.length > 0 && (
              <div className="flex items-start gap-2 text-green-700 p-2 bg-green-50 rounded-md">
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                <strong>Berhasil:</strong> {details.success.join(", ")}
              </div>
            )}
            {details.alreadyExists.length > 0 && (
              <div className="flex items-start gap-2 text-yellow-700 p-2 bg-yellow-50 rounded-md">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <strong>Sudah Ada:</strong> {details.alreadyExists.join(", ")}
              </div>
            )}
            {details.notFound.length > 0 && (
              <div className="flex items-start gap-2 text-red-700 p-2 bg-red-50 rounded-md">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <strong>Tidak Ditemukan:</strong> {details.notFound.join(", ")}
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-md mt-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

// Komponen Utama Halaman
export default function AddAdvisedStudentPage() {
  const { token } = useAuthStore();

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Tambah Mahasiswa Bimbingan</h1>
              <p className="text-gray-600">
                Tambahkan mahasiswa satu per satu atau secara massal.
              </p>
            </div>
            <Link
              href="/dashboard/advising"
              className="flex items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft size={16} />
              Kembali ke Bimbingan
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AddSingleStudent token={token} />
            <AddBulkStudents token={token} />
          </div>
        </div>
      </div>
    </main>
  );
}
