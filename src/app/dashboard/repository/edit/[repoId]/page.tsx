"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchWithAuth } from "@/utils/api";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Trash2,
  FileText,
  UploadCloud,
  ToggleRight,
  ToggleLeft,
  Eye,
  EyeOff,
} from "lucide-react";

interface FileItem {
  id: string;
  alias: string;
  fileUrl: string;
}

interface RepoDetail {
  id: string;
  title: string;
  author: string;
  year: number;
  studyProgram: string;
  abstract: string | null;
  keywords: string | null;
  advisor: string | null;
  files: FileItem[];
  visibility: "PUBLISHED" | "PRIVATE";
  showDownloadsToPublic: boolean;
}

const fetcher = (url: string) => fetchWithAuth(url).then((res) => res.json());

export default function EditRepositoryPage() {
  const router = useRouter();
  const params = useParams();
  const repoId = params.repoId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<Partial<RepoDetail>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${repoId}`;
  const {
    data: item,
    error,
    isLoading,
    mutate,
  } = useSWR<RepoDetail>(repoId ? apiUrl : null, fetcher);

  useEffect(() => {
    if (item) setFormState(item);
  }, [item]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: "visibility" | "showDownloadsToPublic") => {
    const newValue =
      name === "visibility"
        ? formState.visibility === "PUBLISHED"
          ? "PRIVATE"
          : "PUBLISHED"
        : !formState.showDownloadsToPublic;

    setFormState((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleFileDelete = async (fileId: string) => {
    if (!window.confirm("Yakin ingin menghapus file ini?")) return;
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/files/${fileId}`,
        { method: "DELETE" }
      );
      mutate();
    } catch (err) {
      toast.error("Gagal menghapus file.");
    }
  };

  const handleNewFilesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    const filesMetadata = [];
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
      filesMetadata.push({ originalName: files[i].name, alias: files[i].name });
    }
    formData.append("filesMetadata", JSON.stringify(filesMetadata));

    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${repoId}/files`,
        { method: "POST", body: formData }
      );
      mutate();
    } catch (err) {
      toast.error("Gagal menambah file baru.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchWithAuth(apiUrl, {
        method: "PUT",
        body: JSON.stringify(formState),
      });
      toast.success("Perubahan berhasil disimpan!");
      router.push("/dashboard/repository");
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  if (error)
    return (
      <div className="text-center py-12 text-red-500">Gagal memuat data.</div>
    );

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-sky-800">
                Edit Karya Ilmiah
              </h1>
              <Link
                href="/dashboard/repository"
                className="text-sm flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-slate-100"
              >
                <ArrowLeft size={16} /> Kembali
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4 p-6 border rounded-lg bg-white">
                {[
                  ["title", "Judul"],
                  ["author", "Penulis"],
                  ["year", "Tahun"],
                  ["studyProgram", "Program Studi"],
                  ["advisor", "Pembimbing"],
                  ["keywords", "Kata Kunci"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="block text-sm font-medium">{label}</label>
                    <input
                      type={name === "year" ? "number" : "text"}
                      name={name}
                      value={(formState as any)[name] || ""}
                      onChange={handleChange}
                      className="w-full mt-1 p-2 border rounded-md"
                      required={[
                        "title",
                        "author",
                        "year",
                        "studyProgram",
                      ].includes(name)}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium">Abstrak</label>
                  <textarea
                    name="abstract"
                    value={formState.abstract || ""}
                    onChange={handleChange}
                    rows={6}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-white space-y-3">
                  <h3 className="font-semibold">Pengaturan</h3>

                  <button
                    type="button"
                    onClick={() => handleToggle("visibility")}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md font-medium ${
                      formState.visibility === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span>Status: {formState.visibility}</span>
                    {formState.visibility === "PUBLISHED" ? (
                      <ToggleRight size={18} />
                    ) : (
                      <ToggleLeft size={18} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle("showDownloadsToPublic")}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md font-medium ${
                      formState.showDownloadsToPublic
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span>
                      Unduhan Publik:{" "}
                      {formState.showDownloadsToPublic ? "Aktif" : "Nonaktif"}
                    </span>
                    {formState.showDownloadsToPublic ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>

                <div className="p-4 border rounded-lg bg-white space-y-3">
                  <h3 className="font-semibold">File Terlampir</h3>
                  {formState.files?.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-md"
                    >
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${file.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline truncate"
                      >
                        <FileText size={16} /> {file.alias}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleFileDelete(file.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-sm mt-2 p-2 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <UploadCloud size={16} /> Tambah File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleNewFilesUpload}
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
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
