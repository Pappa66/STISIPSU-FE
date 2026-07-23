"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  XCircle,
  Loader2,
  FileText,
  Info,
  Link as LinkIcon,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatAuthorName } from "@/utils/formatters";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";

interface FileToUpload {
  file: File;
  alias: string;
}

interface Prerequisites {
  studentName: string;
  studyProgram: string | null;
  advisorName: string | null;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutateList: () => void;
  editItem?: {
    id: string;
    title: string;
    abstract: string | null;
    keywords?: string;
    year: string;
  };
}

export default function UploadModal({
  isOpen,
  onClose,
  mutateList,
  editItem,
}: UploadModalProps) {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    year: new Date().getFullYear().toString(),
    gdriveLink: "",
  });
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: prereqs } = useSWR<Prerequisites>(
    isOpen && token
      ? `${process.env.NEXT_PUBLIC_API_URL}api/users/submission-prerequisites`
      : null,
    (url) =>
      axios
        .get(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.data)
  );

  // ⏪ Autofill form jika edit
  useEffect(() => {
    if (editItem) {
      setFormData((prev) => ({
        ...prev,
        title: editItem.title || "",
        abstract: editItem.abstract || "",
        keywords: editItem.keywords || "",
        year: editItem.year || new Date().getFullYear().toString(),
      }));
    }
  }, [editItem]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        alias: file.name.split(".")[0] || file.name,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && !formData.gdriveLink) {
      toast.error("Unggah minimal satu file atau link.");
      return;
    }
    if (!prereqs?.advisorName) {
      toast.error("Pembimbing belum ditentukan.");
      return;
    }

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
      setIsLoading(true);

      const endpoint = editItem
        ? `${process.env.NEXT_PUBLIC_API_URL}api/my-repository/${editItem.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}api/my-repository`;

      const method = editItem ? "put" : "post";

      await axios[method](endpoint, submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Berhasil disimpan.");
      mutateList();
      onClose();
    } catch (err) {
      toast.error("Gagal mengunggah.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editItem ? "Edit Karya Ilmiah" : "Unggah Karya Ilmiah Baru"}
          </h2>
          <button onClick={onClose}>
            <XCircle className="w-6 h-6 text-gray-500 hover:text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Judul"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full border rounded p-2"
          />
          <input
            type="number"
            placeholder="Tahun"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full border rounded p-2"
          />
          <textarea
            rows={3}
            placeholder="Abstrak"
            value={formData.abstract}
            onChange={(e) =>
              setFormData({ ...formData, abstract: e.target.value })
            }
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Kata Kunci"
            value={formData.keywords}
            onChange={(e) =>
              setFormData({ ...formData, keywords: e.target.value })
            }
            className="w-full border rounded p-2"
          />

          <div>
            <label className="text-sm font-medium mb-1 block">Upload File (PDF)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
                if (droppedFiles.length > 0) {
                  const newFiles = droppedFiles.map(file => ({ file, alias: file.name.split('.').slice(0, -1).join('.') || file.name }));
                  setFiles(prev => [...prev, ...newFiles]);
                }
              }}
              onClick={() => document.getElementById('modal-pdf-input')?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              <input
                id="modal-pdf-input"
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <svg className="mx-auto h-10 w-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="text-sm text-gray-500">Seret & lepas file PDF di sini, atau klik untuk memilih</p>
              <p className="text-xs mt-1 text-gray-400">Maks. 10MB per file</p>
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={14} />
                    <span className="truncate flex-1">{f.alias}</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700">
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="url"
            placeholder="Link Google Drive (opsional)"
            value={formData.gdriveLink}
            onChange={(e) =>
              setFormData({ ...formData, gdriveLink: e.target.value })
            }
            className="w-full border rounded p-2"
          />

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Kirim"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
