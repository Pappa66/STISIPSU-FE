"use client";

import { useParams, notFound } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  Download,
  UserCircle,
  Calendar,
  Tag,
  FileText,
  Bookmark,
  Eye,
  Quote,
  ArrowUp,
  Share2,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RepositoryDetail } from "@/types";
import { toast } from "react-hot-toast";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Data tidak ditemukan");
    return res.json();
  });

export default function RepositoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [copied, setCopied] = useState(false);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/repository-items/${id}`;
  const { data: item, error, isLoading } = useSWR<RepositoryDetail>(id ? apiUrl : null, fetcher);

  const [citation, setCitation] = useState<string | null>(null);
  const [citationLoading, setCitationLoading] = useState(false);

  useEffect(() => {
    if (item?.title) {
      document.title = `${item.title} | Repositori STISIP`;
    }
  }, [item]);

  const createSafeUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return `${baseUrl.replace(/\/api$/, "")}/${path.replace(/^\//, "")}`;
  };

  const handleDownload = async (fileId: string, alias: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/download/${fileId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = alias;
        a.click();
        URL.revokeObjectURL(url);
        mutate(apiUrl);
      }
    } catch {
      toast.error("Download gagal.");
    }
  };

  const loadCitation = async (format: string) => {
    setCitationLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/citation/${id}?format=${format}`);
      const data = await res.json();
      setCitation(data.citation);
    } catch {
      toast.error("Gagal memuat sitasi.");
    } finally {
      setCitationLoading(false);
    }
  };

  if (error) return notFound();
  if (isLoading) return <div className="text-center py-12">Memuat...</div>;
  if (!item) return notFound();

  return (
    <div className="bg-white">
      {/* HERO */}
      <div
        className="relative bg-cover bg-center bg-no-repeat text-white py-24 shadow-md"
        style={{ backgroundImage: "url('/images/gedung-satu.png')" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative container mx-auto z-10 text-center px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold max-w-4xl mx-auto leading-snug text-white drop-shadow">
            {item.title}
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* KONTEN UTAMA */}
        <div className="lg:col-span-2">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>
                {typeof item.author === "object"
                  ? item.author.name
                  : item.author}
              </span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>Tahun: {item.year}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-medium text-indigo-600">
              {item.studyProgram}
            </span>
          </div>

          {/* ABSTRAK */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Abstrak</h2>
            <article className="prose max-w-none text-gray-700 prose-sm md:prose-base">
              <p>{item.abstract || "Abstrak tidak tersedia."}</p>
            </article>
          </section>

          {/* FILE DOWNLOAD */}
          {item.showDownloadsToPublic && item.files?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                File Terlampir
              </h2>
              <div className="rounded-lg overflow-hidden border divide-y">
                {item.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {file.alias}
                      </span>
                      {file.downloads > 0 && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {file.downloads} download
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload(file.id, file.alias)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 flex-shrink-0 ml-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside>
          <div className="bg-gray-50 border rounded-xl shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Detail Dokumen</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <strong className="block text-gray-700">Penulis:</strong>
                  {typeof item.author === "object" ? item.author.name : item.author}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <strong className="block text-gray-700">Pembimbing:</strong>
                  {item.advisor?.name || "-"}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <strong className="block text-gray-700">Penguji:</strong>
                  {item.secondAdvisor?.name || "-"}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <strong className="block text-gray-700">Tanggal Terbit:</strong>
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
                    : "-"}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Bookmark className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <strong className="block text-gray-700">Program Studi:</strong>
                  {item.studyProgram}
                </div>
              </li>
              {item.category && (
                <li className="flex items-start gap-3">
                  <Bookmark className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <strong className="block text-gray-700">Kategori:</strong>
                    {item.category}
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <strong className="block text-gray-700">Kata Kunci:</strong>
                  {item.keywords || "-"}
                </div>
              </li>
            </ul>

            {/* CITATION */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Quote size={14} /> Sitasi
              </h4>
              <div className="flex gap-2 mb-2">
                <button onClick={() => loadCitation("apa")} disabled={citationLoading}
                  className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300">
                  APA
                </button>
                <button onClick={() => loadCitation("bibtex")} disabled={citationLoading}
                  className="text-xs px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-300">
                  BibTeX
                </button>
              </div>
              {citation && (
                <div className="relative">
                  <p className="text-xs text-gray-600 bg-white p-2 rounded border leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: citation }} />
                  <button
                    onClick={() => { navigator.clipboard.writeText(citation.replace(/<[^>]*>/g, "")); toast.success("Disalin!"); }}
                    className="absolute top-1 right-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Salin
                  </button>
                </div>
              )}
            </div>

            {/* SHARE */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                <Share2 size={14} /> Bagikan
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(item.title + ' ' + window.location.href)}`, '_blank')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Facebook
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  X
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  {copied ? <Check size={12} /> : <LinkIcon size={12} />}
                  {copied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
