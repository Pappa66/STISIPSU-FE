"use client";

import React, { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
const imgUrl = (path: string) => path?.startsWith("http") ? path : `${baseUrl}/${path.replace(/^\//, "")}`;

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}

export default function BannerSlider() {
  const { data: banners, isLoading } = useSWR<Banner[]>(
    `${process.env.NEXT_PUBLIC_API_URL}api/banners`,
    fetcher
  );

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (banners && banners.length > 1) setCurrent((c) => (c + 1) % banners.length);
  }, [banners]);

  const prev = useCallback(() => {
    if (banners && banners.length > 1) setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners, next]);

  if (isLoading) return <div className="h-64 bg-gray-100 animate-pulse" />;
  if (!banners || banners.length === 0) return null;

  const banner = banners[current];

  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-900">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={imgUrl(b.imageUrl)} alt={b.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-12 text-white">
          <div className="max-w-2xl transition-all duration-500">
            <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">
                {banner.subtitle}
              </p>
            )}
            {banner.linkUrl && (
              <Link
                href={banner.linkUrl}
                className="inline-block mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition"
              >
                Selengkapnya
              </Link>
            )}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition">
            <ChevronLeft size={28} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition">
            <ChevronRight size={28} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition ${i === current ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
