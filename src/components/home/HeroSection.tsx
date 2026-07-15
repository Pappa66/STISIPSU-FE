"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import OptimizedImage, { Img } from '@/components/common/OptimizedImage';
import AnimatedSection from '@/components/common/AnimatedSection';
import { buildImageUrl } from '@/utils/image';
import { ArrowRight, User, Calendar } from "lucide-react";
import useSWR from "swr";
import BannerSlider from "./BannerSlider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function splitBlocks(blocks: Block[]) {
  const textTypes = [
    "paragraph",
    "html",
    "table",
    "list",
    "tasklist",
    "heading",
  ];
  const mediaTypes = ["image", "video", "youtube"];

  const textBlocks = blocks.filter((b) => textTypes.includes(b.type));
  const mediaBlocks = blocks.filter((b) => mediaTypes.includes(b.type));

  return { textBlocks, mediaBlocks };
}



function IntroSection() {
  const postId = "cmrlfbop40001l904ds38tmu6";
  const { data: post, isLoading } = useSWR<PostData>(
    postId ? `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}` : null,
    fetcher
  );

  return (
    <section className="bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {isLoading && <p>Memuat konten pengantar...</p>}

        {post?.blocks ? (
          (() => {
            const { textBlocks, mediaBlocks } = splitBlocks(post.blocks);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* LEFT: Media Blocks (Gambar) */}
                <div>
                  {mediaBlocks.length === 0 ? (
                    <p className="text-gray-500">Tidak ada gambar.</p>
                  ) : (
                    mediaBlocks.map((block) => (
                      <BlockRenderer key={block.id} block={block} />
                    ))
                  )}
                </div>

                {/* RIGHT: Text Blocks */}
                <div className="prose max-w-none text-gray-800">
                  {textBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              </div>
            );
          })()
        ) : (
          <p className="text-gray-500">Tidak ada konten pengantar.</p>
        )}
      </div>
    </section>
  );
}

export default function HeroSection() {
  const { data: berita, isLoading: beritaLoading } = useSWR<{
    news: NewsItem[];
  }>(`${process.env.NEXT_PUBLIC_API_URL}api/public/news`, fetcher);

  const { data: galeri, isLoading: galeriLoading } = useSWR<GalleryItem[]>(
    `${process.env.NEXT_PUBLIC_API_URL}api/public/gallery`,
    fetcher
  );

  return (
    <>
      <BannerSlider />

      <IntroSection />

      <section className="bg-[#0077c2] text-white py-5 px-4">
  <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
    {/* KIRI: Teks + Tombol */}
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold">
        Pendaftaran Mahasiswa Baru
      </h2>
      <h3 className="text-lg md:text-xl font-semibold">
        Siap Bergabung? Daftar Sekarang!
      </h3>
      <p className="text-white/90 leading-relaxed">
        Proses pendaftaran cepat, mudah, dan bisa dilakukan 100% online.
        Dapatkan pengalaman belajar terbaik di STISIP Sukabumi.
      </p>
      {/* Tombol Aksi */}
    </div>
    
    {/* KANAN: Gambar */}
    <div className="flex justify-center">
      {/* Ini sudah benar, cuma ganti src saja */}
      <Image
        src="/images/logo-kampus.png"
        alt="Logo STISIP Syamsul Ulum"
        width={200}
        height={200}
        className="object-contain"
        priority
      />
    </div>
  </div>
</section>

      <AnimatedSection direction="up">
      <section className="bg-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-sky-700 mr-4">
              HIGHLIGHT BERITA
            </h2>
            <div className="flex-grow border-t-4 border-sky-700"></div>
          </div>

          {beritaLoading && <p className="text-gray-500">Memuat berita...</p>}

          {berita?.news?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {berita.news
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 3)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="block rounded-lg border border-gray-200 overflow-hidden shadow hover:shadow-lg transition group bg-white"
                  >
                    <div className="relative h-48 w-full">
                      <OptimizedImage
                        src={item.featuredImageUrl || "https://placehold.co/600x400?text=Berita"}
                        alt={item.title}
                        fill
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-sky-700 mb-2">
                        {item.title}
                      </h3>
                      <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User size={12} />
                          <span>{item.author?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada berita terbaru.</p>
          )}
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection direction="up" delay={0.2}>
      <section className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-sky-700 mr-4">
              HIGHLIGHT GALLERY
            </h2>
            <div className="flex-grow border-t-4 border-sky-700"></div>
          </div>

          {galeriLoading && <p className="text-gray-500">Memuat galeri...</p>}

          {galeri?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galeri
                .filter((item) => item.imageUrl)
                .map((item) => (
                  <div
                    key={item.id}
                    className="group block bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-video">
                      <OptimizedImage
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="rounded-t-md"
                      />

                      <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 pointer-events-none" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold">Galeri Masih Kosong</h2>
              <p className="text-gray-600 mt-2">
                Saat ini belum ada foto yang diunggah ke galeri.
              </p>
            </div>
          )}
        </div>
      </section>
      </AnimatedSection>
    </>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="text-2xl font-bold text-sky-700 my-4">
          {block.content}
        </h2>
      );

    case "paragraph":
    case "html":
    case "table":
    case "list":
    case "tasklist":
      return (
        <div
          className="prose max-w-none text-gray-800 leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "image":
      return (
        <figure className="my-6">
          <Img
            src={block.url}
            alt={block.url}
            className="w-full rounded-lg shadow-md"
          />
        </figure>
      );

    case "video":
      return (
        <video
          src={buildImageUrl(block.url)}
          controls
          className="w-full my-6 rounded-lg shadow-md"
        ></video>
      );

    case "youtube":
      const videoId =
        block.url.split("v=")[1]?.split("&")[0] || block.url.split("/").pop();
      if (!videoId) return null;
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`} // Perbaikan di sini: URL embed YouTube yang benar
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video my-6 rounded-lg shadow-md"
        ></iframe>
      );

    default:
      return null;
  }
}

/** Types **/
type Block =
  | { id: string; type: "heading"; content: string }
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "html"; content: string }
  | { id: string; type: "image"; url: string }
  | { id: string; type: "video"; url: string }
  | { id: string; type: "youtube"; url: string }
  | { id: string; type: "table"; content: string }
  | { id: string; type: "list"; content: string }
  | { id: string; type: "tasklist"; content: string };

interface PostData {
  id: string;
  title: string;
  blocks: Block[] | null;
  createdAt: string;
}

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  featuredImageUrl: string | null;
  author: { name: string };
  createdAt: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
}