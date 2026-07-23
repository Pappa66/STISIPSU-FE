"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, User, Tag, ArrowLeft, Share2, Link as LinkIcon, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Img } from '@/components/common/OptimizedImage';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Post {
  title: string;
  blocks: any[];
  author?: { name: string };
  featuredImageUrl?: string;
  createdAt: string;
  tags: string[];
}

export default function DetailBeritaPage() {
  const params = useParams();
  const [data, setData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}api/public/news/${slug}`);
        if (!res.ok) throw new Error("Not Found");
        const result = await res.json();
        setData(result);
      } catch {
        setData(null);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };

    fetchData();
  }, [slug]);

  const allImages = (() => {
    if (!data) return [];
    const result: { src: string; alt: string }[] = [];
    if (data.featuredImageUrl) {
      result.push({ src: data.featuredImageUrl, alt: data.title });
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    for (const b of data.blocks || []) {
      if (b.type === "image") {
        const src = b.url?.startsWith("http") ? b.url : `${baseUrl}${b.url}`;
        const alt = b.caption || data.title;
        if (!result.some((img) => img.src === src)) {
          result.push({ src, alt });
        }
      }
    }
    return result;
  })();

  if (loading)
    return (
      <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
    );

  if (!data) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-3xl font-bold text-red-600">
          404 - Berita Tidak Ditemukan
        </h1>
        <p className="mt-3 text-gray-500 max-w-lg mx-auto">
          Kami tidak dapat menemukan berita yang Anda cari. Mungkin telah
          dihapus atau belum dipublikasikan.
        </p>
        <a
          href="/berita"
          className="mt-6 inline-block bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
        >
          ← Kembali ke Portal Berita
        </a>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <a
          href="/berita"
          className="inline-flex items-center gap-2 text-sm text-sky-700 hover:text-sky-900 mb-4 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke semua berita</span>
        </a>

        <article className="bg-white border rounded-lg shadow p-5 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-snug">
            {data.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-b pb-3 mb-5">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{data.author?.name || "Tim Redaksi"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {new Date(data.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {allImages.length > 0 && (
            <div className="mb-6">
              <div
                className="relative w-full max-w-[600px] mx-auto bg-gray-100 rounded-md shadow overflow-hidden cursor-pointer"
                style={{ minHeight: 200 }}
                onClick={() => setLightboxOpen(true)}
              >
                <Img
                  src={allImages[galleryIdx].src}
                  alt={allImages[galleryIdx].alt}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryIdx((i) => (i === 0 ? allImages.length - 1 : i - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryIdx((i) => (i === allImages.length - 1 ? 0 : i + 1));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <span
                          key={i}
                          className={`block w-2 h-2 rounded-full transition ${i === galleryIdx ? "bg-white" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div
            className="prose prose-sky max-w-none text-gray-800 leading-relaxed mx-auto"
            dangerouslySetInnerHTML={{
              __html: renderBlocksToHTML(data.blocks, baseUrl),
            }}
          />

          {data.tags?.length > 0 && (
            <div className="mt-8 pt-4 border-t flex flex-wrap items-center gap-2">
              <Tag size={16} className="text-sky-700" />
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium text-sky-800 bg-sky-100 rounded-full hover:bg-sky-200 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {lightboxOpen && allImages.length > 0 && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition z-10"
              >
                ✕
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryIdx((i) => (i === 0 ? allImages.length - 1 : i - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition"
              >
                <ChevronLeft size={28} />
              </button>
              <img
                src={allImages[galleryIdx].src}
                alt={allImages[galleryIdx].alt}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryIdx((i) => (i === allImages.length - 1 ? 0 : i + 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition"
              >
                <ChevronRight size={28} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`block w-2.5 h-2.5 rounded-full transition cursor-pointer ${i === galleryIdx ? "bg-white" : "bg-white/40"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryIdx(i);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bagikan */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Share2 size={16} /> Bagikan
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(data.title + ' ' + url)}`, '_blank');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                WhatsApp
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Facebook
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                X
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                {copied ? <Check size={14} /> : <LinkIcon size={14} />}
                {copied ? 'Tersalin' : 'Salin Tautan'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function renderBlocksToHTML(blocks: any[], baseUrl: string): string {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h2 class="text-lg md:text-xl font-semibold my-4">${block.content}</h2>`;

        case "paragraph":
          return `<p class="my-3">${block.content}</p>`;

        case "image":
          const imgSrc = block.url?.startsWith("http")
            ? block.url
            : `${baseUrl}${block.url}`;
          return `<div class="flex justify-center my-4">
                    <img src="${imgSrc}" alt="" loading="lazy" decoding="async" class="rounded-md shadow-sm w-full max-w-[700px] h-auto object-contain" />
                  </div>`;

        case "video":
          const videoSrc = block.url?.startsWith("http")
            ? block.url
            : `${baseUrl}${block.url}`;
          return `<div class="flex justify-center my-4">
                    <video controls class="rounded-md shadow-sm max-w-full max-h-[300px]">
                      <source src="${videoSrc}" type="video/mp4" />
                    </video>
                  </div>`;

        case "youtube":
          const videoId = extractYouTubeId(block.url);
          return videoId
            ? `<div class="flex justify-center my-4">
                <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="rounded-md shadow-sm w-full max-w-[600px] aspect-video"></iframe>
               </div>`
            : "";

        case "list":
          return `<ul class="list-disc list-inside my-3">${block.content}</ul>`;

        case "tasklist":
          return `<ul class="list-none my-3 space-y-1">${block.content}</ul>`;

        case "html":
          return `<div class="my-4">${block.content}</div>`;

        default:
          return "";
      }
    })
    .join("");
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}
