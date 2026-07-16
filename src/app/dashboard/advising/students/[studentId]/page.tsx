"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import useSWR, { mutate } from "swr";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  Check,
  X,
  Eye,
  MessageSquare,
  Info,
  ChevronDown,
  ChevronRight,
  UserPlus,
} from "lucide-react";

// --- Types ---
interface FileItem {
  id: string;
  alias: string;
  fileUrl: string;
}
interface SubmissionItem {
  id: string;
  title: string;
  author: string;
  year: number;
  abstract: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  visibility: "PUBLISHED" | "PRIVATE";
  showDownloadsToPublic: boolean;
  rejectionReason: string | null;
  files: FileItem[];
  advisor: { name: string } | null;
  secondAdvisor: { name: string } | null;
}

interface Lecturer {
  id: string;
  name: string;
  nidn: string;
  userCode: string;
  email: string;
}

// --- SWR Fetcher ---
const fetcher = (url: string, token: string | null) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

// --- Status Badge Renderer ---
const getStatusBadge = (status: SubmissionItem["approvalStatus"]) => {
  const baseClass =
    "flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1";
  switch (status) {
    case "APPROVED":
      return (
        <span className={`${baseClass} bg-green-100 text-green-800`}>
          ✔️ Disetujui
        </span>
      );
    case "REJECTED":
      return (
        <span className={`${baseClass} bg-red-100 text-red-800`}>
          ✏️ Revisi
        </span>
      );
    default:
      return (
        <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
          ⏳ Pending
        </span>
      );
  }
};

const SubmissionCard = ({
  item,
  onReview,
}: {
  item: SubmissionItem;
  onReview: (id: string, payload: any) => Promise<void>;
}) => {
  const [rejectionReason, setRejectionReason] = useState(
    item.rejectionReason || ""
  );
  const [visibility, setVisibility] = useState(item.visibility);
  const [showDownloads, setShowDownloads] = useState(
    item.showDownloadsToPublic
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    toast.dismiss("status-toggle");
    toast(
      visibility === "PUBLISHED"
        ? "Visibilitas diubah ke Publik 🌐"
        : "Visibilitas diubah ke Privat 🔒",
      { id: "status-toggle" }
    );
  }, [visibility]);

  useEffect(() => {
    toast.dismiss("download-toggle");
    toast(
      showDownloads
        ? "Unduhan publik diaktifkan ⬇️"
        : "Unduhan publik dinonaktifkan 🚫",
      { id: "download-toggle" }
    );
  }, [showDownloads]);

  const handleReviewClick = async (action: "APPROVED" | "REJECTED") => {
    if (action === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Catatan revisi wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    const payload =
      action === "APPROVED"
        ? {
            approvalStatus: "APPROVED",
            visibility,
            showDownloadsToPublic: showDownloads,
          }
        : { approvalStatus: "REJECTED", rejectionReason };

    await onReview(item.id, payload);
    setIsSubmitting(false);
  };

 const renderFileLink = (file: FileItem) => {
  const isExternal = file.fileUrl?.startsWith("http");

  // Clean API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "";

  // Handle local or external file
  const url = isExternal
    ? file.fileUrl
    : `${baseUrl}/${file.fileUrl?.replace(/^\/+/, "")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-blue-600 hover:underline"
    >
      <Eye size={14} /> Lihat
    </a>
  );
};

  return (
    <div className="bg-white p-4 sm:p-6 border-t">
      <p className="text-gray-700 mb-4 text-sm">
        {item.abstract || "Tidak ada abstrak."}
      </p>

      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Berkas Terlampir:</h4>
        <ul className="space-y-2">
          {item.files.map((file) => (
            <li
              key={file.id}
              className="flex justify-between text-sm p-2 bg-gray-50 rounded-md"
            >
              <span>{file.alias}</span>
              {renderFileLink(file)}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4 mt-4 space-y-4">
        {/* ✅ Approve Section */}
        <div className="p-4 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-sm text-green-900">
              Publikasikan?
            </label>
            <button
              onClick={() =>
                setVisibility(
                  visibility === "PUBLISHED" ? "PRIVATE" : "PUBLISHED"
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                visibility === "PUBLISHED" ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  visibility === "PUBLISHED" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium text-sm text-green-900">
              Izinkan Unduhan Publik?
            </label>
            <button
              onClick={() => setShowDownloads(!showDownloads)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showDownloads ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showDownloads ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => handleReviewClick("APPROVED")}
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm font-semibold disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {isSubmitting ? "Memproses..." : "Setujui & Simpan"}
          </button>
        </div>

        {/* ❌ Reject Section */}
        <div className="p-4 bg-red-50 rounded-md border border-red-200">
          <label className="font-medium text-sm text-red-900 flex items-center gap-2 mb-2">
            <MessageSquare size={16} /> Catatan Revisi
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded-md text-sm"
            placeholder="Contoh: Abstrak perlu diperbaiki..."
          />
          <button
            onClick={() => handleReviewClick("REJECTED")}
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 text-sm font-semibold disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <X size={16} />
            )}
            {isSubmitting ? "Memproses..." : "Kirim Revisi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StudentSubmissionsPage() {
  const { token } = useAuthStore();
  const params = useParams();
  const studentId = params.studentId as string;

  const currentUserName = token
    ? (() => { try { return JSON.parse(atob(token.split('.')[1])).name; } catch { return ''; } })()
    : '';
  const [openSubmissionId, setOpenSubmissionId] = useState<string | null>(null);
  const [selectedSecondAdvisor, setSelectedSecondAdvisor] = useState("");
  const [assigningAdvisor, setAssigningAdvisor] = useState(false);

  const apiUrl = token
    ? `${process.env.NEXT_PUBLIC_API_URL}api/advisor/students/${studentId}/items`
    : null;

  const {
    data: items,
    error,
    isLoading,
    mutate,
  } = useSWR<SubmissionItem[]>(apiUrl, (url: string) => fetcher(url, token));

  const { data: lecturers } = useSWR<Lecturer[]>(
    token
      ? `${process.env.NEXT_PUBLIC_API_URL}api/users/lecturers`
      : null,
    (url: string) => fetcher(url, token)
  );

  // Ambil dosen pembimbing utama dari item pertama
  const mainAdvisor = items && items.length > 0 ? items[0].advisor : null;
  const currentSecondAdvisor = items && items.length > 0 ? items[0].secondAdvisor : null;
  const isMainAdvisor = mainAdvisor?.name === currentUserName;

  const handleToggleSubmission = (itemId: string) => {
    setOpenSubmissionId((prevId) => (prevId === itemId ? null : itemId));
  };

  const handleReview = async (itemId: string, payload: any) => {
    const promise = axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}api/advisor/items/${itemId}/review`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.promise(promise, {
      loading: "Menyimpan review...",
      success: "✅ Review berhasil disimpan",
      error: "❌ Gagal menyimpan review",
    });

    try {
      await promise;
      mutate();
    } catch (err) {
      console.error("Review error:", err);
    }
  };

  const handleAssignSecondAdvisor = async () => {
    if (!selectedSecondAdvisor || !items || items.length === 0) return;
    setAssigningAdvisor(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}api/advisor/items/${items[0].id}/assign-second-advisor`,
        { secondAdvisorId: selectedSecondAdvisor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Penguji kedua berhasil ditetapkan");
      mutate();
    } catch (err) {
      toast.error("❌ Gagal menetapkan penguji kedua");
    } finally {
      setAssigningAdvisor(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        ⏳ Memuat kiriman mahasiswa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        ❌ Gagal memuat data.
      </div>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Daftar Kiriman Mahasiswa
              </h1>
              <p className="text-sm text-gray-500">
                Lakukan peninjauan karya ilmiah yang telah dikirim.
              </p>
            </div>
            <Link
              href="/dashboard/advising"
              className="flex items-center gap-2 py-2 px-4 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              Kembali ke Bimbingan
            </Link>
          </div>

          {/* Info Dosen Pembimbing & Penguji */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">Pembimbing:</span>
              <span className="text-gray-900">{mainAdvisor?.name || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">Penguji:</span>
              <span className="text-gray-900">{currentSecondAdvisor?.name || "Belum ditentukan"}</span>
            </div>
            {isMainAdvisor && (
              <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tetapkan Penguji:</label>
                <select
                  value={selectedSecondAdvisor}
                  onChange={(e) => setSelectedSecondAdvisor(e.target.value)}
                  className="border rounded-md px-3 py-1.5 text-sm flex-grow max-w-xs"
                >
                  <option value="">-- Pilih Dosen --</option>
                  {lecturers
                    ?.filter((l) => l.name !== mainAdvisor?.name)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAssignSecondAdvisor}
                  disabled={!selectedSecondAdvisor || assigningAdvisor}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {assigningAdvisor ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Tetapkan
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {items && items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => handleToggleSubmission(item.id)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      {openSubmissionId === item.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="font-bold text-gray-800">
                        {item.title}
                      </span>
                    </div>
                    {getStatusBadge(item.approvalStatus)}
                  </button>
                  {openSubmissionId === item.id && (
                    <SubmissionCard item={item} onReview={handleReview} />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-16 bg-white rounded-lg border-dashed border-2">
                <Info className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">
                  Belum Ada Kiriman
                </h3>
                <p className="mt-1 text-gray-500">
                  Mahasiswa ini belum mengunggah karya ilmiah apa pun.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
