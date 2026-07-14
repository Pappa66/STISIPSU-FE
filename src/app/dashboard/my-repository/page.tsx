"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import useSWR, { mutate } from "swr";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import {
  PlusCircle,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Info,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { formatAuthorName } from "@/utils/formatters";

// --- Tipe Data ---
interface MyRepositoryItem {
  id: string;
  title: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  updatedAt: string;
  advisor: { name: string } | null;
}
interface Prerequisites {
  studentName: string;
  studyProgram: string | null;
  advisorName: string | null;
}
interface FileToUpload {
  file: File;
  alias: string;
}

// --- Fetcher untuk SWR ---
const fetcher = (url: string, token: string | null) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

// --- Komponen ---
const StatusBadge = ({
  status,
}: {
  status: MyRepositoryItem["approvalStatus"];
}) => {
  const baseClass =
    "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border";
  switch (status) {
    case "APPROVED":
      return (
        <span
          className={`${baseClass} border-green-300 bg-green-50 text-green-700`}
        >
          <CheckCircle size={14} /> Disetujui
        </span>
      );
    case "REJECTED":
      return (
        <span className={`${baseClass} border-red-300 bg-red-50 text-red-700`}>
          <XCircle size={14} /> Revisi
        </span>
      );
    default:
      return (
        <span
          className={`${baseClass} border-yellow-300 bg-yellow-50 text-yellow-700`}
        >
          <Clock size={14} /> Pending
        </span>
      );
  }
};

const UploadModal = ({
  isOpen,
  onClose,
  mutateList,
  editItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  mutateList: () => void;
  editItem?: MyRepositoryItem | null;
}) => {
  const { token } = useAuthStore();
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    year: new Date().getFullYear().toString(),
    gdriveLink: "",
  });
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: prereqs } = useSWR<Prerequisites>(
    isOpen && token
      ? `${process.env.NEXT_PUBLIC_API_URL}api/users/submission-prerequisites`
      : null,
    (url: string) => fetcher(url, token)
  );

  // ✅ Pre-fill saat edit
  React.useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title,
        abstract: "",
        keywords: "",
        year: new Date(editItem.updatedAt).getFullYear().toString(),
        gdriveLink: "",
      });
    }
  }, [editItem]);

  // ✅ Handle file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        alias: file.name.split(".").slice(0, -1).join(".") || file.name,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleAliasChange = (index: number, newAlias: string) => {
    setFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, alias: newAlias } : item))
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && !formData.gdriveLink) {
      setError(
        "Unggah minimal satu file atau sediakan satu Link Google Drive."
      );
      return;
    }

    if (!prereqs?.advisorName) {
      setError("Tidak dapat mengunggah: Dosen pembimbing belum ditentukan.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const submissionData = new FormData();
    submissionData.append("title", formData.title);
    submissionData.append("abstract", formData.abstract);
    submissionData.append("keywords", formData.keywords);
    submissionData.append("year", formData.year);
    submissionData.append("author", formatAuthorName(prereqs.studentName));
    submissionData.append("studyProgram", prereqs.studyProgram || "");

    if (formData.gdriveLink) {
      submissionData.append("gdriveLink", formData.gdriveLink);
    }

    if (files.length > 0) {
      const filesMetadata = files.map((f) => ({
        originalName: f.file.name,
        alias: f.alias,
      }));
      submissionData.append("filesMetadata", JSON.stringify(filesMetadata));
      files.forEach((f) => submissionData.append("files", f.file));
    }

    try {
      const endpoint = editItem
        ? `${process.env.NEXT_PUBLIC_API_URL}api/my-repository/${editItem.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}api/my-repository`;

      const method = editItem ? "put" : "post";

      const res = await axios({
        url: endpoint,
        method,
        data: submissionData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(res.data.message);
      mutateList();

      setTimeout(() => {
        onClose();
        setFormData({
          title: "",
          abstract: "",
          keywords: "",
          year: new Date().getFullYear().toString(),
          gdriveLink: "",
        });
        setFiles([]);
        setSuccess("");
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal mengunggah.");
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl text-gray-800 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editItem ? "Edit & Kirim Ulang" : "Unggah Karya Ilmiah Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Identitas Mahasiswa */}
          <div className="p-4 bg-gray-50 border rounded-lg">
            {prereqs ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Penulis</p>
                    <p className="font-semibold">
                      {formatAuthorName(prereqs.studentName)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Program Studi</p>
                    <p className="font-semibold">{prereqs.studyProgram}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dosen Pembimbing</p>
                    <p className="font-semibold">
                      {prereqs.advisorName || "-"}
                    </p>
                  </div>
                </div>
                {!prereqs.advisorName && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md">
                    <Info size={20} className="shrink-0" />
                    <span>
                      Dosen pembimbing belum ditentukan. Anda tidak dapat
                      mengunggah sebelum ditambahkan ke daftar bimbingan.
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-sm text-gray-600">
                Memuat data otomatis...
              </div>
            )}
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Judul</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tahun</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Abstrak</label>
            <textarea
              value={formData.abstract}
              onChange={(e) =>
                setFormData({ ...formData, abstract: e.target.value })
              }
              rows={4}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Kata Kunci
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) =>
                setFormData({ ...formData, keywords: e.target.value })
              }
              placeholder="Pisahkan dengan koma"
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Upload Section */}
          <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <h3 className="font-semibold">Metode Unggah</h3>
            <p className="text-xs text-gray-500">
              Anda dapat mengunggah file langsung dan juga menyertakan link
              Google Drive sebagai cadangan.
            </p>

            {/* Upload File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. File Langsung (PDF)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="application/pdf"
                className="block w-full text-sm text-gray-500"
              />
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-100 rounded-md"
                    >
                      <FileText size={18} className="text-gray-500" />
                      <input
                        type="text"
                        value={item.alias}
                        onChange={(e) =>
                          handleAliasChange(index, e.target.value)
                        }
                        className="flex-grow p-1 text-sm border rounded"
                      />
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Google Drive Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. Link Google Drive (Cadangan)
              </label>
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                <Info size={18} className="mt-0.5" />
                Pastikan file Google Drive Anda dibagikan dengan akses publik
                (lihat saja).
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={formData.gdriveLink}
                  onChange={(e) =>
                    setFormData({ ...formData, gdriveLink: e.target.value })
                  }
                  placeholder="https://drive.google.com/..."
                  className="pl-10 pr-3 py-2 w-full border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 border border-green-200 rounded-md">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">
              ⚠️ {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !prereqs?.advisorName}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 disabled:bg-gray-400 transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Kirim untuk Direview"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MyRepositoryPage() {
  const { token } = useAuthStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editItem, setEditItem] = useState<MyRepositoryItem | null>(null);

  const apiUrl = token
    ? `${process.env.NEXT_PUBLIC_API_URL}api/my-repository`
    : null;
  const {
    data: items = [],
    error,
    isLoading,
    mutate,
  } = useSWR<MyRepositoryItem[]>(apiUrl, (url: string) => fetcher(url, token));

  if (error)
    return (
      <div className="container py-12 text-center text-red-500">
        Error: Gagal memuat data.
      </div>
    );
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          {" "}
          <div className="container py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Karya Ilmiah Saya</h1>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition-all"
              >
                <PlusCircle size={18} /> Unggah Baru
              </button>
            </div>
            <div className="space-y-4">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-lg border border-sky-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-sky-700">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Pembimbing:{" "}
                          <span className="font-medium">
                            {item.advisor?.name || "Belum ada"}
                          </span>{" "}
                          | Update:{" "}
                          <span className="font-medium">
                            {new Date(item.updatedAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.approvalStatus} />
                        {item.approvalStatus === "REJECTED" && (
                          <button
                            onClick={() => {
                              setEditItem(item); // ✅ Set data yang mau di-edit
                              setShowUploadModal(true); // ✅ Buka modal
                            }}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-full"
                            title="Edit & Kirim Ulang"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    {item.approvalStatus === "REJECTED" && (
                      <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
                        <strong>Catatan Revisi:</strong> {item.rejectionReason}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-16 bg-white rounded-lg border-dashed border-2">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Anda Belum Mengunggah Apapun
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Klik tombol "Unggah Baru" untuk memulai.
                  </p>
                </div>
              )}
            </div>
          </div>
          <UploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              setEditItem(null);
            }}
            mutateList={mutate}
            editItem={editItem}
          />
        </div>
      </div>
    </main>
  );
}
