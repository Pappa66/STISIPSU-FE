"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from '@/components/common/OptimizedImage';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const isPaused = useRef(false);

  const next = useCallback(() => {
    if (!isPaused.current && banners && banners.length > 1) setCurrent((c) => (c + 1) % banners.length);
  }, [banners]);

  const prev = useCallback(() => {
    if (banners && banners.length > 1) setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners, next]);

  if (isLoading) return <div className="aspect-[3/1] bg-gray-100 animate-pulse" />;
  if (!banners || banners.length === 0) return null;

  const banner = banners[current];

  const overlayContent = (
    <div className="absolute inset-0 flex items-center">
      <div className="container mx-auto px-4 md:px-12 text-white">
        <div className="max-w-2xl transition-all duration-500">
          {banner.subtitle && (
            <p className="text-lg md:text-2xl lg:text-3xl font-semibold drop-shadow-lg text-white/90">
              {banner.subtitle}
            </p>
          )}
          {banner.linkUrl && (
            <span className="inline-block mt-4 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition text-sm md:text-base">
              Selengkapnya
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section
      className="relative w-full aspect-[3/1] overflow-hidden bg-gray-900 mt-4 mb-16 sm:mt-6 sm:mb-24"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <OptimizedImage
            src={b.imageUrl}
            alt=""
            fill
            className="object-cover"
            priority={i === current}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {banner.linkUrl ? (
        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
          {overlayContent}
        </a>
      ) : (
        overlayContent
      )}

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
