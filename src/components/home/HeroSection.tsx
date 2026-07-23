"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import OptimizedImage from '@/components/common/OptimizedImage';
import AnimatedSection from '@/components/common/AnimatedSection';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { User, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useSWR from "swr";
import BannerSlider from "./BannerSlider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  isActive: boolean;
}

export default function HeroSection() {
  const [beritaIdx, setBeritaIdx] = useState(0);

  const { data: berita, isLoading: beritaLoading } = useSWR<{
    news: NewsItem[];
  }>(`${process.env.NEXT_PUBLIC_API_URL}api/public/news`, fetcher);

  const { data: galeri, isLoading: galeriLoading } = useSWR<GalleryItem[]>(
    `${process.env.NEXT_PUBLIC_API_URL}api/public/gallery`,
    fetcher
  );

  const { data: hero } = useSWR<HeroData>(
    `${process.env.NEXT_PUBLIC_API_URL}api/public/hero`,
    fetcher
  );

  const sortedNews = useMemo(() => {
    if (!berita?.news) return [];
    return [...berita.news]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [berita]);

  return (
    <>
      <BannerSlider />

      {hero?.isActive !== false && (
      <section className="bg-[#0077c2] text-white py-5 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              {hero?.title || "Pendaftaran Mahasiswa Baru"}
            </h2>
            {hero?.subtitle && (
              <h3 className="text-lg md:text-xl font-semibold">{hero.subtitle}</h3>
            )}
            {hero?.description && (
              <p className="text-white/90 leading-relaxed">{hero.description}</p>
            )}
            {hero?.linkUrl && (
              <a href={hero.linkUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-white text-[#0077c2] font-semibold rounded-lg hover:bg-sky-50 transition">
                {hero.linkLabel || "Daftar Sekarang"} <ArrowRight size={18} />
              </a>
            )}
          </div>
          <div className="flex justify-center">
            <Image
              src={hero?.imageUrl || "/images/logo-kampus.png"}
              alt="Logo STISIP Syamsul Ulum"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>
      )}

      <AnimatedSection direction="up">
      <section className="bg-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-sky-700 mr-4">
              HIGHLIGHT BERITA
            </h2>
            <div className="flex-grow border-t-4 border-sky-700"></div>
          </div>

          {beritaLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : sortedNews.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${beritaIdx * 100}%)` }}>
                  {sortedNews.map((item) => (
                    <Link key={item.id} href={`/berita/${item.slug}`}
                      className="min-w-full group block bg-white">
                      <div className="relative aspect-video sm:aspect-[21/9] w-full">
                        <OptimizedImage
                          src={item.featuredImageUrl || "https://placehold.co/600x400?text=Berita"}
                          alt={item.title}
                          fill
                          className="rounded-t-md"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-sky-700 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User size={12} />{item.author?.name}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} />
                            {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {sortedNews.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={() => setBeritaIdx(i => Math.max(0, i - 1))}
                    disabled={beritaIdx === 0}
                    className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-2">
                    {sortedNews.map((_, i) => (
                      <button key={i} onClick={() => setBeritaIdx(i)}
                        className={`w-2.5 h-2.5 rounded-full transition ${i === beritaIdx ? "bg-sky-600" : "bg-gray-300 hover:bg-gray-400"}`} />
                    ))}
                  </div>
                  <button onClick={() => setBeritaIdx(i => Math.min(sortedNews.length - 1, i + 1))}
                    disabled={beritaIdx === sortedNews.length - 1}
                    className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
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

          {galeriLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

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